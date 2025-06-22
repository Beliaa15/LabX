@echo off
echo 🧪 Testing build process...

:: Test Node.js version
echo Node.js version:
node --version
echo NPM version:
npm --version

:: Test if we can parse the file
echo Testing TaskViewer.js syntax...
node -c frontend\src\components\Tasks\TaskViewer.js
if %errorlevel% equ 0 (
    echo ✅ Syntax OK
) else (
    echo ❌ Syntax Error
)

echo Testing build script...
node -c build.js
if %errorlevel% equ 0 (
    echo ✅ Build script OK
) else (
    echo ❌ Build script Error
)

echo Done!
