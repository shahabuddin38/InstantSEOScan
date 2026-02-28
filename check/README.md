# instantseoscan.com

A lightweight SEO audit tool for instantseoscan.com with a dashboard-style UI and optional Gemini AI recommendations.

## Features

- URL-based on-page SEO scan
- Score, checklist, and issue summary
- AI recommendations with:
  - **Gemini API** (free tier available)
  - **Free local fallback** (no API key)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. (Optional) Add your Gemini key to `.env`:

```env
GEMINI_API_KEY=your_key_here
AI_PROVIDER=gemini
```

4. Run:

```bash
npm start
```

Open http://localhost:3000

## Free API options

- **Gemini**: https://aistudio.google.com/app/apikey (has free usage tier)
- **No key mode**: Works out of the box using built-in recommendation generator

## Notes

- Some websites block bot traffic, which may prevent scanning.
- This scanner focuses on core on-page SEO checks.
