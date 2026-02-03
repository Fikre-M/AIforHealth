import { clsx } from 'clsx';
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, fullWidth = true, variant = 'default', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
    const hasError = !!error;

    return (
      <div className={clsx('space-y-2', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          {...props}
          ref={ref}
          id={selectId}
          className={clsx(
            // Base styles with consistent design tokens
            'px-3 py-2 border rounded-md shadow-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
            'dark:focus:border-blue-400 dark:focus:ring-blue-400',
            'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
            // Error states
            hasError ? [
              'border-red-300 focus:border-red-500 focus:ring-red-500',
              'dark:border-red-600 dark:focus:border-red-400 dark:focus:ring-red-400'
            ] : [
              'border-gray-300 hover:border-gray-400',
              'dark:border-gray-600 dark:hover:border-gray-500'
            ],
            // Variant styles
            variant === 'filled' && [
              'bg-gray-50 focus:bg-white',
              'dark:bg-gray-700 dark:focus:bg-gray-800'
            ],
            fullWidth ? 'w-full' : 'w-auto',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : 
            helperText ? `${selectId}-helper` : 
            undefined
          }
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p 
            id={`${selectId}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center"
          >
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${selectId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';