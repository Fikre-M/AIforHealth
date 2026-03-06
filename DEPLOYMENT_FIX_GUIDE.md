# Deployment Fix Guide - CORS Issue Resolution

## Problem
Frontend at `https://fridayhealth-123.netlify.app` was getting "No response from server" when trying to connect to backend at `https://aiforhealth-2.onrender.com`.

## Root Cause
The backend CORS configuration was allowing the wrong Netlify URL (old deployment URL) instead of the current one.

## Fixes Applied

### 1. Updated `render.yaml`
- Set `CORS_ORIGIN` to `https://fridayhealth-123.netlify.app`
- Set `FRONTEND_URL` to `https://fridayhealth-123.netlify.app`

### 2. Updated `backend/src/middleware/security.ts`
- Modified CORS configuration to use `CORS_ORIGIN` environment variable
- Added support for multiple origins (comma-separated)
- Added better logging for blocked origins

## Deployment Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "fix: Update CORS configuration for Netlify deployment"
git push origin main
```

### Step 2: Verify Render Environment Variables
Go to your Render dashboard for `aiforhealth-2` service and verify these environment variables are set:

- `CORS_ORIGIN` = `https://fridayhealth-123.netlify.app`
- `FRONTEND_URL` = `https://fridayhealth-123.netlify.app`
- `NODE_ENV` = `production`
- `MONGODB_URI` = (your MongoDB connection string)
- `JWT_SECRET` = (auto-generated or set manually)
- `JWT_REFRESH_SECRET` = (auto-generated or set manually)

### Step 3: Trigger Render Redeploy
The push to main should trigger an automatic deployment. If not:
1. Go to Render dashboard
2. Click on your `aiforhealth-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"

### Step 4: Verify Netlify Build
Netlify should automatically rebuild when you push. Verify:
1. Go to Netlify dashboard
2. Check that the build succeeded
3. Verify environment variables in Netlify:
   - `VITE_API_BASE_URL` = `https://aiforhealth-2.onrender.com/api/v1`

### Step 5: Test the Connection
1. Open browser DevTools (F12)
2. Go to `https://fridayhealth-123.netlify.app`
3. Try to login
4. Check Console tab for API request logs
5. Check Network tab for the actual request/response

## Expected Console Output

### Frontend (Browser Console)
```
🔧 API Configuration:
- Environment: production
- Production: true
- VITE_API_BASE_URL: https://aiforhealth-2.onrender.com/api/v1
- Final API_BASE_URL: https://aiforhealth-2.onrender.com/api/v1

🚀 API Request:
  method: POST
  url: https://aiforhealth-2.onrender.com/api/v1/auth/login
  
✅ API Response:
  status: 200
  data: {...}
```

### Backend (Render Logs)
```
✅ Environment configuration validated successfully
Database connected successfully
Server started on port 5000
API Documentation available at http://localhost:5000/api-docs
```

## Troubleshooting

### If still getting CORS errors:
1. Check Render logs for "CORS blocked origin" messages
2. Verify the exact origin being sent by the browser
3. Make sure `CORS_ORIGIN` environment variable is set correctly on Render

### If getting 500 errors:
1. Check Render logs for error details
2. Verify MongoDB connection string is correct
3. Check that all required environment variables are set

### If Render service is sleeping:
- Free tier Render services sleep after 15 minutes of inactivity
- First request will take 30-60 seconds to wake up
- Consider upgrading to paid tier for always-on service

## Testing Checklist
- [ ] Backend health check works: `https://aiforhealth-2.onrender.com/health`
- [ ] Frontend loads without errors
- [ ] Login form submits without CORS errors
- [ ] API requests show in Network tab
- [ ] Console shows successful API configuration
- [ ] User can successfully login

## Additional Notes

### Multiple Frontend URLs
If you need to support multiple frontend URLs (staging, production, etc.), set `CORS_ORIGIN` as comma-separated:
```
CORS_ORIGIN=https://fridayhealth-123.netlify.app,https://staging.netlify.app
```

### Local Development
The CORS configuration automatically allows all `localhost` origins in development mode, so local development should work without changes.
