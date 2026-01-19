import * as cdk from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface AricaToucanStackProps extends cdk.StackProps {
  githubConnectionArn: string;
  customDomainName?: string;
  hostedZoneId?: string;
}

export class AricaToucanStack extends cdk.Stack {
  public readonly frontendUrl: cdk.CfnOutput;
  public readonly backendUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: AricaToucanStackProps) {
    super(scope, id, props);

    const { githubConnectionArn } = props;

    // IAM Role for App Runner to access ECR and other AWS services
    const appRunnerAccessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'Role for App Runner to access AWS services during build',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppRunnerServicePolicyForECRAccess'),
      ],
    });

    // IAM Role for App Runner instance (runtime)
    const appRunnerInstanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'Role for App Runner service instances at runtime',
    });

    // DynamoDB Table for Organizations
    const organizationsTable = new dynamodb.Table(this, 'AricaOrganizationsTable', {
      tableName: 'AricaOrganizations',
      partitionKey: { name: 'orgId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // DynamoDB Table for Analytics/Usage Tracking
    const analyticsTable = new dynamodb.Table(this, 'AricaAnalyticsTable', {
      tableName: 'AricaAnalytics',
      partitionKey: { name: 'orgId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
    });

    // Grant DynamoDB read/write permissions to App Runner instance role
    organizationsTable.grantReadWriteData(appRunnerInstanceRole);
    analyticsTable.grantReadWriteData(appRunnerInstanceRole);

    // Grant Bedrock InvokeModel permission to App Runner instance role
    appRunnerInstanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'],
    }));

    // Cognito User Pool for authentication
    const userPool = new cognito.UserPool(this, 'AricaToucanUserPool', {
      userPoolName: 'arica-toucan-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        organizationId: new cognito.StringAttribute({ mutable: true }),
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool Client for frontend
    const userPoolClient = new cognito.UserPoolClient(this, 'AricaToucanUserPoolClient', {
      userPool,
      userPoolClientName: 'arica-toucan-web-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      generateSecret: false,
    });

    // S3 Bucket for PDF reports
    const reportsBucket = new s3.Bucket(this, 'AricaToucanReportsBucket', {
      bucketName: `arica-toucan-reports-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(90),
          prefix: 'reports/',
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Grant S3 read/write permissions to App Runner instance role
    reportsBucket.grantReadWrite(appRunnerInstanceRole);

    // SNS Topic for CloudWatch Alarms
    const alarmTopic = new sns.Topic(this, 'AricaToucanAlarmTopic', {
      topicName: 'arica-toucan-alarms',
      displayName: 'Arica Toucan Monitoring Alarms',
    });

    // CloudWatch Alarm for Backend Error Rate > 5%
    const backendErrorRateAlarm = new cloudwatch.Alarm(this, 'BackendErrorRateAlarm', {
      alarmName: 'arica-toucan-backend-error-rate',
      alarmDescription: 'Alarm when backend error rate exceeds 5%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: '5xxStatusResponses',
        dimensionsMap: {
          ServiceName: 'arica-toucan-backend',
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Add SNS notification action to the alarm
    backendErrorRateAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // Backend App Runner Service
    const backendService = new apprunner.Service(this, 'AricaToucanBackend', {
      serviceName: 'arica-toucan-backend',
      source: apprunner.Source.fromGitHub({
        repositoryUrl: 'https://github.com/prathamesh-ops-sudo/Arica-Compliance-v2',
        branch: 'main',
        configurationSource: apprunner.ConfigurationSourceType.API,
        codeConfigurationValues: {
          runtime: apprunner.Runtime.NODEJS_18,
          buildCommand: 'npm ci && npm run build',
          startCommand: 'npm run start',
          port: '8080',
          environmentVariables: {
            DYNAMODB_TABLE_NAME: organizationsTable.tableName,
            DYNAMODB_ANALYTICS_TABLE: analyticsTable.tableName,
            AWS_REGION: this.region,
            COGNITO_USER_POOL_ID: userPool.userPoolId,
            COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
            S3_REPORTS_BUCKET: reportsBucket.bucketName,
          },
        },
        connection: apprunner.GitHubConnection.fromConnectionArn(githubConnectionArn),
      }),
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
      instanceRole: appRunnerInstanceRole,
      accessRole: appRunnerAccessRole,
      healthCheck: apprunner.HealthCheck.http({
        path: '/api/admin/organizations',
        interval: cdk.Duration.seconds(10),
        timeout: cdk.Duration.seconds(5),
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      }),
      autoDeploymentsEnabled: true,
    });

    // Frontend App Runner Service
    // Note: Vite embeds environment variables at build time, so we pass Cognito IDs here
    const frontendService = new apprunner.Service(this, 'AricaToucanFrontend', {
      serviceName: 'arica-toucan-frontend',
      source: apprunner.Source.fromGitHub({
        repositoryUrl: 'https://github.com/prathamesh-ops-sudo/Arica-Compliance-v2',
        branch: 'main',
        configurationSource: apprunner.ConfigurationSourceType.API,
        codeConfigurationValues: {
          runtime: apprunner.Runtime.NODEJS_18,
          buildCommand: 'npm ci && npm install serve && npm run build',
          startCommand: 'npx serve dist/public -l 8080 -s',
          port: '8080',
          environmentVariables: {
            VITE_COGNITO_USER_POOL_ID: userPool.userPoolId,
            VITE_COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
            VITE_API_URL: `https://${backendService.serviceUrl}`,
          },
        },
        connection: apprunner.GitHubConnection.fromConnectionArn(githubConnectionArn),
      }),
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
      instanceRole: appRunnerInstanceRole,
      accessRole: appRunnerAccessRole,
      healthCheck: apprunner.HealthCheck.http({
        path: '/index.html',
        interval: cdk.Duration.seconds(10),
        timeout: cdk.Duration.seconds(5),
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      }),
      autoDeploymentsEnabled: true,
    });

    // Stack Outputs
    this.backendUrl = new cdk.CfnOutput(this, 'BackendServiceUrl', {
      value: `https://${backendService.serviceUrl}`,
      description: 'Arica Toucan Backend API URL',
      exportName: 'AricaToucanBackendUrl',
    });

    this.frontendUrl = new cdk.CfnOutput(this, 'FrontendServiceUrl', {
      value: `https://${frontendService.serviceUrl}`,
      description: 'Arica Toucan Frontend URL',
      exportName: 'AricaToucanFrontendUrl',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: organizationsTable.tableName,
      description: 'DynamoDB Organizations Table Name',
      exportName: 'AricaToucanDynamoDBTable',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableArn', {
      value: organizationsTable.tableArn,
      description: 'DynamoDB Organizations Table ARN',
      exportName: 'AricaToucanDynamoDBTableArn',
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'AricaToucanCognitoUserPoolId',
    });

    new cdk.CfnOutput(this, 'CognitoClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'AricaToucanCognitoClientId',
    });

    new cdk.CfnOutput(this, 'S3ReportsBucket', {
      value: reportsBucket.bucketName,
      description: 'S3 Bucket for PDF Reports',
      exportName: 'AricaToucanS3ReportsBucket',
    });

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS Topic ARN for CloudWatch Alarms',
      exportName: 'AricaToucanAlarmTopicArn',
    });

    new cdk.CfnOutput(this, 'AnalyticsTableName', {
      value: analyticsTable.tableName,
      description: 'DynamoDB Analytics Table Name',
      exportName: 'AricaToucanAnalyticsTable',
    });

    // Custom Domain Placeholder (uncomment and configure when ready)
    // To use a custom domain:
    // 1. Register a domain in Route 53 or transfer an existing domain
    // 2. Create a hosted zone for your domain
    // 3. Pass customDomainName and hostedZoneId to this stack
    // 4. Uncomment the code below
    //
    // if (props.customDomainName && props.hostedZoneId) {
    //   const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
    //     hostedZoneId: props.hostedZoneId,
    //     zoneName: props.customDomainName,
    //   });
    //
    //   // Create CNAME record for frontend (e.g., app.yourdomain.com)
    //   new route53.CnameRecord(this, 'FrontendCname', {
    //     zone: hostedZone,
    //     recordName: 'app',
    //     domainName: frontendService.serviceUrl,
    //   });
    //
    //   // Create CNAME record for backend API (e.g., api.yourdomain.com)
    //   new route53.CnameRecord(this, 'BackendCname', {
    //     zone: hostedZone,
    //     recordName: 'api',
    //     domainName: backendService.serviceUrl,
    //   });
    //
    //   new cdk.CfnOutput(this, 'CustomFrontendUrl', {
    //     value: `https://app.${props.customDomainName}`,
    //     description: 'Custom Frontend URL',
    //   });
    //
    //   new cdk.CfnOutput(this, 'CustomBackendUrl', {
    //     value: `https://api.${props.customDomainName}`,
    //     description: 'Custom Backend API URL',
    //   });
    // }

    // Tags for all resources
    cdk.Tags.of(this).add('Project', 'AricaToucan');
    cdk.Tags.of(this).add('Environment', 'Development');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
