import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// CSRF protection middleware
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  },
  value: (req) => {
    // Check for token in various places
    return (
      req.body._csrf ||
      req.query._csrf ||
      req.headers['csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token']
    );
  },
});

// CSRF error handler
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  logger.warn('CSRF attack detected', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent'),
  });

  res.status(403).json({
    success: false,
    message: 'Invalid CSRF token',
    code: 'CSRF_ERROR',
  });
};

// Generate CSRF token endpoint
export const getCsrfToken = (req: Request, res: Response) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
};

// Double submit cookie pattern
export const doubleSubmitCookie = (req: Request, res: Response, next: NextFunction) => {
  const token = req.csrfToken();

  // Set cookie
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Must be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  });

  next();
};
