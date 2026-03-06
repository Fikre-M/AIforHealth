# Backend Deployment to Render - Step by Step

## Prerequisites Checklist
- [ ] MongoDB Atlas connection string ready
- [ ] GitHub repository pushed with latest code
- [ ] Render account created (render.com)

## Step 1: Create Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Connect your GitHub account if not already connected
5. Find and select your **AIforHealth** repository

## Step 2: Configure Build Settings

Fill in these settings:

- **Name**: `aiforhealth-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (for testing) or `Starter` (for production)

## Step 3: Add Environment Variables

Click **"Advanced"** and add these environment variables:

### Required Variables:

```
NODE_ENV=production
PORT=5000
```

### Database (CRITICAL):
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/aiforhealth?retryWrites=true&w=majority
```
**Replace with your actual MongoDB Atlas connection string!**

### JWT Secrets (CRITICAL - Generate Strong Secrets):
```
JWT_SECRET=<generate-a-random-64-character-string>
JWT_REFRESH_SECRET=<generate-another-random-64-character-string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**To generate secure secrets, run this in your terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it twice to get two different secrets.

### CORS & Frontend URL:
```
CORS_ORIGIN=https://your-frontend-url.netlify.app
FRONTEND_URL=https://your-frontend-url.netlify.app
```
**Replace with your actual Netlify frontend URL!**

### Security:
```
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENFORCE_HTTPS=true
```

### Logging:
```
LOG_LEVEL=info
```

### Optional (can add later):
```
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@aiforhealth.com
FROM_NAME=AI for Health
```

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying (takes 3-5 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll get a URL like: `https://aiforhealth-backend.onrender.com`

## Step 5: Verify Deployment

Test these endpoints in your browser:

1. **Health Check**: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **API Docs**: `https://your-backend-url.onrender.com/api-docs`
   - Should show Swagger documentation

## Step 6: Update Frontend

Update your Netlify frontend environment variable:

1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Update `VITE_API_BASE_URL` to your Render backend URL:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```
4. Trigger a redeploy in Netlify

## Step 7: Seed Database (Optional)

If you want to add initial data (clinics, doctors):

1. In Render dashboard, go to your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run db:seed
   ```

## Troubleshooting

### Build Fails
- Check the build logs in Render
- Ensure `backend` is set as root directory
- Verify all dependencies are in `package.json`

### Database Connection Fails
- Verify MongoDB Atlas connection string is correct
- Check MongoDB Atlas network access allows `0.0.0.0/0`
- Ensure database user has read/write permissions

### CORS Errors
- Verify `CORS_ORIGIN` matches your exact Netlify URL (no trailing slash)
- Check browser console for specific CORS error messages

### App Crashes on Start
- Check Render logs for error messages
- Verify all required environment variables are set
- Ensure JWT secrets are at least 32 characters

## Important Notes

⚠️ **Free Tier Limitations**:
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Consider upgrading to Starter ($7/month) for always-on service

🔒 **Security Reminders**:
- Never commit `.env` file to git
- Use strong, unique JWT secrets (64+ characters recommended)
- Keep MongoDB credentials secure
- Enable 2FA on Render and MongoDB Atlas accounts

## Next Steps

After successful deployment:
- [ ] Test all API endpoints
- [ ] Test frontend-backend integration
- [ ] Set up monitoring (Sentry)
- [ ] Configure email service (SendGrid)
- [ ] Set up automated backups for MongoDB
- [ ] Add custom domain (optional)

## Your Deployment URLs

**Backend**: `https://_____________________.onrender.com`
**Frontend**: `https://_____________________.netlify.app`
**MongoDB**: `mongodb+srv://_____________________.mongodb.net`

---

Need help? Check Render docs: https://render.com/docs
