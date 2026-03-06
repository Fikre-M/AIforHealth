import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from '@/config/env';

const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: isDevelopment ? 1000 : env.RATE_LIMIT_MAX_REQUESTS, // Higher limit in development
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/v1/health';
  }
});

export default rateLimiter;