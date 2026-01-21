import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { config } from './env';
import { logger } from '@/utils/logger';

/**
 * Initialize Sentry for frontend error monitoring
 */
export const initializeSentry = (): void => {
  if (!config.services.sentryDsn) {
    if (config.isProduction) {
      logger.warn('⚠️  Sentry DSN not configured in production environment');
    } else {
      logger.info('ℹ️  Sentry not configured for development environment');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: config.services.sentryDsn,
      environment: config.isProduction ? 'production' : 'development',
      
      integrations: [
        new BrowserTracing({
          // Set up automatic route change tracking for React Router
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],

      // Performance monitoring
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,

      // Release tracking
      release: config.appVersion,

      // Error filtering
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (config.isDevelopment) {
          // Don't send network errors in development
          if (hint.originalException?.name === 'NetworkError') {
            return null;
          }
        }

        // Filter out common non-critical errors
        const error = hint.originalException;
        if (error?.message?.includes('Non-Error promise rejection captured')) {
          return null;
        }

        // Log that we're sending to Sentry
        logger.debug('📤 Sending error to Sentry', { 
          eventId: event.event_id,
          error: error?.message 
        });

        return event;
      },

      // Performance filtering
      beforeSendTransaction(event) {
        // Don't send certain transactions
        if (event.transaction?.includes('idle')) {
          return null;
        }
        return event;
      },

      // User feedback
      showReportDialog: config.isProduction,
    });

    logger.info('✅ Sentry initialized successfully', { 
      environment: config.isProduction ? 'production' : 'development',
      dsn: config.services.sentryDsn.substring(0, 20) + '...' 
    });
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry', error as Error);
  }
};

/**
 * Capture exception with additional context
 */
export const captureException = (error: Error, context?: any): string => {
  return Sentry.captureException(error, {
    tags: {
      component: 'frontend',
      environment: config.isProduction ? 'production' : 'development',
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
      component: 'frontend',
      environment: config.isProduction ? 'production' : 'development',
    },
    extra: context,
  });
};

/**
 * Set user context for Sentry
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
 * Higher-order component for error boundaries
 */
export const withSentryErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Sentry.ErrorBoundaryProps
) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="mt-2 text-sm text-gray-500">
              We've been notified about this error and will fix it soon.
            </p>
            <div className="mt-4">
              <button
                onClick={resetError}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    showDialog: config.isProduction,
    ...options,
  });
};

export default Sentry;