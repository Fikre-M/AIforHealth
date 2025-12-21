import { clsx } from 'clsx';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = 'default',
  className,
  isLoading = false
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={clsx('h-full', className)}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-8 w-16" />
              <LoadingSkeleton className="h-3 w-32" />
            </div>
            <LoadingSkeleton variant="circular" width={48} height={48} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={clsx('h-full', className)} hover>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <div className={clsx(
                'flex items-center text-sm font-medium mt-2',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={clsx(
            'p-3 rounded-lg',
            {
              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': variant === 'default',
              'bg-medical-100 text-medical-600 dark:bg-medical-900 dark:text-medical-400': variant === 'primary',
              'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400': variant === 'success',
              'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400': variant === 'warning',
              'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400': variant === 'error',
            }
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}