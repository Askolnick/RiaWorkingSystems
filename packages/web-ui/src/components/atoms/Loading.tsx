import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

/**
 * Spinner component for loading states
 */
export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
}

/**
 * Loading overlay component
 */
export function LoadingOverlay({ 
  message = 'Loading...', 
  fullScreen = false, 
  blur = true 
}: LoadingOverlayProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10';

  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      {blur && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      )}
      <div className="relative flex flex-col items-center">
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader for content placeholders
 */
export function Skeleton({
  className = '',
  variant = 'text',
  animation = 'pulse',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '20px' : variant === 'circular' ? '40px' : '100px'),
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/**
 * Animated loading dots
 */
export function LoadingDots({ size = 'md', color = 'bg-gray-400' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${color} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  rows?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

/**
 * Loading card with skeleton elements
 */
export function LoadingCard({ rows = 3, showAvatar = false, showActions = false }: LoadingCardProps) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start gap-4">
        {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="text" width="100%" className="mb-2" />
          ))}
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      )}
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
}

/**
 * Loading table with skeleton rows
 */
export function LoadingTable({ rows = 5, columns = 4 }: LoadingTableProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={16} />
          ))}
        </div>
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-3 border-b last:border-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                width={`${100 / columns}%`} 
                height={20}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Aliases for compatibility with existing imports
export const LoadingSpinner = Spinner;