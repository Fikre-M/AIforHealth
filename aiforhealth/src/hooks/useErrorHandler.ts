import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  type: 'network' | 'server' | 'validation' | 'generic';
  details?: any;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: any) => {
    console.error('Error caught by error handler:', error);

    let errorState: ErrorState;

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorState = {
          message: 'Network connection failed. Please check your internet connection.',
          type: 'network',
          details: error.message
        };
      }
      // Server errors
      else if (error.message.includes('500') || error.message.includes('server')) {
        errorState = {
          message: 'Server error occurred. Please try again later.',
          type: 'server',
          details: error.message
        };
      }
      // Validation errors
      else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorState = {
          message: error.message,
          type: 'validation',
          details: error.message
        };
      }
      // Generic errors
      else {
        errorState = {
          message: error.message || 'An unexpected error occurred.',
          type: 'generic',
          details: error.message
        };
      }
    } else if (typeof error === 'string') {
      errorState = {
        message: error,
        type: 'generic'
      };
    } else {
      errorState = {
        message: 'An unexpected error occurred.',
        type: 'generic',
        details: error
      };
    }

    setError(errorState);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback((retryFn?: () => void | Promise<void>) => {
    clearError();
    if (retryFn) {
      try {
        const result = retryFn();
        if (result instanceof Promise) {
          result.catch(handleError);
        }
      } catch (err) {
        handleError(err);
      }
    }
  }, [clearError, handleError]);

  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: !!error
  };
};