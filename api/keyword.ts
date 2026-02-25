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
    const { keyword, country = 'us', languagecode = 'en' } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    // Get keyword volume data
    let volumeData = {};
    try {
      const volumeResponse = await axios.get(
        `https://semrush-keyword-magic-tool.p.rapidapi.com/global-volume?keyword=${encodeURIComponent(keyword)}&country=${country}`,
        { headers: getApiHeaders('semrush-keyword-magic-tool.p.rapidapi.com'), timeout: 10000 }
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
        `https://semrush-keyword-magic-tool.p.rapidapi.com/keyword-research?keyword=${encodeURIComponent(keyword)}&country=${country}&languagecode=${languagecode}`,
        { headers: getApiHeaders('semrush-keyword-magic-tool.p.rapidapi.com'), timeout: 10000 }
      );
      researchData = researchResponse.data || {};
    } catch (e) {
      console.warn('Keyword research API failed:', e);
      researchData = { error: 'Could not fetch research data' };
    }

    // Get question keywords
    let questionKeywords = {};
    try {
      const questionResponse = await axios.get(
        `https://semrush-keyword-magic-tool.p.rapidapi.com/Question-keyword-research-More?keyword=${encodeURIComponent(keyword)}&country=${country}`,
        { headers: getApiHeaders('semrush-keyword-magic-tool.p.rapidapi.com'), timeout: 10000 }
      );
      questionKeywords = questionResponse.data || {};
    } catch (e) {
      console.warn('Question keywords API failed:', e);
      questionKeywords = { error: 'Could not fetch question keywords' };
    }

    res.status(200).json({
      keyword,
      country,
      volume: volumeData,
      research: researchData,
      questions: questionKeywords,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Keyword error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to fetch keyword data' });
    }
  }
}
