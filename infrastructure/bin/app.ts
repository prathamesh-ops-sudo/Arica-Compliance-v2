#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AricaToucanStack } from '../lib/arica-stack';

const app = new cdk.App();

const githubConnectionArn = app.node.tryGetContext('githubConnectionArn') 
  || process.env.GITHUB_CONNECTION_ARN;

if (!githubConnectionArn) {
  console.warn('\n⚠️  WARNING: githubConnectionArn not set!');
  console.warn('Set it via CDK context or GITHUB_CONNECTION_ARN environment variable.');
  console.warn('Example: cdk deploy -c githubConnectionArn=arn:aws:apprunner:...\n');
}

new AricaToucanStack(app, 'AricaToucanStack', {
  githubConnectionArn: githubConnectionArn || '',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Arica Toucan ISO 27001/27002 Compliance SaaS - App Runner Infrastructure',
});

app.synth();
