# Railway Deployment Guide for GRRAS Solutions

This guide will help you deploy your GRRAS Solutions Training Institute website on Railway.

## Prerequisites

1. ✅ GitHub repository with your code
2. 🔗 Railway account ([railway.app](https://railway.app))
3. 🍃 MongoDB Atlas account (for database)

## Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user and password
4. Whitelist all IP addresses (0.0.0.0/0) for Railway access
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/grras_database?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend on Railway

1. **Connect Repository:**
   - Login to Railway
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your GRRAS repository

2. **Configure Backend Service:**
   - Railway will auto-detect your Python app
   - Set the following environment variables in Railway dashboard:

   ```bash
   # Database
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grras_database?retryWrites=true&w=majority
   DB_NAME=grras_database
   
   # Admin
   ADMIN_PASSWORD=grras-admin
   JWT_SECRET=your-secure-jwt-secret-key-here
   
   # Storage
   CONTENT_STORAGE=json
   CONTACT_STORAGE=json
   
   # Python
   PYTHONPATH=/app/backend
   ```

3. **Configure Build Settings:**
   - Root directory: `/` (or leave empty)
   - Start command: `cd backend && python -m uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Or let Railway auto-detect using railway.toml

## Step 3: Deploy Frontend on Railway

1. **Create New Service:**
   - In the same Railway project, click "New Service"
   - Connect the same GitHub repository
   - Select "Frontend" or create a separate service

2. **Configure Frontend Service:**
   - Set build command: `cd frontend && yarn install && yarn build`
   - Set start command: `cd frontend && yarn start`
   - Set environment variables:

   ```bash
   REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
   ```

3. **Update Backend URL:**
   - Get your backend Railway URL (e.g., `https://backend-production-abc123.up.railway.app`)
   - Update `REACT_APP_BACKEND_URL` in frontend environment variables
   - Update `FRONTEND_URL` and `CORS_ORIGINS` in backend environment variables

## Step 4: Configure Domain and CORS

1. **Update Backend CORS:**
   ```bash
   FRONTEND_URL=https://your-frontend-service.railway.app
   CORS_ORIGINS=https://your-frontend-service.railway.app,http://localhost:3000
   ```

2. **Custom Domains (Optional):**
   - Add custom domain in Railway dashboard
   - Update environment variables with your custom domain

## Step 5: Verify Deployment

1. **Test Backend:**
   - Visit `https://your-backend.railway.app/api/` 
   - Should return: `{"message": "GRRAS Solutions Training Institute API", "status": "active"}`

2. **Test Frontend:**
   - Visit `https://your-frontend.railway.app`
   - Verify the website loads correctly
   - Test course pages and contact forms

3. **Test Admin Panel:**
   - Visit `https://your-frontend.railway.app/admin/content`
   - Login with password: `grras-admin`
   - Verify CMS functionality

## Important Notes

### Environment Variables Checklist

**Backend Environment Variables:**
- [ ] `DATABASE_URL` (MongoDB Atlas connection string)
- [ ] `DB_NAME` (database name)
- [ ] `ADMIN_PASSWORD` (admin panel password)
- [ ] `JWT_SECRET` (secure random string)
- [ ] `FRONTEND_URL` (your Railway frontend URL)
- [ ] `CORS_ORIGINS` (comma-separated allowed origins)
- [ ] `PYTHONPATH=/app/backend`

**Frontend Environment Variables:**
- [ ] `REACT_APP_BACKEND_URL` (your Railway backend URL)

### File Structure Changes Made

1. **Added Railway Configuration:**
   - `railway.toml` - Railway deployment configuration
   - `.dockerignore` - Optimized build exclusions
   - `.env.railway` - Environment variable template

2. **Updated Backend:**
   - Railway port support (`$PORT` environment variable)
   - MongoDB Atlas connection string support (`DATABASE_URL`)
   - HTTPS-compatible CORS settings
   - Health check endpoint (`/health`)
   - Secure cookie settings for HTTPS

3. **Path Compatibility:**
   - All file paths now use `Path` objects for Railway compatibility
   - Temporary and storage directories properly configured

### Troubleshooting

**Backend Issues:**
- Check Railway logs for Python import errors
- Verify `DATABASE_URL` connection string format
- Ensure `PYTHONPATH` is set correctly

**Frontend Issues:**
- Verify `REACT_APP_BACKEND_URL` points to correct backend
- Check browser console for CORS errors
- Test API endpoints directly

**CORS Issues:**
- Add both Railway domains to `CORS_ORIGINS`
- Include `http://localhost:3000` for local development
- Use exact URLs (no wildcards in production)

**Database Issues:**
- Verify MongoDB Atlas cluster is running
- Check database user permissions
- Ensure IP whitelist includes 0.0.0.0/0

### Cost Optimization

Railway offers:
- Free tier with usage limits
- $5/month hobby plan for production apps
- Pay-per-use for additional resources

Consider:
- Using MongoDB Atlas free tier (512MB)
- Optimizing build processes
- Monitoring resource usage

### Next Steps

1. Set up monitoring and alerts
2. Configure backup schedules
3. Set up custom domains
4. Implement CI/CD pipelines
5. Add environment-specific configurations

For support, visit [Railway Documentation](https://docs.railway.app/) or join their Discord community.