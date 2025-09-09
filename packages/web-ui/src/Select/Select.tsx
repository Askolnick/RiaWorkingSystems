import * as React from 'react';
import { cn } from '@ria/utils';

export interface Option { value: string; label: string; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn('h-10 px-3 rounded-lg bg-bg border border-inactive shadow-1 text-base', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);
Select.displayName = 'Select';
