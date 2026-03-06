# 🚀 Backend Deployment Checklist

Follow these steps in order to deploy your backend to Render.

## ✅ Pre-Deployment (Complete These First)

### 1. MongoDB Atlas Setup
- [ ] Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create account / Sign in
- [ ] Create a FREE cluster (M0 Sandbox)
- [ ] Create database user:
  - Username: `aiforhealth_user` (or your choice)
  - Password: Generate a strong password (save it!)
- [ ] Network Access:
  - Click "Network Access" in left sidebar
  - Click "Add IP Address"
  - Click "Allow Access from Anywhere" (0.0.0.0/0)
  - Click "Confirm"
- [ ] Get connection string:
  - Click "Database" in left sidebar
  - Click "Connect" on your cluster
  - Choose "Connect your application"
  - Copy the connection string
  - Replace `<password>` with your actual password
  - Replace `<dbname>` with `aiforhealth`

**Your connection string should look like:**
```
mongodb+srv://aiforhealth_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/aiforhealth?retryWrites=true&w=majority
```

### 2. Prepare Environment Variables
- [ ] Open `backend/RENDER_ENV_VARS.txt`
- [ ] Replace `MONGODB_URI` with your MongoDB Atlas connection string
- [ ] Replace `CORS_ORIGIN` with your Netlify frontend URL
- [ ] Replace `FRONTEND_URL` with your Netlify frontend URL
- [ ] Keep the JWT secrets as they are (already generated)

**Example:**
```
MONGODB_URI=mongodb+srv://aiforhealth_user:MyP@ssw0rd@cluster0.xxxxx.mongodb.net/aiforhealth?retryWrites=true&w=majority
CORS_ORIGIN=https://aiforhealth.netlify.app
FRONTEND_URL=https://aiforhealth.netlify.app
```

### 3. Push to GitHub
- [ ] Make sure all your latest code is committed
- [ ] Push to GitHub:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

## 🌐 Render Deployment

### 4. Create Web Service
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up / Sign in (use GitHub for easy connection)
- [ ] Click **"New +"** button (top right)
- [ ] Select **"Web Service"**
- [ ] Click **"Connect account"** if needed to link GitHub
- [ ] Find and select your **AIforHealth** repository
- [ ] Click **"Connect"**

### 5. Configure Service
Fill in these settings:

**Basic Settings:**
- [ ] **Name**: `aiforhealth-backend`
- [ ] **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- [ ] **Branch**: `main`
- [ ] **Root Directory**: `backend`
- [ ] **Runtime**: `Node`

**Build & Deploy:**
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`

**Instance Type:**
- [ ] Select **"Free"** (for testing) or **"Starter $7/month"** (recommended for production)

### 6. Add Environment Variables
- [ ] Click **"Advanced"** button
- [ ] Scroll to **"Environment Variables"** section
- [ ] Open `backend/RENDER_ENV_VARS.txt` in your editor
- [ ] For each variable, click **"Add Environment Variable"**
- [ ] Copy the KEY and VALUE from the file

**Add these variables one by one:**
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = (your MongoDB Atlas connection string)
JWT_SECRET = (from RENDER_ENV_VARS.txt)
JWT_REFRESH_SECRET = (from RENDER_ENV_VARS.txt)
JWT_EXPIRES_IN = 7d
JWT_REFRESH_EXPIRES_IN = 30d
CORS_ORIGIN = (your Netlify URL)
FRONTEND_URL = (your Netlify URL)
BCRYPT_SALT_ROUNDS = 12
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
ENFORCE_HTTPS = true
LOG_LEVEL = info
```

### 7. Deploy!
- [ ] Click **"Create Web Service"** button at the bottom
- [ ] Wait for deployment (3-5 minutes)
- [ ] Watch the logs for any errors
- [ ] Once you see "Live" status, copy your backend URL

**Your backend URL will be:**
```
https://aiforhealth-backend.onrender.com
```
(or whatever name you chose)

## ✅ Post-Deployment Testing

### 8. Test Backend
Open these URLs in your browser:

- [ ] **Health Check**: `https://your-backend-url.onrender.com/health`
  - Should return: `{"status":"ok",...}`
  
- [ ] **API Docs**: `https://your-backend-url.onrender.com/api-docs`
  - Should show Swagger documentation

### 9. Update Frontend
- [ ] Go to [Netlify Dashboard](https://app.netlify.com)
- [ ] Select your frontend site
- [ ] Go to **Site settings** → **Environment variables**
- [ ] Find `VITE_API_BASE_URL`
- [ ] Update it to your Render backend URL:
  ```
  VITE_API_BASE_URL=https://your-backend-url.onrender.com
  ```
- [ ] Go to **Deploys** tab
- [ ] Click **"Trigger deploy"** → **"Clear cache and deploy site"**

### 10. Test Full Integration
- [ ] Open your Netlify frontend URL
- [ ] Try to register a new account
- [ ] Try to login
- [ ] Check if API calls work (open browser DevTools → Network tab)

## 🎉 Success!

If everything works, you're done! Your app is now live:

- **Frontend**: https://your-frontend.netlify.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas

## 🐛 Troubleshooting

### Build Fails
- Check Render logs for specific error
- Verify `backend` is set as root directory
- Make sure all dependencies are in package.json

### Database Connection Error
- Verify MongoDB connection string is correct
- Check MongoDB Atlas allows 0.0.0.0/0 in Network Access
- Ensure database user has correct permissions

### CORS Errors
- Verify CORS_ORIGIN exactly matches your Netlify URL
- No trailing slash in the URL
- Check browser console for specific error

### App Crashes
- Check Render logs for error messages
- Verify all required environment variables are set
- Ensure JWT secrets are properly set

## 📝 Important Notes

⚠️ **Free Tier**: Render free tier spins down after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.

🔒 **Security**: Never commit `RENDER_ENV_VARS.txt` to git (it's in .gitignore).

💰 **Upgrade**: For production, consider upgrading to Render Starter ($7/month) for always-on service.

## 🎯 Next Steps

After successful deployment:
- [ ] Set up monitoring (Sentry)
- [ ] Configure email service (SendGrid)
- [ ] Set up MongoDB backups
- [ ] Add custom domain (optional)
- [ ] Enable auto-deploy on git push

---

**Need help?** Check the detailed guide in `RENDER_DEPLOYMENT_GUIDE.md`
