// UI Components - Centralized exports for better organization
export { Button } from './Button';
export { Input } from './Input';
export { Card, CardContent, CardHeader, CardTitle } from './Card';
export { Modal } from './Modal';

// Loading and State Components
export { 
  LoadingSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  AppointmentSkeleton,
  ProfileSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
  NavSkeleton
} from './LoadingSkeleton';

export { LoadingSpinner } from './LoadingSpinner';

// Error and Empty States
export { 
  ErrorState,
  NetworkError,
  ServerError,
  NotFoundError,
  UnauthorizedError,
  InlineError,
  ErrorBoundaryFallback
} from './ErrorState';

export { 
  EmptyState,
  EmptyAppointments,
  EmptyMessages,
  EmptyNotifications,
  EmptyPatients,
  EmptySearchResults,
  CompactEmptyState,
  EmptyTable
} from './EmptyState';

// Re-export types if needed
export type { LoadingSkeletonProps } from './LoadingSkeleton';
export type { ErrorStateProps } from './ErrorState';
export type { EmptyStateProps } from './EmptyState';