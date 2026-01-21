# AIforHealth - Development Setup Guide

## ✅ Current Status

The application is now configured to run in development mode without requiring real API keys or external services.

### 🚀 Backend Status
- ✅ Running on http://localhost:5000
- ✅ MongoDB connected (AIforHealth database)
- ✅ Authentication working (register/login)
- ✅ All external services optional (Sentry, OpenAI, AWS, etc.)
- ✅ Health check endpoint: http://localhost:5000/health
- ✅ API Documentation: http://localhost:5000/api-docs

### 📊 Database Status
- ✅ MongoDB running on localhost:27017
- ✅ Database: AIforHealth
- ✅ Collections: 7 total (users, appointments, medications, etc.)
- ✅ Sample data seeded (5 users, 3 appointments)

## 🔧 Configuration Changes Made

### Backend Environment Variables (`.env`)
All external services are now optional with placeholder comments:

```env
# Core Configuration (Required)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/AIforHealth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Optional Services (Commented out for development)
# SENTRY_DSN=your-sentry-dsn-here
# OPENAI_API_KEY=your-openai-api-key-here
# SENDGRID_API_KEY=your-sendgrid-api-key-here
# AWS_ACCESS_KEY_ID=your-aws-access-key-here
# STRIPE_SECRET_KEY=your-stripe-secret-key-here
```

### Frontend Environment Variables (`.env`)
```env
# Core Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=AIforHealth

# Optional Services (Commented out for development)
# VITE_SENTRY_DSN=your-sentry-dsn-here
# VITE_OPENAI_API_KEY=your-openai-api-key-here
```

## 🛠️ Key Fixes Applied

### 1. Authentication Issues Fixed
- ✅ Fixed token structure mismatch in `useAuth` hook
- ✅ Aligned localStorage keys between services
- ✅ Fixed token access patterns

### 2. External Services Made Optional
- ✅ Sentry: Safe imports with fallback logging
- ✅ OpenAI: Optional API key validation
- ✅ AWS/S3: Optional file upload services
- ✅ SendGrid: Optional email services
- ✅ Stripe: Optional payment services

### 3. Error Handling Improved
- ✅ Graceful degradation when services unavailable
- ✅ Clear warning messages for missing services
- ✅ Non-blocking configuration validation

## 🚀 How to Run

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Database Operations
```bash
cd backend
npm run db:seed    # Seed initial data
npm run db:status  # Check database status
npm run db:reset   # Clear and reseed
```

## 🧪 Testing Authentication

### Register New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!@#","role":"patient"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

## 📋 MongoDB Compass Connection

**Connection String:** `mongodb://127.0.0.1:27017/AIforHealth`

**Manual Connection:**
- Host: `127.0.0.1`
- Port: `27017`
- Database: `AIforHealth`

## 🔮 Adding Real API Keys Later

When you're ready to add real API keys, simply uncomment the relevant lines in the `.env` files and add your actual keys:

### Backend `.env`
```env
# Uncomment and add real keys when ready
SENTRY_DSN=https://your-real-sentry-dsn@sentry.io/project-id
OPENAI_API_KEY=sk-your-real-openai-key
SENDGRID_API_KEY=SG.your-real-sendgrid-key
AWS_ACCESS_KEY_ID=your-real-aws-key
AWS_SECRET_ACCESS_KEY=your-real-aws-secret
STRIPE_SECRET_KEY=sk_test_your-real-stripe-key
```

### Frontend `.env`
```env
# Uncomment and add real keys when ready
VITE_SENTRY_DSN=https://your-real-sentry-dsn@sentry.io/project-id
VITE_OPENAI_API_KEY=sk-your-real-openai-key
```

## 🎯 Next Steps

1. **Test the frontend** - Try registering and logging in through the web interface
2. **Check browser console** - Look for any remaining errors
3. **Verify all features** - Test different user roles and functionalities
4. **Add real API keys** - When ready for production features

The application should now work completely without any external API keys, allowing you to develop and test all core functionality locally.