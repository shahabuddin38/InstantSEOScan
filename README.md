# Instant SEO Scan (Production)

Production-ready serverless SaaS architecture using Vercel Functions + Prisma + PostgreSQL + JWT + Stripe.

## Final Production Structure

```text
instant-seo-scan/
│
├── api/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── me.ts
│   ├── scan/
│   │   └── index.ts
│   ├── ai/
│   │   └── on-page.ts
│   ├── stripe/
│   │   ├── checkout.ts
│   │   └── webhook.ts
│   └── admin/
│       └── users.ts
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── quota.ts
│   ├── stripe.ts
│   └── gemini.ts
│
├── prisma/
│   └── schema.prisma
│
├── middleware/
│   └── withAuth.ts
│
├── vercel.json
├── package.json
└── .env
```

## Environment Variables

Set these in local [.env](.env) and in Vercel project settings:

- `JWT_SECRET`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `APP_URL`

## Local Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Generate Prisma client

   ```bash
   npm run prisma:generate
   ```

3. Push schema (development)

   ```bash
   npx prisma db push
   ```

4. Start serverless dev runtime

   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/scan`
- `POST /api/ai/on-page`
- `POST /api/stripe/checkout`
- `POST /api/stripe/webhook`
- `GET /api/admin/users`

## Security Notes

- Auth uses JWT verification with user lookup in database.
- Protected APIs use middleware wrapper in [middleware/withAuth.ts](middleware/withAuth.ts).
- Scan usage quota is enforced in [lib/quota.ts](lib/quota.ts).
- Stripe plan upgrades are webhook-driven from [api/stripe/webhook.ts](api/stripe/webhook.ts).
- Login sets HTTP-only auth cookie.

## Deploy

1. Import repo into Vercel.
2. Configure all environment variables above.
3. Deploy.

This repo is fully serverless (no Express app/listener runtime).
