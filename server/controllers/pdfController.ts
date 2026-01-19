import { type Response } from 'express';
import { storage } from '../db';
import { generateComplianceReport, uploadAndGetPresignedUrl, analyticsService } from '../services';
import type { AuthenticatedRequest } from '../middleware';

interface AnalysisResult {
  overallScore: number;
  gaps: Array<{
    control: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }>;
  remedies: Array<{
    action: string;
    timeline: string;
  }>;
  stepByStepPlan: string[];
}

export const pdfController = {
  async generatePdfReport(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.params.orgId as string;

      const org = await storage.getOrganization(orgId);
      if (!org) {
        return res.status(404).json({
          error: true,
          message: 'Organization not found',
        });
      }

      const orgWithAnalysis = org as typeof org & { analysisResult?: AnalysisResult };
      const analysis = orgWithAnalysis.analysisResult || null;

      const pdfBytes = await generateComplianceReport(org, analysis);
      const pdfBuffer = Buffer.from(pdfBytes);

      const filename = `compliance-report-${orgId}-${Date.now()}.pdf`;

      await analyticsService.trackEvent({
        orgId,
        eventType: 'pdf_generated',
        userId: req.user?.sub,
        metadata: { filename },
      });

      try {
        const { downloadUrl } = await uploadAndGetPresignedUrl(orgId, pdfBuffer, filename);

        return res.json({
          success: true,
          downloadUrl,
          filename,
          generatedAt: new Date().toISOString(),
        });
      } catch (s3Error) {
        console.log('S3 upload failed, returning PDF directly:', s3Error);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdfBuffer);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to generate PDF report',
      });
    }
  },
};
