'use client';

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

/**
 * Input component with label, error, and icon support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      block px-3 py-2 border rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'}
      ${icon && iconPosition === 'left' ? 'pl-10' : ''}
      ${icon && iconPosition === 'right' ? 'pr-10' : ''}
      ${fullWidth ? 'w-full' : ''}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={`${baseClasses} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{icon}</span>
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Textarea component with label and error support
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = false,
      resize = 'vertical',
      className = '',
      ...props
    },
    ref
  ) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const baseClasses = `
      block px-3 py-2 border rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'}
      ${resizeClasses[resize]}
      ${fullWidth ? 'w-full' : ''}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

/**
 * Search input with built-in search icon and clear button
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, className = '', ...props }, ref) => {
    const [value, setValue] = useState(props.value || '');
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(value as string);
      }
      props.onKeyDown?.(e);
    };
    
    const handleClear = () => {
      setValue('');
      onClear?.();
    };
    
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
          onKeyDown={handleKeyDown}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          iconPosition="left"
          className={className}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/**
 * Checkbox component with label
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 text-blue-600 border-gray-300 rounded
              focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={props.id} className="font-medium text-gray-700">
              {label}
            </label>
          </div>
        )}
        {error && (
          <p className="ml-3 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';