import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import axios from 'axios';

const corsMiddleware = cors({ origin: '*' });
const RAPIDAPI_KEY = 'ddcc181474msh9f948f7f9a00791p1bdcc6jsn6e1484faee71';

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve();
    });
  });
}

function getApiHeaders(host: string) {
  return {
    'x-rapidapi-host': host,
    'x-rapidapi-key': RAPIDAPI_KEY,
    'Content-Type': 'application/json'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domains } = req.body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Domains array is required' });
    }

    // Fetch DA/PA for each domain
    const results = [];
    for (const domain of domains.slice(0, 10)) {
      try {
        const response = await axios.post(
          'https://moz-da-pa1.p.rapidapi.com/v1/getDaPa',
          { q: domain },
          { headers: getApiHeaders('moz-da-pa1.p.rapidapi.com'), timeout: 10000 }
        );
        
        const daData = response.data || {};
        results.push({
          domain,
          da: daData.domain_authority || 0,
          pa: daData.page_authority || 0,
          backlinks: daData.external_urls_to_url || 0,
          spam: daData.spam_score || 0
        });
      } catch (e) {
        console.warn(`Failed to fetch DA/PA for ${domain}:`, e);
        results.push({
          domain,
          da: 0,
          pa: 0,
          backlinks: 0,
          spam: 0,
          error: 'Could not fetch metrics'
        });
      }
    }

    res.status(200).json(results);

  } catch (error: any) {
    console.error('[API] Bulk Authority error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to check authority' });
    }
  }
}
