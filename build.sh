#!/bin/bash
# Railway build script

echo "🚀 Starting Railway deployment build..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false

echo "📦 Installing backend dependencies..."
cd backend
npm install --production --no-optional
cd ..

echo "🎨 Installing frontend dependencies..."
cd frontend
npm install --no-optional
echo "🏗️ Building frontend..."
npm run build
cd ..

echo "📁 Setting up build structure..."
mkdir -p backend/frontend
cp -r frontend/build backend/frontend/
mkdir -p backend/uploads
mkdir -p backend/frontend/public/webgl-tasks

echo "✅ Build completed successfully!"
