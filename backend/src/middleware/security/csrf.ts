// Simplified CSRF protection (csurf is deprecated)
import { Request, Response, NextFunction } from 'express';

// Simple CSRF token generation
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Basic CSRF middleware (simplified)
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // For now, just pass through - implement proper CSRF later
  next();
};

// Get CSRF token endpoint
export const getCsrfToken = (req: Request, res: Response): void => {
  const token = generateToken();
  res.json({ csrfToken: token });
};

export default csrfProtection;