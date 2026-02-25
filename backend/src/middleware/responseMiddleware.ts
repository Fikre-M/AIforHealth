import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add request ID and start time to response locals
 */
export const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add request ID if not already present
  if (!res.locals.requestId) {
    res.locals.requestId = req.id || uuidv4();
  }

  // Add start time for response time calculation
  res.locals.startTime = Date.now();

  // Store original json method
  const originalJson = res.json;

  // Override json method to ensure consistent format
  res.json = function (body: any): Response {
    // If body is already formatted with our ApiResponse structure, pass through
    if (body && (body.success !== undefined || body.meta?.timestamp)) {
      return originalJson.call(this, body);
    }

    // Otherwise, wrap in success response
    return originalJson.call(this, {
      success: true,
      data: body,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
        responseTime: Date.now() - res.locals.startTime,
      },
    });
  };

  next();
};

/**
 * Middleware to handle uncaught errors in async routes
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware to ensure all responses are in standard format
 */
export const ensureStandardResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Track if response has been sent
  let responseSent = false;

  res.send = function (body: any): Response {
    if (!responseSent) {
      responseSent = true;

      // Don't modify if it's already a standard response
      if (
        typeof body === 'object' &&
        body &&
        (body.success !== undefined || body.meta?.timestamp)
      ) {
        return originalSend.call(this, body);
      }

      // Convert to standard format
      const standardResponse = {
        success: res.statusCode < 400,
        data: body,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: res.locals.requestId,
          responseTime: Date.now() - res.locals.startTime,
        },
      };

      return originalJson.call(this, standardResponse);
    }
    return originalSend.call(this, body);
  };

  res.json = function (body: any): Response {
    if (!responseSent) {
      responseSent = true;

      // Don't modify if it's already a standard response
      if (body && (body.success !== undefined || body.meta?.timestamp)) {
        return originalJson.call(this, body);
      }

      // Convert to standard format
      const standardResponse = {
        success: res.statusCode < 400,
        data: body,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: res.locals.requestId,
          responseTime: Date.now() - res.locals.startTime,
        },
      };

      return originalJson.call(this, standardResponse);
    }
    return originalJson.call(this, body);
  };

  next();
};
