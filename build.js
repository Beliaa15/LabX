const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build process...');

// Set environment variables for better npm performance
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NODE_OPTIONS = '--max-old-space-size=2048';

try {
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });

  // Update browserslist database
  console.log('🔄 Updating browserslist database...');
  try {
    execSync('npx update-browserslist-db@latest', { cwd: 'frontend', stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Could not update browserslist, continuing with build...');
  }

  // Build frontend
  console.log('🏗️ Building frontend...');
  execSync('npm run build', { cwd: 'frontend', stdio: 'inherit' });

  // Create backend directories
  console.log('📁 Setting up directory structure...');
  const backendFrontendDir = path.join('backend', 'frontend');
  if (!fs.existsSync(backendFrontendDir)) {
    fs.mkdirSync(backendFrontendDir, { recursive: true });
  }

  // Copy frontend build to backend
  console.log('📋 Copying frontend build...');
  const frontendBuildDir = path.join('frontend', 'build');
  const backendBuildDir = path.join('backend', 'frontend', 'build');
  
  if (fs.existsSync(frontendBuildDir)) {
    if (fs.cpSync) {
      fs.cpSync(frontendBuildDir, backendBuildDir, { recursive: true });
    } else {
      // Fallback for older Node versions
      execSync(`cp -r "${frontendBuildDir}" "${backendBuildDir}"`, { stdio: 'inherit' });
    }
  }

  // Create upload directories
  const uploadsDir = path.join('backend', 'uploads');
  const webglDir = path.join('backend', 'frontend', 'public', 'webgl-tasks');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(webglDir)) {
    fs.mkdirSync(webglDir, { recursive: true });
  }

  // Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  execSync('npm install --production', { cwd: 'backend', stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
