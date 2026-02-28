module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const role = email === 'shahabjan38@gmail.com' ? 'admin' : 'user';
    
    return res.status(201).json({
      message: role === 'admin'
        ? 'Admin registration successful. You can now log in.'
        : 'Registration successful. Please wait for admin approval and verify your email.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
