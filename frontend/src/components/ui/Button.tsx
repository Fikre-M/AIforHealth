import React from 'react';
import { clsx } from 'clsx';
import { ButtonSpinner } from './LoadingSpinner';
import { designTokens, getVariantColors } from '@/styles/design-tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-controls'?: string;
  'aria-pressed'?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-sm',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600',
  outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-800',
  ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400 dark:text-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 shadow-sm',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300 dark:bg-green-700 dark:hover:bg-green-600 shadow-sm'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm font-medium min-h-[32px]',
  md: 'px-4 py-2 text-sm font-medium min-h-[40px]',
  lg: 'px-6 py-3 text-base font-medium min-h-[48px]'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  type = 'button',
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={clsx(
        // Base styles with consistent design tokens
        'inline-flex items-center justify-center rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'active:scale-[0.98] transform',
        // Variant and size classes
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      aria-disabled={isDisabled}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <ButtonSpinner className="mr-2" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span className="ml-2 flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

// Specialized button components with consistent styling
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="outline" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="danger" />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="success" />
);