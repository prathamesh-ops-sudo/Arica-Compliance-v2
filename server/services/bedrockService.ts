import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { storage } from '../db';
import type { DynamoDBOrganization } from '../db';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

export interface AnalysisResult {
  overallScore: number;
  gaps: Array<{ control: string; description: string; severity: 'High' | 'Medium' | 'Low' }>;
  remedies: Array<{ action: string; timeline: string }>;
  stepByStepPlan: string[];
  analyzedAt: string;
}

export interface OrganizationWithAnalysis {
  id: string;
  name: string;
  complianceScore: number;
  lastScanDate: string | null;
  status: string;
  questionnaireResponses?: Record<string, unknown>;
  scanData?: Record<string, unknown>;
  analysisResult?: AnalysisResult;
}

export const bedrockService = {
  async analyzeOrganization(orgId: string): Promise<AnalysisResult | null> {
    const org = await storage.getOrganization(orgId) as OrganizationWithAnalysis | undefined;
    if (!org) {
      throw new Error('Organization not found');
    }

    const complianceData = {
      organizationName: org.name,
      currentScore: org.complianceScore,
      status: org.status,
      lastScanDate: org.lastScanDate,
      questionnaireResponses: org.questionnaireResponses || {},
      scanData: org.scanData || {},
    };

    const prompt = `You are an ISO 27001/27002 compliance expert. Analyze the following compliance data and provide a detailed assessment.

Compliance Data:
${JSON.stringify(complianceData, null, 2)}

Based on this data, provide your analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": <number between 0-100>,
  "gaps": [
    {"control": "<ISO control reference>", "description": "<gap description>", "severity": "<High|Medium|Low>"}
  ],
  "remedies": [
    {"action": "<remediation action>", "timeline": "<suggested timeline>"}
  ],
  "stepByStepPlan": [
    "<step 1>",
    "<step 2>",
    ...
  ]
}

Ensure the response is valid JSON only, with no markdown formatting or additional text.`;

    try {
      const command = new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      let analysisText = responseBody.content?.[0]?.text || '';
      
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Bedrock response');
      }
      
      const analysis: Omit<AnalysisResult, 'analyzedAt'> = JSON.parse(jsonMatch[0]);
      
      const analysisResult: AnalysisResult = {
        ...analysis,
        analyzedAt: new Date().toISOString(),
      };

      const dynamoStorage = storage as { updateOrganization: (id: string, updates: { analysisResult: AnalysisResult }) => Promise<unknown> };
      await dynamoStorage.updateOrganization(orgId, {
        analysisResult,
      });

      return analysisResult;
    } catch (error) {
      console.error('Error invoking Bedrock:', error);
      throw error;
    }
  },

  async getAnalysisResult(orgId: string): Promise<AnalysisResult | null> {
    const org = await storage.getOrganization(orgId) as OrganizationWithAnalysis | undefined;
    if (!org) {
      return null;
    }
    return org.analysisResult || null;
  },
};
