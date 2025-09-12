import * as React from 'react';
import { cn } from '@ria/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, className, type = 'text', ...props }, ref) => {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg bg-bg border border-inactive shadow-1 px-3', className)}>
        {prefix && <span className="text-inactive">{prefix}</span>}
        <input
          ref={ref}
          type={type}
          className="flex-1 bg-transparent outline-none text-base h-10"
          {...props}
        />
        {suffix}
      </div>
    );
  },
);
Input.displayName = 'Input';
