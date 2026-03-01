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
  // Basic CORS configuration
  app.use(
    cors({
      origin:
        env.NODE_ENV === 'production'
          ? ['https://elegant-sfogliatella-4ff70a.netlify.app']
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