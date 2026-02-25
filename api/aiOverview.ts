import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

const corsMiddleware = cors({ origin: '*' });

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve();
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { auditData, daScore, keywordData } = req.body;

    if (!auditData) {
      return res.status(400).json({ error: 'Audit data is required' });
    }

    // Generate AI-powered summary and recommendations based on audit data
    const summary = generateSummary(auditData, daScore, keywordData);
    const actionSteps = generateActionSteps(auditData);
    const priorityList = generatePriorityList(auditData);

    res.status(200).json({
      summary,
      actionSteps,
      priorityList,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] AI Overview error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'AI Overview generation failed' });
    }
  }
}

function generateSummary(auditData: any, daScore: any, keywordData: any): string {
  const title = auditData.metaTitle || 'Page';
  const hasMeta = auditData.metaDescription ? 'has' : 'is missing';
  const h1Status = auditData.h1Count > 0 ? 'properly optimized' : 'missing H1';
  const ssStatus = auditData.ssl ? 'secured with HTTPS' : 'not secured';
  const daLevel = daScore?.da > 50 ? 'strong' : 'needs improvement';

  return `Your page "${title}" ${h1Status} and ${hasMeta} a meta description. The site is ${ssStatus} with a ${daLevel} authority score (DA: ${daScore?.da || 'N/A'}). Focus on improving content quality and building backlinks to increase domain authority.`;
}

function generateActionSteps(auditData: any): string[] {
  const steps = [];

  if (!auditData.metaTitle || auditData.metaTitle.length < 10) {
    steps.push('Optimize meta title to be between 10-60 characters');
  }

  if (!auditData.metaDescription || auditData.metaDescription.length < 50) {
    steps.push('Write compelling meta description (50-160 characters)');
  }

  if (!auditData.h1Count || auditData.h1Count === 0) {
    steps.push('Add exactly one H1 tag with your primary keyword');
  }

  if (auditData.imagesWithoutAlt > 0) {
    steps.push(`Add alt text to ${auditData.imagesWithoutAlt} images`);
  }

  if (!auditData.ssl) {
    steps.push('Migrate to HTTPS for better security and SEO');
  }

  if (auditData.h2Count < 2) {
    steps.push('Add H2 subheadings to structure content better');
  }

  if (steps.length === 0) {
    steps.push('Continue monitoring SEO metrics and building quality backlinks');
    steps.push('Update content regularly to maintain search visibility');
  }

  return steps.slice(0, 4);
}

function generatePriorityList(auditData: any): any[] {
  const priorities = [];

  const criticalIssues = getErrorCount(auditData);
  const warningCount = getWarningCount(auditData);

  if (criticalIssues > 0) {
    priorities.push({
      task: `Fix ${criticalIssues} critical SEO error${criticalIssues > 1 ? 's' : ''}`,
      impact: 'High',
      effort: 'Medium'
    });
  }

  if (warningCount > 0) {
    priorities.push({
      task: `Address ${warningCount} SEO warning${warningCount > 1 ? 's' : ''}`,
      impact: 'Medium',
      effort: 'Low'
    });
  }

  priorities.push({
    task: 'Build high-quality backlinks from relevant domains',
    impact: 'High',
    effort: 'High'
  });

  priorities.push({
    task: 'Create target keyword content strategy',
    impact: 'High',
    effort: 'Medium'
  });

  return priorities.slice(0, 4);
}

function getErrorCount(auditData: any): number {
  let count = 0;
  if (!auditData.metaTitle || auditData.metaTitle.length < 10) count++;
  if (!auditData.metaDescription) count++;
  if (!auditData.h1Count) count++;
  if (!auditData.ssl) count++;
  return count;
}

function getWarningCount(auditData: any): number {
  let count = 0;
  if (auditData.imagesWithoutAlt > 0) count++;
  if (auditData.h2Count < 2) count++;
  if (auditData.externalLinks === 0) count++;
  return count;
}
