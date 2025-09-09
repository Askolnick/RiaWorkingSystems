import * as React from 'react';
import { cn } from '@ria/utils';

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, hint, error, children, className }) => {
  return (
    <label className={cn('block space-y-2', className)}>
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-attention">{error}</span>
      ) : (
        hint && <span className="text-xs text-inactive">{hint}</span>
      )}
    </label>
  );
};
