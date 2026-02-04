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
    <Card className={clsx('min-h-[200px]', className)} hover>
      <CardHeader border={true}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {icon && (
              <div className={clsx(
                'p-2 rounded-lg flex-shrink-0',
                `bg-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-100`,
                `text-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-600`,
                `dark:bg-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-900/30`,
                `dark:text-${variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'gray'}-400`
              )}>
                {icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h3>
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent padding="md" className="flex-1">
        {children}
      </CardContent>
    </Card>
  );
}