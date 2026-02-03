import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

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
  fullWidth = true,
  variant = 'default',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const hasError = !!error;

  const inputClasses = clsx(
    // Base styles with consistent design tokens
    'block px-3 py-2 border rounded-md shadow-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400',
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
    // Icon padding
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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">{leftIcon}</span>
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
            <span className={clsx(
              'text-gray-400 dark:text-gray-500', 
              hasError && 'text-red-400 dark:text-red-400'
            )}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
        >
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
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
  fullWidth = true,
  variant = 'default',
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 11)}`;
  const hasError = !!error;

  const textareaClasses = clsx(
    // Base styles with consistent design tokens
    'block px-3 py-2 border rounded-md shadow-sm transition-all duration-200 resize-vertical',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400',
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
  );

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
        <p 
          id={`${textareaId}-error`}
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
        >
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${textareaId}-helper`}
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

