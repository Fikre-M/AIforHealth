// Simplified rate limiting (without Redis dependencies)
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Basic rate limiting configuration
export const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    status: 'error',
    message: 'API rate limit exceeded, please try again later.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Brute force protection (simplified)
export const bruteForceProtection = (req: Request, res: Response, next: NextFunction): void => {
  // For now, just pass through - implement proper brute force protection later
  next();
};

// Track brute force attempts (simplified)
export const trackBruteForceAttempt = (email: string, ip: string): void => {
  // For now, just log - implement proper tracking later
  console.log(`Brute force attempt detected for ${email} from ${ip}`);
};

export default basicRateLimit;