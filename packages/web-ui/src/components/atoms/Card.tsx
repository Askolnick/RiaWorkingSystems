import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hover?: boolean;
  onClick?: () => void;
}

/**
 * Card component for content containers
 */
export function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  hover = false,
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        bg-white
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${borderClass}
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

/**
 * Card header component
 */
export function CardHeader({ children, className = '', actions }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between pb-4 ${className}`}>
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Card title component
 */
export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card description component
 */
export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card content component
 */
export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * Card footer component
 */
export function CardFooter({ 
  children, 
  className = '', 
  align = 'right' 
}: CardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center ${alignClasses[align]} pt-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Card grid layout component
 */
export function CardGrid({ 
  children, 
  columns = 3, 
  gap = 'md',
  className = '' 
}: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}