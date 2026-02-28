module.exports = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const isAdmin = email === 'shahabjan38@gmail.com';
    
    const token = 'token_' + Math.random().toString(36).substr(2, 9);

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
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err ? err.toString() : 'Unknown error'
    });
  }
};
