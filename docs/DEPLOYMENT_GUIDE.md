# 🚀 Deployment Guide

## Quick Deploy (5 Minutes)

### Option 1: Render (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Select `backend` folder (if monorepo)

4. **Configure Service**
   ```
   Name: aiforhealth-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **Add Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-64-char-random>
   JWT_REFRESH_SECRET=<generate-64-char-random>
   FRONTEND_URL=<your-frontend-url>
   CORS_ORIGIN=<your-frontend-url>
   ```

6. **Deploy!**
   - Click "Create Web Service"
   - Wait 2-3 minutes
   - Your API is live! 🎉

### Option 2: Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables in Settings
   - Deploy automatically starts

4. **Get URL**
   - Railway provides a URL like: `https://your-app.railway.app`

### Option 3: Vercel (Backend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd backend
   vercel
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # ... add all variables
   ```

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

## Database Setup (MongoDB Atlas)

### 1. Create Cluster (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a free cluster (M0)
4. Choose region closest to your users

### 2. Configure Access
1. **Database Access**
   - Create database user
   - Username: `aiforhealth`
   - Password: Generate strong password
   - Role: `Read and write to any database`

2. **Network Access**
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your hosting provider's IPs

### 3. Get Connection String
1. Click "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your password
5. Replace `<dbname>` with `aiforhealth`

Example:
```
mongodb+srv://aiforhealth:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/aiforhealth?retryWrites=true&w=majority
```

## Environment Variables

### Required
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Optional (Email/SMS)
```env
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@aiforhealth.com
FROM_NAME=AI for Health

TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=+1234567890
```

### Generate Secrets
```bash
# Generate JWT secrets (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend Deployment (Vercel)

### 1. Deploy Frontend
```bash
cd frontend
vercel
```

### 2. Add Environment Variables
```env
VITE_API_BASE_URL=https://your-backend.render.com/api/v1
```

### 3. Production Deploy
```bash
vercel --prod
```

## Post-Deployment Checklist

### 1. Verify Backend
```bash
# Health check
curl https://your-backend.render.com/health

# Should return:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Test API Endpoints
```bash
# Register user
curl -X POST https://your-backend.render.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "patient"
  }'

# Login
curl -X POST https://your-backend.render.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Test Frontend
1. Open https://your-frontend.vercel.app
2. Register a new account
3. Login
4. Book an appointment
5. Verify confirmation page

### 4. Monitor Logs
- **Render**: Dashboard → Logs
- **Railway**: Project → Deployments → Logs
- **Vercel**: Project → Deployments → Function Logs

## Troubleshooting

### Backend Not Starting
1. Check logs for errors
2. Verify environment variables
3. Check MongoDB connection string
4. Ensure build completed successfully

### Database Connection Failed
1. Verify MongoDB Atlas IP whitelist
2. Check connection string format
3. Verify database user credentials
4. Test connection locally first

### CORS Errors
1. Verify `CORS_ORIGIN` matches frontend URL
2. Check `FRONTEND_URL` is correct
3. Ensure no trailing slashes

### 502 Bad Gateway
1. Check if backend is running
2. Verify health check endpoint
3. Check logs for startup errors
4. Ensure PORT is correct

## Monitoring & Maintenance

### 1. Set Up Monitoring
- **Sentry**: Error tracking (already configured)
- **Render**: Built-in metrics
- **Railway**: Built-in monitoring
- **UptimeRobot**: Uptime monitoring (free)

### 2. Regular Maintenance
- Monitor error logs daily
- Check database performance weekly
- Review security updates monthly
- Backup database regularly

### 3. Scaling
- **Render**: Upgrade plan for more resources
- **Railway**: Auto-scales with usage
- **Database**: Upgrade MongoDB Atlas tier

## Cost Estimates

### Free Tier (Development)
- **Render**: Free (750 hours/month)
- **Railway**: $5 credit/month
- **MongoDB Atlas**: Free (M0 cluster)
- **Vercel**: Free (hobby plan)
- **Total**: $0-5/month

### Production (Low Traffic)
- **Render**: $7/month (Starter)
- **Railway**: ~$10/month
- **MongoDB Atlas**: $9/month (M10)
- **Vercel**: Free (hobby) or $20/month (Pro)
- **SendGrid**: Free (100 emails/day)
- **Twilio**: ~$8/1000 SMS
- **Total**: ~$25-50/month

### Production (Medium Traffic)
- **Render**: $25/month (Standard)
- **Railway**: ~$30/month
- **MongoDB Atlas**: $57/month (M20)
- **Vercel**: $20/month (Pro)
- **SendGrid**: $19.95/month (50k emails)
- **Twilio**: ~$80/10k SMS
- **Total**: ~$150-200/month

## CI/CD Setup (Optional)

### GitHub Actions
1. Create `.github/workflows/deploy.yml`
2. Add secrets to GitHub repository
3. Push to main branch
4. Auto-deploy on every push

### Automatic Deployments
- **Render**: Auto-deploy on git push
- **Railway**: Auto-deploy on git push
- **Vercel**: Auto-deploy on git push

## Security Checklist

- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up Sentry for error tracking
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Monitor for suspicious activity

## Support

### Documentation
- API Docs: `https://your-backend.render.com/api-docs`
- Health Check: `https://your-backend.render.com/health`

### Resources
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Vercel Docs: https://vercel.com/docs

## Success! 🎉

Your application is now live and accessible worldwide!

**Backend**: https://your-backend.render.com
**Frontend**: https://your-frontend.vercel.app
**API Docs**: https://your-backend.render.com/api-docs

Share your app with the world! 🚀
