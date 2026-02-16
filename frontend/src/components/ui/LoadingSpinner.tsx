import { FC } from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-t-transparent border-blue-600',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

// ButtonSpinner - smaller spinner for buttons
interface ButtonSpinnerProps {
  className?: string;
}

export const ButtonSpinner: FC<ButtonSpinnerProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'inline-block w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
