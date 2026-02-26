# Quick Fix Guide - Get Running in 30 Minutes

This guide will get your application running quickly. For production deployment, see `DEPLOYMENT_STATUS.md`.

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git bash or terminal

## Step 1: Install Dependencies (5 minutes)

```bash
# From project root
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

## Step 2: Quick Fix Backend TypeScript (10 minutes)

### Option A: Relax TypeScript Strictness (Fastest)

Edit `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    // ... rest of config
  }
}
```

### Option B: Comment Out Problematic Imports

Edit `backend/src/routes/patientRoutes.ts`:
```typescript
// Comment out these lines:
// import { PatientController } from '@/controllers/patient.controller';
// import { authorize } from '@/middleware/authorize';
```

Edit `backend/src/services/index.ts`:
```typescript
// Comment out these exports:
// export type {
//   CreateAppointmentData,
//   UpdateAppointmentData,
//   AppointmentQuery,
//   CancelAppointmentData,
//   RescheduleAppointmentData,
// } from './AppointmentService';
```

## Step 3: Configure Environment (5 minutes)

### Backend Environment

Create or edit `backend/.env`:

```bash
# Minimum required configuration
NODE_ENV=development
PORT=5000

# Database (use your MongoDB connection string)
MONGODB_URI=mongodb://127.0.0.1:27017/AIforHealth

# JWT Secrets (change these!)
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional: Redis (comment out if not using)
# REDIS_URL=redis://localhost:6379
```

### Frontend Environment

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## Step 4: Start MongoDB (if local)

```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

## Step 5: Start the Application (5 minutes)

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Wait for: `✓ Server running on port 5000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## Step 6: Verify It's Working (5 minutes)

1. **Open Browser**: http://localhost:5173
2. **Check Backend API**: http://localhost:5000/api/v1/health
3. **Check API Docs**: http://localhost:5000/api-docs

### Test Registration

1. Go to http://localhost:5173/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Role: Patient
3. Click Register

### Test Login

1. Go to http://localhost:5173/login
2. Use credentials:
   - Email: test@example.com
   - Password: Test123!
3. Click Login

## Troubleshooting

### Backend Won't Start

**Error: MongoDB connection failed**
```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongod

# Mac/Linux:
ps aux | grep mongod

# Start MongoDB if not running
mongod
```

**Error: Port 5000 already in use**
```bash
# Change port in backend/.env
PORT=5001

# Update frontend/.env
VITE_API_URL=http://localhost:5001/api/v1
```

**Error: Cannot find module**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Start

**Error: Port 5173 already in use**
```bash
# Kill the process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

**Error: Cannot connect to backend**
- Check backend is running on correct port
- Verify VITE_API_URL in frontend/.env
- Check CORS_ORIGIN in backend/.env includes frontend URL

### TypeScript Errors

**Backend build fails**
```bash
# Quick fix: Disable strict mode
# Edit backend/tsconfig.json
{
  "compilerOptions": {
    "strict": false
  }
}
```

**Frontend build fails**
```bash
# Already fixed in tsconfig.app.json
# If still failing, try:
cd frontend
rm -rf node_modules .vite
npm install
```

### Database Issues

**Can't connect to MongoDB**
```bash
# Check connection string in backend/.env
MONGODB_URI=mongodb://127.0.0.1:27017/AIforHealth

# Test connection
mongosh "mongodb://127.0.0.1:27017/AIforHealth"
```

**Database is empty**
```bash
# Seed the database (if seeder exists)
cd backend
npm run db:seed
```

## Common Commands

### Backend

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Run tests
npm test

# Check types
npm run type-check

# Lint
npm run lint
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Check types
npm run type-check

# Lint
npm run lint
```

## Default Test Accounts

After seeding (if available):

**Admin**:
- Email: admin@aiforhealth.com
- Password: Admin123!

**Doctor**:
- Email: doctor@aiforhealth.com
- Password: Doctor123!

**Patient**:
- Email: patient@aiforhealth.com
- Password: Patient123!

## Next Steps

Once you have the app running:

1. **Explore the Features**
   - Register as a patient
   - Book an appointment
   - Try the AI symptom checker
   - Check notifications

2. **Review the Code**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Tests: `backend/src/**/__tests__/`

3. **Read the Documentation**
   - `DEPLOYMENT_STATUS.md` - Full deployment guide
   - `FIXES_APPLIED_SUMMARY.md` - What was fixed
   - `backend/README.md` - Backend documentation
   - `backend/QUICK_REFERENCE.md` - API reference

4. **Fix TypeScript Errors** (for production)
   - See `DEPLOYMENT_STATUS.md` for detailed instructions
   - Estimated time: 2-4 hours

## Getting Help

If you're stuck:

1. Check the error message carefully
2. Look in the troubleshooting section above
3. Check `DEPLOYMENT_STATUS.md` for more details
4. Review the logs:
   - Backend: Terminal 1 output
   - Frontend: Terminal 2 output + Browser console
   - MongoDB: MongoDB logs

## Success Checklist

- [ ] Dependencies installed
- [ ] MongoDB running
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can register a new user
- [ ] Can login successfully

If all checked, you're ready to develop! 🎉

For production deployment, see `DEPLOYMENT_STATUS.md`.
