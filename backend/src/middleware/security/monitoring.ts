import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface SuspiciousActivity {
  type: string;
  ip: string;
  userId?: string;
  path: string;
  method: string;
  timestamp: Date;
  details?: any;
}

// In-memory store for recent activities (use Redis in production)
const activityStore = new Map<string, SuspiciousActivity[]>();
const BLOCKED_IPS = new Set<string>();

// Suspicious patterns
const SUSPICIOUS_PATTERNS = {
  SQL_INJECTION: /(\b(select|insert|update|delete|drop|union|exec|declare)\b)|('--)|(#)/i,
  XSS: /(<script)|(javascript:)|(onerror)|(onload)/i,
  PATH_TRAVERSAL: /(\.\.\/)|(\.\.\\)|(%2e%2e%2f)|(%2e%2e%5c)/i,
  COMMAND_INJECTION: /(;\s*$)|(&&)|(\|\|)|(\`.*\`)|(\$\(.*\))/i,
};

// Monitor suspicious activity
export const suspiciousActivityMonitor = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Check if IP is blocked
  if (BLOCKED_IPS.has(ip)) {
    logger.warn('Blocked request from blocked IP', { ip, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      code: 'IP_BLOCKED',
    });
  }

  // Check for suspicious patterns in request
  const suspicious = checkSuspiciousPatterns(req);

  if (suspicious) {
    logSuspiciousActivity({
      type: suspicious,
      ip,
      userId: req.user?.userId,
      path: req.path,
      method: req.method,
      timestamp: new Date(),
      details: {
        query: req.query,
        body: req.body,
        params: req.params,
        userAgent: req.get('user-agent'),
      },
    });

    // Store in activity store
    const activities = activityStore.get(ip) || [];
    activities.push({
      type: suspicious,
      ip,
      userId: req.user?.userId,
      path: req.path,
      method: req.method,
      timestamp: new Date(),
    });

    // Limit stored activities
    if (activities.length > 100) {
      activities.shift();
    }
    activityStore.set(ip, activities);

    // Check if IP should be blocked
    checkAndBlockIP(ip);
  }

  next();
};

// Check for suspicious patterns
const checkSuspiciousPatterns = (req: Request): string | null => {
  const checkValue = (value: any): string | null => {
    if (typeof value === 'string') {
      for (const [type, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
        if (pattern.test(value)) {
          return type;
        }
      }
    }
    if (typeof value === 'object' && value !== null) {
      for (const val of Object.values(value)) {
        const result = checkValue(val);
        if (result) return result;
      }
    }
    return null;
  };

  // Check query parameters
  const queryResult = checkValue(req.query);
  if (queryResult) return queryResult;

  // Check body
  const bodyResult = checkValue(req.body);
  if (bodyResult) return bodyResult;

  // Check params
  const paramsResult = checkValue(req.params);
  if (paramsResult) return paramsResult;

  return null;
};

// Log suspicious activity
const logSuspiciousActivity = (activity: SuspiciousActivity) => {
  logger.warn('Suspicious activity detected', activity);

  // Store in database for analysis
  // await SecurityEvent.create(activity);

  // Could trigger real-time alerts
  if (activity.type === 'SQL_INJECTION' || activity.type === 'COMMAND_INJECTION') {
    triggerSecurityAlert(activity);
  }
};

// Check and block IP based on suspicious activity
const checkAndBlockIP = (ip: string) => {
  const activities = activityStore.get(ip) || [];

  // Count recent suspicious activities (last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentSuspicious = activities.filter((a) => a.timestamp > fiveMinutesAgo);

  if (recentSuspicious.length >= 10) {
    BLOCKED_IPS.add(ip);
    logger.error(`IP blocked due to excessive suspicious activity`, {
      ip,
      count: recentSuspicious.length,
    });

    // Store in Redis for persistence
    // redisClient.setex(`blocked:${ip}`, 3600, 'blocked');
  }
};

// Trigger security alert
const triggerSecurityAlert = (activity: SuspiciousActivity) => {
  // Send email to admin
  // emailService.sendSecurityAlert(activity);

  // Send to Slack/Discord
  // webhookService.sendSecurityAlert(activity);

  // Log to security monitoring service
  if (process.env.SENTRY_DSN) {
    // Sentry.captureMessage('Security Alert', { extra: activity });
  }
};

// Get suspicious activities for an IP
export const getSuspiciousActivities = (ip: string) => {
  return activityStore.get(ip) || [];
};

// Manually block IP
export const blockIP = (ip: string, duration: number = 3600) => {
  BLOCKED_IPS.add(ip);
  logger.warn(`IP manually blocked`, { ip, duration });

  // Store in Redis for persistence
  // redisClient.setex(`blocked:${ip}`, duration, 'blocked');
};

// Manually unblock IP
export const unblockIP = (ip: string) => {
  BLOCKED_IPS.delete(ip);
  logger.info(`IP unblocked`, { ip });

  // Remove from Redis
  // redisClient.del(`blocked:${ip}`);
};
