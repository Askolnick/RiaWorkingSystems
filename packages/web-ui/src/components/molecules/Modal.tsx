'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Modal component with portal rendering
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose, closeOnEsc]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={`
            relative bg-white rounded-lg shadow-xl
            ${sizeClasses[size]}
            w-full
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b">
              {title && (
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Drawer/Slide-over component
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
}: DrawerProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose, closeOnEsc]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  const slideAnimation = {
    left: open ? 'translate-x-0' : '-translate-x-full',
    right: open ? 'translate-x-0' : 'translate-x-full',
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed inset-y-0 ${positionClasses[position]}
          ${sizeClasses[size]}
          w-full
          bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${slideAnimation[position]}
          ${className}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close drawer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render drawer at document root
  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
}