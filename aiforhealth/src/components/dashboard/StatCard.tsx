import { clsx } from 'clsx';
import { Card, CardContent } from '@/components/ui/Card';

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
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <Card className={clsx('h-full', className)} hover>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={clsx(
                'flex items-center text-sm font-medium mt-2',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={clsx(
            'p-3 rounded-lg',
            {
              'bg-gray-100 text-gray-600': variant === 'default',
              'bg-medical-100 text-medical-600': variant === 'primary',
              'bg-green-100 text-green-600': variant === 'success',
              'bg-yellow-100 text-yellow-600': variant === 'warning',
              'bg-red-100 text-red-600': variant === 'error',
            }
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}