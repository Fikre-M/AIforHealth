# API Documentation

## Overview

The AI for Health API provides comprehensive healthcare management features with RESTful endpoints. This document provides detailed information about all available endpoints, request/response formats, authentication, error handling, and rate limiting.

## Base URL

```
Development: http://localhost:5000/api/v1
Staging: https://api-staging.aiforhealth.example.com/api/v1
Production: https://api.aiforhealth.example.com/api/v1
```

## Interactive Documentation

Swagger UI is available at:
```
http://localhost:5000/api-docs
```

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Pagination](#pagination)
5. [Filtering & Sorting](#filtering--sorting)
6. [API Endpoints](#api-endpoints)
7. [Request/Response Examples](#requestresponse-examples)
8. [Status Codes](#status-codes)
9. [Best Practices](#best-practices)

---

## Authentication

### JWT Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

**Include token in Authorization header:**
```
Authorization: Bearer <your-jwt-token>
```

**Token Expiration:**
- Access Token: 7 days
- Refresh Token: 30 days

**Obtaining Tokens:**
1. Register: `POST /auth/register`
2. Login: `POST /auth/login`
3. Refresh: `POST /auth/refresh-token`

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/v1/auth/profile
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse.

### Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Default | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Strict endpoints | 10 requests | 15 minutes |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708084800
```

### Rate Limit Exceeded Response

```json
{
  "status": "error",
  "error": {
    "type": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**HTTP Status:** `429 Too Many Requests`

---

## Error Handling

All errors follow a consistent format.

### Error Response Format

```json
{
  "status": "error",
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  }
}
```

### Error Types

| Type | Status Code | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_KEY` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Example Error Responses

**Validation Error:**
```json
{
  "status": "error",
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Authentication Error:**
```json
{
  "status": "error",
  "error": {
    "type": "UNAUTHORIZED",
    "message": "Please authenticate"
  }
}
```

**Not Found Error:**
```json
{
  "status": "error",
  "error": {
    "type": "NOT_FOUND",
    "message": "User not found"
  }
}
```

---

## Pagination

List endpoints support pagination using query parameters.

### Parameters

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

### Example Request

```bash
GET /api/v1/doctors/patients?page=2&limit=20
```

### Paginated Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

## Filtering & Sorting

Many endpoints support filtering and sorting.

### Common Parameters

- `search`: Search query string
- `sortBy`: Field to sort by (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)
- `status`: Filter by status
- `startDate`: Start date for date range (ISO 8601)
- `endDate`: End date for date range (ISO 8601)

### Example Request

```bash
GET /api/v1/appointments?status=scheduled&sortBy=appointmentDate&sortOrder=asc&startDate=2024-03-01&endDate=2024-03-31
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |
| POST | `/auth/request-password-reset` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |
| POST | `/auth/verify-email` | Verify email | No |

### Doctors

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/doctors/stats` | Get doctor statistics | Yes | Doctor |
| GET | `/doctors/appointments/daily` | Get today's appointments | Yes | Doctor |
| GET | `/doctors/appointments/upcoming` | Get upcoming appointments | Yes | Doctor |
| GET | `/doctors/patients` | Get patients list | Yes | Doctor |
| POST | `/doctors/patients` | Create new patient | Yes | Doctor |
| GET | `/doctors/patients/summaries` | Get patient summaries | Yes | Doctor |
| GET | `/doctors/patients/:patientId` | Get patient details | Yes | Doctor |
| PATCH | `/doctors/patients/:patientId` | Update patient | Yes | Doctor |

### Appointments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/appointments` | Get appointments list | Yes |
| POST | `/appointments` | Create appointment | Yes |
| GET | `/appointments/:id` | Get appointment details | Yes |
| PATCH | `/appointments/:id` | Update appointment | Yes |
| DELETE | `/appointments/:id` | Cancel appointment | Yes |
| POST | `/appointments/:id/reschedule` | Reschedule appointment | Yes |
| POST | `/appointments/:id/complete` | Complete appointment | Yes |

### Health Metrics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health/metrics` | Get health metrics | Yes |
| POST | `/health/metrics` | Record health metric | Yes |
| GET | `/health/metrics/:id` | Get metric details | Yes |
| DELETE | `/health/metrics/:id` | Delete metric | Yes |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get notifications | Yes |
| GET | `/notifications/:id` | Get notification details | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |
| POST | `/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

### Monitoring

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/monitoring/health` | Health check | No | - |
| GET | `/monitoring/metrics` | Get system metrics | Yes | Admin |
| GET | `/monitoring/database/stats` | Get database stats | Yes | Admin |
| POST | `/monitoring/errors/reset` | Reset error metrics | Yes | Admin |

---

## Request/Response Examples

### Register User

**Request:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "patient"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2024-02-16T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**Request:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Doctor Statistics

**Request:**
```bash
GET /api/v1/doctors/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "todayAppointments": 5,
    "weekAppointments": 23,
    "monthAppointments": 87,
    "totalPatients": 156,
    "completedAppointments": 432,
    "cancelledAppointments": 23,
    "totalAppointments": 460
  }
}
```

### Create Appointment

**Request:**
```bash
POST /api/v1/appointments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "65f1234567890abcdef12345",
  "doctorId": "65f1234567890abcdef12346",
  "appointmentDate": "2024-03-15T10:00:00.000Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Regular checkup",
  "symptoms": ["headache", "fatigue"],
  "notes": "Patient reports mild symptoms"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "65f1234567890abcdef12347",
    "patient": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "doctor": {
      "_id": "65f1234567890abcdef12346",
      "name": "Dr. Smith",
      "email": "dr.smith@example.com"
    },
    "appointmentDate": "2024-03-15T10:00:00.000Z",
    "duration": 30,
    "status": "scheduled",
    "type": "consultation",
    "reason": "Regular checkup",
    "symptoms": ["headache", "fatigue"],
    "notes": "Patient reports mild symptoms",
    "createdAt": "2024-02-16T10:00:00.000Z"
  }
}
```

### Get Patients List (Doctor)

**Request:**
```bash
GET /api/v1/doctors/patients?page=1&limit=10&search=john
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "patients": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "age": 34,
      "gender": "male",
      "medicalHistory": ["Hypertension", "Diabetes Type 2"],
      "allergies": ["Penicillin"],
      "currentMedications": ["Metformin", "Lisinopril"],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Create Patient (Doctor)

**Request:**
```bash
POST /api/v1/doctors/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567892",
  "dateOfBirth": "1990-08-22",
  "gender": "female",
  "medicalHistory": ["Migraine"],
  "allergies": [],
  "currentMedications": ["Sumatriptan"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "65f1234567890abcdef12348",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "patient",
    "createdBy": "65f1234567890abcdef12346",
    "isEmailVerified": false,
    "createdAt": "2024-02-16T10:00:00.000Z"
  }
}
```

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Best Practices

### 1. Authentication

✅ **DO:**
- Store tokens securely (httpOnly cookies or secure storage)
- Refresh tokens before expiration
- Implement token refresh logic
- Clear tokens on logout

❌ **DON'T:**
- Store tokens in localStorage (XSS vulnerable)
- Share tokens between users
- Hardcode tokens in code
- Ignore token expiration

### 2. Error Handling

✅ **DO:**
- Check `success` field in responses
- Handle all error types
- Display user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient errors

❌ **DON'T:**
- Ignore error responses
- Display raw error messages to users
- Retry on 4xx errors
- Ignore rate limit headers

### 3. Rate Limiting

✅ **DO:**
- Monitor rate limit headers
- Implement exponential backoff
- Cache responses when possible
- Batch requests when possible

❌ **DON'T:**
- Ignore rate limit warnings
- Make unnecessary requests
- Retry immediately after 429
- Implement aggressive polling

### 4. Pagination

✅ **DO:**
- Use pagination for large datasets
- Start with reasonable page sizes
- Implement infinite scroll or load more
- Cache paginated results

❌ **DON'T:**
- Request all data at once
- Use very large page sizes
- Ignore pagination metadata
- Make duplicate requests

### 5. Security

✅ **DO:**
- Use HTTPS in production
- Validate input data
- Sanitize user input
- Implement CSRF protection
- Use secure headers

❌ **DON'T:**
- Send sensitive data in URLs
- Store passwords in plain text
- Ignore security warnings
- Disable SSL verification

---

## Versioning

The API uses URL path versioning:
- Current version: `/api/v1`
- Future versions: `/api/v2`, etc.

Breaking changes will be introduced in new versions. Old versions will be supported for at least 6 months after a new version is released.

---

## Support

For API support:
- Email: support@aiforhealth.example.com
- Documentation: https://docs.aiforhealth.example.com
- Status Page: https://status.aiforhealth.example.com

---

## Changelog

### Version 1.0.0 (2024-02-16)
- Initial API release
- Authentication endpoints
- Doctor management endpoints
- Appointment management endpoints
- Health metrics endpoints
- Notification endpoints
- Monitoring endpoints

---

## Additional Resources

- [Swagger UI](http://localhost:5000/api-docs) - Interactive API documentation
- [Postman Collection](./postman-collection.json) - Import into Postman
- [API Examples](./api-examples/) - Code examples in various languages
- [Error Codes Reference](./error-codes.md) - Complete error codes list
- [Rate Limiting Guide](./rate-limiting.md) - Detailed rate limiting information
