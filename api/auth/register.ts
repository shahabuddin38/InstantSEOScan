import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // TODO: Connect to database (PostgreSQL, MongoDB, etc.)
    // For now, return a placeholder response
    const role = email === 'shahabjan38@gmail.com' ? 'admin' : 'user';
    const status = email === 'shahabjan38@gmail.com' ? 'approved' : 'pending';

    return res.status(201).json({
      message: role === 'admin'
        ? 'Admin registration successful. You can now log in.'
        : 'Registration successful. Please wait for admin approval and verify your email.'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
