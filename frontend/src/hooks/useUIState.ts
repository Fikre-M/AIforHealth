import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingState } from './useLoadingState';

export type UIState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseUIStateOptions<T> {
  initialData?: T | null;
  emptyCheck?: (data: T | null) => boolean;
  onStateChange?: (state: UIState, data: T | null, error: Error | null) => void;
  retryDelay?: number;
  maxRetries?: number;
}

export const useUIState = <T>(options: UseUIStateOptions<T> = {}) => {
  const {
    initialData = null,
    emptyCheck = (data) => !data || (Array.isArray(data) && data.length === 0),
    onStateChange,
    retryDelay = 1000,
    maxRetries = 3
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const { isLoading, setLoading } = useLoadingState();
  const { handleError: handleErrorBoundary } = useErrorHandler();
  
  const retryCountRef = useRef(0);
  const lastOperationRef = useRef<(() => Promise<T>) | null>(null);

  const isEmpty = emptyCheck(data);
  
  const state: UIState = isLoading('main') 
    ? 'loading' 
    : error 
    ? 'error' 
    : isEmpty 
    ? 'empty' 
    : data 
    ? 'success' 
    : 'idle';

  useEffect(() => {
    onStateChange?.(state, data, error);
  }, [state, data, error, onStateChange]);

  const setUIData = useCallback((newData: T | null) => {
    setData(newData);
    setError(null);
    retryCountRef.current = 0;
  }, []);

  const setUIError = useCallback((newError: Error | string) => {
    const errorObj = typeof newError === 'string' ? new Error(newError) : newError;
    setError(errorObj);
    setData(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading('main', false);
    retryCountRef.current = 0;
    lastOperationRef.current = null;
  }, [initialData, setLoading]);

  const executeAsync = useCallback(async <R extends T>(
    operation: () => Promise<R>,
    options?: {
      loadingKey?: string;
      throwOnError?: boolean;
      silent?: boolean;
    }
  ): Promise<R | null> => {
    const { loadingKey = 'main', throwOnError = false, silent = false } = options || {};
    
    lastOperationRef.current = operation as () => Promise<T>;
    
    if (!silent) {
      setLoading(loadingKey, true);
      clearError();
    }

    try {
      const result = await operation();
      setUIData(result);
      retryCountRef.current = 0;
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (throwOnError) {
        handleErrorBoundary(error);
        throw error;
      } else {
        setUIError(error);
        return null;
      }
    } finally {
      if (!silent) {
        setLoading(loadingKey, false);
      }
    }
  }, [setLoading, clearError, setUIData, setUIError, handleErrorBoundary]);

  const retry = useCallback(async () => {
    if (!lastOperationRef.current) {
      console.warn('No operation to retry');
      return null;
    }

    if (retryCountRef.current >= maxRetries) {
      setUIError(new Error(`Maximum retry attempts (${maxRetries}) exceeded`));
      return null;
    }

    retryCountRef.current += 1;
    
    // Add delay for retries
    if (retryCountRef.current > 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
    }

    return executeAsync(lastOperationRef.current, { throwOnError: false });
  }, [maxRetries, retryDelay, executeAsync, setUIError]);

  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    return retry();
  }, [retry]);

  return {
    // State
    data,
    error,
    isEmpty,
    isLoading: isLoading('main'),
    state,
    retryCount: retryCountRef.current,
    canRetry: retryCountRef.current < maxRetries && !!lastOperationRef.current,

    // Actions
    setData: setUIData,
    setError: setUIError,
    clearError,
    reset,
    executeAsync,
    retry,
    refresh,

    // Utilities
    isState: (checkState: UIState) => state === checkState,
    isAnyState: (states: UIState[]) => states.includes(state),
    hasData: () => !!data && !isEmpty,
    hasError: () => !!error
  };
};

// Specialized hooks for common patterns
export const useAsyncData = <T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: UseUIStateOptions<T> = {}
) => {
  const uiState = useUIState<T>(options);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      uiState.executeAsync(fetcher);
    }
  }, [...dependencies, uiState.executeAsync]);

  const refetch = useCallback(() => {
    return uiState.executeAsync(fetcher);
  }, [uiState.executeAsync, fetcher]);

  return {
    ...uiState,
    refetch
  };
};

export const useFormState = <T extends Record<string, any>>(
  initialValues: T,
  submitHandler: (values: T) => Promise<any>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [fieldErrors, setFieldErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const uiState = useUIState();

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
    setFieldErrors({} as Record<keyof T, string>);
    uiState.reset();
  }, [initialValues, uiState]);

  const submit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    // Check if there are any field errors
    const hasFieldErrors = Object.values(fieldErrors).some(error => error);
    if (hasFieldErrors) {
      uiState.setError(new Error('Please fix the form errors before submitting'));
      return null;
    }

    return uiState.executeAsync(() => submitHandler(values));
  }, [values, fieldErrors, submitHandler, uiState]);

  const isFieldTouched = useCallback((field: keyof T) => touched[field] || false, [touched]);
  const getFieldError = useCallback((field: keyof T) => fieldErrors[field] || '', [fieldErrors]);
  const hasFieldError = useCallback((field: keyof T) => !!fieldErrors[field], [fieldErrors]);

  return {
    // Form state
    values,
    touched,
    fieldErrors,
    
    // UI state
    ...uiState,
    
    // Actions
    setValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    reset,
    submit,
    
    // Utilities
    isFieldTouched,
    getFieldError,
    hasFieldError,
    hasErrors: Object.values(fieldErrors).some(error => error),
    isValid: !Object.values(fieldErrors).some(error => error)
  };
};

// Hook for managing list states (pagination, filtering, sorting)
export const useListState = <T>(
  fetcher: (params: any) => Promise<T[]>,
  options: {
    pageSize?: number;
    initialFilters?: Record<string, any>;
    initialSort?: { field: string; direction: 'asc' | 'desc' };
  } = {}
) => {
  const { pageSize = 10, initialFilters = {}, initialSort } = options;
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [totalCount, setTotalCount] = useState(0);
  
  const uiState = useUIState<T[]>({
    emptyCheck: (data) => !data || data.length === 0
  });

  const fetchData = useCallback(async () => {
    const params = {
      page,
      pageSize,
      filters,
      sort
    };
    
    const result = await fetcher(params);
    
    // If fetcher returns an object with data and total, handle it
    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      const { data, total } = result as any;
      setTotalCount(total);
      return data;
    }
    
    return result;
  }, [fetcher, page, pageSize, filters, sort]);

  useEffect(() => {
    uiState.executeAsync(fetchData);
  }, [fetchData, uiState.executeAsync]);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const updateSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSort({ field, direction });
    setPage(1); // Reset to first page when sort changes
  }, []);

  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(totalCount / pageSize);
    if (page < maxPage) {
      setPage(prev => prev + 1);
    }
  }, [page, totalCount, pageSize]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    const maxPage = Math.ceil(totalCount / pageSize);
    if (newPage >= 1 && newPage <= maxPage) {
      setPage(newPage);
    }
  }, [totalCount, pageSize]);

  return {
    ...uiState,
    
    // Pagination
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNextPage: page < Math.ceil(totalCount / pageSize),
    hasPrevPage: page > 1,
    
    // Filters and sorting
    filters,
    sort,
    
    // Actions
    updateFilters,
    updateSort,
    nextPage,
    prevPage,
    goToPage,
    refresh: () => uiState.executeAsync(fetchData)
  };
};