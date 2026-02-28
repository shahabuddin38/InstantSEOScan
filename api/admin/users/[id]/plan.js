import { updateUserPlan } from '../../../db.js';
import { verifyToken, extractTokenFromHeader } from '../../../jwt-utils.js';

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.query?.id;
    const { plan, limit, days } = req.body || {};

    if (!userId || !plan || !Number.isFinite(Number(limit))) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const numericDays = Number(days);
    const hasDays = Number.isFinite(numericDays) && numericDays > 0;
    const subscriptionEnd = hasDays
      ? new Date(Date.now() + numericDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const user = await updateUserPlan(userId, plan, Number(limit), subscriptionEnd);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Update user plan error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
