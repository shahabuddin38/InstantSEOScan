import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../db.js';
import { generateToken } from '../jwt-utils.js';

const setHeaders = (res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async (req, res) => {
  setHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = String(req.query?.action || '').toLowerCase();

  try {
    if (action === 'register') {
      const { email, password } = req.body || {};
      const normalizedEmail = String(email || '').trim().toLowerCase();

      if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(normalizedEmail, hashedPassword);
      const isAdmin = normalizedEmail === String(DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

      return res.status(201).json({
        message: isAdmin
          ? 'Admin account created successfully. You can now log in.'
          : 'Registration successful! Your account is pending admin approval. You will receive an email when approved.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    }

    if (action === 'login') {
      const { email, password } = req.body || {};
      const normalizedEmail = String(email || '').trim().toLowerCase();

      if (!normalizedEmail || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      let user = await getUserByEmail(normalizedEmail);

      if (!user) {
        const canAutoInitAdmin =
          normalizedEmail === String(DEFAULT_ADMIN_EMAIL).trim().toLowerCase() &&
          password === DEFAULT_ADMIN_PASSWORD;

        if (canAutoInitAdmin) {
          const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
          await createUser(DEFAULT_ADMIN_EMAIL, hashedPassword, 'admin');
          user = await getUserByEmail(normalizedEmail);
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Account not found. Please register first.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      if (user.role !== 'admin') {
        if (user.status !== 'approved') {
          return res.status(403).json({ error: 'Your account is pending admin approval. Please wait.' });
        }
        if (!user.verified) {
          return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }
      }

      const token = generateToken(user);

      return res.status(200).json({
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
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error(`Auth ${action} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
