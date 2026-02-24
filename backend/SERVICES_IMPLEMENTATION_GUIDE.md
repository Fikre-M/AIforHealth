# Backend Services Implementation Guide

## ✅ Current Status

Your backend is **fully operational** with all core services implemented and tested.

### Working Services:
- ✅ **UserService** - User management (CRUD operations)
- ✅ **AuthService** - Authentication & authorization
- ✅ **AppointmentService** - Appointment booking & management
- ✅ **DoctorService** - Doctor management
- ✅ **EmailService** - Email notifications
- ✅ **SMSService** - SMS notifications via Twilio
- ✅ **NotificationService** - In-app notifications

### Working Infrastructure:
- ✅ MongoDB connection (AIforHealth database)
- ✅ JWT authentication with access & refresh tokens
- ✅ Express server running on port 5000
- ✅ API documentation at http://localhost:5000/api-docs
- ✅ Error handling & logging
- ✅ Security middleware (Helmet, CORS, rate limiting)

---

## 📋 Service Overview

### 1. UserService
**Location:** `backend/src/services/UserService.ts`

**Features:**
- Create user with email validation
- Find user by ID or email
- Update user profile
- Soft delete (sets isActive to false)
- Pagination & search
- User statistics
- Password management
- Email verification

**Key Methods:**
```typescript
UserService.createUser(userData)          // Create new user
UserService.findUserById(userId)          // Get user by ID
UserService.findUserByEmail(email)        // Get user by email
UserService.updateUser(userId, data)      // Update user
UserService.deleteUser(userId)            // Soft delete
UserService.getUsers(query)               // List with pagination
UserService.updatePassword(userId, pwd)   // Change password
UserService.verifyEmail(userId)           // Verify email
UserService.getUserStats()                // Get statistics
```

**Usage Example:**
```typescript
// Create a new patient
const user = await UserService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  role: 'patient'
});

// Get user with pagination
const result = await UserService.getUsers({
  page: 1,
  limit: 10,
  role: 'patient',
  search: 'john'
});
```

---

### 2. AuthService
**Location:** `backend/src/services/AuthService.ts`

**Features:**
- User registration with validation
- Login with JWT tokens
- Token refresh mechanism
- Password reset flow
- Email verification
- Account locking after failed attempts
- Logout functionality

**Key Methods:**
```typescript
AuthService.register(userData)                    // Register new user
AuthService.login(email, password)                // Login user
AuthService.refreshToken(refreshToken)            // Refresh access token
AuthService.requestPasswordReset(email)           // Request password reset
AuthService.resetPassword(token, newPassword)     // Reset password
AuthService.verifyEmail(token)                    // Verify email
AuthService.changePassword(userId, old, new)      // Change password
```

**Usage Example:**
```typescript
// Register a new user
const result = await AuthService.register({
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'SecurePass123!',
  role: 'patient'
});
// Returns: { user, tokens: { accessToken, refreshToken } }

// Login
const loginResult = await AuthService.login(
  'jane@example.com',
  'SecurePass123!'
);
```

---

### 3. AppointmentService
**Location:** `backend/src/services/AppointmentService.ts`

**Features:**
- Book appointments
- Check doctor availability
- Cancel appointments
- Reschedule appointments
- Get appointment history
- Appointment reminders
- Status management

**Key Methods:**
```typescript
AppointmentService.createAppointment(data)        // Book appointment
AppointmentService.getAppointmentById(id)         // Get appointment
AppointmentService.updateAppointment(id, data)    // Update appointment
AppointmentService.cancelAppointment(id, reason)  // Cancel appointment
AppointmentService.rescheduleAppointment(id, date)// Reschedule
AppointmentService.getAppointments(query)         // List appointments
AppointmentService.checkAvailability(doctorId)    // Check availability
```

---

### 4. EmailService
**Location:** `backend/src/services/EmailService.ts`

**Features:**
- Send appointment confirmations
- Send appointment reminders
- Send cancellation notifications
- Send password reset emails
- Send email verification
- HTML email templates

**Key Methods:**
```typescript
EmailService.sendAppointmentConfirmation(appointment)
EmailService.sendAppointmentReminder(appointment)
EmailService.sendAppointmentCancellation(appointment)
EmailService.sendPasswordResetEmail(user, token)
EmailService.sendEmailVerification(user, token)
```

