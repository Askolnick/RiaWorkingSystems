import { ReactNode } from 'react';
import { cn } from '@ria/utils';

export interface StackProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

export function Stack({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}: StackProps) {
  const baseStyles = 'flex';
  
  const directions = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };
  
  const spacings = {
    none: '',
    xs: direction === 'horizontal' ? 'gap-x-1' : 'gap-y-1',
    sm: direction === 'horizontal' ? 'gap-x-2' : 'gap-y-2',
    md: direction === 'horizontal' ? 'gap-x-4' : 'gap-y-4',
    lg: direction === 'horizontal' ? 'gap-x-6' : 'gap-y-6',
    xl: direction === 'horizontal' ? 'gap-x-8' : 'gap-y-8',
  };
  
  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };
  
  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };
  
  return (
    <div
      className={cn(
        baseStyles,
        directions[direction],
        spacings[spacing],
        alignments[align],
        justifications[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}