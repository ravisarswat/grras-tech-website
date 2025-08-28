# 🚂 Railway Deployment Checklist for GRRAS Solutions

## ✅ Pre-Deployment Checklist

### 1. Repository Preparation
- [ ] Code pushed to GitHub
- [ ] All files committed and up to date
- [ ] `.gitignore` properly configured
- [ ] Railway configuration files added

### 2. Database Setup (MongoDB Atlas)
- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0 for Railway)
- [ ] Connection string obtained
- [ ] Database name decided: `grras_database`

### 3. Railway Account Setup
- [ ] Railway account created at [railway.app](https://railway.app)
- [ ] GitHub connected to Railway account
- [ ] Project created in Railway

## 🔧 Configuration Files Added

### Backend Configuration
- ✅ `railway.toml` - Main Railway configuration
- ✅ `nixpacks.toml` - Alternative build configuration 
- ✅ `.env.railway` - Environment variable template
- ✅ `railway_server.py` - Railway-optimized server
- ✅ Updated `server.py` with Railway compatibility

### Frontend Configuration  
- ✅ `frontend/.env.railway` - Frontend environment template
- ✅ `frontend/railway.json` - Frontend Railway config
- ✅ Updated `ContentContext.js` for Railway environment handling

### General Configuration
- ✅ `package.json` - Root package configuration
- ✅ `.dockerignore` - Build optimization
- ✅ `railway-deployment-guide.md` - Detailed deployment guide

## 🚀 Deployment Steps

### Step 1: Deploy Backend Service

1. **Create New Project in Railway:**
   ```
   New Project → Deploy from GitHub repo → Select your repository
   ```

2. **Configure Environment Variables:**
   ```bash
   # Database Configuration
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grras_database?retryWrites=true&w=majority
   DB_NAME=grras_database
   
   # Admin Configuration  
   ADMIN_PASSWORD=grras-admin
   JWT_SECRET=your-secure-jwt-secret-here-change-this
   
   # Storage Configuration
   CONTENT_STORAGE=json
   CONTACT_STORAGE=json
   
   # Python Configuration
   PYTHONPATH=/app/backend
   ```

3. **Verify Backend Deployment:**
   - [ ] Service builds successfully
   - [ ] Health check passes: `https://your-backend.railway.app/health`
   - [ ] API responds: `https://your-backend.railway.app/api/`

### Step 2: Deploy Frontend Service

1. **Create Frontend Service:**
   ```
   Add New Service → Deploy from GitHub repo → Same repository
   ```

2. **Configure Frontend Environment:**
   ```bash
   REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
   GENERATE_SOURCEMAP=false
   CI=false
   ```

3. **Verify Frontend Deployment:**
   - [ ] Frontend builds successfully
   - [ ] Website loads at `https://your-frontend.railway.app`
   - [ ] API calls work (check browser console)

### Step 3: Update CORS Configuration

1. **Update Backend CORS Settings:**
   ```bash
   FRONTEND_URL=https://your-frontend-service.railway.app
   CORS_ORIGINS=https://your-frontend-service.railway.app,http://localhost:3000
   ```

2. **Restart Backend Service**

## 🧪 Testing Checklist

### Backend API Testing
- [ ] Health endpoint: `GET /health`
- [ ] API root: `GET /api/`
- [ ] Content endpoint: `GET /api/content`  
- [ ] Courses endpoint: `GET /api/courses`
- [ ] Course details: `GET /api/courses/python`
- [ ] Admin login: `POST /api/admin/login`

### Frontend Testing
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Course pages load
- [ ] Contact form works
- [ ] Syllabus downloads work
- [ ] Admin panel accessible: `/admin/content`
- [ ] CMS login works (password: `grras-admin`)

### Integration Testing
- [ ] API calls from frontend work
- [ ] CORS errors resolved
- [ ] Admin authentication flows work
- [ ] Content management works
- [ ] File uploads work (if using media library)

## 🔒 Security Configuration

### Environment Variables Security
- [ ] Strong `JWT_SECRET` generated (32+ characters)
- [ ] `ADMIN_PASSWORD` changed from default
- [ ] Database credentials secure
- [ ] CORS origins properly configured

### HTTPS Configuration
- [ ] Railway provides HTTPS automatically
- [ ] Secure cookies enabled (`secure=True`)
- [ ] CORS allows only HTTPS origins

## 📊 Monitoring and Maintenance

### Railway Dashboard Monitoring
- [ ] Check service status regularly
- [ ] Monitor resource usage
- [ ] Review deployment logs
- [ ] Set up alerts if needed

### Application Monitoring
- [ ] Test critical user flows weekly
- [ ] Monitor database usage
- [ ] Check backup creation
- [ ] Verify admin panel access

## 🐛 Troubleshooting Common Issues

### Backend Issues
```bash
# Check logs
Railway Dashboard → Backend Service → Logs

# Common fixes:
- Verify PYTHONPATH is set to /app/backend
- Check DATABASE_URL format
- Ensure all required env vars are set
```

### Frontend Issues  
```bash
# Check logs
Railway Dashboard → Frontend Service → Logs

# Common fixes:
- Verify REACT_APP_BACKEND_URL is correct
- Check for CORS errors in browser console
- Ensure backend is running and accessible
```

### CORS Issues
```bash
# Update backend CORS_ORIGINS
CORS_ORIGINS=https://frontend.railway.app,http://localhost:3000

# Restart backend service after CORS changes
```

## 💰 Cost Management

### Railway Pricing
- **Free Tier**: $5 credit, then usage-based
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

### MongoDB Atlas Pricing
- **Free Tier**: 512MB storage (sufficient for this app)
- **Paid Tiers**: Start at $9/month

### Optimization Tips
- [ ] Use JSON storage instead of MongoDB if dataset is small
- [ ] Optimize build processes
- [ ] Monitor resource usage
- [ ] Use Railway's sleep feature for non-critical environments

## 📝 Post-Deployment Tasks

### Documentation Updates
- [ ] Update README with live URLs
- [ ] Document environment variables
- [ ] Create admin user guide
- [ ] Set up backup procedures

### SEO and Analytics
- [ ] Configure custom domains (optional)
- [ ] Set up Google Analytics (optional)
- [ ] Update meta tags with live URLs
- [ ] Submit to search engines

### Backup Strategy
- [ ] Regular database backups (MongoDB Atlas automated)
- [ ] Content export procedures documented
- [ ] Recovery procedures tested

## 🎯 Success Criteria

### Deployment Successful When:
- [ ] Both services deploy without errors
- [ ] Website fully functional on Railway URLs  
- [ ] Admin panel accessible and working
- [ ] Contact forms and lead capture working
- [ ] PDF generation working
- [ ] All course pages accessible
- [ ] Mobile responsiveness maintained

### Performance Targets:
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second  
- [ ] 99%+ uptime
- [ ] No console errors

---

## 📞 Support Resources

- **Railway Documentation**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas Support**: https://docs.atlas.mongodb.com/
- **This Application Support**: Check `/app/railway-deployment-guide.md`

---

**Next Steps After Successful Deployment:**
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure custom domains if needed
4. Plan content migration strategy
5. Train admin users on CMS usage

Good luck with your Railway deployment! 🚂✨