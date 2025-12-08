#!/bin/bash
# Script to safely remove the shadcn component without affecting main app

echo "🗑️ Removing shadcn component..."

# Remove the ui components
rm -rf src/components/ui/
echo "✅ Removed ui components directory"

# Remove the demo page
rm -rf src/app/demo/
echo "✅ Removed demo page"

# Remove framer-motion dependency
npm uninstall framer-motion
echo "✅ Removed framer-motion dependency"

echo ""
echo "🎉 Shadcn component safely removed!"
echo "✅ Main SOPify app is unaffected"
echo "🚀 Run 'npm run dev' to restart the server"
