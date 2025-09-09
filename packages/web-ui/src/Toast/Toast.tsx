'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@ria/utils';

interface ToastMessage {
  id: number;
  content: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextValue {
  addToast: (content: ReactNode, options?: { variant?: 'default' | 'success' | 'warning' | 'error'; duration?: number }) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

const variantClasses = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    content: ReactNode,
    options: { variant?: 'default' | 'success' | 'warning' | 'error'; duration?: number } = {}
  ) => {
    const id = ++toastCounter;
    const toast: ToastMessage = {
      id,
      content,
      variant: options.variant ?? 'default',
      duration: options.duration ?? 4000,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start justify-between rounded-lg border p-4 shadow-lg transition-all duration-300',
              'animate-in slide-in-from-right-full',
              variantClasses[toast.variant || 'default']
            )}
          >
            <div className="flex-1 text-sm font-medium">
              {toast.content}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Close toast"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}