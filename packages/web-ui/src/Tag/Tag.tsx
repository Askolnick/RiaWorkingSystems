'use client';

import { ReactNode } from 'react';
import { cn } from '@ria/utils';

export interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  removable?: boolean;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  success: 'bg-green-100 text-green-800 hover:bg-green-200',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  danger: 'bg-red-100 text-red-800 hover:bg-red-200',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function Tag({
  children,
  onRemove,
  variant = 'default',
  size = 'md',
  className,
  removable = !!onRemove,
}: TagProps) {
  const baseStyles = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  return (
    <span
      className={cn(
        baseStyles,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label="Remove tag"
          className={cn(
            'ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1',
            size === 'sm' && 'h-3 w-3 ml-1',
            size === 'lg' && 'h-5 w-5 ml-2'
          )}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}