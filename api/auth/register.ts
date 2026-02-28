import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

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

    const role = email === 'shahabjan38@gmail.com' ? 'admin' : 'user';
    const status = email === 'shahabjan38@gmail.com' ? 'approved' : 'pending';

    res.status(201).json({
      message: role === 'admin'
        ? 'Admin registration successful. You can now log in.'
        : 'Registration successful. Please wait for admin approval and verify your email.'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
