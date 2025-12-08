#!/bin/bash
# SOPify Deployment Script
# This script helps deploy SOPify to various platforms

set -e

echo "🚀 SOPify Deployment Helper"
echo "============================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your GEMINI_API_KEY"
    echo "You can copy from env.template and fill in your API key"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=" .env.local; then
    echo "❌ Error: GEMINI_API_KEY not found in .env.local"
    echo "Please add your Gemini API key to .env.local"
    exit 1
fi

echo "✅ Environment variables configured"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "📦 Ready for deployment!"
echo ""
echo "Choose your deployment platform:"
echo ""

# Vercel deployment instructions
echo "🌐 VERCEL (Recommended):"
echo "  1. Install Vercel CLI: npm i -g vercel"
echo "  2. Deploy: vercel --prod"
echo "  3. Add GEMINI_API_KEY to Vercel environment variables"
echo "  4. Redeploy after adding the API key"
echo ""

# Railway deployment instructions
echo "🚂 RAILWAY:"
echo "  1. Push to GitHub repository"
echo "  2. Connect repository to Railway"
echo "  3. Add GEMINI_API_KEY environment variable"
echo "  4. Deploy automatically"
echo ""

# Manual deployment instructions
echo "📋 MANUAL DEPLOYMENT:"
echo "  1. Upload all files except node_modules/"
echo "  2. Run: npm install --production"
echo "  3. Set GEMINI_API_KEY environment variable"
echo "  4. Run: npm start"
echo ""

echo "✨ Deployment ready! Your SOPify application is production-ready."
echo ""
echo "🔗 After deployment, test the application by:"
echo "  - Creating a sample incident"
echo "  - Generating an SOP"
echo "  - Checking metrics visualization"
echo "  - Testing export functionality"
