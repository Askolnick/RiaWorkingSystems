import { ReactNode } from 'react';
import { cn } from '@ria/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  const baseStyles = 'rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-transparent border-2 border-gray-300',
    elevated: 'bg-white shadow-lg',
    ghost: 'bg-gray-50',
  };
  
  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const interactiveStyles = cn(
    onClick && 'cursor-pointer',
    hoverable && 'hover:shadow-md hover:-translate-y-0.5'
  );
  
  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        interactiveStyles,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}