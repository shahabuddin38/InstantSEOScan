import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import type { Request, Response } from 'express';
import { queryUsers, initializeDatabase } from '../../server/lib/db.js';
import { comparePassword, generateToken } from '../../server/lib/auth.js';

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
  
  // Initialize database on first request
  initializeDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = queryUsers({ email } as any);
    const user = users.find((u: any) => u.email === email);
    
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }

    const isAdmin = email === 'shahabjan38@gmail.com';
    const token = generateToken(user.id, user.email, isAdmin);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin
      }
    });
  } catch (error: any) {
    console.error('[API] Login error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }
}

