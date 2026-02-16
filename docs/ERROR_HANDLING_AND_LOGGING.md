# Error Handling & Logging Strategy

## Overview
This document describes the comprehensive error handling and logging strategy implemented in the AI Healthcare application, including centralized error handling, structured logging, error monitoring, and observability tools.

## Table of Contents
1. [Error Handling](#error-handling)
2. [Logging Strategy](#logging-strategy)
3. [Error Monitoring](#error-monitoring)
4. [Monitoring & Observability](#monitoring--observability)
5. [Frontend Error Handling](#frontend-error-handling)
6. [Best Practices](#best-practices)

---

## Error Handling

### Centralized Error Handler

Location: `backend/src/middleware/errorHandler.ts`

The application uses a centralized error handling middleware that:
- Catches all errors from routes and middleware
- Transforms errors into consistent response format
- Logs errors appropriately
- Sends errors to monitoring services (Sentry)
- Provides different error details based on environment

**Features:**
- ✅ Handles Mongoose validation errors
- ✅ Handles MongoDB duplicate key errors
- ✅ Handles Mongoose cast errors (invalid ObjectId)
- ✅ Handles JWT errors (invalid/expired tokens)
- ✅ Custom error types with AppError class
- ✅ Stack traces in development only
- ✅ Sanitized error messages in production

**Example Usage:**

```typescript
import { AppError, Errors } from '@/utils/AppError';

// Throw custom error
throw new AppError('User not found', 404);

// Use predefined errors
throw Errors.notFound('Patient not found');
throw Errors.unauthorized('Invalid credentials');
throw Errors.forbidden('Access denied');
throw Errors.validationError('Invalid email format');
```

### Error Types

```typescript
export const ErrorType = {
  NOT_FOUND: "NOT_FOUND",                    // 404
  VALIDATION_ERROR: "VALIDATION_ERROR",      // 400
  UNAUTHORIZED: "UNAUTHORIZED",              // 401
  FORBIDDEN: "FORBIDDEN",                    // 403
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR", // 500
  BAD_REQUEST: "BAD_REQUEST",                // 400
  DUPLICATE_KEY: "DUPLICATE_KEY",            // 400
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED", // 429
};
```

### Error Response Format

All errors follow a consistent format:

```json
{
  "status": "error",
  "error": {
    "type": "NOT_FOUND",
    "message": "Resource not found",
    "stack": "Error stack trace (development only)"
  }
}
```

### Async Error Handling

Use the `asyncHandler` wrapper for all async route handlers:

```typescript
import asyncHandler from '../middleware/asyncHandler';

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.findUserById(req.params.id);
  
  if (!user) {
    throw Errors.notFound('User not found');
  }
  
  res.json({ success: true, data: user });
});
```

---

## Logging Strategy

### Winston Logger

Location: `backend/src/utils/logger.ts`

The application uses Winston for structured logging with multiple transports:

**Log Levels:**
- `error` (0) - Error messages
- `warn` (1) - Warning messages
- `info` (2) - Informational messages
- `http` (3) - HTTP request logs
- `debug` (4) - Debug messages

**Transports:**
- Console (colored output for development)
- File: `logs/error.log` (errors only)
- File: `logs/combined.log` (all logs)

**Configuration:**
```typescript
import { logger, logInfo, logError, logWarn, logDebug } from '@/utils/logger';

// Basic logging
logger.info('User logged in');
logger.error('Database connection failed');

// Structured logging with metadata
logInfo('User created', { userId: '123', email: 'user@example.com' });
logError('Payment failed', error, { orderId: '456', amount: 100 });
```

### Specialized Logging Functions

#### Database Logging
```typescript
import { logDatabase } from '@/utils/logger';

logDatabase.connect('mongodb://localhost:27017/mydb');
logDatabase.connected();
logDatabase.disconnect();
logDatabase.error(error);
logDatabase.query('find', 'users', 45); // operation, collection, duration
```

#### Authentication Logging
```typescript
import { logAuth } from '@/utils/logger';

logAuth.login(userId, email, ipAddress);
logAuth.logout(userId, email);
logAuth.register(userId, email, role);
logAuth.failed(email, 'Invalid password', ipAddress);
logAuth.tokenRefresh(userId);
```

#### API Request Logging
```typescript
import { logApi } from '@/utils/logger';

logApi.request('GET', '/api/users', userId, ipAddress);
logApi.response('GET', '/api/users', 200, 45); // method, url, status, duration
logApi.error('POST', '/api/users', error, userId);
```

#### Security Logging
```typescript
import { logSecurity } from '@/utils/logger';

logSecurity.rateLimitExceeded(ipAddress, '/api/login');
logSecurity.suspiciousActivity('Multiple failed login attempts', userId, ipAddress);
logSecurity.accountLocked(userId, email, attemptCount);
```

#### Application Lifecycle Logging
```typescript
import { logApp } from '@/utils/logger';

logApp.starting(5000, 'production');
logApp.started(5000);
logApp.stopping();
logApp.stopped();
logApp.error(error);
```

### Request Logging Middleware

Location: `backend/src/middleware/requestLogger.ts`

**Features:**
- ✅ Logs all incoming requests
- ✅ Logs all outgoing responses
- ✅ Tracks response time
- ✅ Sanitizes sensitive data (passwords, tokens)
- ✅ Detects slow requests (> 1000ms)
- ✅ Adds unique request ID for tracing
- ✅ Monitors performance
- ✅ Detects suspicious patterns (SQL injection, XSS, etc.)

**Middleware Stack:**
```typescript
app.use(requestId);           // Add unique ID to each request
app.use(performanceMonitor);  // Track response times
app.use(securityLogger);      // Log security events
app.use(requestLogger);       // Log requests/responses
```

**Request ID Header:**
Every request gets a unique ID accessible via:
- Request: `req.id`
- Response Header: `X-Request-ID`

---

## Error Monitoring

### Sentry Integration

Location: `backend/src/utils/errorMonitoring.ts`

**Features:**
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Profiling integration
- ✅ User context tracking
- ✅ Request context tracking
- ✅ Breadcrumb tracking
- ✅ Error filtering
- ✅ Release tracking

**Configuration:**

Set environment variables:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

**Usage:**

```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/utils/errorMonitoring';

// Capture exception with context
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    user: { id: userId, email, role },
    request: req,
    extra: { orderId: '123', amount: 100 },
    tags: { feature: 'payment', severity: 'high' },
    level: 'error'
  });
  throw error;
}

// Capture message
captureMessage('Payment processed successfully', 'info', {
  user: { id: userId, email, role },
  extra: { orderId: '123', amount: 100 },
  tags: { feature: 'payment' }
});

// Add breadcrumb for debugging
addBreadcrumb('User clicked checkout button', 'user-action', {
  cartTotal: 100,
  itemCount: 3
});
```

### Error Metrics

Track error frequency and patterns:

```typescript
import { ErrorMetrics } from '@/utils/errorMonitoring';

// Increment error count
ErrorMetrics.increment('ValidationError');

// Get metrics
const metrics = ErrorMetrics.getMetrics();
// Returns: { errors: { ValidationError: 5 }, since: Date, duration: 3600000 }

// Get most common errors
const topErrors = ErrorMetrics.getMostCommonErrors(10);
// Returns: [{ type: 'ValidationError', count: 5 }, ...]

// Reset metrics
ErrorMetrics.reset();
```

---

## Monitoring & Observability

### Monitoring Endpoints

Location: `backend/src/routes/monitoringRoutes.ts`

#### 1. Health Check (Public)
```
GET /api/v1/monitoring/health
```

Returns application health status:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-16T10:00:00.000Z",
    "uptime": 3600,
    "environment": "production",
    "version": "1.0.0",
    "services": {
      "database": {
        "connected": true,
        "state": "connected",
        "host": "localhost",
        "name": "aiforhealth"
      },
      "errorMonitoring": {
        "enabled": true,
        "environment": "production",
        "metrics": {...},
        "mostCommonErrors": [...]
      }
    },
    "system": {
      "platform": "linux",
      "arch": "x64",
      "nodeVersion": "v18.0.0",
      "cpus": 8,
      "memory": {...},
      "loadAverage": [1.5, 1.2, 1.0],
      "uptime": 86400
    }
  }
}
```

#### 2. Metrics (Admin Only)
```
GET /api/v1/monitoring/metrics
Authorization: Bearer <admin-token>
```

Returns detailed application metrics:
- Process metrics (uptime, memory, CPU)
- System metrics (platform, CPUs, memory, load)
- Database metrics (connections, operations, storage)
- Error metrics (counts, types, trends)

#### 3. Database Stats (Admin Only)
```
GET /api/v1/monitoring/database/stats
Authorization: Bearer <admin-token>
```

Returns database statistics:
- Connection pool status
- Storage usage
- Index usage
- Operation counts
- Memory usage

#### 4. Reset Error Metrics (Admin Only)
```
POST /api/v1/monitoring/errors/reset
Authorization: Bearer <admin-token>
```

Resets error metrics counters.

#### 5. Test Error (Development Only)
```
POST /api/v1/monitoring/test-error
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "validation" // or "database", "unauthorized", "notfound", "generic"
}
```

Tests error handling and monitoring (disabled in production).

### Monitoring Dashboard

For production monitoring, integrate with:

**Recommended Tools:**
- **Sentry** - Error tracking and performance monitoring
- **Datadog** - Infrastructure and application monitoring
- **New Relic** - Application performance monitoring
- **ELK Stack** - Log aggregation and analysis
- **Grafana** - Metrics visualization
- **Prometheus** - Metrics collection

**Setup Example (Datadog):**
```bash
# Install Datadog agent
npm install dd-trace

# Initialize in your app
import tracer from 'dd-trace';
tracer.init({
  service: 'aiforhealth-backend',
  env: process.env.NODE_ENV,
  logInjection: true
});
```

---

## Frontend Error Handling

### Error Boundary Component

Create an error boundary to catch React errors:

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@/utils/errorMonitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error monitoring
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      },
      tags: {
        errorBoundary: 'true'
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### API Error Handling

Create a centralized API error handler:

```typescript
// src/utils/apiErrorHandler.ts
import { toast } from 'react-toastify';
import { captureException } from '@/utils/errorMonitoring';

export interface ApiError {
  status: string;
  error: {
    type: string;
    message: string;
    details?: any;
  };
}

export const handleApiError = (error: any, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  // Extract error message
  let message = 'An unexpected error occurred';
  let errorType = 'UNKNOWN_ERROR';

  if (error.response?.data?.error) {
    message = error.response.data.error.message;
    errorType = error.response.data.error.type;
  } else if (error.message) {
    message = error.message;
  }

  // Show user-friendly message
  toast.error(message);

  // Send to error monitoring
  captureException(error, {
    extra: {
      context,
      errorType,
      response: error.response?.data
    },
    tags: {
      apiError: 'true',
      errorType
    }
  });

  return { message, errorType };
};
```

### Axios Interceptor

Set up global error handling for API requests:

```typescript
// src/api/axios.ts
import axios from 'axios';
import { handleApiError } from '@/utils/apiErrorHandler';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          handleApiError(error);
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      handleApiError(error, 'Network');
    } else {
      handleApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Frontend Sentry Integration

```typescript
// src/utils/errorMonitoring.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeErrorMonitoring = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
```

---

## Best Practices

### 1. Error Handling

✅ **DO:**
- Use try-catch blocks in async functions
- Use asyncHandler wrapper for route handlers
- Throw specific error types (AppError)
- Include context in error messages
- Log errors before throwing
- Sanitize error messages for users

❌ **DON'T:**
- Expose sensitive information in errors
- Swallow errors silently
- Use generic error messages
- Log passwords or tokens
- Return stack traces in production

### 2. Logging

✅ **DO:**
- Use appropriate log levels
- Include context and metadata
- Use structured logging
- Log important business events
- Log authentication events
- Log security events

❌ **DON'T:**
- Log sensitive data (passwords, tokens, PII)
- Over-log (log every function call)
- Use console.log in production
- Log large objects without sanitization

### 3. Monitoring

✅ **DO:**
- Monitor error rates
- Set up alerts for critical errors
- Track performance metrics
- Monitor database health
- Review logs regularly
- Use distributed tracing

❌ **DON'T:**
- Ignore monitoring alerts
- Wait for users to report errors
- Monitor without taking action
- Forget to rotate logs

### 4. Security

✅ **DO:**
- Sanitize all logged data
- Use rate limiting
- Log security events
- Monitor for suspicious patterns
- Implement CORS properly
- Use HTTPS in production

❌ **DON'T:**
- Log authentication credentials
- Expose internal error details
- Ignore security warnings
- Disable security features

---

## Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Install logrotate (Linux)
sudo apt-get install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/aiforhealth

# Add configuration
/path/to/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload aiforhealth
    endscript
}
```

---

## Troubleshooting

### Common Issues

**1. Logs not appearing**
- Check LOG_LEVEL environment variable
- Verify logs directory exists and is writable
- Check file permissions

**2. Sentry not capturing errors**
- Verify SENTRY_DSN is set correctly
- Check network connectivity
- Verify error is not filtered out

**3. High memory usage**
- Implement log rotation
- Reduce log level in production
- Clear old log files

**4. Slow performance**
- Reduce logging verbosity
- Use async logging
- Optimize database queries

---

## Summary

The application now has:
- ✅ Centralized error handling
- ✅ Structured logging with Winston
- ✅ Error monitoring with Sentry
- ✅ Request/response logging
- ✅ Performance monitoring
- ✅ Security logging
- ✅ Health check endpoints
- ✅ Metrics endpoints
- ✅ Frontend error handling
- ✅ Comprehensive documentation

This provides production-ready error handling and observability for the AI Healthcare application.
