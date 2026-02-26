# Vercel Setup Instructions

## Step 1: Add Environment Variables to Vercel Dashboard

Go to: **https://vercel.com/shahabs-projects-24824ff4/instant-seo/settings/environment-variables**

Add these environment variables for **Production**:

```
GEMINI_API_KEY = AIzaSyB81NgItUuWiOzSD_768UyQfmfei0XIusg
RAPIDAPI_KEY = 299b7a247emshcf5cf55db564bdfp1857b9jsn2a275b3f9bfa
RAPIDAPI_HOST_KEYWORDS = semrush-keyword-magic-tool.p.rapidapi.com
RAPIDAPI_HOST_BACKLINKS = semrush8.p.rapidapi.com
JWT_SECRET = 5dd4f333-c5ba-4a57-9536-6c7708015312
ADMIN_SECRET = instantscan_super_admin_2026_secure_key
```

## Step 2: Redeploy on Vercel

After adding the variables:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Wait 2-3 minutes for the new deployment to complete

## Step 3: Create Admin User

Once the deployment is complete, run this command in PowerShell:

```powershell
$response = Invoke-WebRequest -Uri "https://instant-seo.vercel.app/api/admin/seed" `
  -Method POST `
  -Headers @{
    "x-admin-secret" = "instantscan_super_admin_2026_secure_key"
    "Content-Type" = "application/json"
  } `
  -Body '{"email":"shahabjan38@gmail.com","password":"Admin@@7788"}'

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1708963200000,
    "email": "shahabjan38@gmail.com",
    "role": "admin",
    "plan": "premium"
  },
  "message": "Admin user created successfully"
}
```

## Step 4: Login to Application

Visit: **https://instant-seo.vercel.app**

- **Email**: shahabjan38@gmail.com
- **Password**: Admin@@7788

---

## API Endpoints

### Public Endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/scan` - Scan a website for SEO

### Admin Only:
- `POST /api/admin/seed` - Create admin user (requires x-admin-secret header)

### Protected Endpoints (requires Authorization header):
- `POST /api/keywords` - Get keyword suggestions
- `POST /api/backlinks` - Get backlink data

---

## Troubleshooting

If you still get "Unexpected token 'T'" error:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to Vercel and manually redeploy
3. Wait 3 minutes for changes to propagate
4. Try again

Check Vercel Logs:
- Go to Deployments > Click latest deployment > Click "View Logs"
- Look for any error messages
