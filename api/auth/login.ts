import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const isAdmin = email === 'shahabjan38@gmail.com';

    if (!isAdmin && email !== 'test@example.com') {
      res.status(401).json({ error: 'Account not found. Please create an account.' });
      return;
    }

    const token = jwt.sign(
      { id: 1, email, role: isAdmin ? 'admin' : 'user' },
      process.env.JWT_SECRET || 'default-secret'
    );

    res.status(200).json({
      token,
      user: {
        id: 1,
        email,
        role: isAdmin ? 'admin' : 'user',
        plan: isAdmin ? 'agency' : 'free',
        status: 'approved',
        verified: 1
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
