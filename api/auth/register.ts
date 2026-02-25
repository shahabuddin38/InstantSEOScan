import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { initializeDatabase } from '../../../server/lib/db.js';
import { registerHandler } from '../../../server/api/auth.js';

const corsMiddleware = cors({ origin: '*' });

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve();
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
    console.log('[API] Register handler called');
    await registerHandler(req, res);
  } catch (error: any) {
    console.error('[API] Register error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }
}
