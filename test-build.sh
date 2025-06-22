#!/bin/bash
echo "🧪 Testing build process..."

# Test Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Test if we can parse the file
echo "Testing TaskViewer.js syntax..."
node -c frontend/src/components/Tasks/TaskViewer.js && echo "✅ Syntax OK" || echo "❌ Syntax Error"

echo "Testing build script..."
node -c build.js && echo "✅ Build script OK" || echo "❌ Build script Error"

echo "Done!"
