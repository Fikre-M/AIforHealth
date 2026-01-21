import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './env';
import { logger } from '@/utils/logger';

/**
 * Initialize Sentry for error monitoring and performance tracking
 */
export const initializeSentry = (): void => {
  if (!env.SENTRY_DSN) {
    if (env.NODE_ENV === 'production') {
      logger.warn('⚠️  Sentry DSN not configured in production environment');
    } else {
      logger.info('ℹ️  Sentry not configured for development environment');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT,
      
      // Performance monitoring
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      integrations: [
        // Add profiling integration
        nodeProfilingIntegration(),
        
        // HTTP integration for tracing
        new Sentry.Integrations.Http({ tracing: true }),
        
        // Express integration
        new Sentry.Integrations.Express({ app: undefined }),
      ],

      // Release tracking
      release: process.env.npm_package_version || '1.0.0',

      // Error filtering
      beforeSend(event, hint) {
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
      beforeSendTransaction(event) {
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
 * Sentry middleware for Express
 */
export const sentryRequestHandler = () => Sentry.Handlers.requestHandler();
export const sentryTracingHandler = () => Sentry.Handlers.tracingHandler();
export const sentryErrorHandler = () => Sentry.Handlers.errorHandler();

/**
 * Capture exception with additional context
 */
export const captureException = (error: Error, context?: any): string => {
  return Sentry.captureException(error, {
    tags: {
      component: 'backend',
      environment: env.NODE_ENV,
    },
    extra: context,
  });
};

/**
 * Capture message with level
 */
export const captureMessage = (
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: any
): string => {
  return Sentry.captureMessage(message, {
    level,
    tags: {
      component: 'backend',
      environment: env.NODE_ENV,
    },
    extra: context,
  });
};

/**
 * Add user context to Sentry scope
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  role?: string;
}): void => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

/**
 * Add custom tags to Sentry scope
 */
export const setTags = (tags: Record<string, string>): void => {
  Sentry.setTags(tags);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: any
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start a new transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

/**
 * Flush Sentry events (useful for graceful shutdown)
 */
export const flush = async (timeout = 2000): Promise<boolean> => {
  try {
    const result = await Sentry.flush(timeout);
    logger.info('✅ Sentry events flushed successfully');
    return result;
  } catch (error) {
    logger.error('❌ Failed to flush Sentry events', error as Error);
    return false;
  }
};

export default Sentry;