# Backend Setup Guide

This guide will help you set up and run the AI for Health backend server.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or cloud instance)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

**Required Configuration:**
```env
# Server
NODE_ENV=development
PORT=5000

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/aiforhealth

# JWT Secrets (REQUIRED - Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Optional Services** (can be added later):
- Sentry (error monitoring)
- SendGrid (email)
- Twilio (SMS)
- OpenAI (AI features)
- AWS S3 (file storage)
- Stripe (payments)

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start the Server

**Development Mode** (with hot reload):
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
npm start
```

## Verify Installation

### 1. Health Check

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. API Documentation

Visit: http://localhost:5000/api-docs

This will open the Swagger UI with all available endpoints.

## Available Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Fix code style issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Database
npm run db:seed          # Seed database with sample data
npm run db:clear         # Clear all data
npm run db:reset         # Clear and reseed
npm run db:status        # Check database status
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── env.ts       # Environment variables
│   │   ├── sentry.ts    # Error monitoring
│   │   └── swagger.ts   # API documentation
│   ├── features/        # Feature-based modules
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── appointments/# Appointments
│   │   └── doctors/     # Doctor management
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Mongoose models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Application logs
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments` - Get appointments
- `GET /api/v1/appointments/:id` - Get appointment by ID
- `PUT /api/v1/appointments/:id` - Update appointment
- `PATCH /api/v1/appointments/:id/status` - Update status
- `POST /api/v1/appointments/:id/cancel` - Cancel appointment
- `POST /api/v1/appointments/:id/reschedule` - Reschedule appointment
- `POST /api/v1/appointments/:id/complete` - Complete appointment

### Doctors
- `GET /api/v1/doctors` - Get all doctors
- `GET /api/v1/doctors/:id` - Get doctor by ID
- `GET /api/v1/doctors/:id/availability` - Get doctor availability

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

1. Register or login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

2. Use the token in subsequent requests:
```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles

- `patient` - Regular users who book appointments
- `doctor` - Healthcare providers
- `admin` - System administrators

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log levels: `error`, `warn`, `info`, `http`, `debug`

Configure log level in `.env`:
```env
LOG_LEVEL=info
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - express-validator
- **MongoDB Injection Protection** - Mongoose sanitization

## Database Seeding

Seed the database with sample data:

```bash
npm run db:seed
```

This creates:
- Sample users (patients, doctors, admin)
- Sample appointments
- Sample health records

Default admin credentials:
```
Email: admin@aiforhealth.com
Password: Admin123!
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify MongoDB port (default: 27017)

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
1. Change `PORT` in `.env`
2. Or kill the process using port 5000:
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### JWT Secret Error

**Error**: `JWT secret must be at least 32 characters`

**Solution**:
Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` with longer strings (min 32 chars).

### TypeScript Errors

**Error**: Type errors during development

**Solution**:
```bash
npm run type-check
```

## Production Deployment

### Environment Variables

Ensure all required variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret)
- `JWT_REFRESH_SECRET` (strong secret)
- `SENTRY_DSN` (error monitoring)
- `CORS_ORIGIN` (frontend URL)

### Build and Start

```bash
npm run build
npm start
```

### Recommended Platforms

- **Railway** - Easy deployment with MongoDB
- **Heroku** - Classic PaaS
- **AWS EC2/ECS** - Full control
- **DigitalOcean App Platform** - Simple deployment
- **Google Cloud Run** - Serverless containers

## Next Steps

1. ✅ Set up environment variables
2. ✅ Start MongoDB
3. ✅ Run the server
4. ✅ Test with Swagger UI
5. 📝 Seed database with sample data
6. 🔧 Configure optional services (email, SMS, AI)
7. 🚀 Connect frontend application

## Support

- **Documentation**: See `/docs` folder
- **API Docs**: http://localhost:5000/api-docs
- **Issues**: GitHub Issues
- **Email**: support@aiforhealth.com

## License

MIT License - see LICENSE file for details
