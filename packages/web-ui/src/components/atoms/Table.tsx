'use client';

import React from 'react';
import { cn } from '@ria/utils';

// === DATA TABLE TYPES ===
interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  rowKey?: keyof T | ((record: T) => string | number);
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    className?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
}

// === PRIMITIVE TABLE TYPES ===
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'striped' | 'bordered';
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

// === UTILITY CLASSES ===
const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const variantClasses = {
  default: '',
  striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50',
  bordered: 'border border-gray-200',
};

const cellPaddingClasses = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

// === PRIMITIVE TABLE COMPONENTS ===
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ size = 'md', variant = 'default', className, ...props }, ref) => {
    const classes = cn(
      'min-w-full',
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table ref={ref} className={classes} {...props} />
      </div>
    );
  }
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-gray-50', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-gray-200 bg-white', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'hover:bg-gray-50 transition-colors',
        selected && 'bg-blue-50 border-blue-200',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(
  ({ className, sortable, sorted, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-100 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-gray-400">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

// === DATA TABLE COMPONENT ===
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  rowKey = 'id',
  onRow,
  className = '',
  size = 'md',
  bordered = true,
  striped = true,
}: DataTableProps<T>) {
  const [sortState, setSortState] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection = sortState?.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
    setSortState({ key, direction: newDirection });
    onSort(key, newDirection);
  };

  const getRowKey = (record: T, index: number) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] ?? index;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-10 mb-2 rounded"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 h-8 mb-1 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table 
        size={size}
        variant={striped ? 'striped' : bordered ? 'bordered' : 'default'}
      >
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                sortable={column.sortable}
                sorted={
                  sortState?.key === column.key 
                    ? sortState.direction 
                    : false
                }
                onSort={() => column.sortable && handleSort(String(column.key))}
                className={cn(
                  cellPaddingClasses[size],
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
                {...(column.width && { style: { width: column.width } })}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn(cellPaddingClasses[size], 'text-center text-gray-500')}
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((record, index) => {
              const rowProps = onRow?.(record, index) || {};
              return (
                <TableRow
                  key={getRowKey(record, index)}
                  className={rowProps.className}
                  onClick={rowProps.onClick}
                >
                  {columns.map((column) => {
                    const value = record[column.key as keyof T];
                    const cellContent = column.render
                      ? column.render(value, record, index)
                      : value?.toString() || '';

                    return (
                      <TableCell
                        key={String(column.key)}
                        align={column.align}
                        className={cellPaddingClasses[size]}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export with legacy names for backward compatibility
export { Table as SimpleTable };

export default DataTable;