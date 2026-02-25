# Vercel Deployment Setup

## ✅ Deployment Status

Your InstantSEOScan app is now deployed to Vercel!

- **Production URL**: https://instant-seo-scan.vercel.app
- **Project**: shahabs-projects-24824ff4/instant-seo-scan

## 🔒 Environment Variables

Set these environment variables in your Vercel project dashboard:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `instant-seo-scan`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add these three variables:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | `AIzaSyB81NgItUuWiOzSD_768UyQfmfei0XIusg` |
| `JWT_SECRET` | `instantseoscan_production_jwt_secret_key_2026_super_secure_key` |
| `DATABASE_URL` | `data.db` |

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click the three dots on the latest production deployment
3. Select **Redeploy** → **Redeploy to Production**

## 🔐 Admin Credentials

| Field | Value |
|-------|-------|
| Email | `shahabjan38@gmail.com` |
| Password | `admin@@788` |

## 📝 Features Available

### Public Pages
- ✅ Home (Marketing)
- ✅ About
- ✅ Contact
- ✅ Pricing (3 tiers)
- ✅ Terms of Service
- ✅ Privacy Policy

### Authentication
- ✅ User Registration (requires admin approval)
- ✅ User Login
- ✅ JWT Token-based Auth

### User Dashboard (Protected)
- ✅ Dashboard Overview
- ✅ Site Audit Tool
- ✅ Keyword Research Tool
- ✅ Authority Checker Tool
- ✅ Pricing Management

### Admin Panel (Protected - Admin Only)
- ✅ Pending Users Approval
- ✅ All Users Management
- ✅ Subscription Management
- ✅ Revenue Statistics
- ✅ Plan Management

## 📊 Database

The app uses an **in-memory database** (perfect for testing). Data will reset when the Vercel function restarts.

**For Production:** Integrate MongoDB, PostgreSQL, or another persistent database by updating [server/lib/db.ts](server/lib/db.ts)

## 🧪 Testing the App

### 1. Create a Regular Account
- Visit https://instant-seo-scan.vercel.app/register
- Fill in your details
- Account will be pending admin approval

### 2. Login as Admin
- Visit https://instant-seo-scan.vercel.app/login
- Use credentials above
- Go to Admin Panel
- Approve pending users

### 3. Access Dashboard
- Login with approved user account
- Explore all SEO tools

## 🚀 Next Steps

### Add Custom Domain
1. Go to Vercel project **Settings**
2. Click **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### Enable Database Persistence
Replace in-memory DB with:
- **MongoDB**: Add connection string to env var
- **PostgreSQL**: Configure with Prisma
- **Supabase**: Quick Postgres setup

### CI/CD Updates
Your git repo automatically deploys on:
- Push to `main` branch → Preview deployment
- Use `vercel --prod` → Production deployment

## 📚 Key Files

- **Frontend**: [src/](src/) - React components
- **Backend**: [server.ts](server.ts) - Express server
- **Database**: [server/lib/db.ts](server/lib/db.ts) - Database layer
- **Config**: [vercel.json](vercel.json) - Vercel configuration

## 🆘 Troubleshooting

### White Screen After Login
- ✅ Fixed: Axios interceptor now adds auth token
- ✅ Fixed: Redirect goes to `/app` (Dashboard)
- Ensure JavaScript is enabled in browser

### 401 Unauthorized Errors
- Check environment variables are set in Vercel
- Verify JWT_SECRET matches in code
- Clear browser localStorage and retry login

### Database Issues
- In-memory DB resets on function restart
- For persistence: Migrate to PostgreSQL/MongoDB
- See [server/lib/db.ts](server/lib/db.ts) for implementation

## 📞 Support

For Vercel-specific issues:
- Vercel Documentation: https://vercel.com/docs
- Project Logs: https://vercel.com/dashboard → Project → Deployments → Logs
