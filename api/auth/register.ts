import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { addUser, queryUsers } from '../../server/lib/db.js';
import { hashPassword, isValidEmail, isStrongPassword } from '../../server/lib/auth.js';

const corsMiddleware = cors({ origin: '*' });

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve();
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    const existingUser = queryUsers({ email } as any).find((u: any) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = hashPassword(password);
    const newUser = addUser({
      email,
      password: hashedPassword,
      name,
      phone: phone || undefined,
      approved: 0,
    });

    return res.status(201).json({ 
      message: 'Registration successful. Please wait for admin approval.',
      userId: newUser.id 
    });
  } catch (error: any) {
    console.error('[API] Register error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }
}
