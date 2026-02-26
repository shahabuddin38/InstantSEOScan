# VERCEL SETUP GUIDE

## Step 1: Set Environment Variables on Vercel Dashboard

Go to: https://vercel.com/shahabs-projects-24824ff4/instant-seo/settings/environment-variables

Add these environment variables in the Production environment:

### API Keys:
- **GEMINI_API_KEY**: AIzaSyB81NgItUuWiOzSD_768UyQfmfei0XIusg
- **RAPIDAPI_KEY**: 299b7a247emshcf5cf55db564bdfp1857b9jsn2a275b3f9bfa
- **RAPIDAPI_HOST_KEYWORDS**: semrush-keyword-magic-tool.p.rapidapi.com
- **RAPIDAPI_HOST_BACKLINKS**: semrush8.p.rapidapi.com

### Security Keys:
- **JWT_SECRET**: Use a strong random string (e.g., `your-jwt-secret-${Date.now()}`)
- **ADMIN_SECRET**: Use a strong random string for admin seeding

## Step 2: Create Admin User

After setting environment variables, run this command:

```bash
curl -X POST https://instant-seo.vercel.app/api/admin/seed \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{
    "email": "shahabjan38@gmail.com",
    "password": "Admin@@7788"
  }'
```

Replace `YOUR_ADMIN_SECRET` with the value you set in Vercel.

## Admin Credentials:
- **Email**: shahabjan38@gmail.com
- **Password**: Admin@@7788
- **Role**: admin

## URLs:
- **Live Site**: https://instant-seo.vercel.app
- **Dashboard Link**: https://vercel.com/shahabs-projects-24824ff4/instant-seo
