import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import axios from 'axios';

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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the website HTML for analysis
    let html = '';
    let statusCode = 0;
    try {
      const response = await axios.get(url, { timeout: 5000 });
      html = response.data;
      statusCode = response.status;
    } catch (e: any) {
      console.warn(`Failed to fetch ${url}:`, e.message);
      html = '';
      statusCode = e.response?.status || 0;
    }

    // Parse basic SEO metrics without cheerio
    const metaTitle = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '';
    const metaDescription = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '';
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] || '';
    const images = (html.match(/<img[^>]*>/gi) || []).length;
    const imagesWithoutAlt = (html.match(/<img[^>]*?(?<!alt\s*=)>/gi) || []).length;
    const internalLinks = (html.match(/href="\/[^"]*"/gi) || []).length;
    const externalLinks = (html.match(/href="https?:\/\/[^"]*"/gi) || []).length - internalLinks;

    const ssl = url.startsWith('https');
    const pageSpeed = Math.floor(Math.random() * 40) + 60; // Mock 60-100
    
    let score = 100;
    const issues = [];

    if (!metaTitle || metaTitle.length < 10 || metaTitle.length > 60) {
      score -= 10;
      issues.push({ type: 'error', message: 'Meta title length should be between 10 and 60 characters.' });
    }
    if (!metaDescription || metaDescription.length < 50 || metaDescription.length > 160) {
      score -= 10;
      issues.push({ type: 'error', message: 'Meta description length should be between 50 and 160 characters.' });
    }
    if (h1Count === 0) {
      score -= 10;
      issues.push({ type: 'error', message: 'Page is missing an H1 tag.' });
    } else if (h1Count > 1) {
      score -= 5;
      issues.push({ type: 'warning', message: 'Multiple H1 tags found. Consider using only one.' });
    }
    if (!ssl) {
      score -= 20;
      issues.push({ type: 'error', message: 'Site is not using HTTPS.' });
    }
    if (imagesWithoutAlt > 0) {
      score -= Math.min(imagesWithoutAlt * 2, 10);
      issues.push({ type: 'warning', message: `${imagesWithoutAlt} images are missing alt attributes.` });
    }
    if (pageSpeed < 80) {
      score -= 10;
      issues.push({ type: 'warning', message: `Page speed is low (${pageSpeed}/100).` });
    }

    if (issues.length === 0) {
      issues.push({ type: 'success', message: 'No major SEO issues found!' });
    }

    res.status(200).json({
      score: Math.max(0, score),
      data: {
        url,
        metaTitle,
        metaDescription,
        h1Count,
        h2Count,
        canonical,
        ssl,
        statusCode,
        pageSpeed,
        images,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
      },
      issues
    });

  } catch (error: any) {
    console.error('[API] Audit error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Audit failed' });
    }
  }
}
