import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { initializeDatabase } from '../../server/lib/db.js';
import { authMiddleware, adminMiddleware } from '../../server/middleware/auth.js';

// Import handlers
import { registerHandler, loginHandler, meHandler } from '../../server/api/auth.js';
import { auditHandler } from '../../server/api/audit.js';
import { keywordHandler } from '../../server/api/keyword.js';
import { daPaCheckerHandler } from '../../server/api/dapachecker.js';
import { bulkAuthorityHandler } from '../../server/api/bulkAuthority.js';
import { geoHandler } from '../../server/api/geo.js';
import { aiOverviewHandler } from '../../server/api/aiOverview.js';
import {
  getPendingUsersHandler,
  approveUserHandler,
  rejectUserHandler,
  getAllUsersHandler,
  updateSubscriptionHandler,
  getPricingPlansHandler,
  getSubscriptionStatsHandler
} from '../../server/api/admin.js';

// Initialize database
initializeDatabase();

const corsMiddleware = cors({ origin: '*', credentials: true });

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  await runMiddleware(req, res, corsMiddleware);

  const url = req.url || '';
  const method = req.method || 'GET';

  console.log(`[API] ${method} ${url}`);

  try {
    // Auth routes
    if (url.includes('/auth/login') && method === 'POST') {
      return await loginHandler(req, res);
    }
    if (url.includes('/auth/register') && method === 'POST') {
      return await registerHandler(req, res);
    }
    if (url.includes('/auth/me') && method === 'GET') {
      await runMiddleware(req, res, authMiddleware);
      return await meHandler(req, res);
    }

    // SEO Tools routes (protected)
    if (url.includes('/audit') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await auditHandler(req, res);
    }
    if (url.includes('/keyword') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await keywordHandler(req, res);
    }
    if (url.includes('/dapachecker') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await daPaCheckerHandler(req, res);
    }
    if (url.includes('/bulkAuthority') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await bulkAuthorityHandler(req, res);
    }
    if (url.includes('/geo') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await geoHandler(req, res);
    }
    if (url.includes('/aiOverview') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      return await aiOverviewHandler(req, res);
    }

    // Pricing route (public)
    if (url.includes('/pricing') && method === 'GET') {
      return await getPricingPlansHandler(req, res);
    }

    // Admin routes (protected)
    if (url.includes('/admin/pending-users') && method === 'GET') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await getPendingUsersHandler(req, res);
    }
    if (url.includes('/admin/approve-user') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await approveUserHandler(req, res);
    }
    if (url.includes('/admin/reject-user') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await rejectUserHandler(req, res);
    }
    if (url.includes('/admin/users') && method === 'GET') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await getAllUsersHandler(req, res);
    }
    if (url.includes('/admin/update-subscription') && method === 'POST') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await updateSubscriptionHandler(req, res);
    }
    if (url.includes('/admin/stats') && method === 'GET') {
      await runMiddleware(req, res, authMiddleware);
      await runMiddleware(req, res, adminMiddleware);
      return await getSubscriptionStatsHandler(req, res);
    }

    // 404 handler
    console.log(`[API] Route not found: ${method} ${url}`);
    return res.status(404).json({ error: 'Route not found' });
  } catch (error: any) {
    console.error(`[API] Error:`, error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
