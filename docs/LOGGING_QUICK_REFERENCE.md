# Logging Quick Reference Guide

## Import Statements

```typescript
// Basic logging
import { logger, logInfo, logError, logWarn, logDebug } from '@/utils/logger';

// Specialized logging
import { logDatabase, logAuth, logApi, logSecurity, logApp } from '@/utils/logger';

// Error monitoring
import { captureException, captureMessage, addBreadcrumb } from '@/utils/errorMonitoring';

// Error types
import { AppError, Errors } from '@/utils/AppError';
```

## Common Logging Patterns

### 1. Basic Logging

```typescript
// Info
logInfo('User profile updated', { userId, changes });

// Error
logError('Failed to send email', error, { userId, emailType });

// Warning
logWarn('API rate limit approaching', { userId, requestCount });

// Debug
logDebug('Cache hit', { key, ttl });
```

### 2. Database Operations

```typescript
// Connection
logDatabase.connect(mongoUri);
logDatabase.connected();
logDatabase.disconnect();

// Errors
logDatabase.error(error);

// Queries
logDatabase.query('find', 'users', 45); // operation, collection, duration(ms)
```

### 3. Authentication Events

```typescript
// Login
logAuth.login(userId, email, req.ip);

// Logout
logAuth.logout(userId, email);

// Registration
logAuth.register(userId, email, role);

// Failed attempts
logAuth.failed(email, 'Invalid password', req.ip);

// Token refresh
logAuth.tokenRefresh(userId);
```

### 4. API Requests

```typescript
// Request
logApi.request(req.method, req.url, userId, req.ip);

// Response
logApi.response(req.method, req.url, res.statusCode, duration);

// Error
logApi.error(req.method, req.url, error, userId);
```

### 5. Security Events

```typescript
// Rate limit
logSecurity.rateLimitExceeded(req.ip, req.path);

// Suspicious activity
logSecurity.suspiciousActivity('SQL injection attempt', userId, req.ip);

// Account locked
logSecurity.accountLocked(userId, email, attemptCount);
```

### 6. Application Lifecycle

```typescript
// Starting
logApp.starting(port, env);

// Started
logApp.started(port);

// Stopping
logApp.stopping();

// Stopped
logApp.stopped();

// Error
logApp.error(error);
```

## Error Handling Patterns

### 1. Throwing Errors

```typescript
// Custom error
throw new AppError('User not found', 404);

// Predefined errors
throw Errors.notFound('Patient not found');
throw Errors.unauthorized('Invalid credentials');
throw Errors.forbidden('Access denied');
throw Errors.validationError('Invalid email format');
throw Errors.badRequest('Missing required field');
throw Errors.duplicateKey('Email already exists');
throw Errors.rateLimitExceeded();
throw Errors.serverError('Database connection failed');
```

### 2. Try-Catch with Logging

```typescript
try {
  const user = await UserService.findUserById(userId);
  logInfo('User retrieved', { userId });
  return user;
} catch (error) {
  logError('Failed to retrieve user', error, { userId });
  throw Errors.serverError('Failed to retrieve user');
}
```

### 3. Async Handler

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

## Error Monitoring Patterns

### 1. Capture Exception

```typescript
try {
  await processPayment(orderId);
} catch (error) {
  captureException(error, {
    user: { id: userId, email, role },
    request: req,
    extra: { orderId, amount },
    tags: { feature: 'payment', severity: 'high' },
    level: 'error'
  });
  throw error;
}
```

### 2. Capture Message

```typescript
captureMessage('Payment processed successfully', 'info', {
  user: { id: userId, email, role },
  extra: { orderId, amount },
  tags: { feature: 'payment' }
});
```

### 3. Add Breadcrumb

```typescript
addBreadcrumb('User clicked checkout', 'user-action', {
  cartTotal: 100,
  itemCount: 3
}, 'info');
```

## Service Layer Pattern

```typescript
export class UserService {
  static async findUserById(userId: string): Promise<IUser | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw Errors.validationError('Invalid user ID format');
      }

      logDebug('Finding user by ID', { userId });
      
      const user = await User.findById(userId);
      
      if (!user) {
        logWarn('User not found', { userId });
        return null;
      }

      logInfo('User found', { userId, email: user.email });
      return user;
    } catch (error) {
      logError('Failed to find user', error, { userId });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw Errors.serverError('Failed to find user');
    }
  }
}
```

