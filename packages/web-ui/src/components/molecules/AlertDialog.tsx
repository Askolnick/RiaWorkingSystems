'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error';
}

/**
 * Alert dialog component for confirmations and warnings
 */
export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}: AlertDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'error':
        return 'danger' as const;
      case 'warning':
        return 'primary' as const;
      case 'info':
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {getIcon()}
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant={getConfirmButtonVariant()}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default AlertDialog;