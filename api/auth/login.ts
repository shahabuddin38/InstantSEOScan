import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // TODO: Connect to database and verify credentials
    // For now, return a placeholder response
    const isAdmin = email === 'shahabjan38@gmail.com';

    if (!isAdmin && email !== 'test@example.com') {
      return res.status(401).json({ error: 'Account not found. Please create an account.' });
    }

    // Create a dummy token for testing
    const token = jwt.sign(
      { id: 1, email, role: isAdmin ? 'admin' : 'user' },
      process.env.JWT_SECRET || 'default-secret'
    );

    return res.status(200).json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
};