## Controller Layer Pattern

```typescript
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  logApi.request(req.method, req.url, req.user?.userId, req.ip);
  
  const user = await UserService.findUserById(userId);
  
  if (!user) {
    throw Errors.notFound('User not found');
  }
  
  logApi.response(req.method, req.url, 200, Date.now() - req.startTime);
  
  res.status(200).json({
    success: true,
    data: user
  });
});
```

## Monitoring Endpoints

### Health Check
```bash
curl http://localhost:5000/api/v1/monitoring/health
```

### Metrics (Admin)
```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:5000/api/v1/monitoring/metrics
```

### Database Stats (Admin)
```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:5000/api/v1/monitoring/database/stats
```

### Reset Error Metrics (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  http://localhost:5000/api/v1/monitoring/errors/reset
```

## Environment Variables

```bash
# Logging
LOG_LEVEL=info  # error, warn, info, http, debug

# Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

## Log Levels

- `error` (0) - Errors that need immediate attention
- `warn` (1) - Warning messages, potential issues
- `info` (2) - Important business events
- `http` (3) - HTTP request/response logs
- `debug` (4) - Detailed debugging information

## Best Practices

✅ **DO:**
- Log at appropriate levels
- Include context (userId, orderId, etc.)
- Use structured logging
- Sanitize sensitive data
- Log errors before throwing
- Use error monitoring for production

❌ **DON'T:**
- Log passwords or tokens
- Log large objects without sanitization
- Use console.log in production
- Over-log (every function call)
- Ignore errors silently
- Expose internal details to users

## Common Scenarios

### User Registration
```typescript
try {
  const user = await UserService.createUser(userData);
  logAuth.register(user._id, user.email, user.role);
  captureMessage('New user registered', 'info', {
    user: { id: user._id, email: user.email, role: user.role }
  });
  return user;
} catch (error) {
  logError('Registration failed', error, { email: userData.email });
  captureException(error, {
    extra: { email: userData.email },
    tags: { feature: 'registration' }
  });
  throw error;
}
```

### Database Query
```typescript
const startTime = Date.now();
try {
  const users = await User.find(filter);
  const duration = Date.now() - startTime;
  logDatabase.query('find', 'users', duration);
  return users;
} catch (error) {
  logDatabase.error(error);
  throw Errors.serverError('Database query failed');
}
```

### API Request
```typescript
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  logApi.request(req.method, req.url, req.user?.userId, req.ip);
  
  const startTime = Date.now();
  const users = await UserService.getUsers(req.query);
  const duration = Date.now() - startTime;
  
  logApi.response(req.method, req.url, 200, duration);
  
  res.json({ success: true, data: users });
});
```

### Security Event
```typescript
if (loginAttempts > MAX_ATTEMPTS) {
  logSecurity.accountLocked(userId, email, loginAttempts);
  captureMessage('Account locked due to failed login attempts', 'warning', {
    user: { id: userId, email },
    extra: { attempts: loginAttempts },
    tags: { security: 'account-lock' }
  });
  throw Errors.unauthorized('Account locked');
}
```

## Troubleshooting

### Logs not appearing
1. Check LOG_LEVEL environment variable
2. Verify logs directory exists: `mkdir -p logs`
3. Check file permissions: `chmod 755 logs`

### Sentry not working
1. Verify SENTRY_DSN is set
2. Check network connectivity
3. Verify error is not filtered out

### High memory usage
1. Implement log rotation
2. Reduce log level in production
3. Clear old log files: `find logs -name "*.log" -mtime +30 -delete`

## Log Files

- `logs/error.log` - Errors only
- `logs/combined.log` - All logs
- Rotated daily, kept for 14 days
- Compressed after rotation

## Support

For issues or questions:
1. Check documentation: `docs/ERROR_HANDLING_AND_LOGGING.md`
2. Review logs: `tail -f logs/combined.log`
3. Check monitoring: `GET /api/v1/monitoring/health`
4. Contact DevOps team
