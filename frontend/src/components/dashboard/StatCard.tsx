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
      <Card className={clsx('h-full', className)} hover>
        <CardContent padding="md">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
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
      <CardContent padding="md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Title with consistent typography */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
              {title}
            </p>
            
            {/* Value with consistent large text */}
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {value}
            </p>
            
            {/* Subtitle with consistent small text */}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
            
            {/* Trend indicator with consistent styling */}
            {trend && (
              <div className={clsx(
                'flex items-center text-sm font-medium mt-2',
                trend.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}>
                <span className="mr-1">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {/* Icon with consistent variant styling */}
          <div className={clsx(
            'p-3 rounded-lg flex-shrink-0 ml-4',
            `bg-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-100`,
            `text-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-600`,
            `dark:bg-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-900/30`,
            `dark:text-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-400`
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}