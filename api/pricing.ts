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
    console.log('[API] Pricing request');
    
    // TODO: Fetch actual pricing plans from database
    return res.status(200).json({
      plans: [
        {
          id: 1,
          name: 'Starter',
          price: 29,
          features: ['5 audits/month', 'Keyword research', 'Basic support']
        },
        {
          id: 2,
          name: 'Pro',
          price: 79,
          features: ['50 audits/month', 'Advanced analytics', 'Priority support']
        },
        {
          id: 3,
          name: 'Enterprise',
          price: 199,
          features: ['Unlimited audits', 'Dedicated account', '24/7 support']
        }
      ]
    });
  } catch (error: any) {
    console.error('[API] Pricing error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to fetch pricing' });
    }
  }
}
