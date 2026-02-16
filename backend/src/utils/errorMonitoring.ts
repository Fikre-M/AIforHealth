import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env, isProduction } from '@/config/env';
import { logger } from './logger';
import { Request } from 'express';

/**
 * Initialize Sentry error monitoring
 */
export const initializeErrorMonitoring = () => {
  if (!env.SENTRY_DSN) {
    logger.warn('⚠️  Sentry DSN not configured - error monitoring disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
      
      // Performance monitoring
      tracesSampleRate: isProduction() ? 0.1 : 1.0, // 10% in production, 100% in dev
      
      // Profiling
      profilesSampleRate: isProduction() ? 0.1 : 1.0,
      integrations: [
        nodeProfilingIntegration(),
      ],

      // Release tracking
      release: process.env.npm_package_version,

      // Error filtering
      beforeSend(event, hint) {
        // Don't send errors in test environment
        if (env.NODE_ENV === 'test') {
          return null;
        }

        // Filter out known non-critical errors
        const error = hint.originalException;
        if (error instanceof Error) {
          // Don't report validation errors
          if (error.name === 'ValidationError') {
            return null;
          }
          
          // Don't report authentication errors (they're expected)
          if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return null;
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        'NetworkError',
        'AbortError',
        'TimeoutError',
        /^Non-Error/,
      ],
    });

    logger.info('✅ Sentry error monitoring initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry', error);
  }
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error,
  context?: {
    user?: { id: string; email: string; role: string };
    request?: Request;
    extra?: Record<string, any>;
    tags?: Record<string, string>;
    level?: Sentry.SeverityLevel;
  }
) => {
  if (!env.SENTRY_DSN) {
    logger.error('Error captured (Sentry disabled)', { error, context });
    return;
  }

  Sentry.withScope((scope) => {
    // Add user context
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
      });
    }

    // Add request context
    if (context?.request) {
      scope.setContext('request', {
        method: context.request.method,
        url: context.request.url,
        headers: sanitizeHeaders(context.request.headers),
        query: context.request.query,
        body: sanitizeBody(context.request.body),
      });
    }

    // Add extra context
    if (context?.extra) {
      scope.setExtras(context.extra);
    }

    // Add tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Set level
    if (context?.level) {
      scope.setLevel(context.level);
    }

    Sentry.captureException(error);
  });
};

/**
 * Capture message with context
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: {
    user?: { id: string; email: string; role: string };
    extra?: Record<string, any>;
    tags?: Record<string, string>;
  }
) => {
  if (!env.SENTRY_DSN) {
    logger.info('Message captured (Sentry disabled)', { message, level, context });
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
      });
    }

    if (context?.extra) {
      scope.setExtras(context.extra);
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
) => {
  if (!env.SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start a transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string) => {
  if (!env.SENTRY_DSN) return null;

  return Sentry.startSpan({
    name,
    op,
  }, (span) => span);
};

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

  for (const header of sensitiveHeaders) {
    if (header in sanitized) {
      sanitized[header] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Sanitize body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Error monitoring metrics
 */
export class ErrorMetrics {
  private static errors: Map<string, number> = new Map();
  private static lastReset: Date = new Date();

  static increment(errorType: string) {
    const count = this.errors.get(errorType) || 0;
    this.errors.set(errorType, count + 1);
  }

  static getMetrics() {
    return {
      errors: Object.fromEntries(this.errors),
      since: this.lastReset,
      duration: Date.now() - this.lastReset.getTime(),
    };
  }

  static reset() {
    this.errors.clear();
    this.lastReset = new Date();
  }

  static getMostCommonErrors(limit: number = 10) {
    return Array.from(this.errors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }
}

/**
 * Health check for error monitoring
 */
export const getErrorMonitoringHealth = () => {
  return {
    enabled: !!env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    metrics: ErrorMetrics.getMetrics(),
    mostCommonErrors: ErrorMetrics.getMostCommonErrors(5),
  };
};

export default {
  initialize: initializeErrorMonitoring,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
  getHealth: getErrorMonitoringHealth,
};
