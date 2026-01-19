import * as cdk from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface AricaToucanStackProps extends cdk.StackProps {
  githubConnectionArn: string;
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

    // Grant DynamoDB read/write permissions to App Runner instance role
    organizationsTable.grantReadWriteData(appRunnerInstanceRole);

    // Grant Bedrock InvokeModel permission to App Runner instance role
    appRunnerInstanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0'],
    }));

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
            AWS_REGION: this.region,
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
    // Note: For the frontend to know the backend URL, you need to:
    // 1. Deploy backend first to get its URL
    // 2. Set VITE_API_URL in the frontend build environment (Vite injects at build time)
    // 3. Redeploy frontend with the backend URL
    // Or use a runtime config approach (fetch config from backend/S3)
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

    // Tags for all resources
    cdk.Tags.of(this).add('Project', 'AricaToucan');
    cdk.Tags.of(this).add('Environment', 'Development');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
