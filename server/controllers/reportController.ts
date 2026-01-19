import { type Request, type Response } from 'express';
import { reportService } from '../services';

export const reportController = {
  async getReport(req: Request<{ orgId: string }>, res: Response) {
    try {
      const orgId = req.params.orgId;
      const report = await reportService.getReportByOrgId(orgId);

      if (!report) {
        return res.status(404).json({ error: true, message: 'Organization not found' });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to generate report' });
    }
  },
};
