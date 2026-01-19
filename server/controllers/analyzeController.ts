import type { Request, Response } from 'express';
import { bedrockService, analyticsService } from '../services';
import type { AuthenticatedRequest } from '../middleware';

export const analyzeController = {
  async analyzeOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.params.orgId as string;
      const forceRefresh = req.query.refresh === 'true';
      
      if (!orgId) {
        res.status(400).json({ error: true, message: 'Organization ID is required' });
        return;
      }

      if (!forceRefresh) {
        const cachedResult = await bedrockService.getAnalysisResult(orgId);
        if (cachedResult) {
          console.log(`Returning cached analysis for org ${orgId}`);
          res.json({ success: true, data: cachedResult, cached: true });
          return;
        }
      }

      const result = await bedrockService.analyzeOrganization(orgId);
      
      if (!result) {
        res.status(404).json({ error: true, message: 'Organization not found' });
        return;
      }

      await analyticsService.trackEvent({
        orgId,
        eventType: 'analysis_run',
        userId: req.user?.sub,
        metadata: { forceRefresh },
      });

      res.json({ success: true, data: result, cached: false });
    } catch (error) {
      console.error('Error analyzing organization:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze organization';
      res.status(500).json({ error: true, message });
    }
  },

  async getAnalysisResult(req: Request, res: Response): Promise<void> {
    try {
      const orgId = req.params.orgId as string;
      
      if (!orgId) {
        res.status(400).json({ error: true, message: 'Organization ID is required' });
        return;
      }

      const result = await bedrockService.getAnalysisResult(orgId);
      
      if (!result) {
        res.status(404).json({ error: true, message: 'Analysis result not found' });
        return;
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching analysis result:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch analysis result';
      res.status(500).json({ error: true, message });
    }
  },
};
