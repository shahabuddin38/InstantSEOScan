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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Get traffic data from Semrush
    let trafficData = {};
    try {
      const trafficResponse = await axios.get(
        `https://semrush8.p.rapidapi.com/url_traffic?url=${encodeURIComponent(url)}`,
        { headers: getApiHeaders('semrush8.p.rapidapi.com'), timeout: 10000 }
      );
      trafficData = trafficResponse.data || {};
    } catch (e) {
      console.warn('Traffic API failed:', e);
      trafficData = { error: 'Could not fetch traffic data' };
    }

    // Get SEO audit report
    let auditData = {};
    try {
      const auditResponse = await axios.post(
        'https://technical-seo-audit.p.rapidapi.com/api/complete-seo-report',
        { url },
        { headers: getApiHeaders('technical-seo-audit.p.rapidapi.com'), timeout: 15000 }
      );
      auditData = auditResponse.data || {};
    } catch (e) {
      console.warn('SEO audit API failed:', e);
      auditData = { error: 'Could not fetch SEO audit data' };
    }

    res.status(200).json({
      url,
      traffic: trafficData,
      audit: auditData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Audit error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Audit failed' });
    }
  }
}
    });

  } catch (error: any) {
    console.error('[API] Audit error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Audit failed' });
    }
  }
}
