# 🚂 Railway Deployment Guide - Quick Start

**Terra Industries Backend - Deployment Steps**

---

## ✅ **Pre-Deployment Checklist**

- [x] Backend separated into standalone repository ✅
- [x] Pushed to GitHub: https://github.com/Atlas00000/terra_server.git ✅
- [x] Railway-optimized Dockerfile created ✅
- [x] railway.json configuration ready ✅
- [x] Environment variables documented ✅
- [x] README.md with full documentation ✅

---

## 🚀 **Railway Deployment - Step by Step**

### **Step 1: Sign Up & Connect (5 minutes)**

1. Go to [railway.app](https://railway.app)
2. Sign up using GitHub (easiest option)
3. Verify your email
4. Connect your GitHub account

### **Step 2: Create New Project (2 minutes)**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`terra_server`** repository
4. Railway will auto-detect the Dockerfile ✅

### **Step 3: Add PostgreSQL Database (1 minute)**

1. In your project dashboard, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically provisions PostgreSQL 16
4. Database URL is auto-available as `${{Postgres.DATABASE_URL}}`

**No configuration needed!** Railway handles everything.

### **Step 4: Add Redis Cache (1 minute)**

1. Click **"New"** again
2. Select **"Database"** → **"Add Redis"**
3. Railway automatically provisions Redis 7
4. Redis URL is auto-available as `${{Redis.REDIS_URL}}`

**No configuration needed!** Railway handles everything.

### **Step 5: Configure Environment Variables (5 minutes)**

Click on your backend service → **"Variables"** tab → Add these:

#### **Required Variables:**

```bash
# Application
NODE_ENV=production
PORT=${{PORT}}  # Auto-provided by Railway

# Database (Auto-linked from PostgreSQL plugin)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Cache (Auto-linked from Redis plugin)
REDIS_URL=${{Redis.REDIS_URL}}

# Authentication (GENERATE SECURE SECRET!)
JWT_SECRET=<paste_your_generated_secret_here>
JWT_EXPIRES_IN=7d

# CORS (Update with your frontend URL)
CORS_ORIGIN=https://terra-industries-drab.vercel.app

# Security
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Logging
LOG_LEVEL=info
```

#### **Generate JWT Secret:**

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste as `JWT_SECRET` value.

#### **Optional Variables (Add Later):**

```bash
# Cloudflare R2 (Media Storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=terra-media

# Resend (Email Service)
RESEND_API_KEY=
EMAIL_FROM=noreply@terraindustries.com
ADMIN_EMAIL=admin@terraindustries.com

# Sentry (Error Tracking)
SENTRY_DSN=
```

### **Step 6: Deploy! (Automatic)**

Railway will automatically:
1. ✅ Build your Docker image
2. ✅ Run database migrations
3. ✅ Start your application
4. ✅ Provide a public URL

**Deployment time:** ~3-5 minutes

### **Step 7: Get Your Backend URL (1 minute)**

1. Click on your backend service
2. Go to **"Settings"** tab
3. Find **"Domains"** section
4. Copy your Railway URL (something like):
   ```
   https://terra-server-production-xxxx.up.railway.app
   ```

### **Step 8: Test Deployment (2 minutes)**

Test your deployed API:

```bash
# Health Check
curl https://your-app.up.railway.app/api/v1/health/liveness

# Expected response:
# {"status":"ok","info":{"uptime":123.45},"timestamp":"2025-11-06T..."}

# API Documentation
# Visit in browser:
https://your-app.up.railway.app/api-docs
```

If you see the health check response, **deployment successful!** 🎉

---

## 🔗 **Connect Frontend to Backend**

### **Update Frontend Environment Variables (Vercel)**

1. Go to your Vercel project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL`:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app/api/v1
```

4. Redeploy frontend

### **Update Backend CORS**

Make sure `CORS_ORIGIN` in Railway includes your frontend URL:

```bash
CORS_ORIGIN=https://terra-industries-drab.vercel.app
```

---

## 📊 **Railway Dashboard Overview**

After deployment, you'll see:

- **Backend Service**: Your NestJS API
  - Status: Running ✅
  - URL: https://your-app.up.railway.app
  - Metrics: CPU, Memory, Network usage

- **PostgreSQL Database**
  - Status: Running ✅
  - Version: PostgreSQL 16
  - Storage: Auto-scaling

- **Redis Cache**
  - Status: Running ✅
  - Version: Redis 7
  - Memory: Auto-scaling

---

## 💰 **Pricing Estimate**

### **Hobby Plan (Free Trial)**
- $5 free credit per month
- ~500 hours of usage
- Perfect for development/testing

### **Developer Plan ($5/month)**
- $5 base fee + usage
- Unlimited hours
- Custom domains
- Better for production

### **Estimated Monthly Cost:**
```
Backend API:     $5-10/month
PostgreSQL:      $5/month
Redis:           $2-5/month
Total:           ~$12-20/month
```

**Note:** Railway offers $5 free credit monthly on Hobby plan.

---

## 🎯 **Post-Deployment Tasks**

### **1. Seed Database (Optional)**

If you want sample data:

```bash
# Using Railway CLI
npm i -g @railway/cli
railway login
railway link
railway run npm run prisma:seed
```

### **2. Create Admin User**

```bash
curl -X POST https://your-app.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@terraindustries.com",
    "password": "SecurePass123!",
    "fullName": "Admin User"
  }'
```

### **3. Test API Endpoints**

Visit your Swagger docs:
```
https://your-app.up.railway.app/api-docs
```

Test key endpoints:
- `/api/v1/health/liveness` - Health check
- `/api/v1/health/readiness` - Database connection
- `/api/v1/auth/login` - Authentication
- `/api/v1/news` - Public news endpoint
- `/api/v1/product-specs` - Products endpoint

### **4. Set Up Monitoring (Optional)**

**Sentry for Error Tracking:**
1. Sign up at [sentry.io](https://sentry.io)
2. Create a NestJS project
3. Copy DSN
4. Add to Railway variables: `SENTRY_DSN=your_dsn_here`
5. Redeploy

**Railway Metrics:**
- Built-in metrics dashboard
- CPU, Memory, Network usage
- Request logs
- Deployment history

---

## 🔧 **Common Issues & Solutions**

### **Issue: Build Failed**

**Solution:**
- Check Railway build logs
- Ensure all dependencies in `package.json`
- Verify `Dockerfile.railway` exists

### **Issue: Database Connection Failed**

**Solution:**
- Verify PostgreSQL plugin is added
- Check `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Wait ~2 minutes for database to fully provision

### **Issue: CORS Error**

**Solution:**
- Update `CORS_ORIGIN` in Railway variables
- Include your Vercel frontend URL
- Redeploy backend

### **Issue: Health Check Failing**

**Solution:**
- Check if migrations ran successfully
- View deployment logs in Railway
- Verify `PORT` is set correctly

---

## 📞 **Support Resources**

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Repo**: https://github.com/Atlas00000/terra_server
- **API Docs**: https://your-app.up.railway.app/api-docs

---

## ✅ **Deployment Checklist**

- [ ] Railway account created and GitHub connected
- [ ] New project created from `terra_server` repo
- [ ] PostgreSQL database added
- [ ] Redis cache added
- [ ] Environment variables configured
- [ ] JWT_SECRET generated and added
- [ ] CORS_ORIGIN set to frontend URL
- [ ] Deployment successful (green status)
- [ ] Health check passing
- [ ] API documentation accessible
- [ ] Frontend connected to backend
- [ ] Test API endpoints working
- [ ] Admin user created
- [ ] (Optional) Database seeded
- [ ] (Optional) Sentry monitoring set up

---

## 🎉 **You're Done!**

Your Terra Industries backend is now:
- ✅ Deployed on Railway
- ✅ Running with PostgreSQL + Redis
- ✅ Accessible via public URL
- ✅ Ready for production traffic
- ✅ Monitored and scalable

**Next Steps:**
1. Update frontend API URL
2. Test all features
3. Monitor Railway dashboard
4. Scale as needed

---

**Deployment Time Total:** ~20 minutes  
**Cost:** $12-20/month (after free trial)  
**Status:** Production-Ready ✅

---

<div align="center">

**Terra Industries Backend**  
**Successfully Deployed on Railway! 🚂**

[View Repository](https://github.com/Atlas00000/terra_server) | [Railway Dashboard](https://railway.app)

</div>

