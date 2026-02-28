// Database module - supports PostgreSQL (via pg), SQLite, and module-level fallback
// Supports DATABASE_URL for Prisma and standard PostgreSQL connections

// Module-level store (persists for the lifetime of the function container)
const MODULE_STORE = {
  users: new Map(),
  scans: new Map(),
  initialized: false
};

export const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'shahabjan38@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
const AUTO_INIT_ADMIN = process.env.AUTO_INIT_ADMIN !== 'false';

let usePostgres = false;
let useSQLite = false;
let db = null;
let pgPool = null;

let bcrypt = null;
try {
  const bcryptModule = await import('bcryptjs');
  bcrypt = bcryptModule.default || bcryptModule;
} catch (e) {
  console.log('bcryptjs package not available in this environment');
}

// PostgreSQL pool
let Pool = null;
try {
  Pool = (await import('pg')).Pool;
} catch (e) {
  console.log('pg package not available in this environment');
}

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
    // Try PostgreSQL first (DATABASE_URL for Prisma/standard or POSTGRES_URL for legacy)
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl && Pool) {
      pgPool = new Pool({ connectionString: dbUrl });
      
      // Test connection
      const client = await pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      
      console.log('✓ Using PostgreSQL via pg package');
      usePostgres = true;
      
      // Initialize schema on first connection
      await initPostgresSchema();
      await ensureDefaultAdminUser();
      return;
    }
  } catch (error) {
    console.log('PostgreSQL not available:', error.message);
    if (pgPool) {
      await pgPool.end();
      pgPool = null;
    }
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
      await ensureDefaultAdminUser();
      return;
    } catch (error) {
      console.log('SQLite failed:', error.message);
      useSQLite = false;
    }
  }

  console.log('✓ Using module-level memory store (persists during function container lifetime)');
  await ensureDefaultAdminUser();
}

async function ensureDefaultAdminUser() {
  if (!AUTO_INIT_ADMIN || !bcrypt) {
    return;
  }

  try {
    const existingAdmin = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await createUser(DEFAULT_ADMIN_EMAIL, hashedPassword, 'admin');
    console.log(`✓ Default admin user initialized: ${DEFAULT_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Failed to auto-initialize default admin user:', error.message);
  }
}

// Initialize PostgreSQL schema
async function initPostgresSchema() {
  if (!pgPool) return;
  
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        plan TEXT DEFAULT 'free',
        status TEXT DEFAULT 'pending',
        verified INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        usage_limit INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        domain TEXT NOT NULL,
        scan_type TEXT,
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  } catch (error) {
    // Tables might already exist
  }
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
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
    const isAdmin = email === DEFAULT_ADMIN_EMAIL;
    const userRole = isAdmin ? 'admin' : role;
    const userStatus = isAdmin ? 'approved' : 'pending';
    const userVerified = isAdmin ? 1 : 0;

    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO users (email, password, role, status, verified, plan, usage_limit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role, status, verified, plan',
        [email, hashedPassword, userRole, userStatus, userVerified, isAdmin ? 'agency' : 'free', isAdmin ? 999999 : 5]
      );
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'UPDATE users SET status = $1, verified = 1 WHERE id = $2 RETURNING id, email, status',
        [status, userId]
      );
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'SELECT id, email, role, plan, status, verified, usage_count, usage_limit, created_at FROM users ORDER BY created_at DESC'
      );
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'SELECT id, email, role, plan, status, verified, created_at FROM users WHERE status = $1 ORDER BY created_at ASC',
        ['pending']
      );
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO scans (user_id, domain, scan_type, status) VALUES ($1, $2, $3, $4) RETURNING id, domain, scan_type, created_at',
        [userId, domain, scanType, 'completed']
      );
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
    if (usePostgres && pgPool) {
      const result = await pgPool.query(
        'SELECT id, domain, scan_type, status, created_at FROM scans WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
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
