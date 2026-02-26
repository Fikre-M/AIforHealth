import React from 'react';
import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'dashboard' | 'appointment' | 'profile';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
  'aria-label'?: string;
}

export type { LoadingSkeletonProps };

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animate = true,
  'aria-label': ariaLabel
}) => {
  const baseClasses = clsx(
    'bg-gray-200 dark:bg-gray-700',
    animate && 'animate-pulse',
    className
  );

  if (variant === 'text') {
    return (
      <div className="space-y-2" role="status" aria-label={ariaLabel || "Loading content"}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              'h-4 rounded',
              index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width, height }}
          />
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-full')}
        style={{
          width: width || height || '40px',
          height: height || width || '40px'
        }}
        role="status"
        aria-label={ariaLabel || "Loading"}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-lg p-4')}
        style={{ width, height }}
        role="status"
        aria-label={ariaLabel || "Loading card"}
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        <span className="sr-only">Loading card content...</span>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="space-y-6" role="status" aria-label={ariaLabel || "Loading dashboard"}>
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  if (variant === 'appointment') {
    return (
      <div className="space-y-4" role="status" aria-label={ariaLabel || "Loading appointments"}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              </div>
            </div>
            <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
        <span className="sr-only">Loading appointments...</span>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-6" role="status" aria-label={ariaLabel || "Loading profile"}>
        <div className="flex items-center space-x-6 animate-pulse">
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading profile...</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(baseClasses, 'rounded')}
      style={{ width, height }}
      role="status"
      aria-label={ariaLabel || "Loading"}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Specialized skeleton components
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <LoadingSkeleton variant="text" lines={lines} className={className} aria-label="Loading text content" />
);

export const AvatarSkeleton: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className 
}) => (
  <LoadingSkeleton variant="circular" width={size} height={size} className={className} aria-label="Loading avatar" />
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="card" className={className} aria-label="Loading card" />
);

export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="dashboard" className={className} aria-label="Loading dashboard" />
);

export const AppointmentSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="appointment" className={className} aria-label="Loading appointments" />
);

export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="profile" className={className} aria-label="Loading profile" />
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3" role="status" aria-label="Loading table">
    <div className="sr-only">Loading table data...</div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton
            key={colIndex}
            className="flex-1 h-4"
            animate={true}
          />
        ))}
      </div>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4" role="status" aria-label="Loading list">
    <div className="sr-only">Loading list items...</div>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <AvatarSkeleton size={32} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Form skeleton for loading forms
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6" role="status" aria-label="Loading form">
    <div className="sr-only">Loading form fields...</div>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
    ))}
    <LoadingSkeleton className="h-10 w-32" />
  </div>
);

// Navigation skeleton
export const NavSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4" role="status" aria-label="Loading navigation">
    <div className="sr-only">Loading navigation...</div>
    <div className="flex items-center space-x-4">
      <LoadingSkeleton className="h-8 w-32" />
      <div className="hidden md:flex space-x-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <LoadingSkeleton className="h-8 w-8 rounded-full" />
      <LoadingSkeleton className="h-4 w-20" />
    </div>
  </div>
);