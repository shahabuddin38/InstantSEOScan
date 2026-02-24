import { Request, Response } from 'express';
import { 
  queryUsers,
  addUser,
  querySubscriptions,
  queryPlans
} from '../lib/db.js';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  isValidEmail,
  isStrongPassword 
} from '../lib/auth.js';

export async function registerHandler(req: Request, res: Response) {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
    });
  }

  try {
    const existingUser = queryUsers({ email } as any).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = hashPassword(password);
    const newUser = addUser({
      email,
      password: hashedPassword,
      name,
      phone: phone || undefined,
      approved: 0,
    });

    res.status(201).json({ 
      message: 'Registration successful. Please wait for admin approval.',
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = queryUsers({ email } as any);
    const user = users.find(u => u.email === email);
    
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }

    const isAdmin = email === 'shahabjan38@gmail.com';
    const token = generateToken(user.id, user.email, isAdmin);

    // Get subscription info
    const subscriptions = querySubscriptions({ user_id: user.id });
    const activeSubscription = subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    const subscription = activeSubscription ? {
      name: activeSubscription.plan_id,
      end_date: activeSubscription.end_date,
      status: activeSubscription.status
    } : null;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin,
        subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function meHandler(req: Request, res: Response) {
  const userId = (req as any).userId;

  try {
    const users = queryUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptions = querySubscriptions({ user_id: userId });
    const activeSubscription = subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    const subscription = activeSubscription ? {
      plan_id: activeSubscription.plan_id,
      end_date: activeSubscription.end_date,
      status: activeSubscription.status
    } : null;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      approved: user.approved,
      created_at: user.created_at,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Me handler error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
