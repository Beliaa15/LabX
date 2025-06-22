#!/bin/bash
# Development startup script

echo "🚀 Starting LabX Development Environment"

# Set development environment
export NODE_ENV=development

# Start backend on port 3000
echo "📡 Starting backend server on port 3000..."
cd backend
npm install
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend on port 3001
echo "🎨 Starting frontend server on port 3001..."
cd ../frontend
npm install
BROWSER=none npm start

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for frontend to exit
wait
