# Render Deployment Fix Guide

## Issues Fixed

1. **Husky prepare script failure** - Modified to skip gracefully when husky is not installed (production environments)
2. **MongoDB connection logging** - Added better error messages to identify connection issues

## Required Render Configuration

### 1. Environment Variables

You MUST set these environment variables in your Render dashboard:

#### Required Variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiforhealth?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

#### Optional but Recommended:
```
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production
LOG_LEVEL=info
BCRYPT_SALT_ROUNDS=12
```

#### Email/SMS (if using):
```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@aiforhealth.com
FROM_NAME=AI for Health
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 2. Render Service Settings

#### Build Settings:
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (or set to `/`)

#### Advanced Settings:
- **Auto-Deploy**: Yes (if you want automatic deploys on git push)
- **Health Check Path**: `/health`

### 3. MongoDB Atlas Setup

If you haven't already:

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine for testing)
3. Create a database user with read/write permissions
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string from Atlas:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `aiforhealth`

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/aiforhealth?retryWrites=true&w=majority
```

### 4. Generate Secure Secrets

For JWT_SECRET and JWT_REFRESH_SECRET, generate secure random strings:

```bash
# On your local machine, run:
node backend/generate-secrets.js
```

Copy the generated secrets to your Render environment variables.

## Deployment Steps

1. **Commit the fixes**:
   ```bash
   git add .
   git commit -m "fix: Render deployment issues - husky and MongoDB logging"
   git push
   ```

2. **Configure Render**:
   - Go to your Render dashboard
   - Select your backend service
   - Go to "Environment" tab
   - Add all required environment variables listed above
   - Save changes

3. **Trigger Manual Deploy**:
   - Go to "Manual Deploy" tab
   - Click "Deploy latest commit"
   - Watch the logs for any errors

4. **Verify Deployment**:
   - Once deployed, visit: `https://your-app.onrender.com/health`
   - You should see a JSON response with status "OK"
   - Check: `https://your-app.onrender.com/api-docs` for API documentation

## Troubleshooting

### If MongoDB connection still fails:

1. **Check the logs** for the masked connection string to verify format
2. **Verify MongoDB Atlas**:
   - Database user exists and has correct password
   - IP whitelist includes Render's IPs (or 0.0.0.0/0)
   - Connection string is correct format
3. **Test connection locally**:
   ```bash
   cd backend
   MONGODB_URI="your-atlas-connection-string" npm start
   ```

### If build fails:

1. Check that you're using Node.js 18 or higher
2. Verify package.json exists in backend folder
3. Check build logs for specific error messages

### Common Issues:

- **"husky: not found"** - Fixed by the package.json change
- **"MONGODB_URI is not defined"** - Add MONGODB_URI to Render environment variables
- **"Authentication failed"** - Check MongoDB Atlas user password
- **"IP not whitelisted"** - Add 0.0.0.0/0 to MongoDB Atlas IP whitelist
- **"Connection timeout"** - Check MongoDB Atlas cluster is running

## Next Steps

After successful deployment:

1. Update your frontend to use the Render backend URL
2. Test all API endpoints
3. Monitor logs for any errors
4. Set up proper monitoring (Sentry recommended)
5. Configure custom domain (optional)

## Support

If you continue to have issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check MongoDB Atlas logs: Atlas Dashboard → Cluster → Metrics
3. Verify all environment variables are set correctly
