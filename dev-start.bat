@echo off
echo 🚀 Starting LabX Development Environment

REM Set development environment
set NODE_ENV=development

REM Start backend on port 3000
echo 📡 Starting backend server on port 3000...
cd backend
call npm install
start "Backend Server" cmd /k "npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend on port 3001
echo 🎨 Starting frontend server on port 3001...
cd ..\frontend
call npm install
set BROWSER=none
npm start

echo 🛑 Development servers stopped
pause
