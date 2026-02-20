# Backend Setup Checklist

Use this checklist to ensure your backend is properly configured and running.

## 📋 Pre-Setup Checklist

- [ ] Node.js >= 18.0.0 installed
- [ ] npm or yarn installed
- [ ] MongoDB installed (local) OR MongoDB Atlas account (cloud)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 🚀 Setup Checklist

### 1. Installation
- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Verify installation: Check for `node_modules` folder

### 2. Environment Configuration
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Open `.env` in editor
- [ ] Set `MONGODB_URI` (local or Atlas connection string)
- [ ] Set `JWT_SECRET` (min 32 characters, random string)
- [ ] Set `JWT_REFRESH_SECRET` (min 32 characters, different from JWT_SECRET)
- [ ] Set `CORS_ORIGIN` (frontend URL, default: http://localhost:5173)
- [ ] (Optional) Configure additional services (Sentry, SendGrid, etc.)

### 3. Database Setup
- [ ] **If using local MongoDB:**
  - [ ] Start MongoDB service
  - [ ] Verify MongoDB is running on port 27017
- [ ] **If using MongoDB Atlas:**
  - [ ] Create account at mongodb.com/cloud/atlas
  - [ ] Create cluster
  - [ ] Whitelist IP address (or allow all: 0.0.0.0/0)
  - [ ] Create database user
  - [ ] Get connection string
  - [ ] Update `MONGODB_URI` in `.env`

### 4. Start Server
- [ ] Run development server: `npm run dev`
- [ ] Check console for success messages:
  - [ ] "✅ Environment configuration validated"
  - [ ] "✅ MongoDB connected successfully"
  - [ ] "✅ Application started successfully"
- [ ] Note the port (default: 5000)

### 5. Verify Installation
- [ ] Open browser to http://localhost:5000/health
- [ ] Verify health check returns JSON with status "OK"
- [ ] Open http://localhost:5000/api-docs
- [ ] Verify Swagger UI loads with API documentation

### 6. Test API
- [ ] Test registration endpoint:
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"Test123!","role":"patient"}'
  ```
- [ ] Verify response contains user object and tokens
- [ ] Test login endpoint with same credentials
- [ ] Verify login returns tokens

### 7. Optional: Seed Database
- [ ] Run seed command: `npm run db:seed`
- [ ] Verify sample data created
- [ ] Note default admin credentials:
  - Email: admin@aiforhealth.com
  - Password: Admin123!

## ✅ Verification Checklist

### Server Health
- [ ] Server starts without errors
- [ ] No error messages in console
- [ ] Health endpoint responds
- [ ] API docs load correctly

### Database Connection
- [ ] MongoDB connection successful
- [ ] No connection errors
- [ ] Database queries work
- [ ] Collections created automatically

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens generated
- [ ] Protected endpoints require authentication

### API Endpoints
- [ ] `/health` - Returns OK
- [ ] `/api-docs` - Loads Swagger UI
- [ ] `/api/v1/auth/register` - Creates user
- [ ] `/api/v1/auth/login` - Returns tokens
- [ ] `/api/v1/auth/profile` - Returns user (with token)

### Code Quality
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Formatting correct: `npm run format:check`
- [ ] Tests run: `npm test`

### Logging
- [ ] Console logs appear
- [ ] `logs/combined.log` file created
- [ ] `logs/error.log` file created
- [ ] Logs contain structured information

## 🔧 Troubleshooting Checklist

### MongoDB Connection Issues
- [ ] MongoDB service is running
- [ ] Connection string is correct
- [ ] Database user has correct permissions
- [ ] IP address is whitelisted (Atlas)
- [ ] Network allows connection to MongoDB port

### Server Start Issues
- [ ] Port 5000 is not in use
- [ ] All dependencies installed
- [ ] `.env` file exists and is configured
- [ ] JWT secrets are at least 32 characters
- [ ] No syntax errors in code

### Authentication Issues
- [ ] JWT secrets are set in `.env`
- [ ] Passwords meet requirements (min 8 chars)
- [ ] Email format is valid
- [ ] User doesn't already exist (for registration)

### API Issues
- [ ] Correct HTTP method used
- [ ] Content-Type header set to application/json
- [ ] Request body is valid JSON
- [ ] Authorization header included (for protected routes)
- [ ] Token format: `Bearer <token>`

## 📝 Development Checklist

### Before Committing
- [ ] Code compiles: `npm run build`
- [ ] Types check: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] Formatting correct: `npm run format:check`
- [ ] Commit message follows conventional format

### Commit Message Format
- [ ] Starts with type: feat, fix, docs, etc.
- [ ] Includes scope in parentheses (optional)
- [ ] Has colon and space after type/scope
- [ ] Subject is lowercase
- [ ] Subject doesn't end with period
- [ ] Max 100 characters

Example: `feat(auth): add password reset functionality`

### Before Pushing
- [ ] All tests pass
- [ ] No console errors
- [ ] Documentation updated (if needed)
- [ ] `.env` not committed
- [ ] Sensitive data not in code

## 🚀 Production Checklist

### Environment
- [ ] `NODE_ENV=production` set
- [ ] Production MongoDB URI configured
- [ ] Strong JWT secrets (64+ characters)
- [ ] CORS origin set to production frontend URL
- [ ] Sentry DSN configured
- [ ] Email service configured (if needed)

### Security
- [ ] HTTPS enabled
- [ ] Secrets not in code
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet)

### Performance
- [ ] MongoDB indexes created
- [ ] Connection pooling configured
- [ ] Logging level set appropriately
- [ ] File size limits set
- [ ] Compression enabled

### Monitoring
- [ ] Error monitoring active (Sentry)
- [ ] Logging configured
- [ ] Health checks working
- [ ] Database monitoring setup
- [ ] Performance monitoring active

### Deployment
- [ ] Build succeeds: `npm run build`
- [ ] Production server starts: `npm start`
- [ ] All endpoints accessible
- [ ] Database migrations run (if any)
- [ ] Backup strategy in place

## 📚 Documentation Checklist

- [ ] Read `QUICK_START.md`
- [ ] Read `SETUP.md`
- [ ] Review `BACKEND_IMPLEMENTATION_STATUS.md`
- [ ] Explore API docs at `/api-docs`
- [ ] Understand authentication flow
- [ ] Know available endpoints
- [ ] Understand error responses

## 🎯 Next Steps

After completing all checklists:

1. [ ] Connect frontend to backend
2. [ ] Test full authentication flow
3. [ ] Test appointment booking
4. [ ] Test doctor listing
5. [ ] Implement additional features
6. [ ] Write more tests
7. [ ] Deploy to production

## ✅ Final Verification

- [ ] Backend runs without errors
- [ ] All API endpoints work
- [ ] Authentication flow complete
- [ ] Database operations successful
- [ ] Logging working correctly
- [ ] Error handling working
- [ ] API documentation accessible
- [ ] Code quality tools configured
- [ ] Ready for frontend integration

## 🎉 Success!

If all items are checked, your backend is ready to use!

**Quick Commands:**
```bash
npm run dev              # Start development server
npm test                 # Run tests
npm run lint             # Check code quality
npm run type-check       # Check types
```

**Useful URLs:**
- Health: http://localhost:5000/health
- API Docs: http://localhost:5000/api-docs
- Logs: `backend/logs/`

**Need Help?**
- See `SETUP.md` for detailed instructions
- See `QUICK_START.md` for quick reference
- Check API docs for endpoint details
