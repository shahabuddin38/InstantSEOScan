import { getUserByEmail, getUserById, createScan, canUserAccessAudit } from '../db.js';
import { verifyToken, extractTokenFromHeader } from '../jwt-utils.js';

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify user token
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPayload = verifyToken(token);
    if (!userPayload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get full user data
    const user = await getUserByEmail(userPayload.email) || await getUserById(userPayload.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user can access audit
    if (!await canUserAccessAudit(user)) {
      if (user.status === 'pending') {
        return res.status(403).json({ 
          error: 'Your account is pending admin approval. Please wait for approval before running audits.' 
        });
      }
      if (!user.verified) {
        return res.status(403).json({ 
          error: 'Please verify your email before running audits.' 
        });
      }
      if (user.usage_count >= user.usage_limit) {
        return res.status(403).json({ 
          error: 'You have reached your usage limit. Upgrade your plan to continue.' 
        });
      }
      return res.status(403).json({ error: 'You do not have access to this feature.' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { domain, scanType } = req.body || {};

    if (!domain || !scanType) {
      return res.status(400).json({ error: 'Domain and scan type required' });
    }

    if (!['on-page', 'technical', 'audit'].includes(scanType)) {
      return res.status(400).json({ error: 'Invalid scan type' });
    }

    // Create scan
    const scan = await createScan(user.id, domain, scanType);

    res.json({
      message: 'Audit started',
      scan,
      remaining: user.usage_limit - user.usage_count - 1
    });
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
