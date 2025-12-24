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

### Core Endpoints
- `GET /` - API information
- `GET /api/v1/health` - Health check

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (protected)
- `GET /api/v1/auth/profile` - Get current user profile (protected)
- `PUT /api/v1/auth/change-password` - Change password (protected)
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/verify-email` - Verify email with token

### User Management (Protected)
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/stats` - Get user statistics (admin only)
- `GET /api/v1/users/:id` - Get user by ID (owner or admin)
- `PUT /api/v1/users/:id` - Update user profile (owner or admin)
- `DELETE /api/v1/users/:id` - Delete user (admin only)
- `PUT /api/v1/users/:id/password` - Update user password (owner or admin)
- `PUT /api/v1/users/:id/verify-email` - Verify user email (owner or admin)

### Protected Route Examples
- `GET /api/v1/protected/public` - Public endpoint (no auth required)
- `GET /api/v1/protected/optional-auth` - Optional authentication
- `GET /api/v1/protected/protected` - Basic protected endpoint
- `GET /api/v1/protected/admin-only` - Admin only access
- `GET /api/v1/protected/doctor-only` - Doctor only access
- `GET /api/v1/protected/patient-only` - Patient only access
- `GET /api/v1/protected/doctor-or-admin` - Multiple role access
- `GET /api/v1/protected/resource/:id/owner-or-admin` - Resource ownership
- `GET /api/v1/protected/verified-only` - Email verified users only
- `POST /api/v1/protected/sensitive-operation` - Sensitive operations
- `GET /api/v1/protected/patient-data/:id` - Complex middleware chain

### Future Endpoints
- ⏳ Doctor management endpoints
- ⏳ Appointment booking endpoints

## Features Ready for Implementation

- ✅ Project structure and configuration
- ✅ Database connection setup
- ✅ Security middleware
- ✅ Error handling and logging
- ✅ User schema and management system
- ✅ JWT Authentication system
- ⏳ Doctor profiles and specializations
- ⏳ Appointment booking system

## Authentication & Authorization Middleware

The system includes comprehensive middleware for authentication and authorization:

### Authentication Middleware
- **`authenticate`**: Verifies JWT tokens and loads user context
- **`optionalAuth`**: Optional authentication (doesn't fail if no token)
- **`requireVerified`**: Requires email verification

### Authorization Middleware
- **`authorize(...roles)`**: Requires specific user roles
- **`authorizeAny(...roles)`**: Requires any of the specified roles
- **`authorizeAll(...roles)`**: Requires all specified roles (future use)
- **`ownerOrAdmin`**: Resource owner or admin access
- **`ownerOrRoles(...roles)`**: Resource owner or specific roles
- **`sensitiveOperation`**: Enhanced security for sensitive operations

### Error Handling
- **Detailed error codes**: Specific error codes for different auth failures
- **Clean error messages**: User-friendly error descriptions
- **Security headers**: No-cache headers for sensitive operations
- **JWT error handling**: Specific handling for token expiration/invalid tokens

### Usage Examples
```typescript
// Basic authentication
router.get('/profile', authenticate, getProfile);

// Role-based access
router.get('/admin', authenticate, authorize(UserRole.ADMIN), adminEndpoint);

// Multiple roles
router.get('/medical', authenticate, authorizeAny(UserRole.DOCTOR, UserRole.ADMIN), medicalEndpoint);

// Resource ownership
router.get('/user/:id', authenticate, ownerOrAdmin, getUserData);

// Complex middleware chain
router.get('/sensitive/:id', 
  authenticate, 
  requireVerified,
  ownerOrRoles(UserRole.DOCTOR, UserRole.ADMIN),
  sensitiveOperation,
  sensitiveEndpoint
);
```

## User Schema

The User model includes:
- **Basic Info**: name, email, password (hashed)
- **Role-based Access**: patient, doctor, admin roles
- **Security Features**: account locking, login attempts tracking
- **Email Verification**: verification tokens and status
- **Password Reset**: secure token-based password reset
- **Audit Fields**: timestamps, last login tracking
- **Soft Delete**: isActive flag for data retention