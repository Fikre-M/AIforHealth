# AuthService Implementation Guide

## ✅ Status: Fully Implemented and Tested

The AuthService is production-ready with all authentication and authorization features working correctly.

---

## 📋 Features Implemented

### Core Authentication
- ✅ User Registration with validation
- ✅ User Login with JWT tokens
- ✅ Token Refresh mechanism
- ✅ Logout functionality
- ✅ Password hashing (bcrypt with 12 rounds)

### Security Features
- ✅ Account locking after 5 failed login attempts
- ✅ Account lock duration: 2 hours
- ✅ JWT access tokens (7 days expiration)
- ✅ JWT refresh tokens (30 days expiration)
- ✅ Password strength validation
- ✅ Email uniqueness validation
- ✅ Active account verification

### Password Management
- ✅ Change password (requires current password)
- ✅ Request password reset
- ✅ Reset password with token
- ✅ Password reset token expiration (10 minutes)

### Email Verification
- ✅ Generate email verification token
- ✅ Verify email with token
- ✅ Email verification status tracking

### Profile Management
- ✅ Get user profile
- ✅ Update user profile
- ✅ Get user settings
- ✅ Update user settings

---

## 🔧 Service Methods

### 1. Register User

**Method:** `AuthService.register(registerData)`

**Parameters:**
```typescript
{
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'doctor' | 'admin';
}
```

**Returns:**
```typescript
{
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
}
```

**Example:**
```typescript
const result = await AuthService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  role: 'patient'
});

console.log(result.user._id);
console.log(result.tokens.accessToken);
```

**Validation Rules:**
- Name: 2-50 characters, letters and spaces only
- Email: Valid email format, unique
- Password: 8-128 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- Role: Optional, defaults to 'patient'

---

### 2. Login User

**Method:** `AuthService.login(loginData)`

**Parameters:**
```typescript
{
  email: string;
  password: string;
}
```

**Returns:**
```typescript
{
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
}
```

**Example:**
```typescript
const result = await AuthService.login({
  email: 'john@example.com',
  password: 'SecurePass123!'
});
```

**Security Checks:**
- Verifies email exists
- Checks if account is locked
- Checks if account is active
- Verifies password
- Increments login attempts on failure
- Locks account after 5 failed attempts
- Resets login attempts on success
- Updates last login timestamp

---

### 3. Refresh Token

**Method:** `AuthService.refreshToken(refreshTokenData)`

**Parameters:**
```typescript
{
  refreshToken: string;
}
```

**Returns:**
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Example:**
```typescript
const tokens = await AuthService.refreshToken({
  refreshToken: oldRefreshToken
});
```

**Validation:**
- Verifies refresh token signature
- Checks token expiration
- Verifies user still exists
- Verifies user is active
- Generates new token pair

---

### 4. Change Password

**Method:** `AuthService.changePassword(userId, currentPassword, newPassword)`

**Parameters:**
- `userId`: string - User ID
- `currentPassword`: string - Current password
- `newPassword`: string - New password

**Returns:** `boolean` - Success status

**Example:**
```typescript
const success = await AuthService.changePassword(
  userId,
  'OldPass123!',
  'NewPass123!'
);
```

**Validation:**
- Verifies user exists
- Verifies current password is correct
- New password must meet strength requirements
- Updates password hash
- Resets login attempts

---

### 5. Request Password Reset

**Method:** `AuthService.requestPasswordReset(email)`

**Parameters:**
- `email`: string - User email

**Returns:** `string` - Reset token

**Example:**
```typescript
const resetToken = await AuthService.requestPasswordReset(
  'john@example.com'
);

// In production, send resetToken via email
await EmailService.sendPasswordResetEmail(user, resetToken);
```

**Security:**
- Doesn't reveal if email exists
- Generates secure random token
- Token expires in 10 minutes
- Stores token hash in database

---

### 6. Reset Password

**Method:** `AuthService.resetPassword(token, newPassword)`

**Parameters:**
- `token`: string - Reset token from email
- `newPassword`: string - New password

**Returns:** `boolean` - Success status

**Example:**
```typescript
const success = await AuthService.resetPassword(
  resetToken,
  'NewSecurePass123!'
);
```

**Validation:**
- Verifies token exists
- Checks token expiration
- Validates new password strength
- Updates password
- Clears reset token
- Resets login attempts
- Unlocks account if locked

---

### 7. Verify Email

**Method:** `AuthService.verifyEmail(token)`

**Parameters:**
- `token`: string - Email verification token

**Returns:** `boolean` - Success status

**Example:**
```typescript
const success = await AuthService.verifyEmail(verificationToken);
```

---

### 8. Get Profile

**Method:** `AuthService.getProfile(userId)`

