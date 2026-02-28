<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ade58c6e-0e0b-48bc-883f-1c28b9c97602

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional, for persistent scan cache + report history) set `PRISMA_DATABASE_URL` in `.env.local`
4. Generate Prisma client:
   `npm run prisma:generate`
5. Run the app:
   `npm run dev`

## Prisma report history and cache

- When `PRISMA_DATABASE_URL` is configured, scan results are stored in Postgres via Prisma.
- `/api/scan` uses a per-user 24-hour URL cache to return recent scan data faster.
- New API endpoints:
  - `GET /api/reports/history` (last 20 reports for logged-in user)
  - `GET /api/reports/:id` (single saved report for logged-in user)
- If Prisma is not configured, the app still works and falls back to existing behavior.

## Security note

- Keep database URLs and API keys in local environment files only.
- If credentials are ever shared publicly, rotate them immediately.

## Vercel deployment (one command + GitHub auto deploy)

This repo now includes a Vercel config file at [vercel.json](vercel.json) and deploy scripts in [package.json](package.json).

### One-command deploy

1. Install Vercel CLI once:
   `npm i -g vercel`
2. From repo root, deploy production:
   `npm run deploy:vercel`

### Required environment variables in Vercel

- `GEMINI_API_KEY` (if used by your frontend build/runtime)

Note: local `/api` proxy is for dev only. In production, this repo uses `vercel.json` rewrites for `/api` so `VITE_API_BASE_URL` is not required.

### Enable automatic deploys from GitHub pushes

1. Import this GitHub repo into Vercel (one-time setup).
2. Set Production branch to `main`.
3. Add the environment variables above in Vercel project settings.

After that, every push to `main` triggers automatic production deployment.
