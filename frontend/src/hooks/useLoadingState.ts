import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingStateOptions {
  defaultStates?: LoadingState;
  onLoadingChange?: (key: string, isLoading: boolean) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { defaultStates = {}, onLoadingChange } = options;
  const [loadingStates, setLoadingStates] = useState<LoadingState>(defaultStates);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const setLoading = useCallback((key: string, isLoading: boolean, delay?: number) => {
    if (delay && isLoading) {
      // Delay showing loading state to prevent flashing
      const timeout = setTimeout(() => {
        setLoadingStates(prev => {
          const newState = { ...prev, [key]: isLoading };
          onLoadingChange?.(key, isLoading);
          return newState;
        });
        timeoutsRef.current.delete(key);
      }, delay);
      
      timeoutsRef.current.set(key, timeout);
    } else {
      // Clear any pending timeout
      const existingTimeout = timeoutsRef.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timeoutsRef.current.delete(key);
      }

      setLoadingStates(prev => {
        const newState = { ...prev, [key]: isLoading };
        onLoadingChange?.(key, isLoading);
        return newState;
      });
    }
  }, [onLoadingChange]);

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const areAllLoading = useCallback((keys: string[]): boolean => {
    return keys.every(key => loadingStates[key]);
  }, [loadingStates]);

  const isAnyOfLoading = useCallback((keys: string[]): boolean => {
    return keys.some(key => loadingStates[key]);
  }, [loadingStates]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    options?: { delay?: number; minDuration?: number }
  ): Promise<T> => {
    const { delay = 0, minDuration = 0 } = options || {};
    const startTime = Date.now();
    
    setLoading(key, true, delay);
    
    try {
      const result = await asyncFn();
      
      // Ensure minimum loading duration if specified
      if (minDuration > 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
        }
      }
      
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  const reset = useCallback((keys?: string[]) => {
    if (keys) {
      setLoadingStates(prev => {
        const newState = { ...prev };
        keys.forEach(key => {
          newState[key] = false;
          onLoadingChange?.(key, false);
        });
        return newState;
      });
    } else {
      setLoadingStates({});
      Object.keys(loadingStates).forEach(key => {
        onLoadingChange?.(key, false);
      });
    }
  }, [loadingStates, onLoadingChange]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    areAllLoading,
    isAnyOfLoading,
    withLoading,
    reset
  };
};

// Hook for managing loading states with automatic error handling
export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { setLoading, isLoading } = useLoadingState();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading('operation', true);
    setError(null);

    try {
      const result = await operation();
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading('operation', false);
      }
    }
  }, [operation, setLoading]);

  useEffect(() => {
    execute();
  }, [...dependencies, execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    error,
    isLoading: isLoading('operation'),
    retry,
    execute
  };
};

// Hook for managing multiple concurrent operations
export const useConcurrentOperations = () => {
  const { loadingStates, setLoading, isLoading, isAnyLoading } = useLoadingState();
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const executeOperation = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(key, true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });

    try {
      const result = await operation();
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setErrors(prev => ({ ...prev, [key]: errorObj }));
      return null;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    loadingStates,
    errors,
    isLoading,
    isAnyLoading,
    executeOperation,
    clearError,
    clearAllErrors
  };
};