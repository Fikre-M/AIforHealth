import { clsx } from 'clsx';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export function DashboardWidget({ 
  title, 
  children, 
  className, 
  action, 
  icon,
  variant = 'default'
}: DashboardWidgetProps) {
  return (
    <Card className={clsx('h-full', className)} hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={clsx(
                'p-2 rounded-lg',
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
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}