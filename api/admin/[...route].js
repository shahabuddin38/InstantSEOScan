import bcrypt from 'bcryptjs';
import {
  createUser,
  getUserByEmail,
  getAllUsers,
  updateUserStatus,
  updateUserPlan,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD
} from '../db.js';
import { verifyToken, extractTokenFromHeader } from '../jwt-utils.js';

const setHeaders = (res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const getRouteParts = (queryRoute) => {
  if (Array.isArray(queryRoute)) return queryRoute;
  if (typeof queryRoute === 'string' && queryRoute) return [queryRoute];
  return [];
};

export default async (req, res) => {
  setHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const routeParts = getRouteParts(req.query?.route);

  try {
    if (routeParts.length === 1 && routeParts[0] === 'init') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const adminUser = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
      if (adminUser) {
        return res.status(200).json({
          message: 'Admin user already exists',
          user: {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            status: adminUser.status
          }
        });
      }

      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      const admin = await createUser(DEFAULT_ADMIN_EMAIL, hashedPassword, 'admin');

      return res.status(201).json({
        message: 'Admin account initialized successfully',
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          credential: {
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD
          }
        },
        note: 'Please change the password after first login'
      });
    }

    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (routeParts.length === 1 && routeParts[0] === 'users') {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const users = await getAllUsers();
      return res.status(200).json({ users });
    }

    if (routeParts.length === 3 && routeParts[0] === 'users' && routeParts[2] === 'approve') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const user = await updateUserStatus(routeParts[1], 'approved');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ success: true, user });
    }

    if (routeParts.length === 3 && routeParts[0] === 'users' && routeParts[2] === 'plan') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { plan, limit, days } = req.body || {};
      if (!plan || !Number.isFinite(Number(limit))) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      const numericDays = Number(days);
      const hasDays = Number.isFinite(numericDays) && numericDays > 0;
      const subscriptionEnd = hasDays
        ? new Date(Date.now() + numericDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const user = await updateUserPlan(routeParts[1], plan, Number(limit), subscriptionEnd);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ success: true, user });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Admin route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
