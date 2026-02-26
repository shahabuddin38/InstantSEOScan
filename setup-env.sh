#!/bin/bash
# Vercel Environment Setup Script

# Set environment variables for production
npx vercel env add GEMINI_API_KEY AIzaSyB81NgItUuWiOzSD_768UyQfmfei0XIusg --environment production
npx vercel env add RAPIDAPI_KEY 299b7a247emshcf5cf55db564bdfp1857b9jsn2a275b3f9bfa --environment production
npx vercel env add RAPIDAPI_HOST_KEYWORDS semrush-keyword-magic-tool.p.rapidapi.com --environment production
npx vercel env add RAPIDAPI_HOST_BACKLINKS semrush8.p.rapidapi.com --environment production
npx vercel env add JWT_SECRET your-jwt-secret-key-here --environment production
npx vercel env add ADMIN_SECRET your-admin-secret-key-here --environment production

echo "Environment variables set on Vercel"
