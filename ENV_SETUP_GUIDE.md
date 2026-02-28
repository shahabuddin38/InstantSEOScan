# Environment Variables Setup Guide

## Required Environment Variables

### 1. JWT Secret
```
JWT_SECRET=your-very-secure-random-string-here
```
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Connection (Vercel Postgres)
The connection string is automatically provided by Vercel as `POSTGRES_URL`

#### Setup Steps:
1. Go to your Vercel Dashboard
2. Select your project (InstantSEOScan)
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name it `instant-seo-scan-db`
6. Vercel will automatically add:
   - `POSTGRES_URL` - Full connection string
   - `POSTGRES_URL_NON_POOLING` - Non-pooling connection
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_USER`
   - `POSTGRES_DATABASE`

### 3. Gemini API Key (Optional - for AI features)
```
GEMINI_API_KEY=your-gemini-api-key
```
Get it from: https://ai.google.dev/

### 4. Stripe Keys (Optional - for payments)
```
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## Setting Environment Variables in Vercel

1. Go to Vercel Dashboard → Project Settings
2. Click **Environment Variables**
3. Add each variable:
   - **Name**: JWT_SECRET
   - **Value**: (your secret key)
   - **Environments**: All environments (or Production only)
4. Click **Save** and re-deploy

## Local Development (.env.local)

Create `.env.local` in the project root:

```
VITE_API_URL=http://localhost:3000
JWT_SECRET=dev-secret-change-in-production
POSTGRES_URL=postgresql://user:password@localhost/dbname
GEMINI_API_KEY=your-key
```

## Database Migration

On first deployment, the database schema will auto-create tables.

To manually initialize:
```bash
curl -X POST https://your-domain.com/api/db/init \
  -H "Authorization: Bearer admin_token"
```

## Admin Account

The account `shahabjan38@gmail.com` is automatically set as admin when registered.

### Admin Features:
- View all users
- Approve/reject new user registrations
- Update user plans (free, pro, agency)
- View all scans
- Set usage limits
- Manage subscriptions

## User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all features and admin panel |
| **user** | Can run audits (if approved), view own scans |

## User Status

| Status | Can Use Audit? | Notes |
|--------|---|---|
| **pending** | ❌ | Waiting for admin approval |
| **approved** | ✅ | Active user |
| **rejected** | ❌ | Registration denied |

## Testing

### Test Account
Email: `shahabjan38@gmail.com`
Password: `Anypassword123`
Role: Admin (auto-approved)

### Regular User Flow
1. Register with email
2. Admin approves in dashboard
3. Verify email (link sent)
4. Run audits

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/approve-user` - Approve/reject user (admin only)

### Audits
- `POST /api/audit/start` - Start a new audit (auth required, must be approved)

### Health
- `GET /api/health` - Health check

## Security Notes

1. **JWT Secret**: Change from default immediately in production
2. **Database**: Never expose connection strings
3. **Passwords**: Always hashed with bcrypt
4. **CORS**: Configured to allow frontend access
5. **Admin Email**: Only `shahabjan38@gmail.com` gets admin privileges

## Troubleshooting

### "Database connection failed"
- Check `POSTGRES_URL` is set in Vercel
- Verify database is created in Vercel Storage tab
- Redeploy after adding database

### "JWT token invalid"
- Ensure `JWT_SECRET` is the same on all functions
- Check token expiration (7 days)

### "Admin access required"
- Only `shahabjan38@gmail.com` has admin role
- Re-register if needed to get admin privileges

## Next Steps

1. Set up all environment variables in Vercel
2. Connect Vercel Postgres
3. Re-deploy the application
4. Register with `shahabjan38@gmail.com` account
5. Test login and audit endpoints
