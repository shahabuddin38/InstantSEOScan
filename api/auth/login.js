import bcrypt from 'bcryptjs';
import { getUserByEmail } from '../db.js';
import { generateToken } from '../jwt-utils.js';

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('Login attempt for:', email);

    // Get user from database
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Account not found. Please register first.' });
    }
    
    console.log('User found, verifying password...');

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if user is approved (unless admin)
    if (user.role !== 'admin') {
      if (user.status !== 'approved') {
        return res.status(403).json({ 
          error: 'Your account is pending admin approval. Please wait.' 
        });
      }
      if (!user.verified) {
        return res.status(403).json({ 
          error: 'Please verify your email before logging in.' 
        });
      }
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        verified: user.verified,
        usage_count: user.usage_count,
        usage_limit: user.usage_limit
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
