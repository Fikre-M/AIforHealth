// backend/src/middleware/security/headers.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Custom security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", process.env.API_URL || ''],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      reportUri: '/api/v1/security/csp-violation',
    },
    reportOnly: process.env.NODE_ENV === 'development', // Report only in dev
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  ieNoOpen: true,
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

// Additional security headers
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent browser from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Remove potentially sensitive headers
  res.removeHeader('X-Powered-By');

  // Feature policy / Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );

  // Clear-Site-Data for logout endpoints
  if (req.path === '/api/v1/auth/logout' && req.method === 'POST') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  next();
};

// CSP violation report handler
export const cspViolationHandler = (req: Request, res: Response) => {
  const violation = req.body;

  logger.warn('CSP Violation detected', {
    'document-uri': violation['document-uri'],
    'violated-directive': violation['violated-directive'],
    'blocked-uri': violation['blocked-uri'],
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Store violation for analysis
  storeCSPViolation(violation);

  res.status(204).send();
};

// Store CSP violations (implement with your database)
const storeCSPViolation = async (violation: any) => {
  // Store in database for security monitoring
  // await SecurityEvent.create({ type: 'CSP_VIOLATION', data: violation });
};
