import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@ria/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'border-gray-300 focus:border-theme focus:ring-theme',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
};

const sizeClasses = {
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-3',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'w-full rounded-md border bg-white text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    return (
      <textarea
        ref={ref}
        className={cn(
          baseStyles,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';