import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { initializeDatabase } from '../../server/lib/db.js';
import { authMiddleware } from '../../server/middleware/auth.js';
import { keywordHandler } from '../../server/api/keyword.js';

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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, authMiddleware);
    await keywordHandler(req, res);
  } catch (error: any) {
    console.error('[API] Keyword error:', error);
    res.status(500).json({ error: error.message || 'Keyword research failed' });
  }
}
