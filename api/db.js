// Database module - supports Postgres, SQLite, and module-level fallback
// For Vercel: uses module-level storage that persists during cold starts

// Module-level store (persists for the lifetime of the function container)
const MODULE_STORE = {
  users: new Map(),
  scans: new Map(),
  initialized: false
};

let usePostgres = false;
let useSQLite = false;
let db = null;

// Try to use better-sqlite3 for local development
let Database = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    Database = (await import('better-sqlite3')).default;
  } catch (e) {
    // SQLite not available
  }
}

// Initialize database
async function initDatabase() {
  if (MODULE_STORE.initialized) return;
  MODULE_STORE.initialized = true;

  try {
    // Try Postgres first
    if (process.env.POSTGRES_URL) {
      const { sql } = await import('@vercel/postgres');
      await sql`SELECT 1`;
      console.log('✓ Using Vercel Postgres');
      usePostgres = true;
      return;
    }
  } catch (error) {
    console.log('Postgres not available:', error.message);
  }

  // Try SQLite for local development
  if (Database && process.env.NODE_ENV !== 'production') {
    try {
      db = new Database('/tmp/instant-seo-scan.db');
      useSQLite = true;
      console.log('✓ Using SQLite database');
      
      // Create tables
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
      useSQLite = false;
    }
  }

  console.log('✓ Using module-level memory store (persists during function container lifetime)');
}

// Initialize on first import
initDatabase().catch(console.error);

// Helper to generate IDs for module store
function getNextUserId() {
  let maxId = 0;
  for (const user of MODULE_STORE.users.values()) {
    if (user.id > maxId) maxId = user.id;
  }
  return maxId + 1;
}

// User functions
export async function getUserByEmail(email) {
  await initDatabase();

  try {
    if (usePostgres) {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      return result.rows[0] || null;
    }

    if (useSQLite && db) {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email) || null;
    }

    // Module store fallback
    for (const user of MODULE_STORE.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  return null;
}

export async function createUser(email, hashedPassword, role = 'user') {
  await initDatabase();

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

    if (useSQLite && db) {
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

    // Module store
    const user = {
      id: getNextUserId(),
      email,
      password: hashedPassword,
      role: userRole,
      status: userStatus,
      verified: userVerified,
      plan: isAdmin ? 'agency' : 'free',
      usage_limit: isAdmin ? 999999 : 5,
      usage_count: 0,
      created_at: new Date().toISOString()
    };
    
    MODULE_STORE.users.set(user.id, user);
    console.log(`✓ User created: ${email} (ID: ${user.id})`);
    return { id: user.id, email: user.email, role: user.role, status: user.status, verified: user.verified, plan: user.plan };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserStatus(userId, status) {
  await initDatabase();

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

    if (useSQLite && db) {
      const stmt = db.prepare('UPDATE users SET status = ?, verified = 1 WHERE id = ?');
      stmt.run(status, userId);
      const user = db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(userId);
      return user;
    }

    // Module store
    const user = MODULE_STORE.users.get(userId);
    if (user) {
      user.status = status;
      user.verified = 1;
      return { id: user.id, email: user.email, status: user.status };
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  await initDatabase();

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

    if (useSQLite && db) {
      const stmt = db.prepare('SELECT id, email, role, plan, status, verified, usage_count, usage_limit, created_at FROM users ORDER BY created_at DESC');
      return stmt.all();
    }

    // Module store
    return Array.from(MODULE_STORE.users.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
  
  return [];
}

export async function getPendingUsers() {
  await initDatabase();

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

    if (useSQLite && db) {
      const stmt = db.prepare('SELECT id, email, role, plan, status, verified, created_at FROM users WHERE status = ? ORDER BY created_at ASC');
      return stmt.all('pending');
    }

    // Module store
    return Array.from(MODULE_STORE.users.values())
      .filter(u => u.status === 'pending')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } catch (error) {
    console.error('Error fetching pending users:', error);
  }
  
  return [];
}

// Scans management
export async function createScan(userId, domain, scanType) {
  await initDatabase();

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

    if (useSQLite && db) {
      const stmt = db.prepare('INSERT INTO scans (user_id, domain, scan_type, status) VALUES (?, ?, ?, ?)');
      const result = stmt.run(userId, domain, scanType, 'completed');
      return { 
        id: result.lastInsertRowid, 
        domain, 
        scan_type: scanType, 
        created_at: new Date().toISOString() 
      };
    }

    // Module store
    let maxId = 0;
    for (const scan of MODULE_STORE.scans.values()) {
      if (scan.id > maxId) maxId = scan.id;
    }
    const scan = {
      id: maxId + 1,
      user_id: userId,
      domain,
      scan_type: scanType,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    MODULE_STORE.scans.set(scan.id, scan);
    return { id: scan.id, domain: scan.domain, scan_type: scan.scan_type, created_at: scan.created_at };
  } catch (error) {
    console.error('Error creating scan:', error);
    throw error;
  }
}

export async function getUserScans(userId) {
  await initDatabase();

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

    if (useSQLite && db) {
      const stmt = db.prepare('SELECT id, domain, scan_type, status, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC');
      return stmt.all(userId);
    }

    // Module store
    return Array.from(MODULE_STORE.scans.values())
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
