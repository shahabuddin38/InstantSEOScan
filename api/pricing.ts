import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { initializeDatabase } from '../../server/lib/db.js';
import { getPricingPlansHandler } from '../../server/api/admin.js';

const corsMiddleware = cors({ origin: '*', credentials: true });

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

initializeDatabase();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, corsMiddleware);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await getPricingPlansHandler(req, res);
  } catch (error: any) {
    console.error('[API] Pricing error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch pricing' });
  }
}
