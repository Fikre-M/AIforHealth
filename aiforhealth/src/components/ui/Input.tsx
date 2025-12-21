import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { InlineError } from './ErrorState';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  variant = 'default',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const inputClasses = clsx(
    'block px-3 py-2 border rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
      'border-gray-300 focus:border-blue-500': !hasError && variant === 'default',
      'bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500': variant === 'filled'
    },
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    fullWidth ? 'w-full' : 'w-auto',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            undefined
          }
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={clsx('text-gray-400', hasError && 'text-red-400')}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <InlineError 
          message={error} 
          className="mt-1"
        />
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const textareaClasses = clsx(
    'block px-3 py-2 border rounded-md shadow-sm transition-colors resize-vertical',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
      'border-gray-300 focus:border-blue-500': !hasError && variant === 'default',
      'bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500': variant === 'filled'
    },
    fullWidth ? 'w-full' : 'w-auto',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${textareaId}-error` : 
          helperText ? `${textareaId}-helper` : 
          undefined
        }
      />
      
      {error && (
        <InlineError 
          message={error} 
          className="mt-1"
        />
      )}
      
      {helperText && !error && (
        <p 
          id={`${textareaId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  placeholder,
  children,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const selectClasses = clsx(
    'block px-3 py-2 border rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
      'border-gray-300 focus:border-blue-500': !hasError && variant === 'default',
      'bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500': variant === 'filled'
    },
    fullWidth ? 'w-full' : 'w-auto',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        {...props}
        ref={ref}
        id={selectId}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${selectId}-error` : 
          helperText ? `${selectId}-helper` : 
          undefined
        }
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      
      {error && (
        <InlineError 
          message={error} 
          className="mt-1"
        />
      )}
      
      {helperText && !error && (
        <p 
          id={`${selectId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';