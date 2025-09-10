'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  showTime?: boolean;
  format?: 'date' | 'datetime-local' | 'time';
}

/**
 * Date picker component with various formats
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'outlined',
      showTime = false,
      format,
      className = '',
      ...props
    },
    ref
  ) => {
    // Determine input type based on format or showTime
    const inputType = format || (showTime ? 'datetime-local' : 'date');

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
        <input
          ref={ref}
          type={inputType}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${errorClasses}
            ${widthClasses}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
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

DatePicker.displayName = 'DatePicker';

interface DateRangePickerProps {
  label?: string;
  startLabel?: string;
  endLabel?: string;
  startValue?: string;
  endValue?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Date range picker component
 */
export function DateRangePicker({
  label,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  error,
  fullWidth = false,
  className = '',
}: DateRangePickerProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePicker
          label={startLabel}
          value={startValue}
          onChange={(e) => onStartChange?.(e.target.value)}
          error={error}
          fullWidth
        />
        <DatePicker
          label={endLabel}
          value={endValue}
          onChange={(e) => onEndChange?.(e.target.value)}
          error={error}
          fullWidth
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default DatePicker;