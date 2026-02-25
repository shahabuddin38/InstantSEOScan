import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try importing and initializing database
    const { queryUsers, initializeDatabase } = await import('../server/lib/db.js');
    initializeDatabase();
    const users = queryUsers();
    
    return res.status(200).json({
      success: true,
      userCount: users.length,
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        approved: u.approved
      }))
    });
  } catch (error: any) {
    console.error('[API] Debug error:', error);
    return res.status(500).json({ 
      error: error.message || 'Debug failed',
      stack: error.stack 
    });
  }
}
