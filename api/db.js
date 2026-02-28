import { sql } from '@vercel/postgres';

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
        plan VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'agency'
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        verified INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        usage_limit INTEGER DEFAULT 5,
        subscription_end TIMESTAMP,
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Scans table
    await sql`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        url VARCHAR(2048),
        scan_type VARCHAR(50), -- 'on-page', 'technical', 'audit'
        results TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `;

    console.log('Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// User management
export async function getUserByEmail(email) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function createUser(email, hashedPassword, role = 'user') {
  try {
    const isAdmin = email === 'shahabjan38@gmail.com';
    const userRole = isAdmin ? 'admin' : role;
    const userStatus = isAdmin ? 'approved' : 'pending';
    const userVerified = isAdmin ? 1 : 0;

    const result = await sql`
      INSERT INTO users (email, password, role, status, verified, plan, usage_limit)
      VALUES (${email}, ${hashedPassword}, ${userRole}, ${userStatus}, ${userVerified}, 
              ${isAdmin ? 'agency' : 'free'}, ${isAdmin ? 999999 : 5})
      RETURNING id, email, role, status, verified, plan
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserStatus(userId, status) {
  try {
    const result = await sql`
      UPDATE users SET status = ${status}, verified = 1
      WHERE id = ${userId}
      RETURNING id, email, status
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, role, plan, status, verified, usage_count, usage_limit, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getPendingUsers() {
  try {
    const result = await sql`
      SELECT id, email, role, plan, status, verified, created_at
      FROM users
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }
}

// Scans management
export async function createScan(userId, domain, scanType) {
  try {
    const result = await sql`
      INSERT INTO scans (user_id, domain, scan_type, status)
      VALUES (${userId}, ${domain}, ${scanType}, 'completed')
      RETURNING id, domain, scan_type, created_at
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating scan:', error);
    throw error;
  }
}

export async function getUserScans(userId) {
  try {
    const result = await sql`
      SELECT id, domain, scan_type, status, created_at
      FROM scans
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
}

// Check if user can access audit
export async function canUserAccessAudit(user) {
  if (!user) return false;
  if (user.status !== 'approved' && user.status !== 'admin') return false;
  if (!user.verified && user.role !== 'admin') return false;
  if (user.usage_count >= user.usage_limit && user.role !== 'admin') return false;
  return true;
}
