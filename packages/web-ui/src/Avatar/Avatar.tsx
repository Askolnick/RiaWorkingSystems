import { ReactNode } from 'react';
import { cn } from '@ria/utils';

export interface AvatarProps {
  name?: string;
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: ReactNode;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function Avatar({
  name = 'User',
  src,
  alt,
  size = 'md',
  className,
  fallback,
}: AvatarProps) {
  // Generate initials from name
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const baseStyles = 'relative inline-flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600 select-none overflow-hidden';

  if (src) {
    return (
      <div className={cn(baseStyles, sizeClasses[size], className)}>
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error and show fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback || initials || 'U'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseStyles, sizeClasses[size], className)}>
      {fallback || initials || 'U'}
    </div>
  );
}