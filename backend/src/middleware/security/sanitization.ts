// Simplified sanitization middleware
import { Request, Response, NextFunction } from 'express';

// Basic XSS sanitization
export const sanitizeXSS = (req: Request, res: Response, next: NextFunction): void => {
  // Basic sanitization - remove script tags and dangerous content
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Basic SQL injection prevention
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  // Basic SQL injection patterns to block
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(OR|AND)\b.*=.*)/gi
  ];

  const checkForSQLInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForSQLInjection(value));
    }
    return false;
  };

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input detected'
    });
    return;
  }

  next();
};

// Basic file upload sanitization
export const sanitizeFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  // For now, just pass through - implement proper file sanitization later
  next();
};

// Helper function to sanitize objects
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

export default sanitizeXSS;