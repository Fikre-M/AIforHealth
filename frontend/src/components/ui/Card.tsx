import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg',
        paddingClasses[padding],
        shadowClasses[shadow],
        border && 'border border-gray-200',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};

// Card header component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  border = true
}) => {
  return (
    <div
      className={clsx(
        'px-6 py-4',
        border && 'border-b border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};

// Card content component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
};

// Card footer component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  border = true
}) => {
  return (
    <div
      className={clsx(
        'px-6 py-4',
        border && 'border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};

// Specialized card components
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, change, changeType = 'neutral', icon, className }) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className={clsx('p-6', className)} hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={clsx('text-sm', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export const ActionCard: React.FC<{
  title: string;
  description: string;
  action: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, icon, className }) => {
  return (
    <Card className={clsx('p-6', className)} hover>
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0 text-blue-600">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
          <div className="mt-4">
            {action}
          </div>
        </div>
      </div>
    </Card>
  );
};