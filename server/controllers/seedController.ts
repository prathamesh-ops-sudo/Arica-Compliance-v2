import { type Response } from 'express';
import { dynamoDBStorage, type DynamoDBOrganization } from '../db/dynamodb';
import { analyticsService } from '../services';
import type { AuthenticatedRequest } from '../middleware';

const DEMO_ORG_ID = 'demo-org-001';

type AnalysisResult = DynamoDBOrganization['analysisResult'];

const demoQuestionnaireResponses = {
  'info-sec-policy': 'Yes',
  'risk-assessment': 'Partial',
  'asset-inventory': 'Yes',
  'access-control': 'Partial',
  'encryption': 'Yes',
  'incident-response': 'No',
  'business-continuity': 'Partial',
  'supplier-security': 'No',
  'physical-security': 'Yes',
  'hr-security': 'Partial',
  'secure-development': 'Partial',
  'network-security': 'Yes',
  'monitoring-logging': 'Partial',
  'compliance-audit': 'No',
};

const demoAnalysisResult: AnalysisResult = {
  overallScore: 62,
  gaps: [
    {
      control: 'A.16 Information Security Incident Management',
      description: 'No formal incident response plan or procedures documented',
      severity: 'High',
    },
    {
      control: 'A.15 Supplier Relationships',
      description: 'Supplier security requirements not defined or monitored',
      severity: 'High',
    },
    {
      control: 'A.18 Compliance',
      description: 'No regular compliance audits or reviews conducted',
      severity: 'High',
    },
    {
      control: 'A.6 Organization of Information Security',
      description: 'Risk assessment process incomplete - missing threat modeling',
      severity: 'Medium',
    },
    {
      control: 'A.9 Access Control',
      description: 'Access reviews not performed regularly',
      severity: 'Medium',
    },
    {
      control: 'A.17 Business Continuity',
      description: 'Business continuity plans not tested annually',
      severity: 'Medium',
    },
    {
      control: 'A.7 Human Resource Security',
      description: 'Security awareness training not mandatory for all staff',
      severity: 'Low',
    },
    {
      control: 'A.14 System Development',
      description: 'Secure coding guidelines partially implemented',
      severity: 'Low',
    },
  ],
  remedies: [
    {
      action: 'Develop and document incident response plan with defined roles and escalation procedures',
      timeline: '2-4 weeks',
    },
    {
      action: 'Create supplier security assessment questionnaire and review all critical suppliers',
      timeline: '4-6 weeks',
    },
    {
      action: 'Establish quarterly compliance review process and annual audit schedule',
      timeline: '2-3 weeks',
    },
    {
      action: 'Complete threat modeling exercise and update risk register',
      timeline: '3-4 weeks',
    },
    {
      action: 'Implement quarterly access reviews with documented approval workflow',
      timeline: '2-3 weeks',
    },
    {
      action: 'Schedule and conduct business continuity tabletop exercise',
      timeline: '4-6 weeks',
    },
    {
      action: 'Deploy security awareness training platform and make completion mandatory',
      timeline: '2-4 weeks',
    },
    {
      action: 'Finalize secure coding guidelines and integrate into CI/CD pipeline',
      timeline: '3-4 weeks',
    },
  ],
  stepByStepPlan: [
    'Week 1-2: Draft incident response plan and assign incident response team roles',
    'Week 2-3: Create supplier security questionnaire and identify critical suppliers',
    'Week 3-4: Complete threat modeling and update risk assessment documentation',
    'Week 4-5: Implement access review process and conduct first quarterly review',
    'Week 5-6: Send supplier security questionnaires and begin assessments',
    'Week 6-7: Deploy security awareness training and set completion deadlines',
    'Week 7-8: Finalize secure coding guidelines and developer training',
    'Week 8-9: Conduct business continuity tabletop exercise',
    'Week 9-10: Establish compliance review calendar and audit schedule',
    'Week 10-12: Review all implementations and prepare for certification audit',
  ],
  analyzedAt: new Date().toISOString(),
};

export const seedController = {
  async createDemoData(req: AuthenticatedRequest, res: Response) {
    try {
      const existingOrg = await dynamoDBStorage.getOrganization(DEMO_ORG_ID);
      
      if (existingOrg) {
        await dynamoDBStorage.updateOrganization(DEMO_ORG_ID, {
          questionnaireResponses: demoQuestionnaireResponses,
          analysisResult: demoAnalysisResult,
          complianceScore: demoAnalysisResult?.overallScore ?? 62,
          status: 'Partial',
          lastScanDate: new Date().toISOString(),
        });
      } else {
        const newOrg = await dynamoDBStorage.createOrganization({
          name: 'Demo Company Inc.',
          complianceScore: demoAnalysisResult?.overallScore ?? 62,
          status: 'Partial',
          lastScanDate: new Date().toISOString(),
        });
        
        await dynamoDBStorage.updateOrganization(newOrg.id, {
          questionnaireResponses: demoQuestionnaireResponses,
          analysisResult: demoAnalysisResult,
        });
      }

      await analyticsService.trackEvent({
        orgId: DEMO_ORG_ID,
        eventType: 'questionnaire_submitted',
        metadata: { source: 'demo_seed' },
      });

      await analyticsService.trackEvent({
        orgId: DEMO_ORG_ID,
        eventType: 'analysis_run',
        metadata: { source: 'demo_seed' },
      });

      return res.json({
        success: true,
        message: 'Demo data created successfully',
        data: {
          organizationId: DEMO_ORG_ID,
          organizationName: 'Demo Company Inc.',
          complianceScore: demoAnalysisResult.overallScore,
          gapsCount: demoAnalysisResult.gaps.length,
          remediesCount: demoAnalysisResult.remedies.length,
        },
      });
    } catch (error) {
      console.error('Error creating demo data:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to create demo data',
      });
    }
  },

  async getDemoCredentials(_req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      message: 'Demo credentials for testing',
      credentials: {
        note: 'Use these credentials to test the application',
        signupUrl: 'https://8amhmgsqgq.us-east-1.awsapprunner.com/signup',
        loginUrl: 'https://8amhmgsqgq.us-east-1.awsapprunner.com/login',
        instructions: [
          '1. Go to the signup URL and create a new account',
          '2. Use any email address (e.g., demo@example.com)',
          '3. Set a password (min 8 chars, uppercase, lowercase, number)',
          '4. After signup, you can login and access the dashboard',
          '5. Call POST /api/seed/demo to create sample data',
        ],
        demoOrgId: DEMO_ORG_ID,
      },
    });
  },
};
