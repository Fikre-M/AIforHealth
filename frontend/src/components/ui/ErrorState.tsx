import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Wifi, Server } from 'lucide-react';
import { clsx } from 'clsx';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'network' | 'server' | 'not-found' | 'unauthorized' | 'generic';
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  showIcon?: boolean;
  retryLabel?: string;
  homeLabel?: string;
  backLabel?: string;
}

const errorConfigs = {
  network: {
    icon: Wifi,
    title: 'Connection Problem',
    message: 'Please check your internet connection and try again.',
    iconColor: 'text-orange-500'
  },
  server: {
    icon: Server,
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a moment.',
    iconColor: 'text-red-500'
  },
  'not-found': {
    icon: AlertTriangle,
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist or has been moved.',
    iconColor: 'text-yellow-500'
  },
  unauthorized: {
    icon: AlertTriangle,
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    iconColor: 'text-red-500'
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    iconColor: 'text-gray-500'
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'generic',
  onRetry,
  onGoHome,
  onGoBack,
  className,
  showIcon = true,
  retryLabel = 'Try Again',
  homeLabel = 'Go Home',
  backLabel = 'Go Back'
}) => {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div 
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 space-y-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <div className={clsx('p-3 rounded-full bg-gray-100', config.iconColor)}>
          <Icon className="w-8 h-8" aria-hidden="true" />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {title || config.title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {message || config.message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${retryLabel} - Retry the failed operation`}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>{retryLabel}</span>
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`${homeLabel} - Navigate to homepage`}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{homeLabel}</span>
          </button>
        )}
        
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`${backLabel} - Go back to previous page`}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Specialized error components
export const NetworkError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="network" />
);

export const ServerError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="server" />
);

export const NotFoundError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="not-found" />
);

export const UnauthorizedError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="unauthorized" />
);

// Inline error component for forms and smaller spaces
export const InlineError: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className }) => (
  <div 
    className={clsx(
      'flex items-center space-x-2 text-red-600 text-sm mt-1',
      className
    )}
    role="alert"
    aria-live="polite"
  >
    <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
    <span>{message}</span>
  </div>
);

// Error boundary fallback component
export const ErrorBoundaryFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <ErrorState
      title="Application Error"
      message={`Something went wrong: ${error.message}`}
      type="server"
      onRetry={resetError}
      onGoHome={() => window.location.href = '/'}
      className="max-w-md"
    />
  </div>
);