import { type Request, type Response } from 'express';
import { z } from 'zod';
import { questionnaireService, organizationService } from '../services';

const submitQuestionnaireSchema = z.object({
  responses: z.record(z.string()),
  organizationId: z.string().optional(),
  type: z.enum(['user', 'provider']).optional(),
});

export const questionnaireController = {
  async submitUserQuestionnaire(req: Request, res: Response) {
    try {
      const data = submitQuestionnaireSchema.parse(req.body);

      const response = await questionnaireService.createUserResponse({
        organizationId: data.organizationId || 'anonymous',
        responses: JSON.stringify(data.responses),
        submittedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Questionnaire submitted successfully',
        id: response.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: true, message: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: true, message: 'Failed to submit questionnaire' });
    }
  },

  async getUserResponses(_req: Request, res: Response) {
    try {
      const responses = await questionnaireService.getUserResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch questionnaire responses' });
    }
  },

  async submitProviderQuestionnaire(req: Request, res: Response) {
    try {
      const data = submitQuestionnaireSchema.parse(req.body);

      const response = await questionnaireService.createProviderResponse({
        organizationId: data.organizationId || 'internal',
        responses: JSON.stringify(data.responses),
        submittedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Provider review submitted successfully',
        id: response.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: true, message: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: true, message: 'Failed to submit provider review' });
    }
  },

  async getProviderResponses(_req: Request, res: Response) {
    try {
      const responses = await questionnaireService.getProviderResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch provider responses' });
    }
  },

  async submitQuestionnaire(req: Request, res: Response) {
    try {
      const data = submitQuestionnaireSchema.parse(req.body);
      const type = data.type || 'user';

      if (type === 'provider') {
        const response = await questionnaireService.createProviderResponse({
          organizationId: data.organizationId || 'internal',
          responses: JSON.stringify(data.responses),
          submittedAt: new Date().toISOString(),
        });

        return res.status(201).json({
          success: true,
          message: 'Provider questionnaire submitted successfully',
          id: response.id,
        });
      }

      const response = await questionnaireService.createUserResponse({
        organizationId: data.organizationId || 'anonymous',
        responses: JSON.stringify(data.responses),
        submittedAt: new Date().toISOString(),
      });

      if (data.organizationId) {
        const score = calculateComplianceScore(data.responses);
        await organizationService.updateOrganization(data.organizationId, {
          complianceScore: score,
          lastScanDate: new Date().toISOString().split('T')[0],
          status: score >= 85 ? 'Compliant' : score >= 60 ? 'Partial' : 'Critical',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Questionnaire submitted successfully',
        id: response.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: true, message: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: true, message: 'Failed to submit questionnaire' });
    }
  },
};

function calculateComplianceScore(responses: Record<string, string>): number {
  const values = Object.values(responses);
  if (values.length === 0) return 0;

  let score = 0;
  values.forEach((value) => {
    if (value === 'Yes') score += 100;
    else if (value === 'Partial') score += 50;
    else if (value === 'Not Applicable') score += 75;
  });

  return Math.round(score / values.length);
}
