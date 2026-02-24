#!/bin/bash
# InstantSEOScan - Quick Start Script

echo "🚀 InstantSEOScan - Quick Start"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your API keys:"
    echo "   - GEMINI_API_KEY"
    echo "   - JWT_SECRET"
    echo ""
fi

# Display next steps
echo "📝 Next Steps:"
echo ""
echo "1. Update .env file with your API keys:"
echo "   nano .env"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Default admin login:"
echo "   Email: shahabjan38@gmail.com"
echo "   Password: admin@@788"
echo ""
echo "5. For production build:"
echo "   npm run build"
echo "   npm start"
echo ""
echo "6. Deploy to Vercel:"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""
echo "✨ All set! Start building amazing SEO tools."
