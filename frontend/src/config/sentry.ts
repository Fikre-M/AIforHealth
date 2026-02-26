import { config } from './env';
import { logger } from '@/utils/logger';
import React from 'react';

// Optional Sentry imports - only import if packages are available
let Sentry: any = null;
let BrowserTracing: any = null;
let useLocation: any = null;
let useNavigationType: any = null;
let createRoutesFromChildren: any = null;
let matchRoutes: any = null;

try {
  Sentry = require('@sentry/react');
  const tracingModule = require('@sentry/tracing');
  BrowserTracing = tracingModule.BrowserTracing;
  
  // React Router imports
  const routerModule = require('react-router-dom');
  useLocation = routerModule.useLocation;
  useNavigationType = routerModule.useNavigationType;
  createRoutesFromChildren = routerModule.createRoutesFromChildren;
  matchRoutes = routerModule.matchRoutes;
} catch (error) {
  // Sentry packages not installed - this is fine for development
  console.log('ℹ️  Sentry packages not installed - error monitoring disabled');
}

/**
 * Initialize Sentry for frontend error monitoring
 */
export const initializeSentry = (): void => {
  if (!Sentry) {
    logger.info('ℹ️  Sentry not available - packages not installed');
    return;
  }

  if (!config.services.sentryDsn) {
    if (config.isProduction) {
      logger.warn('⚠️  Sentry DSN not configured in production environment');
    } else {
      logger.info('ℹ️  Sentry not configured for development environment');
    }
    return;
  }

  try {
    const integrations = [];

    // Add browser tracing if available
    if (BrowserTracing && useLocation && useNavigationType && createRoutesFromChildren && matchRoutes) {
      integrations.push(
        new BrowserTracing({
          // Set up automatic route change tracking for React Router
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        })
      );
    }

    Sentry.init({
      dsn: config.services.sentryDsn,
      environment: config.isProduction ? 'production' : 'development',
      
      integrations,

      // Performance monitoring
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,

      // Release tracking
      release: config.appVersion,

      // Error filtering
      beforeSend(event: any, hint: any) {
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
      beforeSendTransaction(event: any) {
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
 * Capture exception with additional context (safe wrapper)
 */
export const captureException = (error: Error, context?: any): string => {
  if (Sentry) {
    return Sentry.captureException(error, {
      tags: {
        component: 'frontend',
        environment: config.isProduction ? 'production' : 'development',
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
        component: 'frontend',
        environment: config.isProduction ? 'production' : 'development',
      },
      extra: context,
    });
  } else {
    // Fallback to console logging
    logger.info(`Message captured (Sentry not available) [${level}]: ${message}`, context);
    return 'no-sentry';
  }
};

/**
 * Set user context for Sentry (safe wrapper)
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
 * Higher-order component for error boundaries (safe wrapper)
 */
export const withSentryErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: any
) => {
  if (Sentry && Sentry.withErrorBoundary) {
    return Sentry.withErrorBoundary(Component, {
      fallback: ({ error, resetError }: any) => {
        // Simple fallback without JSX
        console.error('Error boundary triggered:', error);
        return null; // Return null for now, can be enhanced later
      },
      showDialog: config.isProduction,
      ...options,
    });
  } else {
    // Return component as-is if Sentry is not available
    return Component;
  }
};

export default Sentry;