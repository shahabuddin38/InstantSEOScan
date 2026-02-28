module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    
    // If body is a string, parse it
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { email, password } = body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
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
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : String(err)
    });
  }
};
