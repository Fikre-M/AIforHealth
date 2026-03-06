# Backend Services Quick Reference

## 🚀 Quick Start

```bash
cd backend
npm run dev
```

Server: http://localhost:5000
API Docs: http://localhost:5000/api-docs

---

## 🔑 Common API Calls

### Register User
```bash
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test123!@#",
  "role": "patient"
}
```

### Login
```bash
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "Test123!@#"
}
# Returns: { user, tokens: { accessToken, refreshToken } }
```

### Get Profile (Protected)
```bash
GET /api/v1/auth/profile
Headers: Authorization: Bearer <accessToken>
```

### Create Appointment (Protected)
```bash
POST /api/v1/appointments
Headers: Authorization: Bearer <accessToken>
{
  "doctor": "doctorId",
  "appointmentDate": "2026-03-15T10:00:00Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Regular checkup"
}
```

---

## 💻 Service Usage in Code

### UserService
```typescript
import { UserService } from '@/services/UserService';

// Create user
const user = await UserService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'patient'
});

// Find user
const user = await UserService.findUserById(userId);
const user = await UserService.findUserByEmail(email);

// Update user
const updated = await UserService.updateUser(userId, {
  name: 'Jane Doe'
});

// List users with pagination
const result = await UserService.getUsers({
  page: 1,
  limit: 10,
  role: 'patient',
  search: 'john'
});
```

### AuthService
```typescript
import { AuthService } from '@/services/AuthService';

// Register
const result = await AuthService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'patient'
});

// Login
const result = await AuthService.login(
  'john@example.com',
  'password123'
);

// Refresh token
const tokens = await AuthService.refreshToken(refreshToken);
```

### AppointmentService
```typescript
import { AppointmentService } from '@/services/AppointmentService';

// Create appointment
const appointment = await AppointmentService.createAppointment({
  patientId: userId,
  doctorId: doctorId,
  appointmentDate: new Date('2026-03-15T10:00:00Z'),
  duration: 30,
  type: 'consultation',
  reason: 'Regular checkup'
});

// Get appointments
const appointments = await AppointmentService.getAppointments({
  page: 1,
  limit: 10,
  patientId: userId
});
```

---

## 🔧 Environment Variables

```bash
# Required
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/AIforHealth
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# Optional (for email/SMS)
SENDGRID_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- UserService

# Run with coverage
npm run test:coverage

# Verify services
node verify-services.js
```

---

## 🐛 Common Issues

### MongoDB Connection Error
```bash
# Check if MongoDB is running
Get-Service -Name MongoDB

# If not running, start it
Start-Service -Name MongoDB
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### JWT Token Expired
- Login again to get new tokens
- Use refresh token endpoint to get new access token

---

## 📊 Database Quick Commands

### MongoDB Compass
- Connection: `mongodb://127.0.0.1:27017`
- Database: `AIforHealth`
- Collections: `users`, `appointments`, `notifications`

### View Users
```javascript
db.users.find().pretty()
```

### View Appointments
```javascript
db.appointments.find().pretty()
```

### Clear Test Data
```javascript
db.users.deleteMany({ email: /test/ })
```

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days (access) / 30 days (refresh)
- Account locks after 5 failed login attempts
- Rate limiting: 100 requests per 15 minutes
- CORS enabled for http://localhost:5173

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": [ ... ]
  }
}
```

---

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

---

## 📞 Quick Links

- API Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health
- Detailed Health: http://localhost:5000/api/v1/health

---

**All services are operational and ready to use!** ✅
