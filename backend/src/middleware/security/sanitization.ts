// backend/src/middleware/security/sanitization.ts
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// MongoDB query sanitization
export const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Potential NoSQL injection detected`, {
      key,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    // Track for security monitoring
    trackSecurityEvent('NOSQL_INJECTION_ATTEMPT', {
      key,
      ip: req.ip,
      path: req.path,
    });
  },
});

// XSS sanitization options
const xssOptions = {
  whiteList: {
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
    h4: ['id'],
    h5: ['id'],
    h6: ['id'],
    ul: [],
    ol: [],
    li: [],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: [],
    pre: [],
    blockquote: [],
    table: [],
    thead: [],
    tbody: [],
    tr: [],
    th: [],
    td: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
  css: false,
};

// XSS sanitization middleware
export const sanitizeXSS = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    const originalBody = JSON.stringify(req.body);

    // Recursively sanitize all string fields
    sanitizeObject(req.body);

    // Check if anything was sanitized
    const sanitizedBody = JSON.stringify(req.body);
    if (originalBody !== sanitizedBody) {
      logger.warn('XSS content sanitized', {
        ip: req.ip,
        path: req.path,
        originalContent: originalBody.substring(0, 200),
        sanitizedContent: sanitizedBody.substring(0, 200),
      });

      // Track XSS attempt
      trackSecurityEvent('XSS_ATTEMPT_BLOCKED', {
        ip: req.ip,
        path: req.path,
      });
    }
  }

  next();
};

// Recursive object sanitization
const sanitizeObject = (obj: any) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // Sanitize string values
        obj[key] = xss(obj[key], xssOptions);
      } else if (typeof obj[key] === 'object') {
        // Recursively sanitize nested objects
        sanitizeObject(obj[key]);
      }
    }
  }
};

// SQL injection prevention (if using SQL database)
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPattern = /(\b(select|insert|update|delete|drop|union|exec|declare)\b)|(--)|(\*)/i;

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPattern.test(value);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => checkValue(v));
    }
    return false;
  };

  if (req.body && checkValue(req.body)) {
    logger.warn('Potential SQL injection blocked', {
      ip: req.ip,
      path: req.path,
      body: JSON.stringify(req.body).substring(0, 200),
    });

    trackSecurityEvent('SQL_INJECTION_ATTEMPT', {
      ip: req.ip,
      path: req.path,
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }

  next();
};

// File upload sanitization
export const sanitizeFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    // Check filename for path traversal
    const filename = req.file.originalname;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      logger.warn('Path traversal attempt in filename', {
        filename,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
        code: 'INVALID_FILENAME',
      });
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      logger.warn('Blocked file upload with invalid extension', {
        filename,
        extension: ext,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: 'File type not allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }
  }

  next();
};

// Track security events
const trackSecurityEvent = (type: string, data: any) => {
  // Store in database for security monitoring
  // await SecurityEvent.create({ type, data, timestamp: new Date() });

  // Could also send to security monitoring service
  if (process.env.SENTRY_DSN) {
    // Sentry.captureMessage(`Security Event: ${type}`, { extra: data });
  }
};
