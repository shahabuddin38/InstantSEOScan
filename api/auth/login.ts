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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Login request:', req.body);
    
    // Inline response for testing
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // TODO: Implement actual authentication
    return res.status(200).json({ 
      token: 'test-token-123',
      user: { id: 1, email, name: 'Test User', isAdmin: false }
    });
  } catch (error: any) {
    console.error('[API] Login error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }
}

