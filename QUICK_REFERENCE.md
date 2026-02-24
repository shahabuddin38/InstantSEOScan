# 🚀 InstantSEOScan - Quick Reference Guide

## 🌐 Website Routes

### Public Pages (No Login Required)
- **Home**: `/` - Landing page with features and CTAs
- **About**: `/about` - Company info and team details
- **Contact**: `/contact` - Contact form and support info
- **Pricing**: `/pricing` - 3 pricing tiers with comparison
- **Terms**: `/terms` - Terms of service
- **Privacy**: `/privacy` - Privacy policy

### Authentication
- **Login**: `/login` - Login with email/password
- **Register**: `/register` - User registration

### User Dashboard (Protected Routes)
- **App Dashboard**: `/app` - Main dashboard
- **Site Audit**: `/app/audit` - Technical SEO audit
- **Keyword Research**: `/app/keyword` - Keyword analysis
- **Authority Checker**: `/app/authority` - DA/PA checker
- **Pricing**: `/app/pricing` - View/upgrade subscription

### Admin Area
- **Admin Dashboard**: `/admin` - Admin control panel (login required + admin role)

## 🔑 Admin Credentials

**Email**: shahabjan38@gmail.com
**Password**: admin@@788

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    - Create new account
POST /api/auth/login       - Login to account
GET  /api/auth/me          - Get current user (requires token)
```

### Public API
```
GET  /api/pricing          - Get pricing plans (no auth needed)
```

### SEO Tools (Protected - Requires JWT Token)
```
POST /api/audit            - Perform site audit
POST /api/keyword          - Research keywords
POST /api/dapachecker      - Check domain authority
POST /api/bulkAuthority    - Bulk check multiple domains
POST /api/geo              - Get geographic SEO data
POST /api/aiOverview       - Get AI recommendations
```

### Admin API (Protected - Requires Admin Role)
```
GET  /api/admin/pending-users           - List pending user approvals
POST /api/admin/approve-user            - Approve a user
POST /api/admin/reject-user             - Reject a user
GET  /api/admin/users                   - List all users
POST /api/admin/update-subscription     - Change user subscription
GET  /api/admin/stats                   - Get dashboard statistics
```

## 💳 Pricing Plans

### Basic - $29/month
- 100 keyword searches/month
- Basic site audit
- Authority checking
- 5 projects
- Email support

### Pro - $99/month  
- 1000 keyword searches/month
- Advanced site audit
- Authority checking with backlinks
- 50 projects
- Priority email support
- API access
- Rank tracking

### Enterprise - $299/month
- Unlimited keyword searches
- Advanced site audit
- Authority checking with backlinks
- Unlimited projects
- 24/7 phone support
- API access
- Rank tracking
- Custom integrations
- Dedicated account manager
- Monthly reporting

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# JWT Secret (change this to something secure!)
JWT_SECRET=your_secure_random_string_min_32_chars

# Node Environment
NODE_ENV=production

# Database (auto-created)
DATABASE_URL=data.db
```

## 📦 Installation & Running

### Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### Development
```bash
# Start dev server (http://localhost:3000)
npm run dev
```

### Production
```bash
# Build
npm run build

# Start server
npm start

# Clean build
npm run clean
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

## 📁 Project Structure Summary

```
server/api/              - API endpoints (8 files under 12 limit)
server/config/           - API configuration
server/lib/              - Database & auth utilities
server/middleware/       - Auth middleware
src/pages/               - React page components
src/components/          - React components
public/                  - Static files & robots.txt
```

## 🔐 Default Database Setup

The app automatically creates and initializes:

1. **users table** - Store user accounts
2. **pricing_plans table** - 3 plans pre-configured
3. **subscriptions table** - Track user subscriptions

Admin account is auto-created on first run.

## 📊 Admin Dashboard Features

After login at `/admin`:

- 📈 **Statistics** - User count, revenue, plan distribution
- 👥 **Pending Approvals** - Approve/reject new users
- 💼 **User Management** - View all users and their status
- 🎛️ **Subscription Control** - Change plans and validity dates
- 📉 **Analytics** - Track active subscriptions and revenue

## 🌐 Company Information (NAP)

**Name**: Shahab Uddin
**Address**: Swat, KPK, Pakistan
**Phone**: +92 346 9366699
**Email**: shahabjan38@gmail.com

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `server.ts` | Express server & routes |
| `src/App.tsx` | React router & pages |
| `server/lib/db.ts` | Database setup |
| `server/lib/auth.ts` | Auth utilities |
| `.env` | Environment variables |
| `DEPLOYMENT.md` | Deployment guide |
| `IMPLEMENTATION_SUMMARY.md` | Feature overview |

## ⚡ Quick Debugging

**Error: "SQLITE_CANTOPEN"**
- Solution: Create `data` directory or restart app

**Error: API keys not working**
- Solution: Check `.env` file, restart server

**Error: "Unauthorized"**
- Solution: Include JWT token in Authorization header: `Bearer <token>`

**Error: "Admin access required"**
- Solution: Login as admin or contact admin for approval

## 🚀 Next Steps After Deploy

1. ✅ Change admin password
2. ✅ Set up custom domain
3. ✅ Enable HTTPS (automatic on Vercel)
4. ✅ Add payment processing (Stripe)
5. ✅ Set up email notifications
6. ✅ Configure analytics
7. ✅ Monitor Vercel logs
8. ✅ Set up backups

## 📞 Support

- **Documentation**: See DEPLOYMENT.md, README_NEW.md, IMPLEMENTATION_SUMMARY.md
- **Email**: shahabjan38@gmail.com  
- **Phone**: +92 346 9366699

## ✨ Success Checklist

- ✅ All features implemented
- ✅ RapidAPI endpoints configured
- ✅ Admin system working
- ✅ Subscription management ready
- ✅ SEO optimized
- ✅ Vercel deployment ready
- ✅ Database initialized
- ✅ Authentication secure
- ✅ Public pages complete
- ✅ Documentation complete

---

**You're all set! Deploy and start ranking! 🎉**
