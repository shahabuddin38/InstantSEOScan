import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import axios from 'axios';

const corsMiddleware = cors({ origin: '*' });
const RAPIDAPI_KEY = 'ddcc181474msh9f948f7f9a00791p1bdcc6jsn6e1484faee71';

const RAPIDAPI_ENDPOINTS = {
  keywordVolume: {
    host: 'semrush-keyword-magic-tool.p.rapidapi.com',
    url: 'https://semrush-keyword-magic-tool.p.rapidapi.com/global-volume'
  },
  keywordResearch: {
    host: 'semrush-keyword-magic-tool.p.rapidapi.com',
    url: 'https://semrush-keyword-magic-tool.p.rapidapi.com/keyword-research'
  }
};

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
    const { keyword, country = 'us', languagecode = 'en' } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    // Get keyword volume data
    let volumeData = {};
    try {
      const volumeResponse = await axios.get(
        `${RAPIDAPI_ENDPOINTS.keywordVolume.url}?keyword=${encodeURIComponent(keyword)}&country=${country}`,
        { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.keywordVolume.host), timeout: 10000 }
      );
      volumeData = volumeResponse.data || {};
    } catch (e) {
      console.warn('Keyword volume API failed:', e);
      volumeData = { error: 'Could not fetch volume data' };
    }

    // Get keyword research data
    let researchData = {};
    try {
      const researchResponse = await axios.get(
        `${RAPIDAPI_ENDPOINTS.keywordResearch.url}?keyword=${encodeURIComponent(keyword)}&country=${country}&languagecode=${languagecode}`,
        { headers: getApiHeaders(RAPIDAPI_ENDPOINTS.keywordResearch.host), timeout: 10000 }
      );
      researchData = researchResponse.data || {};
    } catch (e) {
      console.warn('Keyword research API failed:', e);
      researchData = { error: 'Could not fetch research data' };
    }

    res.status(200).json({
      keyword,
      country,
      volume: volumeData,
      research: researchData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Keyword error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to fetch keyword data' });
    }
  }
}
