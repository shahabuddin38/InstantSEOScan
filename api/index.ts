import express, { Request, Response } from 'express';
import cors from 'cors';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase } from '../server/lib/db.js';
import { authMiddleware, adminMiddleware } from '../server/middleware/auth.js';

// Import API handlers
import { registerHandler, loginHandler, meHandler } from '../server/api/auth.js';
import { auditHandler } from '../server/api/audit.js';
import { keywordHandler } from '../server/api/keyword.js';
import { daPaCheckerHandler } from '../server/api/dapachecker.js';
import { bulkAuthorityHandler } from '../server/api/bulkAuthority.js';
import { geoHandler } from '../server/api/geo.js';
import { aiOverviewHandler } from '../server/api/aiOverview.js';
import {
  getPendingUsersHandler,
  approveUserHandler,
  rejectUserHandler,
  getAllUsersHandler,
  updateSubscriptionHandler,
  getPricingPlansHandler,
  getSubscriptionStatsHandler
} from '../server/api/admin.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database once
try {
  initializeDatabase();
  console.log('[API] Database initialized');
} catch (error) {
  console.error('[API] Database initialization error:', error);
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Authentication Routes
app.post('/auth/register', registerHandler);
app.post('/auth/login', loginHandler);
app.get('/auth/me', authMiddleware, meHandler);

// SEO Tools Routes (protected)
app.post('/audit', authMiddleware, auditHandler);
app.post('/keyword', authMiddleware, keywordHandler);
app.post('/dapachecker', authMiddleware, daPaCheckerHandler);
app.post('/bulkAuthority', authMiddleware, bulkAuthorityHandler);
app.post('/geo', authMiddleware, geoHandler);
app.post('/aiOverview', authMiddleware, aiOverviewHandler);

// Pricing Routes (public)
app.get('/pricing', getPricingPlansHandler);

// Admin Routes (protected)
app.get('/admin/pending-users', authMiddleware, adminMiddleware, getPendingUsersHandler);
app.post('/admin/approve-user', authMiddleware, adminMiddleware, approveUserHandler);
app.post('/admin/reject-user', authMiddleware, adminMiddleware, rejectUserHandler);
app.get('/admin/users', authMiddleware, adminMiddleware, getAllUsersHandler);
app.post('/admin/update-subscription', authMiddleware, adminMiddleware, updateSubscriptionHandler);
app.get('/admin/stats', authMiddleware, adminMiddleware, getSubscriptionStatsHandler);

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error('[API] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log('[API] 404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Not Found' });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
