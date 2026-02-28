# InstantSEOScan - Backend Architecture

## System Overview

```
Frontend (React)
    ↓
API Routes (Vercel Serverless)
    ↓
Database (Vercel Postgres)
```

## User Access Control Flow

### Registration → Approval → Audit Access

```
User Registration
    ↓
shahabjan38@gmail.com? → Auto-approved (Admin)
    ↓
Other emails → Pending approval by admin
    ↓
Admin approves in dashboard
    ↓
Email verified
    ↓
User can run audits
```

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique user ID |
| email | VARCHAR UNIQUE | User email (login) |
| password | VARCHAR | Hashed password |
| role | VARCHAR | 'admin' or 'user' |
| plan | VARCHAR | 'free', 'pro', 'agency' |
| status | VARCHAR | 'pending', 'approved', 'rejected' |
| verified | INTEGER | 0=unverified, 1=verified email |
| usage_count | INTEGER | Number of scans run |
| usage_limit | INTEGER | Max scans allowed (5 for free) |
| subscription_end | TIMESTAMP | When subscription expires |
| stripe_customer_id | VARCHAR | Stripe subscription ID |
| created_at | TIMESTAMP | Account creation date |

### Scans Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique scan ID |
| user_id | INTEGER FK | Link to user |
| domain | VARCHAR | Website domain |
| url | VARCHAR | Page URL |
| scan_type | VARCHAR | 'on-page', 'technical', 'audit' |
| results | TEXT | JSON scan results |
| status | VARCHAR | 'completed', 'failed' |
| created_at | TIMESTAMP | When scan was run |
| expires_at | TIMESTAMP | When results expire |

## API Endpoints

### Authentication

#### POST /api/auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "message": "Registration successful! Your account is pending admin approval.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "status": "pending"
  }
}
```

#### POST /api/auth/login
Login and get JWT token
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "plan": "free",
    "status": "approved",
    "verified": 1,
    "usage_count": 2,
    "usage_limit": 5
  }
}
```

### Admin

#### GET /api/admin/users
Get all users (admin only)
```
Headers:
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "users": [
    {
      "id": 1,
      "email": "shahabjan38@gmail.com",
      "role": "admin",
      "plan": "agency",
      "status": "approved",
      "verified": 1,
      "usage_count": 0,
      "usage_limit": 999999,
      "created_at": "2026-02-28T10:00:00Z"
    },
    {
      "id": 2,
      "email": "user@example.com",
      "role": "user",
      "plan": "free",
      "status": "pending",
      "verified": 0
    }
  ]
}
```

#### POST /api/admin/approve-user
Approve or reject user registration (admin only)
```json
{
  "userId": 2,
  "status": "approved"
}
```

Response:
```json
{
  "message": "User approved successfully",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "status": "approved"
  }
}
```

### Audits

#### POST /api/audit/start
Start a new audit (authentication required, user must be approved)
```json
{
  "domain": "example.com",
  "scanType": "on-page"
}
```

Restrictions:
- User must be registered
- User must be approved by admin
- User must verify email
- User must not exceed usage limit

Response:
```json
{
  "message": "Audit started",
  "scan": {
    "id": 1,
    "domain": "example.com",
    "scan_type": "on-page",
    "created_at": "2026-02-28T10:00:00Z"
  },
  "remaining": 3
}
```

Error if not approved:
```json
{
  "error": "Your account is pending admin approval. Please wait for approval before running audits."
}
```

### Health

#### GET /api/health
Check API status
```json
{
  "ok": true
}
```

## User Permission Matrix

| Feature | Pending | Approved | Admin |
|---------|---------|----------|-------|
| Login | No | Yes | Yes |
| Run Audits | No | Yes | Yes |
| View Own Scans | No | Yes | Yes |
| View All Users | No | No | Yes |
| Approve Users | No | No | Yes |
| Change Plans | No | No | Yes |
| Delete Users | No | No | Yes |

## JWT Token Structure

The token contains:
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "plan": "free",
  "iat": 1677600000,
  "exp": 1678204800
}
```

- Expires in 7 days
- Include in Authorization header: `Bearer <token>`

## Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Email and password required | Missing fields |
| 401 | Account not found | User doesn't exist |
| 401 | Invalid password | Wrong credentials |
| 403 | Account pending approval | Admin hasn't approved yet |
| 403 | Verify your email | Email not verified |
| 403 | Usage limit exceeded | Too many scans run |
| 409 | Email already registered | User exists |
| 500 | Internal server error | Database error |

## Security Measures

1. **Password Hashing**: Bcrypt with 10 salt rounds
2. **JWT Tokens**: HS256 signing, 7-day expiration
3. **CORS**: Allowed for frontend domain
4. **Admin Check**: Only `shahabjan38@gmail.com` is admin
5. **Rate Limiting**: (To be implemented)
6. **Input Validation**: Email format, password strength

## Deployment Checklist

- [ ] Set `JWT_SECRET` in Vercel
- [ ] Create Vercel Postgres database
- [ ] All env vars added to Vercel
- [ ] Database schema initialized
- [ ] Re-deploy after setup
- [ ] Test registration flow
- [ ] Test admin approval
- [ ] Test audit endpoints

## Future Enhancements

- Email verification links
- Password reset
- Stripe subscription integration
- Rate limiting
- Audit logs
- 2FA for admin
- Team invitations
- API key authentication
