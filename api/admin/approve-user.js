import { updateUserStatus, getUserByEmail } from '../db.js';
import { verifyToken, extractTokenFromHeader } from '../jwt-utils.js';

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Verify admin token
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

    const { userId, status } = req.body || {};

    if (!userId || !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Update user status
    const user = await updateUserStatus(userId, status);

    res.json({
      message: `User ${status} successfully`,
      user
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
