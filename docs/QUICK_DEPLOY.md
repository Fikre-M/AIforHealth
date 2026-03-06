# ⚡ Quick Deploy Reference

## 🎯 What You Need

1. **MongoDB Atlas** connection string
2. **Netlify** frontend URL
3. **GitHub** repository pushed
4. **Render** account

## 📋 Render Configuration (Copy-Paste Ready)

### Build Settings
```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables
Open `backend/RENDER_ENV_VARS.txt` and copy all variables to Render.

**Don't forget to replace:**
- `MONGODB_URI` → Your MongoDB Atlas connection string
- `CORS_ORIGIN` → Your Netlify URL
- `FRONTEND_URL` → Your Netlify URL

## ✅ Quick Test URLs

After deployment, test these:

1. Health: `https://your-backend.onrender.com/health`
2. API Docs: `https://your-backend.onrender.com/api-docs`

## 🔄 Update Frontend

In Netlify, update environment variable:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

Then redeploy.

## 📚 Full Guides

- **Step-by-step**: See `DEPLOYMENT_CHECKLIST.md`
- **Detailed docs**: See `RENDER_DEPLOYMENT_GUIDE.md`

---

**Ready?** Go to [render.com](https://render.com) and start deploying! 🚀
