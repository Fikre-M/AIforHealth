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
   # Edit .env with your configuration
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