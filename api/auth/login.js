export default (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  res.json({
    token: 'test_token_' + Date.now(),
    user: { id: 1, email, role: 'user', plan: 'free', status: 'approved', verified: 1 }
  });
};
