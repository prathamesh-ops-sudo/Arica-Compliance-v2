# Arica Toucan - ISO 27001/27002 Compliance SaaS

Arica Toucan is a comprehensive compliance management platform that helps organizations achieve and maintain ISO 27001/27002 certification through AI-powered assessments, gap analysis, and actionable remediation plans.

## Live Application

- **Frontend**: https://8amhmgsqgq.us-east-1.awsapprunner.com
- **Backend API**: https://hdqnvk4mnm.us-east-1.awsapprunner.com

## Features

- **Comprehensive Questionnaires**: Structured assessments aligned with ISO 27001/27002 controls
- **AI-Powered Analysis**: Claude 3 Sonnet analyzes responses and identifies compliance gaps
- **PDF Reports**: Professional compliance reports for stakeholders and auditors
- **Multi-Organization Support**: Manage compliance across multiple organizations
- **Step-by-Step Plans**: Actionable implementation plans with timelines
- **Usage Analytics**: Track analyses and reports per organization
- **Data Export**: Download all organization data as JSON

## Architecture

```
                                    +------------------+
                                    |   CloudFront     |
                                    |   (Future CDN)   |
                                    +--------+---------+
                                             |
              +------------------------------+------------------------------+
              |                                                             |
    +---------v---------+                                       +-----------v-----------+
    |   App Runner      |                                       |     App Runner        |
    |   (Frontend)      |                                       |     (Backend)         |
    |   React + Vite    |                                       |   Express + TypeScript|
    +-------------------+                                       +-----------+-----------+
                                                                            |
              +-------------------------------------------------------------+
              |                              |                              |
    +---------v---------+        +-----------v-----------+      +-----------v-----------+
    |    DynamoDB       |        |      DynamoDB         |      |     AWS Bedrock       |
    | AricaOrganizations|        |    AricaAnalytics     |      |   Claude 3 Sonnet     |
    +-------------------+        +-----------------------+      +-----------------------+
              |
    +---------v---------+
    |        S3         |
    |  PDF Reports      |
    +-------------------+
```

## User Guide

### 1. Sign Up / Login

1. Navigate to the application URL
2. Click "Sign Up" to create a new account
3. Enter your email and password
4. Verify your email (check spam folder)
5. Log in with your credentials

### 2. Complete Questionnaire

1. After login, click "Start Assessment" or navigate to User Questionnaire
2. Answer each question about your organization's security practices
3. Options: Yes (100%), Partial (50%), N/A (75%), No (0%)
4. Submit the questionnaire when complete

### 3. Run AI Analysis

1. Go to Admin Dashboard
2. Find your organization in the list
3. Click "AI Analysis" button
4. Wait for Claude 3 Sonnet to analyze your responses
5. Review the results:
   - Overall compliance score
   - Identified gaps with severity ratings
   - Recommended remediation actions
   - Step-by-step implementation plan

### 4. Generate PDF Report

1. After running AI analysis, click "Download PDF"
2. The report includes:
   - Cover page with organization details
   - Compliance gaps table
   - Remediation recommendations
   - Implementation timeline

### 5. Export Data

1. Go to Admin Dashboard
2. Click the export button for your organization
3. Download JSON file with all organization data

## Environment Variables

### Backend (server/)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `DYNAMODB_TABLE_NAME` | Organizations table name | `AricaOrganizations` |
| `DYNAMODB_ANALYTICS_TABLE` | Analytics table name | `AricaAnalytics` |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | - |
| `COGNITO_CLIENT_ID` | Cognito App Client ID | - |
| `S3_REPORTS_BUCKET` | S3 bucket for PDF reports | - |

### Frontend (client/)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+
- AWS CLI configured (for DynamoDB/Bedrock access)

### Setup

```bash
# Clone the repository
git clone https://github.com/prathamesh-ops-sudo/Arica-Compliance-v2.git
cd Arica-Compliance-v2

# Install dependencies
npm install

# Start development server (both frontend and backend)
npm run dev
```

### Running Separately

```bash
# Backend only
cd server && npm run dev

# Frontend only
cd client && npm run dev
```

## Deployment

The application auto-deploys to AWS App Runner when changes are pushed to the `main` branch.

### Manual CDK Deployment

```bash
cd infrastructure
npm ci
cdk deploy -c githubConnectionArn=<your-connection-arn>
```

See [infrastructure/README.md](infrastructure/README.md) for detailed deployment instructions.

## Troubleshooting

### Bedrock Access Denied

If you see "Access denied" when running AI analysis:

1. Go to AWS Bedrock console
2. Navigate to Model access
3. Request access to Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
4. For Anthropic models, you may need to submit use case details

### Cognito Authentication Issues

1. Verify `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` are set correctly
2. Check that the user pool exists in the correct region
3. Ensure the app client has the required OAuth flows enabled

### DynamoDB Connection Issues

1. Verify AWS credentials are configured
2. Check that the DynamoDB tables exist
3. Ensure the IAM role has read/write permissions

### PDF Generation Fails

1. Check S3 bucket exists and is accessible
2. Verify IAM role has S3 PutObject and GetObject permissions
3. Check CloudWatch logs for detailed error messages

## API Reference

### Organizations

- `GET /api/admin/organizations` - List all organizations
- `GET /api/admin/organizations/:id` - Get organization details
- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations/:id/export` - Export organization data

### Questionnaire

- `POST /api/questionnaire/submit` - Submit questionnaire responses

### Analysis

- `POST /api/analyze/:orgId` - Run AI analysis
- `GET /api/analyze/:orgId` - Get cached analysis result

### Reports

- `GET /api/report/:orgId` - Get report data
- `GET /api/report/pdf/:orgId` - Generate and download PDF

### Analytics

- `GET /api/analytics/:orgId/stats` - Get usage statistics
- `GET /api/analytics/:orgId/events` - Get recent events

### Billing (Stub)

- `GET /api/billing/plans` - Get pricing plans
- `POST /api/billing/subscribe` - Subscribe to plan
- `POST /api/billing/cancel` - Cancel subscription

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Express, TypeScript, AWS SDK v3
- **Database**: DynamoDB
- **AI**: AWS Bedrock (Claude 3 Sonnet)
- **Auth**: AWS Cognito
- **Storage**: S3
- **Hosting**: AWS App Runner
- **Infrastructure**: AWS CDK

## License

Proprietary - Arica Technologies
