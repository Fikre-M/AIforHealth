import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...',
  overlay = false
}) => {
  const spinner = (
    <div 
      className={clsx(
        'flex items-center justify-center',
        overlay && 'absolute inset-0 bg-white bg-opacity-75 z-10',
        className
      )}
      role="status"
      aria-label={label}
    >
      <Loader2 
        className={clsx(
          'animate-spin text-blue-600',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="relative">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Full page loading component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Button loading state
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 
    className={clsx('animate-spin w-4 h-4', className)} 
    aria-hidden="true"
  />
);

// Inline loading component
export const InlineLoader: React.FC<{ 
  message?: string; 
  className?: string;
}> = ({ message = 'Loading...', className }) => (
  <div className={clsx('flex items-center space-x-2 text-gray-600', className)}>
    <LoadingSpinner size="sm" />
    <span className="text-sm">{message}</span>
  </div>
);

// Card loading overlay
export const CardLoader: React.FC<{ 
  children: React.ReactNode;
  loading: boolean;
  message?: string;
}> = ({ children, loading, message = 'Loading...' }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )}
  </div>
);