import * as React from 'react';
import { cn } from '@ria/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconOnly?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-theme text-white shadow-1 hover:shadow-2',
  secondary: 'bg-secondary text-white shadow-1 hover:shadow-2',
  ghost: 'bg-bg text-theme border border-inactive hover:shadow-1',
  danger: 'bg-attention text-white shadow-1 hover:shadow-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', iconOnly = false, className, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 ring-offset-2',
      sizeClasses[size],
      variantClasses[variant],
      iconOnly ? '!px-0 w-10' : '',
      className,
    );
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = 'Button';
