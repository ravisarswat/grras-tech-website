# 🚀 GRRAS Backend Deployment Guide

## 🎯 DEPLOYMENT OPTIONS

### **Option 1: Railway Backend Deployment (Recommended)**

#### Step 1: Create New Railway Service for Backend
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your GRRAS repository
4. **IMPORTANT**: Create a **separate service** for backend

#### Step 2: Configure Backend Service
```bash
# Service Settings:
- Service Name: "grras-backend"
- Build Command: "cd backend && pip install -r requirements.txt"  
- Start Command: "cd backend && python server.py"
- Port: 8001
```

#### Step 3: Set Environment Variables
```env
# Required Environment Variables in Railway:
MONGO_URL=your_mongodb_connection_string
DB_NAME=grras_production
ADMIN_PASSWORD=grras-admin
PORT=8001
CORS_ORIGINS=https://www.grras.tech,https://grras.tech
```

#### Step 4: Get Backend URL
- Railway will provide a backend URL like: `https://grras-backend-production.up.railway.app`
- This will be your API base URL

#### Step 5: Update Frontend Environment Variable
```env
# In your frontend Railway service:
REACT_APP_BACKEND_URL=https://grras-backend-production.up.railway.app
```

---

### **Option 2: Deploy Both Frontend + Backend Together**

#### Update Root nixpacks.toml:
```toml
[variables]
NODE_VERSION = "20"
PYTHON_VERSION = "3.11"

[phases.setup]
nixPkgs = ["nodejs_20", "python311"]

[phases.build]
cmds = [
    "cd frontend && npm ci && npm run build",
    "cd backend && pip install -r requirements.txt"
]

[start]
cmd = "python backend/server.py & cd frontend && npx serve -s build -l 3000"
```

---

### **Option 3: Manual Server Deployment**

#### For VPS/Cloud Server:
```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3 python3-pip nginx

# 2. Clone and setup
git clone your-repo
cd grras-website/backend
pip3 install -r requirements.txt

# 3. Configure environment
export MONGO_URL="your_mongodb_connection"
export DB_NAME="grras_production"  
export ADMIN_PASSWORD="grras-admin"
export PORT=8001

# 4. Run with PM2 (process manager)
npm install -g pm2
pm2 start server.py --name grras-backend --interpreter python3

# 5. Configure Nginx reverse proxy
# /etc/nginx/sites-available/grras-backend
server {
    listen 80;
    server_name api.grras.tech;  # or your-domain.com/api
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 PRODUCTION ENVIRONMENT VARIABLES

### **Required Variables:**
```env
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=grras_production

# Authentication  
ADMIN_PASSWORD=grras-admin

# Server
PORT=8001
CORS_ORIGINS=https://www.grras.tech,https://grras.tech

# Optional - if using MongoDB Atlas
MONGO_URI=mongodb+srv://...  # Alternative to MONGO_URL
```

### **MongoDB Setup:**
1. **MongoDB Atlas** (Recommended):
   - Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Get connection string
   - Add to `MONGO_URL` environment variable

2. **Local MongoDB**:
   - Install MongoDB on your server
   - Use: `mongodb://localhost:27017`

---

## 🎯 VERIFICATION STEPS

After deployment, verify:

### 1. Backend Health Check:
```bash
curl https://your-backend-url/api/health
# Should return: {"status": "healthy", "database": "connected"}
```

### 2. Admin Authentication:
```bash
curl -X POST https://your-backend-url/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "grras-admin"}'
```

### 3. Courses Endpoint:
```bash
curl https://your-backend-url/api/courses
# Should return all courses including new certifications
```

### 4. Frontend API Connection:
- Update `REACT_APP_BACKEND_URL` in frontend environment
- Redeploy frontend
- Check browser console for API errors

---

## 📊 EXPECTED RESULTS

After successful deployment:

✅ **Backend API**: Accessible at your backend URL
✅ **All 23 Courses**: Including AWS, Kubernetes, Red Hat certifications  
✅ **6 Learning Paths**: Including new career paths
✅ **Admin Panel**: Working with new course organization features
✅ **PDF Generation**: Course syllabus downloads working
✅ **Database**: All content properly stored and accessible

---

## 🔥 QUICK DEPLOYMENT (Railway)

**Fastest Approach:**

1. **Create Backend Service**: New Railway service from GitHub repo
2. **Environment Variables**: Add `MONGO_URL`, `ADMIN_PASSWORD`, `PORT=8001`
3. **Build Settings**: 
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python server.py`
4. **Get URL**: Copy the Railway-provided backend URL
5. **Update Frontend**: Set `REACT_APP_BACKEND_URL` to backend URL
6. **Deploy Frontend**: Redeploy frontend service with new backend URL

**Time: ~10 minutes for complete deployment**

---

## 🚨 TROUBLESHOOTING

### Common Issues:

**1. CORS Errors:**
```env
# Add your frontend domain to CORS_ORIGINS
CORS_ORIGINS=https://www.grras.tech,https://grras.tech
```

**2. Database Connection:**
```bash
# Check MongoDB URL format
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

**3. Port Issues:**
```env
# Railway uses dynamic ports, ensure:
PORT=8001  # or use Railway's PORT variable
```

**4. API Route Issues:**
```bash
# Ensure all routes are prefixed with /api
# Backend serves at: /api/health, /api/courses, etc.
```

---

## 💡 RECOMMENDATIONS

1. **Use Railway**: Simplest deployment with automatic scaling
2. **MongoDB Atlas**: Free tier perfect for production
3. **Environment Variables**: Keep all secrets in Railway environment settings
4. **Health Checks**: Monitor `/api/health` endpoint
5. **Backup Strategy**: Regular MongoDB backups via Atlas

**Total Cost**: $0-5/month (using free tiers of Railway + MongoDB Atlas)

---

**Ready to deploy? Choose your preferred option and follow the steps above!** 🚀