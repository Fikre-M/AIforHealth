# AIforHealth Backend

Production-ready Node.js + Express + MongoDB backend for AI Healthcare & Medical Appointment System.

## Technology Stack

- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication with role-based access
- **Security** middleware (Helmet, CORS, Rate limiting)
- **Centralized** error handling and logging

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.ts       # Environment variables
│   └── database.ts  # MongoDB connection
├── features/        # Feature-based modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── doctors/     # Doctor management
│   └── appointments/# Appointment system
├── middleware/      # Express middleware
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Production build:**
   ```bash
   npm run build
   npm start
   ```

## Database Management

The backend includes a robust MongoDB connection with production-ready features:

### Connection Features
- **Connection pooling** with configurable pool sizes
- **Automatic reconnection** with exponential backoff
- **Health monitoring** and connection state tracking
- **Graceful shutdown** handling
- **Production optimizations** (compression, write concerns)

### Database Scripts
```bash
# Check database status
npm run db:status

# Seed database with initial data (development only)
npm run db:seed

# Clear all data (development only)
npm run db:clear

# Reset database (clear + seed)
npm run db:reset
```

### Environment Variables
Configure MongoDB connection in your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/aiforhealth
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=5
MONGODB_RETRY_WRITES=true
MONGODB_WRITE_CONCERN=majority
```

## API Endpoints

- `GET /` - API information
- `GET /api/v1/health` - Health check
- Feature endpoints will be added as modules are implemented

## Features Ready for Implementation

- ✅ Project structure and configuration
- ✅ Database connection setup
- ✅ Security middleware
- ✅ Error handling and logging
- ⏳ Authentication system
- ⏳ User management
- ⏳ Doctor profiles
- ⏳ Appointment booking