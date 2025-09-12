'use client';

import React from 'react';
import { AlertDialog } from './AlertDialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmDialogProps) {
  const alertType = variant === 'destructive' ? 'error' : 'info';
  
  return (
    <AlertDialog 
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={message}
      confirmText={confirmText}
      cancelText={cancelText}
      type={alertType}
    />
  );
}