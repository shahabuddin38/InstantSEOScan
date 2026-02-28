// Database module - supports both Vercel Postgres and in-memory fallback

let db = {
  users: new Map(),
  scans: new Map(),
  nextUserId: 1,
  nextScanId: 1
};

// Use Vercel Postgres if available, otherwise use in-memory
let usePostgres = false;

async function initPostgres() {
  try {
    if (!process.env.POSTGRES_URL) {
      console.log('No POSTGRES_URL - using in-memory database');
      return false;
    }
    
    const { sql } = await import('@vercel/postgres');
    
    // Test connection
    await sql`SELECT 1`;
    console.log('Connected to Vercel Postgres');
    usePostgres = true;
    return true;
  } catch (error) {
    console.log('Postgres not available - using in-memory database', error.message);
    return false;
  }
}

initPostgres().catch(err => console.error('Init error:', err));

// User functions
export async function getUserByEmail(email) {
  if (usePostgres) {
    try {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
  
  // In-memory fallback
  for (const user of db.users.values()) {
    if (user.email === email) {
      return user;
    }
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

    // In-memory fallback
    const user = {
      id: db.nextUserId++,
      email,
      password: hashedPassword,
      role: userRole,
      status: userStatus,
      verified: userVerified,
      plan: isAdmin ? 'agency' : 'free',
      usage_limit: isAdmin ? 999999 : 5,
      usage_count: 0,
      created_at: new Date()
    };
    
    db.users.set(user.id, user);
    return { id: user.id, email: user.email, role: user.role, status: user.status, verified: user.verified, plan: user.plan };
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

    // In-memory fallback
    const user = db.users.get(userId);
    if (user) {
      user.status = status;
      user.verified = 1;
      return { id: user.id, email: user.email, status: user.status };
    }
    return null;
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

    // In-memory fallback
    return Array.from(db.users.values()).map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      plan: u.plan,
      status: u.status,
      verified: u.verified,
      usage_count: u.usage_count,
      usage_limit: u.usage_limit,
      created_at: u.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
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

    // In-memory fallback
    return Array.from(db.users.values())
      .filter(u => u.status === 'pending')
      .map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        plan: u.plan,
        status: u.status,
        verified: u.verified,
        created_at: u.created_at
      }));
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }
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

    // In-memory fallback
    const scan = {
      id: db.nextScanId++,
      user_id: userId,
      domain,
      scan_type: scanType,
      status: 'completed',
      created_at: new Date()
    };
    
    db.scans.set(scan.id, scan);
    return { id: scan.id, domain: scan.domain, scan_type: scan.scan_type, created_at: scan.created_at };
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

    // In-memory fallback
    return Array.from(db.scans.values())
      .filter(s => s.user_id === userId)
      .map(s => ({
        id: s.id,
        domain: s.domain,
        scan_type: s.scan_type,
        status: s.status,
        created_at: s.created_at
      }));
  } catch (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
}

// Check if user can access audit
export async function canUserAccessAudit(user) {
  if (!user) return false;
  if (user.status !== 'approved' && user.role !== 'admin') return false;
  if (!user.verified && user.role !== 'admin') return false;
  if (user.usage_count >= user.usage_limit && user.role !== 'admin') return false;
  return true;
}
