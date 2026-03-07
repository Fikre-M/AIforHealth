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
  // Get allowed origins from environment - support both CORS_ORIGIN and FRONTEND_URL
  const corsOrigin = env.CORS_ORIGIN || env.FRONTEND_URL || 'https://fridayhealth-123.netlify.app';
  const allowedOrigins = env.NODE_ENV === 'production'
    ? corsOrigin.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

  console.log('🔒 CORS Configuration:', {
    environment: env.NODE_ENV,
    corsOriginEnv: env.CORS_ORIGIN,
    frontendUrlEnv: env.FRONTEND_URL,
    finalCorsOrigin: corsOrigin,
    allowedOrigins
  });

  // Basic CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        console.log('🌐 CORS Check - Origin:', origin, 'Allowed:', allowedOrigins);
        
        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) {
          console.log('✅ CORS Allowed: No origin (server-to-server)');
          callback(null, true);
          return;
        }
        
        // In development, allow all localhost
        if (env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
          console.log('✅ CORS Allowed (dev):', origin);
          callback(null, origin);
          return;
        }
        
        // Check if origin is in allowed list
        const isAllowed = allowedOrigins.some(allowed => 
          origin === allowed || origin.startsWith(allowed)
        );
        
        if (isAllowed) {
          console.log('✅ CORS Allowed:', origin);
          callback(null, origin);
        } else {
          console.warn(`❌ CORS blocked origin: ${origin}`);
          console.warn(`   Allowed origins:`, allowedOrigins);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 86400, // 24 hours
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