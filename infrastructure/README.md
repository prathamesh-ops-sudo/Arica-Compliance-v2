# Arica Toucan Infrastructure

AWS CDK infrastructure for deploying Arica Toucan ISO 27001/27002 Compliance SaaS to AWS App Runner.

## Architecture

This stack deploys two AWS App Runner services:

- **arica-toucan-backend** - Express.js API server
- **arica-toucan-frontend** - React/Vite static frontend served via Node.js

Both services are configured for:
- Automatic deployment on push to `main` branch
- 1 vCPU + 2 GB memory (minimal for development)
- Health checks enabled
- Public accessibility

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js 18+** installed
3. **AWS CDK CLI** installed globally: `npm install -g aws-cdk`
4. **GitHub Connection** created in AWS App Runner console (one-time setup)

## How to Deploy Infrastructure

There are two ways to deploy: **GitHub Actions (recommended)** or **local deployment**.

---

### Option A: Deploy via GitHub Actions (Recommended)

Deploy infrastructure automatically from GitHub without needing local AWS credentials.

#### Step 1: Create IAM Role with OIDC Trust for GitHub

1. Go to AWS Console > IAM > Identity providers
2. Add provider: OpenID Connect
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
3. Create IAM Role with trust policy for GitHub Actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:prathamesh-ops-sudo/Arica-Compliance-v2:*"
        }
      }
    }
  ]
}
```

4. Attach policies to the role: `AdministratorAccess` (or scoped CDK/CloudFormation/AppRunner permissions)

#### Step 2: Create App Runner GitHub Connection

1. Go to AWS Console > App Runner > GitHub connections
2. Click "Add new" and follow the OAuth flow to connect your GitHub account
3. Authorize access to the `prathamesh-ops-sudo/Arica-Compliance-v2` repository
4. Copy the **Connection ARN** (format: `arn:aws:apprunner:REGION:ACCOUNT:connection/NAME/ID`)

#### Step 3: Add GitHub Secrets

Go to GitHub repo > Settings > Secrets and variables > Actions, and add:

| Secret Name | Value |
|-------------|-------|
| `AWS_ROLE_ARN` | ARN of the IAM role created in Step 1 |
| `AWS_ACCOUNT_ID` | Your AWS account ID (12-digit number) |
| `GITHUB_CONNECTION_ARN` | App Runner GitHub connection ARN from Step 2 |

#### Step 4: Deploy

- **Automatic**: Push any changes to `infrastructure/` folder on `main` branch
- **Manual**: Go to Actions tab > "Deploy CDK Infrastructure" > "Run workflow"

The workflow will bootstrap CDK (if needed) and deploy the stack. Check the workflow run summary for the deployed service URLs.

---

### Option B: Deploy Locally

#### Step 1: Create GitHub Connection in AWS Console

1. Go to AWS Console > App Runner > GitHub connections
2. Click "Add new" and follow the OAuth flow to connect your GitHub account
3. Authorize access to the `prathamesh-ops-sudo/Arica-Compliance-v2` repository
4. Copy the **Connection ARN** (format: `arn:aws:apprunner:REGION:ACCOUNT:connection/NAME/ID`)

#### Step 2: Install Dependencies

```bash
cd infrastructure
npm ci
```

#### Step 3: Bootstrap CDK (First Time Only)

If this is your first time using CDK in this AWS account/region:

```bash
cdk bootstrap
```

#### Step 4: Deploy the Stack

Deploy with the GitHub connection ARN:

```bash
# Option 1: Using CDK context
cdk deploy -c githubConnectionArn=arn:aws:apprunner:us-east-1:123456789012:connection/github/abc123

# Option 2: Using environment variable
export GITHUB_CONNECTION_ARN=arn:aws:apprunner:us-east-1:123456789012:connection/github/abc123
cdk deploy
```

#### Step 5: Verify Deployment

After deployment completes, CDK will output the service URLs:

```
Outputs:
AricaToucanStack.BackendServiceUrl = https://xxxxx.us-east-1.awsapprunner.com
AricaToucanStack.FrontendServiceUrl = https://xxxxx.us-east-1.awsapprunner.com
```

Visit the frontend URL to access the application.

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run synth` | Synthesize CloudFormation template |
| `npm run deploy` | Deploy stack to AWS |
| `npm run destroy` | Destroy all stack resources |
| `cdk diff` | Compare deployed stack with current state |

## Configuration

### CDK Context Variables

Set in `cdk.json` or via `-c` flag:

| Variable | Description | Required |
|----------|-------------|----------|
| `githubConnectionArn` | ARN of the App Runner GitHub connection | Yes |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_CONNECTION_ARN` | Alternative to CDK context for connection ARN |
| `CDK_DEFAULT_ACCOUNT` | AWS account ID (auto-detected if AWS CLI configured) |
| `CDK_DEFAULT_REGION` | AWS region (defaults to us-east-1) |

## Future Enhancements

- [ ] Add DynamoDB tables for persistent storage
- [ ] Add AWS Bedrock integration for AI features
- [ ] Add custom domain with Route 53
- [ ] Add CloudWatch alarms and dashboards
- [ ] Add WAF for security

## Troubleshooting

### "GitHub connection not found"
Ensure the connection ARN is correct and the connection status is "Available" in the AWS Console.

### "Access denied" errors
Verify your AWS credentials have permissions for App Runner, IAM, and CloudFormation.

### Build failures in App Runner
Check the App Runner service logs in AWS Console for detailed build/runtime errors.
