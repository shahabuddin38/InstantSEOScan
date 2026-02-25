import express from 'express';
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Authentication Routes
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', authMiddleware, meHandler);

// SEO Tools Routes (protected)
app.post('/api/audit', authMiddleware, auditHandler);
app.post('/api/keyword', authMiddleware, keywordHandler);
app.post('/api/dapachecker', authMiddleware, daPaCheckerHandler);
app.post('/api/bulkAuthority', authMiddleware, bulkAuthorityHandler);
app.post('/api/geo', authMiddleware, geoHandler);
app.post('/api/aiOverview', authMiddleware, aiOverviewHandler);

// Pricing Routes (public)
app.get('/api/pricing', getPricingPlansHandler);

// Admin Routes (protected)
app.get('/api/admin/pending-users', authMiddleware, adminMiddleware, getPendingUsersHandler);
app.post('/api/admin/approve-user', authMiddleware, adminMiddleware, approveUserHandler);
app.post('/api/admin/reject-user', authMiddleware, adminMiddleware, rejectUserHandler);
app.get('/api/admin/users', authMiddleware, adminMiddleware, getAllUsersHandler);
app.post('/api/admin/update-subscription', authMiddleware, adminMiddleware, updateSubscriptionHandler);
app.get('/api/admin/stats', authMiddleware, adminMiddleware, getSubscriptionStatsHandler);

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
