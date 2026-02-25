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
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const response = await axios.post(
      'https://moz-da-pa1.p.rapidapi.com/v1/getDaPa',
      { q: domain },
      { headers: getApiHeaders('moz-da-pa1.p.rapidapi.com'), timeout: 10000 }
    );

    res.status(200).json({
      domain,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Authority check error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to fetch DA/PA data' });
    }
  }
}
