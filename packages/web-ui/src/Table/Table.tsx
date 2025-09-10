import * as React from 'react';
import { cn } from '@ria/utils';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'striped' | 'bordered';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: Size;
  variant?: Variant;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  align?: 'left' | 'center' | 'right';
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const variantClasses: Record<Variant, string> = {
  default: '',
  striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50',
  bordered: 'border border-gray-200',
};

const cellPaddingClasses: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ size = 'md', variant = 'default', className, ...props }, ref) => {
    const classes = cn(
      'w-full border-collapse',
      sizeClasses[size],
      variantClasses[variant],
      className,
    );
    return <table ref={ref} className={classes} {...props} />;
  },
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    const classes = cn(
      'bg-gray-50 border-b border-gray-200',
      className,
    );
    return <thead ref={ref} className={classes} {...props} />;
  },
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    const classes = cn(
      'divide-y divide-gray-200',
      className,
    );
    return <tbody ref={ref} className={classes} {...props} />;
  },
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected = false, className, ...props }, ref) => {
    const classes = cn(
      'hover:bg-gray-50 transition-colors',
      selected && 'bg-blue-50',
      className,
    );
    return <tr ref={ref} className={classes} {...props} />;
  },
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(
  ({ sortable = false, sorted = false, onSort, align = 'left', className, children, ...props }, ref) => {
    const classes = cn(
      'font-semibold text-gray-900 px-4 py-3',
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      sortable && 'cursor-pointer select-none hover:bg-gray-100',
      className,
    );

    const content = sortable ? (
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={cn(
                'w-3 h-3 -mb-1',
                sorted === 'asc' ? 'text-gray-900' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
            <svg
              className={cn(
                'w-3 h-3 rotate-180',
                sorted === 'desc' ? 'text-gray-900' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </div>
        )}
      </div>
    ) : children;

    return (
      <th
        ref={ref}
        className={classes}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {content}
      </th>
    );
  },
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ align = 'left', className, ...props }, ref) => {
    const classes = cn(
      'px-4 py-3 text-gray-900',
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className,
    );
    return <td ref={ref} className={classes} {...props} />;
  },
);
TableCell.displayName = 'TableCell';