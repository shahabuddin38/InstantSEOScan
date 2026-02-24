# InstantSEOScan - Deployment Guide

## Deployment to Vercel

This guide walks through deploying InstantSEOScan to Vercel with all features functional.

### Prerequisites

1. Node.js 18+ installed locally
2. Vercel CLI: `npm i -g vercel`
3. GitHub account with repository push access
4. The following API keys:
   - Google Gemini API Key
   - RapidAPI Key (included in code)

### Step 1: Prepare Environment Variables

Create a `.env` file in the project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_very_secure_random_secret_key_here
NODE_ENV=production
```

**DO NOT commit `.env` to git.**

### Step 2: Local Testing

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test production build
npm start
```

The app should be accessible at `http://localhost:3000`

### Step 3: Deploy to Vercel

#### Option A: Via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Via GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add your keys
5. Click "Deploy"

### Step 4: Set Environment Variables in Vercel

```bash
vercel env add GEMINI_API_KEY
vercel env add JWT_SECRET
vercel env add NODE_ENV production
```

Or via Vercel Dashboard:
1. Go to Project Settings
2. Environment Variables
3. Add each variable with appropriate values

### Step 5: Database Setup

The application uses SQLite (better-sqlite3). For Vercel:

1. **Local Database**: The database will be created locally on first run
2. **Note**: Files in Vercel are read-only at runtime. For production, consider:
   - Using a managed database (PostgreSQL, MongoDB)
   - Using Vercel serverless functions with a third-party database
   - Running migrations as part of build process

For now, the local SQLite approach works for development.

### Step 6: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Database Migration for Production

For production deployment with persistent data:

#### Option 1: Use PostgreSQL

Create a managed PostgreSQL database and update the connection in `server.ts`:

```typescript
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);
// Update database initialization
```

#### Option 2: Use MongoDB

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URL);
// Update database logic
```

### Admin Access

After first deployment:

1. Navigate to `/login`
2. Use credentials:
   - Email: `shahabjan38@gmail.com`
   - Password: `admin@@788`
3. Dashboard auto-approves this admin account

**IMPORTANT**: Change admin credentials in production!

### Routing Information

- **Public Pages**: `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/pricing`
- **Auth Pages**: `/login`, `/register`
- **Protected Routes**: `/app/*` (requires authentication)
- **Admin Dashboard**: `/admin` (requires admin credentials)
- **API Routes**: `/api/*` (require authentication where specified)

### API Endpoints

All RapidAPI endpoints are configured and functional:

- Keyword research (Semrush)
- Technical SEO audit
- Domain/Page authority checking
- Bulk DA/PA checker
- Traffic data (Semrush)

### Common Issues and Solutions

#### Issue: "SQLITE_CANTOPEN"
- **Solution**: Ensure `/data` directory exists and is writable

#### Issue: Environment variables not loading
- **Solution**: Verify `.env` file exists locally; use Vercel Dashboard for production vars

#### Issue: Database persists on each deploy
- **Solution**: Implement database seeding or use managed database service

#### Issue: API key errors
- **Solution**: Verify keys are correctly set in Vercel Environment Variables

### Monitoring

1. **Vercel Analytics**: Monitor in Vercel Dashboard
2. **Error Tracking**: Check Function Logs in Vercel
3. **Database Logs**: Monitor SQLite performance

### Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong JWT_SECRET (min 32 characters)
3. ✅ Rotate admin credentials monthly
4. ✅ Enable HTTPS (automatic with Vercel)
5. ✅ Implement rate limiting on API endpoints
6. ✅ Add CORS restrictions in production

### Scaling Recommendations

For production with multiple users:

1. Migrate to PostgreSQL/MongoDB
2. Implement caching (Redis)
3. Add rate limiting via middleware
4. Use CDN for static assets
5. Implement user sessions/JWT refresh tokens

### Support & Troubleshooting

For issues:
1. Check Vercel Function Logs
2. Review browser console for client errors
3. Test locally before deploying
4. Verify all environment variables are set
5. Contact support with error codes and logs

---

**Deploy Successfully & Build Amazing SEO Tools! 🚀**
