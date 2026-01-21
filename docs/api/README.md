# 📖 API Documentation

Welcome to the AI for Health API documentation. This RESTful API provides comprehensive healthcare management functionality.

## 🌐 Base URL

- **Production**: `https://api.aiforhealth.com/api/v1`
- **Staging**: `https://staging-api.aiforhealth.com/api/v1`
- **Development**: `http://localhost:5000/api/v1`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "patient"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## 📚 API Endpoints

### 🔐 Authentication
- [Authentication API](./authentication.md) - Login, register, password reset

### 👤 User Management
- [Users API](./users.md) - User profiles, settings, management

### 📅 Appointments
- [Appointments API](./appointments.md) - Booking, scheduling, management

### 🏥 Health Data
- [Health API](./health.md) - Medications, reminders, metrics

### 🔔 Notifications
- [Notifications API](./notifications.md) - Real-time notifications

## 📋 Request/Response Format

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
```

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

### Pagination
List endpoints support pagination:

**Request:**
```http
GET /appointments?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## 🔍 Filtering & Sorting

### Filtering
```http
GET /appointments?status=scheduled&type=consultation
GET /health/medications?active=true
GET /notifications?read=false
```

### Sorting
```http
GET /appointments?sort=appointmentDate&order=asc
GET /health/metrics?sort=recordedDate&order=desc
```

### Date Filtering
```http
GET /appointments?startDate=2024-01-01&endDate=2024-12-31
GET /health/metrics?recordedDate[gte]=2024-01-01
```

## 🚨 Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `TOKEN_EXPIRED` | JWT token expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RESOURCE_CONFLICT` | Resource already exists or conflicts |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `EXTERNAL_SERVICE_ERROR` | Third-party service error |

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Please provide a valid email address",
          "value": "invalid-email"
        }
      ]
    }
  }
}
```

## 🔒 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **File upload endpoints**: 10 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔐 Security

### HTTPS Only
All API requests must use HTTPS in production.

### CORS
Cross-Origin Resource Sharing (CORS) is configured for approved domains only.

### Input Validation
All input is validated and sanitized to prevent injection attacks.

### Authentication
- JWT tokens expire after 7 days
- Refresh tokens expire after 30 days
- Account lockout after 5 failed login attempts

## 📊 API Versioning

The API uses URL versioning:
- Current version: `v1`
- Base path: `/api/v1`

Version changes:
- **Patch**: Bug fixes, no breaking changes
- **Minor**: New features, backward compatible
- **Major**: Breaking changes, new version required

## 🧪 Testing

### Postman Collection
Import our Postman collection: [Download](./postman-collection.json)

### OpenAPI/Swagger
Interactive API documentation: [Swagger UI](https://api.aiforhealth.com/api-docs)

### Example Requests

#### Create Appointment
```bash
curl -X POST https://api.aiforhealth.com/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": "doctor_id",
    "appointmentDate": "2024-02-15T10:00:00Z",
    "duration": 30,
    "type": "consultation",
    "reason": "Annual checkup"
  }'
```

#### Get User Profile
```bash
curl -X GET https://api.aiforhealth.com/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  }
}
```

### Metrics
API metrics are available at `/metrics` (Prometheus format).

## 🆘 Support

- **API Issues**: [GitHub Issues](https://github.com/Fikre-M/AIforHealth/issues)
- **Documentation**: [GitHub Discussions](https://github.com/Fikre-M/AIforHealth/discussions)
- **Status Page**: [status.aiforhealth.com](https://status.aiforhealth.com)

## 📄 License

This API is licensed under the MIT License. See [LICENSE](../../LICENSE) for details.

---

**Last Updated**: January 2025  
**API Version**: v1.0.0