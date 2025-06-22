# Railway Deployment Guide for LabX

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. GitHub repository containing your code
3. Railway CLI installed (optional)

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 3. Add Required Services

#### Add MongoDB Database
1. In your Railway project dashboard, click "+ New"
2. Select "Database" → "MongoDB"
3. Railway will create a MongoDB instance
4. Copy the connection string from the MongoDB service variables

#### Add Redis Database
1. Click "+ New" again
2. Select "Database" → "Redis"
3. Railway will create a Redis instance
4. Copy the connection string from the Redis service variables

### 4. Configure Environment Variables
In your main service (web app), add these environment variables:

```env
# Database Configuration
DATABASE_URL=<your-mongodb-connection-string>
MONGODB_URI=<your-mongodb-connection-string>

# Redis Configuration
REDIS_URL=<your-redis-connection-string>

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-minimum-32-characters

# App Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
ALLOWED_ORIGINS=https://your-app-name.up.railway.app

# Google OAuth (if used)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.up.railway.app/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret-minimum-32-characters
```

### 5. Configure Custom Domain (Optional)
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain and configure DNS

### 6. Deploy
1. Railway will automatically deploy when you push to your main branch
2. Monitor the build logs in the Railway dashboard
3. Once deployed, your app will be available at the provided Railway URL

## File Upload Considerations
- Railway has ephemeral file systems
- Consider using cloud storage (AWS S3, Cloudinary) for persistent file uploads
- Current setup stores files locally - they will be lost on redeploys

## WebGL Content
- Ensure your WebGL builds are in the correct directory structure
- Test WebGL loading in production environment

## Monitoring and Logs
- Use Railway dashboard to monitor your application
- Check logs for any deployment or runtime issues
- Set up health checks and monitoring alerts

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check package.json scripts and dependencies
2. **Database Connection**: Verify environment variables are correct
3. **CORS Issues**: Update ALLOWED_ORIGINS with your Railway domain
4. **File Upload Issues**: Check file size limits and permissions

### Useful Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from command line
railway up

# View logs
railway logs

# Connect to your project
railway link
```

## Production Optimizations
1. Enable gzip compression
2. Set up CDN for static assets
3. Configure proper caching headers
4. Monitor performance and memory usage
5. Set up database indexes for better performance

## Security Checklist
- [ ] All sensitive data in environment variables
- [ ] JWT secrets are strong and unique
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload security measures in place

## Cost Optimization
- Monitor resource usage in Railway dashboard
- Consider scaling options based on traffic
- Review and optimize database queries
- Use appropriate instance sizes