**Parameters:**
- `userId`: string - User ID

**Returns:** `IUser | null` - User profile

**Example:**
```typescript
const profile = await AuthService.getProfile(userId);
```

---

### 9. Update Profile

**Method:** `AuthService.updateProfile(userId, updateData)`

**Parameters:**
```typescript
{
  name?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  avatar?: string;
}
```

**Returns:** `IUser | null` - Updated user

**Example:**
```typescript
const updated = await AuthService.updateProfile(userId, {
  name: 'Jane Doe',
  phone: '+1234567890'
});
```

---

### 10. Logout

**Method:** `AuthService.logout(userId)`

**Parameters:**
- `userId`: string - User ID

**Returns:** `boolean` - Success status

**Example:**
```typescript
const success = await AuthService.logout(userId);
// Client should also clear tokens from storage
```

**Note:** In a stateless JWT system, logout is primarily handled client-side by removing tokens. This method is provided for any server-side cleanup needed.

---

## 🔒 Security Features

### Password Security
- **Hashing Algorithm:** bcrypt with 12 salt rounds
- **Minimum Length:** 8 characters
- **Maximum Length:** 128 characters
- **Complexity Requirements:**
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character

### Account Locking
- **Max Failed Attempts:** 5
- **Lock Duration:** 2 hours
- **Auto-unlock:** After lock duration expires
- **Manual Unlock:** Reset on successful login or password reset

### Token Security
- **Access Token Expiration:** 7 days
- **Refresh Token Expiration:** 30 days
- **Token Algorithm:** HS256 (HMAC with SHA-256)
- **Token Payload:**
  ```typescript
  {
    userId: string;
    email: string;
    role: string;
    iat: number;  // Issued at
    exp: number;  // Expiration
    aud: string;  // Audience
    iss: string;  // Issuer
  }
  ```

### Password Reset Security
- **Token Type:** Cryptographically secure random bytes
- **Token Length:** 32 bytes (64 hex characters)
- **Token Expiration:** 10 minutes
- **Single Use:** Token cleared after use

---

## 📡 API Endpoints

### POST /api/v1/auth/register
Register a new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "patient"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "isActive": true,
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  },
  "message": "User registered successfully"
}
```

---

### POST /api/v1/auth/login
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  },
  "message": "Login successful"
}
```

---

### POST /api/v1/auth/refresh-token
Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  },
  "message": "Token refreshed successfully"
}
```

---

### GET /api/v1/auth/profile
Get user profile (Protected)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "isActive": true,
    "isEmailVerified": false,
    "lastLogin": "2026-02-24T19:55:02.311Z"
  }
}
```

---

### PUT /api/v1/auth/change-password
Change password (Protected)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### POST /api/v1/auth/request-password-reset
Request password reset

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### POST /api/v1/auth/reset-password
Reset password with token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### POST /api/v1/auth/logout
Logout user (Protected)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing

### Manual Testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!@#","role":"patient"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Get Profile
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Change Password
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Test123!@#","newPassword":"NewTest123!@#","confirmPassword":"NewTest123!@#"}'
```

### Automated Tests

```bash
# Run AuthService tests
npm test -- AuthService

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## ✅ Verification Checklist

- [x] User registration works
- [x] Duplicate email prevention works
- [x] Password hashing works
- [x] User login works
- [x] Invalid login prevention works
- [x] Account locking works (5 failed attempts)
- [x] JWT token generation works
- [x] Token refresh works
- [x] Protected routes work
- [x] Unauthorized access blocked
- [x] Password change works
- [x] Password reset request works
- [x] Password reset with token works
- [x] Email verification works
- [x] Profile retrieval works
- [x] Profile update works
- [x] Logout works

**Status: All features verified and working!** ✅

---

## 🔍 Common Issues & Solutions

### Issue: "Invalid email or password"
- **Cause:** Wrong credentials or account locked
- **Solution:** Verify credentials, wait 2 hours if locked

### Issue: "Account is temporarily locked"
- **Cause:** 5 failed login attempts
- **Solution:** Wait 2 hours or use password reset

### Issue: "Token expired"
- **Cause:** Access token expired (7 days)
- **Solution:** Use refresh token to get new access token

### Issue: "Invalid refresh token"
- **Cause:** Refresh token expired (30 days) or invalid
- **Solution:** Login again to get new tokens

### Issue: "User with this email already exists"
- **Cause:** Email already registered
- **Solution:** Use different email or login

---

## 📚 Related Documentation

- [UserService Guide](./SERVICES_IMPLEMENTATION_GUIDE.md#1-userservice)
- [Quick Reference](./QUICK_REFERENCE.md)
- [API Documentation](http://localhost:5000/api-docs)

---

**Last Updated:** February 24, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
