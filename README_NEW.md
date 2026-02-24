# InstantSEOScan 🚀

<div align="center">

**Professional SEO Tools Platform | Powered by RapidAPI**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Deployment](#deployment) • [API Documentation](#api-documentation)

</div>

## Overview

InstantSEOScan is a comprehensive SEO analysis platform that integrates with industry-leading APIs to provide real-time keyword research, technical audits, authority metrics, and AI-powered insights. Built with React, TypeScript, and Express, it offers both public-facing pages and protected user dashboards with admin management capabilities.

### Key Highlights

- 🎯 **Real-time SEO Data** - Powered by Semrush, Moz, and Ahrefs APIs
- 👥 **User Authentication** - Secure registration, login, and admin approval system
- 💳 **Subscription Management** - 3 pricing tiers with admin-controlled validity
- 🎛️ **Admin Dashboard** - Complete user and subscription management interface
- 📊 **Technical Audits** - In-depth website analysis and recommendations
- 🔍 **Keyword Research** - Advanced keyword difficulty and volume analysis
- 🏆 **Authority Checking** - DA/PA scores and backlink analysis
- 📈 **AI Insights** - Google Gemini-powered SEO recommendations
- 🌐 **SEO Optimized** - Fully optimized public pages for search rankings
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS

## Features

### User Features
- ✅ Secure user registration with email verification
- ✅ Multiple pricing plans (Basic, Pro, Enterprise)
- ✅ Keyword research with volume and difficulty data
- ✅ Technical SEO audit reports
- ✅ Domain and page authority checking
- ✅ Bulk domain analysis
- ✅ AI-powered SEO recommendations
- ✅ Subscription management

### Admin Features
- ✅ User approval management
- ✅ Subscription lifecycle management
- ✅ Plan creation and modification
- ✅ Statistics and analytics dashboard
- ✅ User account management
- ✅ Revenue tracking

### Technical Features
- ✅ JWT-based authentication
- ✅ SQLite database with migrations
- ✅ RapidAPI integration for SEO data
- ✅ Google Gemini AI integration
- ✅ Responsive React interface
- ✅ Express backend with middleware
- ✅ TypeScript for type safety
- ✅ Tailwind CSS styling
- ✅ SEO metadata and robots.txt
- ✅ Vercel deployment ready

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd InstantSEOScan

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API keys
# GEMINI_API_KEY=your_key_here
# JWT_SECRET=your_secret_key
```

### Development

```bash
# Start development server
npm run dev

# Access the app
# http://localhost:3000
```

### Building for Production

```bash
# Build the project
npm run build

# Test production build
npm start

# Clean build artifacts
npm run clean
```

## Project Structure

```
/
├── public/
│   └── robots.txt              # SEO robots file
├── server/
│   ├── api/
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── admin.ts            # Admin management endpoints
│   │   ├── audit.ts            # Technical audit endpoint
│   │   ├── keyword.ts          # Keyword research endpoint
│   │   ├── dapachecker.ts      # DA/PA checking endpoint
│   │   ├── bulkAuthority.ts    # Bulk domain checking
│   │   ├── geo.ts              # Geographic data
│   │   └── aiOverview.ts       # AI insights endpoint
│   ├── config/
│   │   └── rapidapi.ts         # RapidAPI configuration
│   ├── lib/
│   │   ├── db.ts               # Database initialization
│   │   └── auth.ts             # Authentication utilities
│   └── middleware/
│       └── auth.ts             # Auth middleware
├── src/
│   ├── components/
│   │   └── SEOHelmet.tsx        # SEO metadata component
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── About.tsx           # About page
│   │   ├── Contact.tsx         # Contact page
│   │   ├── Terms.tsx           # Terms of service
│   │   ├── Privacy.tsx         # Privacy policy
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── Audit.tsx           # Site audit page
│   │   ├── Keyword.tsx         # Keyword research
│   │   ├── Authority.tsx       # Authority checker
│   │   ├── Pricing.tsx         # Pricing page
│   │   └── Admin.tsx           # Admin dashboard
│   ├── App.tsx                 # Main app router
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── server.ts                   # Express server
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── vercel.json                 # Vercel config
├── .env.example                # Environment template
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons

### Backend (Express + Node.js)
- **Runtime**: Node.js with TypeScript (tsx)
- **Framework**: Express 4
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT with bcrypt
- **Middleware**: CORS, JSON parser

### External APIs
- **RapidAPI** - SEO data (Semrush, Moz, Ahrefs)
- **Google Gemini** - AI-powered insights

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  name TEXT,
  phone TEXT,
  approved INTEGER,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Pricing Plans
```sql
CREATE TABLE pricing_plans (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  price REAL,
  billing_cycle INTEGER,
  features TEXT (JSON),
  created_at DATETIME
)
```

### Subscriptions
```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  plan_id INTEGER,
  start_date DATETIME,
  end_date DATETIME,
  status TEXT,
  auto_renew INTEGER,
  created_at DATETIME
)
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "subscription": {...}
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### SEO Tools Endpoints (Protected)

#### Site Audit
```
POST /api/audit
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### Keyword Research
```
POST /api/keyword
Authorization: Bearer <token>
Content-Type: application/json

{
  "keyword": "seo tools",
  "country": "us",
  "languagecode": "en"
}
```

#### DA/PA Checker
```
POST /api/dapachecker
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "example.com"
}
```

#### Bulk Authority Check
```
POST /api/bulkAuthority
Authorization: Bearer <token>
Content-Type: application/json

{
  "domains": ["example1.com", "example2.com", "example3.com"]
}
```

### Admin Endpoints (Protected + Admin)

#### Get Pending Users
```
GET /api/admin/pending-users
Authorization: Bearer <token>
```

#### Approve User
```
POST /api/admin/approve-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 5
}
```

#### Get All Users
```
GET /api/admin/users
Authorization: Bearer <token>
```

#### Update Subscription
```
POST /api/admin/update-subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 3,
  "planId": 2,
  "daysValid": 30
}
```

#### Get Statistics
```
GET /api/admin/stats
Authorization: Bearer <token>
```

## Admin Access

**Default Admin Credentials:**
- Email: `shahabjan38@gmail.com`
- Password: `admin@@788`

Access admin panel at: `/admin`

⚠️ **IMPORTANT**: Change these credentials immediately in production!

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_strong_secret_key_min_32_chars
NODE_ENV=production
```

## Company Information (NAP)

**Name**: Shahab Uddin
**Address**: Swat, KPK, Pakistan
**Phone**: +92 346 9366699
**Email**: shahabjan38@gmail.com

## Pricing Plans

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

## Security

### Best Practices Implemented
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ CORS protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Environment variable protection
- ✅ HTTPS support (Vercel automatic)
- ✅ Rate limiting ready (implement in production)

### Additional Recommendations
- Implement rate limiting on API endpoints
- Add request validation middleware
- Use Content Security Policy (CSP) headers
- Implement CSRF protection for forms
- Regular security audits
- Keep dependencies updated

## Performance

### Optimization Features
- ✅ Code splitting with Vite
- ✅ Tree-shaking for unused code
- ✅ Lazy loading of routes
- ✅ CSS optimization with Tailwind
- ✅ Image optimization ready
- ✅ Caching headers configured

## SEO Features

### On-Page SEO
- ✅ Semantic HTML structure
- ✅ Meta descriptions and keywords
- ✅ Open Graph tags
- ✅ Twitter Card support
- ✅ Canonical URLs
- ✅ Robots.txt
- ✅ Dynamic meta updates

### Technical SEO
- ✅ Mobile responsive design
- ✅ Fast page load times
- ✅ Proper heading hierarchy
- ✅ Image alt text (in templates)
- ✅ Structured data ready
- ✅ XML sitemap ready

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, feature requests, or questions:

- **Email**: shahabjan38@gmail.com
- **Phone**: +92 346 9366699
- **Address**: Swat, KPK, Pakistan

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ User authentication system
- ✅ Admin dashboard
- ✅ SEO tools integration
- ✅ Subscription management
- ✅ Pricing plans
- ✅ Public pages with SEO optimization
- ✅ Vercel deployment ready

---

<div align="center">

**Built with ❤️ for SEO Professionals**

[Make an Issue](../../issues) | [Request a Feature](../../issues) | [Deploy Now](https://vercel.com/new)

</div>
