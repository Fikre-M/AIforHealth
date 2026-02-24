import { env } from './env';
import { logger } from '@/utils/logger';

// Optional Sentry imports - only import if packages are available
let Sentry: any = null;
let nodeProfilingIntegration: any = null;

try {
  Sentry = require('@sentry/node');
  const profilingModule = require('@sentry/profiling-node');
  nodeProfilingIntegration = profilingModule.nodeProfilingIntegration;
} catch (error) {
  // Sentry packages not installed - this is fine for development
  console.log('ℹ️  Sentry packages not installed - error monitoring disabled');
}

/**
 * Initialize Sentry for error monitoring and performance tracking
 */
export const initializeSentry = (): void => {
  if (!Sentry) {
    logger.info('ℹ️  Sentry not available - packages not installed');
    return;
  }

  if (!env.SENTRY_DSN || env.SENTRY_DSN.includes('test_sentry_dsn')) {
    if (env.NODE_ENV === 'production') {
      logger.warn('⚠️  Sentry DSN not configured in production environment');
    } else {
      logger.info('ℹ️  Sentry not configured for development environment');
    }
    return;
  }

  try {
    const integrations: any[] = [];

    // Add HTTP integration if available
    if (Sentry.Integrations && Sentry.Integrations.Http) {
      integrations.push(new Sentry.Integrations.Http({ tracing: true }));
    }
    
    // Add Express integration if available
    if (Sentry.Integrations && Sentry.Integrations.Express) {
      integrations.push(new Sentry.Integrations.Express({ app: undefined }));
    }

    // Add profiling integration if available
    if (nodeProfilingIntegration) {
      integrations.push(nodeProfilingIntegration());
    }

    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT,
      
      // Performance monitoring
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      integrations,

      // Release tracking
      release: process.env.npm_package_version || '1.0.0',

      // Error filtering
      beforeSend(event: any, hint: any) {
        // Filter out certain errors in development
        if (env.NODE_ENV === 'development') {
          // Don't send validation errors to Sentry in development
          if (hint.originalException?.name === 'ValidationError') {
            return null;
          }
        }

        // Log that we're sending to Sentry
        logger.debug('📤 Sending error to Sentry', { 
          eventId: event.event_id,
          error: hint.originalException?.message 
        });

        return event;
      },

      // Performance filtering
      beforeSendTransaction(event: any) {
        // Don't send health check transactions
        if (event.transaction?.includes('/health')) {
          return null;
        }
        return event;
      },
    });

    logger.info('✅ Sentry initialized successfully', { 
      environment: env.SENTRY_ENVIRONMENT,
      dsn: env.SENTRY_DSN.substring(0, 20) + '...' 
    });
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry', error as Error);
  }
};

/**
 * Sentry middleware for Express (safe wrappers)
 */
export const sentryRequestHandler = () => {
  if (Sentry && Sentry.Handlers) {
    return Sentry.Handlers.requestHandler();
  }
  return (req: any, res: any, next: any) => next(); // No-op middleware
};

export const sentryTracingHandler = () => {
  if (Sentry && Sentry.Handlers) {
    return Sentry.Handlers.tracingHandler();
  }
  return (req: any, res: any, next: any) => next(); // No-op middleware
};

export const sentryErrorHandler = () => {
  if (Sentry && Sentry.Handlers) {
    return Sentry.Handlers.errorHandler();
  }
  return (err: any, req: any, res: any, next: any) => next(err); // Pass through
};

/**
 * Capture exception with additional context (safe wrapper)
 */
export const captureException = (error: Error, context?: any): string => {
  if (Sentry) {
    return Sentry.captureException(error, {
      tags: {
        component: 'backend',
        environment: env.NODE_ENV,
      },
      extra: context,
    });
  } else {
    // Fallback to console logging
    logger.error('Exception captured (Sentry not available)', error, context);
    return 'no-sentry';
  }
};

/**
 * Capture message with level (safe wrapper)
 */
export const captureMessage = (
  message: string, 
  level: string = 'info',
  context?: any
): string => {
  if (Sentry) {
    return Sentry.captureMessage(message, {
      level,
      tags: {
        component: 'backend',
        environment: env.NODE_ENV,
      },
      extra: context,
    });
  } else {
    // Fallback to console logging
    logger.info(`Message captured (Sentry not available) [${level}]:`, message, context);
    return 'no-sentry';
  }
};

/**
 * Add user context to Sentry scope (safe wrapper)
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  role?: string;
}): void => {
  if (Sentry) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
};

/**
 * Add custom tags to Sentry scope (safe wrapper)
 */
export const setTags = (tags: Record<string, string>): void => {
  if (Sentry) {
    Sentry.setTags(tags);
  }
};

/**
 * Add breadcrumb for debugging (safe wrapper)
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: string = 'info',
  data?: any
): void => {
  if (Sentry) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }
};

/**
 * Start a new transaction for performance monitoring (safe wrapper)
 */
export const startTransaction = (name: string, op: string) => {
  if (Sentry) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
};

/**
 * Flush Sentry events (safe wrapper)
 */
export const flush = async (timeout = 2000): Promise<boolean> => {
  if (Sentry) {
    try {
      const result = await Sentry.flush(timeout);
      logger.info('✅ Sentry events flushed successfully');
      return result;
    } catch (error) {
      logger.error('❌ Failed to flush Sentry events', error as Error);
      return false;
    }
  }
  return true; // No-op success
};

export default Sentry;