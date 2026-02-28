import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail } from '../db.js';

export default async function handler(req, res) {
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
    // Check if admin already exists
    const adminUser = await getUserByEmail('shahabjan38@gmail.com');
    if (adminUser) {
      return res.status(200).json({ 
        message: 'Admin user already exists',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          status: adminUser.status
        }
      });
    }

    // Create admin user with default password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await createUser('shahabjan38@gmail.com', hashedPassword);

    res.status(201).json({
      message: 'Admin account initialized successfully',
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        credential: {
          email: 'shahabjan38@gmail.com',
          password: 'Admin123!'
        }
      },
      note: 'Please change the password after first login'
    });
  } catch (error) {
    console.error('Admin init error:', error);
    res.status(500).json({ error: 'Failed to initialize admin account' });
  }
}
