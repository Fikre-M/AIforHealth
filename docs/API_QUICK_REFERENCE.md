# API Quick Reference Guide

## Quick Start

### 1. Access API Documentation
```
http://localhost:5000/api-docs
```

### 2. Base URL
```
Development: http://localhost:5000/api/v1
Production:  https://api.aiforhealth.example.com/api/v1
```

### 3. Authentication
```bash
# All requests (except public endpoints) require JWT token
Authorization: Bearer <your-jwt-token>
```

## Common Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/refresh-token` | Refresh token | No |

### Doctors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doctors/stats` | Get doctor statistics | Yes (Doctor) |
| GET | `/doctors/appointments/daily` | Today's appointments | Yes (Doctor) |
| GET | `/doctors/appointments/upcoming` | Upcoming appointments | Yes (Doctor) |
| GET | `/doctors/patients` | Get patients list | Yes (Doctor) |
| POST | `/doctors/patients` | Create new patient | Yes (Doctor) |
| GET | `/doctors/patients/{id}` | Get patient details | Yes (Doctor) |
| PATCH | `/doctors/patients/{id}` | Update patient | Yes (Doctor) |

### Appointments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/appointments` | Get appointments | Yes |
| POST | `/appointments` | Create appointment | Yes |
| GET | `/appointments/{id}` | Get appointment details | Yes |
| PATCH | `/appointments/{id}` | Update appointment | Yes |
| DELETE | `/appointments/{id}` | Cancel appointment | Yes |

### Monitoring

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/monitoring/health` | Health check | No |

## Quick Examples

### Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'

# Response includes token:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### Use Protected Endpoint
```bash
# Get profile
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

### Create Appointment
```bash
curl -X POST http://localhost:5000/api/v1/appointments \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "65f1234567890abcdef12345",
    "doctorId": "65f1234567890abcdef12346",
    "appointmentDate": "2024-03-15T10:00:00.000Z",
    "duration": 30,
    "type": "consultation",
    "reason": "Regular checkup"
  }'
```

### Get Paginated List
```bash
# Get patients with pagination and search
curl -X GET "http://localhost:5000/api/v1/doctors/patients?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <doctor-token>"
```

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Search
```
?search=john
```

### Sorting
```
?sortBy=createdAt&sortOrder=desc
```

### Filtering
```
?status=scheduled&startDate=2024-03-01&endDate=2024-03-31
```

### Combined
```
?page=1&limit=10&search=john&sortBy=name&sortOrder=asc&status=active
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Success with Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error message"
  }
}
```

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Error Types

| Type | HTTP Code | Description |
|------|-----------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_KEY` | 409 | Resource already exists |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Default | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Strict endpoints | 10 requests | 15 minutes |

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708084800
```

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `patient` | Regular user | Own data only |
| `doctor` | Healthcare provider | Patient data, appointments |
| `admin` | Administrator | Full system access |

## Appointment Statuses

| Status | Description |
|--------|-------------|
| `scheduled` | Appointment scheduled |
| `confirmed` | Patient confirmed |
| `in_progress` | Currently happening |
| `completed` | Finished successfully |
| `missed` | Patient didn't show |
| `cancelled` | Cancelled by user |
| `rescheduled` | Moved to new time |

## Appointment Types

| Type | Description |
|------|-------------|
| `consultation` | General consultation |
| `follow_up` | Follow-up visit |
| `emergency` | Emergency visit |
| `routine_checkup` | Routine checkup |
| `specialist` | Specialist consultation |
| `telemedicine` | Remote consultation |

## Testing with Swagger UI

1. **Open Swagger UI**
   ```
   http://localhost:5000/api-docs
   ```

2. **Authenticate**
   - Click "Authorize" button (top right)
   - Enter: `Bearer <your-token>`
   - Click "Authorize"

3. **Try an Endpoint**
   - Expand endpoint
   - Click "Try it out"
   - Edit request body
   - Click "Execute"
   - View response

## Testing with Postman

1. **Import OpenAPI Spec**
   - Open Postman
   - Import → Link
   - Enter: `http://localhost:5000/api-docs/swagger.json`

2. **Set Environment Variables**
   ```
   baseUrl: http://localhost:5000/api/v1
   token: <your-jwt-token>
   ```

3. **Use in Requests**
   ```
   URL: {{baseUrl}}/auth/profile
   Headers: Authorization: Bearer {{token}}
   ```

## Common Workflows

### Patient Registration Flow
1. `POST /auth/register` - Register as patient
2. `POST /auth/verify-email` - Verify email (if required)
3. `POST /auth/login` - Login
4. `GET /auth/profile` - Get profile
5. `GET /appointments` - View appointments

### Doctor Workflow
1. `POST /auth/login` - Login as doctor
2. `GET /doctors/stats` - View dashboard stats
3. `GET /doctors/appointments/daily` - Today's schedule
4. `GET /doctors/patients` - View patient list
5. `GET /doctors/patients/{id}` - View patient details
6. `PATCH /appointments/{id}` - Update appointment

### Appointment Booking Flow
1. `POST /auth/login` - Login
2. `GET /doctors` - Find available doctors
3. `POST /appointments` - Book appointment
4. `GET /appointments/{id}` - View appointment details
5. `PATCH /appointments/{id}` - Update if needed

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aiforhealth

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### 401 Unauthorized
- Check if token is included in Authorization header
- Verify token format: `Bearer <token>`
- Check if token is expired
- Try refreshing token with `/auth/refresh-token`

### 403 Forbidden
- Check user role permissions
- Verify user has access to resource
- Check if user is accessing own data

### 404 Not Found
- Verify endpoint URL is correct
- Check if resource ID exists
- Ensure using correct HTTP method

### 429 Rate Limit Exceeded
- Wait for rate limit window to reset
- Check `X-RateLimit-Reset` header
- Reduce request frequency

### 500 Internal Server Error
- Check server logs
- Verify database connection
- Check environment variables
- Contact support if persists

## Support Resources

- **Swagger UI**: http://localhost:5000/api-docs
- **Full Documentation**: docs/API_DOCUMENTATION.md
- **Implementation Summary**: docs/API_DOCUMENTATION_IMPLEMENTATION_SUMMARY.md
- **Support Email**: support@aiforhealth.example.com

---

**Last Updated**: February 16, 2026
**API Version**: 1.0.0
