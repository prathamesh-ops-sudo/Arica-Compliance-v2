import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface Organization {
  id: string;
  name: string;
  complianceScore: number;
  lastScanDate: string | null;
  status: string;
}

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

export async function generateComplianceReport(
  org: Organization,
  analysis: AnalysisResult | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  const primaryColor = rgb(0.2, 0.4, 0.6);
  const secondaryColor = rgb(0.3, 0.3, 0.3);
  const highSeverityColor = rgb(0.8, 0.2, 0.2);
  const mediumSeverityColor = rgb(0.9, 0.6, 0.1);
  const lowSeverityColor = rgb(0.2, 0.6, 0.3);

  let coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - 150;

  coverPage.drawText('ISO 27001/27002', {
    x: margin,
    y: yPosition,
    size: 32,
    font: helveticaBold,
    color: primaryColor,
  });

  yPosition -= 50;
  coverPage.drawText('Compliance Assessment Report', {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: secondaryColor,
  });

  yPosition -= 80;
  coverPage.drawText(`Organization: ${org.name}`, {
    x: margin,
    y: yPosition,
    size: 16,
    font: helvetica,
    color: secondaryColor,
  });

  yPosition -= 30;
  coverPage.drawText(`Report Date: ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: helvetica,
    color: secondaryColor,
  });

  yPosition -= 30;
  coverPage.drawText(`Last Scan: ${org.lastScanDate}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: helvetica,
    color: secondaryColor,
  });

  yPosition -= 60;
  const scoreColor = org.complianceScore >= 80 ? lowSeverityColor : 
                     org.complianceScore >= 60 ? mediumSeverityColor : highSeverityColor;
  
  coverPage.drawText('Compliance Score', {
    x: margin,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: primaryColor,
  });

  yPosition -= 40;
  coverPage.drawText(`${org.complianceScore}%`, {
    x: margin,
    y: yPosition,
    size: 48,
    font: helveticaBold,
    color: scoreColor,
  });

  yPosition -= 30;
  coverPage.drawText(`Status: ${org.status}`, {
    x: margin,
    y: yPosition,
    size: 16,
    font: helvetica,
    color: scoreColor,
  });

  yPosition -= 100;
  coverPage.drawText('Powered by Arica Toucan', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  coverPage.drawText('AI-Powered Compliance Analysis', {
    x: margin,
    y: yPosition - 20,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  if (analysis) {
    let gapsPage = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin;

    gapsPage.drawText('Compliance Gaps Analysis', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: primaryColor,
    });

    yPosition -= 40;

    if (analysis.gaps && analysis.gaps.length > 0) {
      for (const gap of analysis.gaps) {
        if (yPosition < 100) {
          gapsPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }

        const severityColor = gap.severity === 'High' ? highSeverityColor :
                              gap.severity === 'Medium' ? mediumSeverityColor : lowSeverityColor;

        gapsPage.drawText(`[${gap.severity}]`, {
          x: margin,
          y: yPosition,
          size: 10,
          font: helveticaBold,
          color: severityColor,
        });

        gapsPage.drawText(gap.control, {
          x: margin + 60,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: secondaryColor,
        });

        yPosition -= 20;

        const descLines = wrapText(gap.description, 80);
        for (const line of descLines) {
          gapsPage.drawText(line, {
            x: margin + 20,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: secondaryColor,
          });
          yPosition -= 15;
        }

        yPosition -= 10;
      }
    } else {
      gapsPage.drawText('No significant compliance gaps identified.', {
        x: margin,
        y: yPosition,
        size: 12,
        font: helvetica,
        color: lowSeverityColor,
      });
    }

    let remediesPage = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin;

    remediesPage.drawText('Recommended Remediation Actions', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: primaryColor,
    });

    yPosition -= 40;

    if (analysis.remedies && analysis.remedies.length > 0) {
      for (let i = 0; i < analysis.remedies.length; i++) {
        const remedy = analysis.remedies[i];
        
        if (yPosition < 100) {
          remediesPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }

        remediesPage.drawText(`${i + 1}.`, {
          x: margin,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: primaryColor,
        });

        const actionLines = wrapText(remedy.action, 75);
        for (const line of actionLines) {
          remediesPage.drawText(line, {
            x: margin + 25,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: secondaryColor,
          });
          yPosition -= 15;
        }

        remediesPage.drawText(`Timeline: ${remedy.timeline}`, {
          x: margin + 25,
          y: yPosition,
          size: 10,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });

        yPosition -= 25;
      }
    }

    let planPage = pdfDoc.addPage([pageWidth, pageHeight]);
    yPosition = pageHeight - margin;

    planPage.drawText('Step-by-Step Implementation Plan', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: primaryColor,
    });

    yPosition -= 40;

    if (analysis.stepByStepPlan && analysis.stepByStepPlan.length > 0) {
      for (let i = 0; i < analysis.stepByStepPlan.length; i++) {
        const step = analysis.stepByStepPlan[i];
        
        if (yPosition < 100) {
          planPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }

        planPage.drawText(`Step ${i + 1}:`, {
          x: margin,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: primaryColor,
        });

        yPosition -= 18;

        const stepLines = wrapText(step, 80);
        for (const line of stepLines) {
          planPage.drawText(line, {
            x: margin + 15,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: secondaryColor,
          });
          yPosition -= 15;
        }

        yPosition -= 15;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
