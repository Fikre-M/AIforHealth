# 🚀 Quick Start - Backend

Get the backend running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

## Step 2: Configure Environment (2 min)

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` and update these REQUIRED fields:**

```env
# Change these JWT secrets (must be at least 32 characters)
JWT_SECRET=change-this-to-a-long-random-string-min-32-characters-abc123
JWT_REFRESH_SECRET=change-this-to-another-long-random-string-min-32-chars-xyz789

# If using local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017/aiforhealth

# If using MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiforhealth
```

## Step 3: Start MongoDB (1 min)

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

## Step 4: Start Server (1 min)

```bash
npm run dev
```

You should see:
```
✅ Environment configuration validated (with warnings)
🔌 Connecting to MongoDB main database...
✅ MongoDB connected successfully
🚀 Application starting
✅ Application started successfully
💡 API Documentation available at http://localhost:5000/api-docs
```

## Step 5: Test It! (30 sec)

Open your browser:
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api-docs

Or use curl:
```bash
curl http://localhost:5000/health
```

## ✅ Success!

Your backend is now running! 

### What's Next?

1. **Explore API**: Visit http://localhost:5000/api-docs
2. **Seed Data**: Run `npm run db:seed` for sample data
3. **Test Endpoints**: Try the authentication endpoints
4. **Connect Frontend**: Update frontend `.env` with backend URL

### Quick Test - Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "patient"
  }'
```

### Default Ports

- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB: localhost:27017

## Troubleshooting

### MongoDB Connection Failed?
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try MongoDB Atlas (cloud) instead

### Port 5000 Already in Use?
- Change `PORT=5001` in `.env`
- Or kill the process: `lsof -i :5000` then `kill -9 <PID>`

### JWT Secret Error?
- Ensure secrets are at least 32 characters long
- Use random strings, not simple passwords

## Need Help?

- Full setup guide: See `SETUP.md`
- Documentation: See `/docs` folder
- API reference: http://localhost:5000/api-docs
