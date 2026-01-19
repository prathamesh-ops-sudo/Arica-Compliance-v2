import { type Response } from 'express';
import { analyticsService } from '../services';
import type { AuthenticatedRequest } from '../middleware';

export const analyticsController = {
  async getUsageStats(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const userOrgId = req.user?.organizationId;

      if (userOrgId && userOrgId !== orgId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'Access denied to this organization\'s analytics',
        });
      }

      const stats = await analyticsService.getUsageStats(orgId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to fetch usage statistics',
      });
    }
  },

  async getRecentEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const userOrgId = req.user?.organizationId;
      const limit = parseInt(req.query.limit as string) || 50;

      if (userOrgId && userOrgId !== orgId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'Access denied to this organization\'s analytics',
        });
      }

      const events = await analyticsService.getRecentEvents(orgId, limit);

      return res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Error fetching recent events:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to fetch recent events',
      });
    }
  },
};