---

### 5. SMSService
**Location:** `backend/src/services/SMSService.ts`

**Features:**
- Send SMS via Twilio
- Appointment reminders
- Appointment confirmations
- Cancellation notifications

**Key Methods:**
```typescript
SMSService.sendSMS(to, message)
SMSService.sendAppointmentReminder(appointment)
SMSService.sendAppointmentConfirmation(appointment)
SMSService.sendAppointmentCancellation(appointment)
```

---

## 🔧 Configuration

### Environment Variables
All services are configured via `.env` file:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/AIforHealth

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@aiforhealth.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Running the Backend

### Start Development Server
```bash
cd backend
npm run dev
```

Server will start on: http://localhost:5000

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `PUT /api/v1/auth/change-password` - Change password (protected)

#### Users
- `GET /api/v1/users` - List users (protected)
- `GET /api/v1/users/:id` - Get user by ID (protected)
- `PUT /api/v1/users/:id` - Update user (protected)
- `DELETE /api/v1/users/:id` - Delete user (protected)

#### Appointments
- `POST /api/v1/appointments` - Create appointment (protected)
- `GET /api/v1/appointments` - List appointments (protected)
- `GET /api/v1/appointments/:id` - Get appointment (protected)
- `PUT /api/v1/appointments/:id` - Update appointment (protected)
- `POST /api/v1/appointments/:id/cancel` - Cancel appointment (protected)
- `POST /api/v1/appointments/:id/reschedule` - Reschedule (protected)
- `GET /api/v1/appointments/availability` - Check availability (protected)

#### Health Check
- `GET /health` - Server health check
- `GET /api/v1/health` - Detailed health with database status

---

## 🧪 Testing Services

### Manual Testing with curl

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "patient"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### 3. Get Profile (use token from login)
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Automated Testing
```bash
# Run all tests
npm test

# Run specific service tests
npm test -- UserService
npm test -- AuthService

# Run with coverage
npm run test:coverage
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'patient' | 'doctor' | 'admin',
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  // Patient-specific fields
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  emergencyContact: Object,
  medicalHistory: [String],
  allergies: [String],
  currentMedications: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  appointmentDate: Date,
  duration: Number,
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
  type: String,
  reason: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

### Implemented Security Measures:
1. **Password Hashing** - bcrypt with salt rounds of 12
2. **JWT Authentication** - Access & refresh tokens
3. **Rate Limiting** - Prevents brute force attacks
4. **Helmet** - Sets security HTTP headers
5. **CORS** - Configured for frontend origin
6. **Input Validation** - express-validator
7. **Account Locking** - After 5 failed login attempts
8. **SQL Injection Protection** - MongoDB parameterized queries
9. **XSS Protection** - Input sanitization

---

## 📝 Next Steps

### Optional Enhancements:

1. **Add More Tests**
   - Integration tests for all endpoints
   - Load testing for performance
   - Security testing

2. **Add More Features**
   - File upload for avatars
   - Real-time notifications with WebSockets
   - Advanced search and filtering
   - Analytics dashboard

3. **Production Deployment**
   - Set up CI/CD pipeline
   - Configure production environment variables
   - Set up monitoring (Sentry is already configured)
   - Configure backup strategy

4. **Documentation**
   - API documentation is available at `/api-docs`
   - Add more code comments
   - Create user guides

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if MongoDB is running
Get-Service -Name MongoDB

# Check if port 5000 is available
netstat -ano | findstr :5000

# Check logs
npm run dev
```

### Database connection issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure database name matches (AIforHealth)

### Authentication issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure user exists and is active

---

## ✅ Verification Checklist

- [x] Server starts successfully
- [x] MongoDB connection established
- [x] User registration works
- [x] User login works
- [x] JWT authentication works
- [x] Protected routes work
- [x] Database operations work
- [x] API documentation accessible
- [x] Health check endpoint works
- [x] Error handling works
- [x] Logging works

**Status: All services are operational and ready for use!**

---

## 📞 Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Review API documentation at http://localhost:5000/api-docs
3. Check environment variables in `.env`
4. Review service implementation in `backend/src/services/`

---

**Last Updated:** February 24, 2026
**Backend Version:** 1.0.0
**Status:** Production Ready ✅
