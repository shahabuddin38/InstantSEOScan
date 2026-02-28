const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const isAdmin = email === 'shahabjan38@gmail.com';

    if (!isAdmin && email !== 'test@example.com') {
      return res.status(401).json({ error: 'Account not found. Please create an account.' });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
