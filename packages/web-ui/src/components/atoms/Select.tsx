'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
}

/**
 * Select dropdown component
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'outlined',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      px-3 py-2 
      border rounded-md 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-100 disabled:cursor-not-allowed
      transition-colors
    `;

    const variantClasses = {
      outlined: 'border-gray-300 bg-white',
      filled: 'border-gray-300 bg-gray-50',
    };

    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : '';

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${errorClasses}
            ${widthClasses}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;