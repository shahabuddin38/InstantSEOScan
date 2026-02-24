import bcrypt from 'bcryptjs';

// Simple in-memory database for Vercel deployment
interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  approved: number;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  billing_cycle: number;
  features: string;
  created_at: string;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date?: string;
  status: string;
  auto_renew: number;
  created_at: string;
}

class Database {
  users: User[] = [];
  plans: Plan[] = [];
  subscriptions: Subscription[] = [];
  nextUserId = 1;
  nextPlanId = 1;
  nextSubId = 1;

  prepare(sql: string) {
    return {
      run: (...params: any[]) => {
        // Mock implementation
      },
      get: (...params: any[]) => {
        // Mock implementation
      },
      all: (...params: any[]) => {
        // Mock implementation
      }
    };
  }

  exec(sql: string) {
    // Mock implementation
  }
}

const db = new Database();

export function initializeDatabase() {
  // Initialize default plans
  if (db.plans.length === 0) {
    db.plans = [
      {
        id: 1,
        name: 'Basic',
        price: 29,
        billing_cycle: 30,
        features: JSON.stringify([
          'Up to 100 keyword searches/month',
          'Basic site audit',
          'Authority checking',
          '5 projects',
          'Email support'
        ]),
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Pro',
        price: 99,
        billing_cycle: 30,
        features: JSON.stringify([
          'Up to 1000 keyword searches/month',
          'Advanced site audit',
          'Authority checking with backlinks',
          '50 projects',
          'Priority email support',
          'API access',
          'Rank tracking'
        ]),
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Enterprise',
        price: 299,
        billing_cycle: 30,
        features: JSON.stringify([
          'Unlimited keyword searches',
          'Advanced site audit',
          'Authority checking with backlinks',
          'Unlimited projects',
          '24/7 phone support',
          'API access',
          'Rank tracking',
          'Custom integrations',
          'Dedicated account manager',
          'Monthly reporting'
        ]),
        created_at: new Date().toISOString()
      }
    ];
    db.nextPlanId = 4;
  }

  // Create admin user if not exists
  const adminExists = db.users.find(u => u.email === 'shahabjan38@gmail.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin@@788', 10);
    db.users.push({
      id: db.nextUserId++,
      email: 'shahabjan38@gmail.com',
      password: hashedPassword,
      name: 'Shahab Uddin',
      phone: '+923469366699',
      approved: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  console.log('Database initialized successfully (in-memory)');
}

// Query helpers
export function queryUsers(filter?: Partial<User>) {
  if (!filter) return db.users;
  return db.users.filter(u => 
    Object.entries(filter).every(([key, value]) => (u as any)[key] === value)
  );
}

export function addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const newUser: User = {
    ...user,
    id: db.nextUserId++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.users.push(newUser);
  return newUser;
}

export function updateUser(id: number, updates: Partial<User>) {
  const user = db.users.find(u => u.id === id);
  if (user) {
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
  }
  return user;
}

export function deleteUser(id: number) {
  db.users = db.users.filter(u => u.id !== id);
}

export function queryPlans() {
  return db.plans;
}

export function querySubscriptions(filter?: Partial<Subscription>) {
  if (!filter) return db.subscriptions;
  return db.subscriptions.filter(s =>
    Object.entries(filter).every(([key, value]) => (s as any)[key] === value)
  );
}

export function addSubscription(sub: Omit<Subscription, 'id' | 'created_at'>) {
  const newSub: Subscription = {
    ...sub,
    id: db.nextSubId++,
    created_at: new Date().toISOString()
  };
  db.subscriptions.push(newSub);
  return newSub;
}

export function updateSubscription(id: number, updates: Partial<Subscription>) {
  const sub = db.subscriptions.find(s => s.id === id);
  if (sub) {
    Object.assign(sub, updates);
  }
  return sub;
}
