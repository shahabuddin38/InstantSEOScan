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
    
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { email, password } = body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const role = email === 'shahabjan38@gmail.com' ? 'admin' : 'user';
    
    res.status(201).json({
      message: role === 'admin'
        ? 'Admin registration successful. You can now log in.'
        : 'Registration successful. Please wait for admin approval and verify your email.'
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : String(err)
    });
  }
};
