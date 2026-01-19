import { storage } from '../db/storage';
import type { Organization } from '@shared/schema';

export interface ReportData {
  organization: Organization;
  summary: {
    totalControls: number;
    compliantControls: number;
    partialControls: number;
    nonCompliantControls: number;
  };
  recommendations: string[];
  generatedAt: string;
}

export const reportService = {
  async getReportByOrgId(orgId: string): Promise<ReportData | null> {
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return null;
    }

    const mockReport: ReportData = {
      organization,
      summary: {
        totalControls: 114,
        compliantControls: Math.round((organization.complianceScore / 100) * 114),
        partialControls: Math.round(((100 - organization.complianceScore) / 100) * 114 * 0.4),
        nonCompliantControls: Math.round(((100 - organization.complianceScore) / 100) * 114 * 0.6),
      },
      recommendations: generateRecommendations(organization.complianceScore),
      generatedAt: new Date().toISOString(),
    };

    return mockReport;
  },
};

function generateRecommendations(score: number): string[] {
  const recommendations: string[] = [];

  if (score < 50) {
    recommendations.push('Implement a formal information security policy (ISO 27001 Clause 5.2)');
    recommendations.push('Establish access control procedures (ISO 27002 Control 5.15)');
    recommendations.push('Deploy endpoint protection solutions (ISO 27002 Control 8.7)');
  }
  
  if (score < 70) {
    recommendations.push('Implement data encryption for sensitive data (ISO 27002 Control 8.24)');
    recommendations.push('Develop and test incident response procedures (ISO 27001 Clause 10.1)');
  }
  
  if (score < 85) {
    recommendations.push('Conduct regular security awareness training (ISO 27002 Control 6.3)');
    recommendations.push('Maintain comprehensive asset inventory (ISO 27002 Control 5.9)');
  }
  
  if (score < 95) {
    recommendations.push('Review and test backup procedures (ISO 27002 Control 8.13)');
    recommendations.push('Perform regular internal audits');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current security posture');
    recommendations.push('Continue regular compliance monitoring');
  }

  return recommendations;
}
