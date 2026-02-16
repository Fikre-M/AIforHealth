import { Request, Response, NextFunction } from 'express';
import { logApi, logSecurity } from '@/utils/logger';

/**
 * Enhanced request logging middleware
 * Logs all incoming requests with detailed information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Extract request information
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
  };

  // Log incoming request
  logApi.request(
    requestInfo.method,
    requestInfo.url,
    requestInfo.userId,
    requestInfo.ip
  );

  // Capture the original res.json to log response
  const originalJson = res.json.bind(res);
  
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    
    // Log response
    logApi.response(
      requestInfo.method,
      requestInfo.url,
      res.statusCode,
      duration
    );

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logSecurity.suspiciousActivity(
        `Slow request detected: ${duration}ms`,
        requestInfo.userId,
        requestInfo.ip
      );
    }

    return originalJson(body);
  };

  next();
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Performance monitoring middleware
 * Tracks response times and adds headers
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  // Capture original end method
  const originalEnd = res.end.bind(res);
  
  // Override end to add headers before response is sent
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Add response time header BEFORE ending response
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      // Ignore header errors if already sent
    }

    // Log performance metrics
    if (duration > 5000) {
      logSecurity.suspiciousActivity(
        `Very slow request: ${duration.toFixed(2)}ms for ${req.method} ${req.url}`,
        req.user?.userId,
        req.ip
      );
    }

    // Call original end
    return originalEnd(chunk, encoding, callback);
  };

  next();
};

/**
 * Request ID middleware
 * Adds unique ID to each request for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = generateRequestId();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Security headers middleware
 * Logs security-related events
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL injection
    /(<script|javascript:|onerror=|onload=)/i, // XSS
    /(eval\(|exec\(|system\()/i, // Code injection
  ];

  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logSecurity.suspiciousActivity(
        `Suspicious pattern detected in request`,
        req.user?.userId,
        req.ip
      );
      break;
    }
  }

  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
