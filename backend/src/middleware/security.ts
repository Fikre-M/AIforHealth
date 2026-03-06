import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { Express, Request, Response, NextFunction } from 'express';
import { env } from '@/config/env';

/**
 * HTTPS Enforcement Middleware
 * Redirects HTTP requests to HTTPS in production
 */
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  if (env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    res.redirect(301, `https://${req.get('host')}${req.url}`);
    return;
  }
  next();
};

/**
 * Basic Security Configuration
 */
export const configureSecurity = (app: Express): void => {
  // Get allowed origins from environment
  const allowedOrigins = env.NODE_ENV === 'production'
    ? (env.CORS_ORIGIN || 'https://fridayhealth-123.netlify.app').split(',').map(origin => origin.trim())
    : [];

  // Basic CORS configuration
  app.use(
    cors({
      origin:
        env.NODE_ENV === 'production'
          ? (origin, callback) => {
              // Allow requests with no origin (mobile apps, Postman, etc.)
              if (!origin) {
                callback(null, true);
                return;
              }
              // Check if origin is in allowed list
              if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
                callback(null, true);
              } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
              }
            }
          : (origin, callback) => {
              // Allow any localhost origin in development
              if (!origin || origin.startsWith('http://localhost:')) {
                callback(null, true);
              } else {
                callback(new Error('Not allowed by CORS'));
              }
            },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Basic helmet configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // Compression
  app.use(compression());

  // HTTPS enforcement
  app.use(enforceHTTPS);
};

export default configureSecurity;