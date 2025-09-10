import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Loading';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Button component with multiple variants and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
      link: 'bg-transparent underline-offset-4 hover:underline text-blue-600 focus:ring-blue-500',
      outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-6 py-3 rounded-lg',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${widthClass}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading && iconPosition === 'left' && (
          <Spinner size="sm" color={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'primary'} className="mr-2" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
        {loading && iconPosition === 'right' && (
          <Spinner size="sm" color={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'primary'} className="ml-2" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'iconPosition'> {
  icon: React.ReactNode;
  'aria-label': string;
}

/**
 * Icon-only button component
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-1',
      md: 'p-2',
      lg: 'p-3',
    };
    
    return (
      <Button
        ref={ref}
        size={size}
        className={`${sizeClasses[size]} ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Button group component for grouping related actions
 */
export function ButtonGroup({ 
  children, 
  className = '', 
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };
  
  return (
    <div className={`inline-flex ${orientationClasses[orientation]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        let roundedClasses = '';
        if (orientation === 'horizontal') {
          if (isFirst && !isLast) roundedClasses = 'rounded-r-none';
          else if (!isFirst && isLast) roundedClasses = 'rounded-l-none';
          else if (!isFirst && !isLast) roundedClasses = 'rounded-none';
        } else {
          if (isFirst && !isLast) roundedClasses = 'rounded-b-none';
          else if (!isFirst && isLast) roundedClasses = 'rounded-t-none';
          else if (!isFirst && !isLast) roundedClasses = 'rounded-none';
        }
        
        return React.cloneElement(child as React.ReactElement<any>, {
          className: `${(child as React.ReactElement<any>).props.className || ''} ${roundedClasses}`,
        });
      })}
    </div>
  );
}