// backend/src/middleware/security/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';

// Redis client for distributed rate limiting
const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Custom key generator for more granular control
const generateKey = (req: Request, prefix: string): string => {
  const userId = req.user?.userId || 'anonymous';
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.get('user-agent') || 'unknown';

  // Create a hash of the key components for anonymity
  const key = `${prefix}:${userId}:${ip}:${Buffer.from(userAgent).toString('base64')}`;
  return Buffer.from(key).toString('base64'); // Obfuscate the key
};

// Rate limit configurations
export const rateLimiters = {
  // General API rate limiter
  api: rateLimit({
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix: 'rl:api:',
        })
      : undefined,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((15 * 60) / 60), // in minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => generateKey(req, 'api'),
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for API`, {
        ip: req.ip,
        path: req.path,
        userId: req.user?.userId,
      });
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  }),

  // Strict rate limiter for auth endpoints
  auth: rateLimit({
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix: 'rl:auth:',
        })
      : undefined,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 login attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    keyGenerator: (req: Request) => {
      const email = req.body?.email || 'unknown';
      return generateKey(req, `auth:${email}`);
    },
    handler: (req, res) => {
      logger.warn(`Auth rate limit exceeded`, {
        ip: req.ip,
        email: req.body?.email,
      });

      // Track for potential brute force attempts
      trackBruteForceAttempt(req.body?.email, req.ip);

      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      });
    },
  }),

  // Password reset limiter
  passwordReset: rateLimit({
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix: 'rl:password-reset:',
        })
      : undefined,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset attempts per hour
    message: {
      success: false,
      message: 'Too many password reset requests. Please try again later.',
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
    },
    keyGenerator: (req) => generateKey(req, 'pwd-reset'),
    handler: (req, res) => {
      logger.warn(`Password reset rate limit exceeded`, {
        ip: req.ip,
        email: req.body?.email,
      });
      res.status(429).json({
        success: false,
        message: 'Too many password reset attempts. Please try again in an hour.',
        code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      });
    },
  }),

  // OTP/2FA rate limiter
  otp: rateLimit({
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix: 'rl:otp:',
        })
      : undefined,
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 OTP attempts per 5 minutes
    message: {
      success: false,
      message: 'Too many OTP attempts. Please try again later.',
      code: 'OTP_LIMIT_EXCEEDED',
    },
    keyGenerator: (req) => generateKey(req, 'otp'),
    handler: (req, res) => {
      logger.warn(`OTP rate limit exceeded`, {
        ip: req.ip,
        userId: req.user?.userId,
      });
      res.status(429).json({
        success: false,
        message: 'Too many OTP verification attempts. Please try again in 5 minutes.',
        code: 'OTP_LIMIT_EXCEEDED',
      });
    },
  }),

  // API endpoint specific limiters
  endpoint: {
    // Stricter limits for sensitive operations
    sensitive: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20,
      message: 'Too many sensitive operations from this IP',
    }),

    // Lighter limits for read-only operations
    readOnly: rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute
      message: 'Too many read requests',
    }),

    // File upload limits
    upload: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      message: 'Upload limit exceeded',
    }),
  },
};

// Track brute force attempts
const trackBruteForceAttempt = (email: string, ip: string) => {
  if (!redisClient) return;

  const key = `bruteforce:${email}:${ip}`;
  redisClient.incr(key);
  redisClient.expire(key, 86400); // 24 hours

  redisClient.get(key).then((attempts) => {
    if (attempts && parseInt(attempts) > 20) {
      logger.error(`Possible brute force attack detected`, {
        email,
        ip,
        attempts,
      });

      // Here you could trigger alerts, block IP temporarily, etc.
      blockIpTemporarily(ip);
    }
  });
};

// Temporary IP blocking
const blockIpTemporarily = async (ip: string) => {
  if (!redisClient) return;

  const blockedKey = `blocked:${ip}`;
  await redisClient.setex(blockedKey, 3600, 'blocked'); // Block for 1 hour

  logger.warn(`IP temporarily blocked due to suspicious activity`, { ip });
};

// IP whitelist for admin endpoints
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logger.warn(`Blocked request from non-whitelisted IP`, { ip: clientIP });
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: 'IP_NOT_WHITELISTED',
      });
    }

    next();
  };
};
