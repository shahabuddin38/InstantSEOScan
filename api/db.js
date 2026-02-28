// Database module - supports both Vercel Postgres and SQLite fallback

let usePostgres = false;
let db = null;

// Try to use better-sqlite3 for persistence
let Database = null;
try {
  Database = (await import('better-sqlite3')).default;
} catch (e) {
  console.log('SQLite not available, using in-memory fallback');
}

// Initialize database
async function initDatabase() {
  try {
    // Try Postgres first
    if (process.env.POSTGRES_URL) {
      const { sql } = await import('@vercel/postgres');
      await sql`SELECT 1`;
      console.log('Using Vercel Postgres');
      usePostgres = true;
      return;
    }
  } catch (error) {
    console.log('Postgres not available');
  }

  // Try SQLite
  if (Database) {
    try {
      db = new Database('/tmp/instant-seo-scan.db');
      console.log('Using SQLite database');
      
      // Create tables if they don't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          plan TEXT DEFAULT 'free',
          status TEXT DEFAULT 'pending',
          verified INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          usage_limit INTEGER DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          domain TEXT NOT NULL,
          scan_type TEXT,
          status TEXT DEFAULT 'completed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      return;
    } catch (error) {
      console.log('SQLite failed:', error.message);
    }
  }

  console.log('Using in-memory fallback (data will not persist)');
}

// Initialize on module load
initDatabase().catch(console.error);

// User functions
export async function getUserByEmail(email) {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      return result.rows[0] || null;
    }

    if (db) {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email) || null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  return null;
}

export async function createUser(email, hashedPassword, role = 'user') {
  try {
    const isAdmin = email === 'shahabjan38@gmail.com';
    const userRole = isAdmin ? 'admin' : role;
    const userStatus = isAdmin ? 'approved' : 'pending';
    const userVerified = isAdmin ? 1 : 0;

    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        INSERT INTO users (email, password, role, status, verified, plan, usage_limit)
        VALUES (${email}, ${hashedPassword}, ${userRole}, ${userStatus}, ${userVerified}, 
                ${isAdmin ? 'agency' : 'free'}, ${isAdmin ? 999999 : 5})
        RETURNING id, email, role, status, verified, plan
      `;
      return result.rows[0];
    }

    if (db) {
      const stmt = db.prepare(`
        INSERT INTO users (email, password, role, status, verified, plan, usage_limit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(email, hashedPassword, userRole, userStatus, userVerified, 
                              isAdmin ? 'agency' : 'free', isAdmin ? 999999 : 5);
      return { 
        id: result.lastInsertRowid, 
        email, 
        role: userRole, 
        status: userStatus, 
        verified: userVerified, 
        plan: isAdmin ? 'agency' : 'free' 
      };
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserStatus(userId, status) {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        UPDATE users SET status = ${status}, verified = 1
        WHERE id = ${userId}
        RETURNING id, email, status
      `;
      return result.rows[0];
    }

    if (db) {
      const stmt = db.prepare('UPDATE users SET status = ?, verified = 1 WHERE id = ?');
      stmt.run(status, userId);
      const user = db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(userId);
      return user;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        SELECT id, email, role, plan, status, verified, usage_count, usage_limit, created_at
        FROM users
        ORDER BY created_at DESC
      `;
      return result.rows;
    }

    if (db) {
      const stmt = db.prepare('SELECT id, email, role, plan, status, verified, usage_count, usage_limit, created_at FROM users ORDER BY created_at DESC');
      return stmt.all();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
  
  return [];
}

export async function getPendingUsers() {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        SELECT id, email, role, plan, status, verified, created_at
        FROM users
        WHERE status = 'pending'
        ORDER BY created_at ASC
      `;
      return result.rows;
    }

    if (db) {
      const stmt = db.prepare('SELECT id, email, role, plan, status, verified, created_at FROM users WHERE status = ? ORDER BY created_at ASC');
      return stmt.all('pending');
    }
  } catch (error) {
    console.error('Error fetching pending users:', error);
  }
  
  return [];
}

// Scans management
export async function createScan(userId, domain, scanType) {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        INSERT INTO scans (user_id, domain, scan_type, status)
        VALUES (${userId}, ${domain}, ${scanType}, 'completed')
        RETURNING id, domain, scan_type, created_at
      `;
      return result.rows[0];
    }

    if (db) {
      const stmt = db.prepare('INSERT INTO scans (user_id, domain, scan_type, status) VALUES (?, ?, ?, ?)');
      const result = stmt.run(userId, domain, scanType, 'completed');
      return { 
        id: result.lastInsertRowid, 
        domain, 
        scan_type: scanType, 
        created_at: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error('Error creating scan:', error);
    throw error;
  }
}

export async function getUserScans(userId) {
  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        SELECT id, domain, scan_type, status, created_at
        FROM scans
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return result.rows;
    }

    if (db) {
      const stmt = db.prepare('SELECT id, domain, scan_type, status, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC');
      return stmt.all(userId);
    }
  } catch (error) {
    console.error('Error fetching scans:', error);
  }
  
  return [];
}

// Check if user can access audit
export async function canUserAccessAudit(user) {
  if (!user) return false;
  if (user.status !== 'approved' && user.role !== 'admin') return false;
  if (!user.verified && user.role !== 'admin') return false;
  if (user.usage_count >= user.usage_limit && user.role !== 'admin') return false;
  return true;
}
