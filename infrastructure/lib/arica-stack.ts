import * as cdk from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // Future: Add DynamoDB, Bedrock permissions here
    // appRunnerInstanceRole.addToPolicy(new iam.PolicyStatement({
    //   actions: ['dynamodb:*'],
    //   resources: ['*'],
    // }));

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

    // Tags for all resources
    cdk.Tags.of(this).add('Project', 'AricaToucan');
    cdk.Tags.of(this).add('Environment', 'Development');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
