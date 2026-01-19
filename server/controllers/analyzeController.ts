import type { Request, Response } from 'express';
import { bedrockService } from '../services';

export const analyzeController = {
  async analyzeOrganization(req: Request, res: Response): Promise<void> {
    try {
      const orgId = req.params.orgId as string;
      
      if (!orgId) {
        res.status(400).json({ error: true, message: 'Organization ID is required' });
        return;
      }

      const result = await bedrockService.analyzeOrganization(orgId);
      
      if (!result) {
        res.status(404).json({ error: true, message: 'Organization not found' });
        return;
      }

      res.json({ success: true, data: result });
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
