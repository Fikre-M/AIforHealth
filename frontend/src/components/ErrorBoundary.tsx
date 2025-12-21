import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryFallback } from './ui/ErrorState';
import { announceToScreenReader } from '../utils/accessibility';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors from direct children
  level?: 'page' | 'section' | 'component'; // Different error handling strategies
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Announce error to screen readers
    announceToScreenReader(
      `An error occurred: ${error.message}. Please try refreshing the page or contact support if the problem persists.`,
      'assertive'
    );
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service (in production)
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, send to error tracking service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };
    
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, errorReport);
    console.warn('Error report:', errorReport);
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
    
    announceToScreenReader('Error has been cleared. Content reloaded.', 'polite');
  };

  private handleRetry = () => {
    this.resetError();
    
    // Optional: Add a small delay before retry to prevent rapid retries
    this.retryTimeoutId = window.setTimeout(() => {
      // Force a re-render of children
      this.forceUpdate();
    }, 100);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorBoundaryFallback;
      return (
        <div role="alert" aria-live="assertive" id={this.state.errorId}>
          <FallbackComponent 
            error={this.state.error} 
            resetError={this.handleRetry} 
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error boundary integration
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  const handleAsyncError = (error: Error) => {
    // For async errors that won't be caught by error boundary
    console.error('Async error:', error);
    announceToScreenReader(`An error occurred: ${error.message}`, 'assertive');
    
    // Could dispatch to global error state or show toast
    // For now, we'll just log it
  };

  return { throwError, handleAsyncError };
};