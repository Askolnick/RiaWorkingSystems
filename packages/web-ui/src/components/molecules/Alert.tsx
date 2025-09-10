import React from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * Alert component for displaying messages
 */
export function Alert({
  type = 'info',
  title,
  children,
  icon,
  onClose,
  className = '',
}: AlertProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: '💡',
      iconColor: 'text-blue-600',
      title: 'text-blue-800',
      content: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: '✅',
      iconColor: 'text-green-600',
      title: 'text-green-800',
      content: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconColor: 'text-yellow-600',
      title: 'text-yellow-800',
      content: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: '❌',
      iconColor: 'text-red-600',
      title: 'text-red-800',
      content: 'text-red-700',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`
        border rounded-lg p-4
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icon || <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.content}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${styles.iconColor} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Alias for compatibility with existing imports  
export const ErrorAlert = ({ children, ...props }: Omit<AlertProps, 'type'>) => (
  <Alert type="error" {...props}>
    {children}
  </Alert>
);

