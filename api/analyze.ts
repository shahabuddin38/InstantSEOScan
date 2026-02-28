import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

function normalizeUrl(url: string) {
  const value = String(url || '').trim();
  if (!value) return '';
  return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'API working' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const targetUrl = normalizeUrl((req.body as any)?.url || '');
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
      responseType: 'text',
    });

    const html = String(response.data || '');
    const $ = cheerio.load(html);

    const title = $('title').first().text().trim() || 'Missing';
    const description = $('meta[name="description"]').attr('content')?.trim() || 'Missing';

    const technical = {
      title,
      description,
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      h3Count: $('h3').length,
      imgAltMissing: $('img').filter((_, el) => !$(el).attr('alt')).length,
      loadTime: 0,
    };

    return res.status(200).json({
      url: targetUrl,
      status: response.status,
      technical,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Analyze failed',
    });
  }
}
