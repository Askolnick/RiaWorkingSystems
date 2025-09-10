import * as React from 'react';
import { cn } from '@ria/utils';

type Size = 'sm' | 'md' | 'lg';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: Size;
  error?: boolean;
  label?: string;
  helperText?: string;
  showTime?: boolean;
  min?: string;
  max?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
};

const formatDate = (date: Date, showTime: boolean = false): string => {
  if (showTime) {
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  }
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    size = 'md', 
    error = false, 
    label, 
    helperText, 
    showTime = false,
    className, 
    disabled = false,
    value,
    onChange,
    ...props 
  }, ref) => {
    const inputType = showTime ? 'datetime-local' : 'date';
    
    const inputClasses = cn(
      'w-full rounded-lg border transition-all focus:outline-none focus-visible:ring-2 ring-offset-2 ring-theme',
      sizeClasses[size],
      error 
        ? 'border-attention focus:border-attention' 
        : 'border-inactive focus:border-theme',
      disabled && 'bg-inactive cursor-not-allowed opacity-50',
      className,
    );

    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-1',
      disabled && 'opacity-50',
    );

    const helperClasses = cn(
      'text-sm mt-1',
      error ? 'text-attention' : 'text-gray-500',
    );

    // Handle controlled vs uncontrolled
    const inputValue = React.useMemo(() => {
      if (value === undefined || value === null || value === '') {
        return '';
      }
      
      if (typeof value === 'string') {
        return value;
      }
      
      if (value instanceof Date) {
        return formatDate(value, showTime);
      }
      
      return String(value);
    }, [value, showTime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Pass the raw event for maximum flexibility
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          disabled={disabled}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
        {helperText && (
          <p className={helperClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

// Utility functions for working with DatePicker values
export const DatePickerUtils = {
  formatDate,
  parseDate,
  
  // Get today's date in the correct format
  today: (showTime: boolean = false): string => {
    return formatDate(new Date(), showTime);
  },
  
  // Get date N days from today
  daysFromToday: (days: number, showTime: boolean = false): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date, showTime);
  },
  
  // Check if a date string is valid
  isValidDate: (dateString: string): boolean => {
    return parseDate(dateString) !== null;
  },
  
  // Compare two date strings
  compareDates: (date1: string, date2: string): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    if (!d1 || !d2) return 0;
    
    return d1.getTime() - d2.getTime();
  },
};