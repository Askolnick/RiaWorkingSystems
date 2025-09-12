// Re-export all types
export * from './types';

// Export utility functions and constants
export const BILL_STATUSES: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHODS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  paypal: 'PayPal',
  stripe: 'Stripe',
  cash: 'Cash',
  check: 'Check',
  ach: 'ACH Transfer',
  wire: 'Wire Transfer',
  other: 'Other',
};

export const APPROVAL_STATUSES: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  requires_review: 'Requires Review',
};

export const BILL_PRIORITIES: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

// Helper functions
export function calculateBillTotal(
  subtotal: number,
  taxRate: number = 0,
  discountAmount: number = 0
): { taxAmount: number; total: number; balanceDue: number } {
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discountAmount;
  
  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    balanceDue: Math.round(total * 100) / 100,
  };
}

export function generateBillNumber(
  prefix: string = 'BILL',
  counter: number,
  padding: number = 4
): string {
  const year = new Date().getFullYear();
  const paddedCounter = counter.toString().padStart(padding, '0');
  return `${prefix}-${year}-${paddedCounter}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid' || status === 'cancelled') return false;
  return new Date(dueDate) < new Date();
}

export function calculateDaysPastDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  
  if (now <= due) return 0;
  
  const diffTime = now.getTime() - due.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getBillStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'paid': return 'success';
    case 'approved': return 'secondary';
    case 'partial': return 'warning';
    case 'overdue': 
    case 'rejected': return 'error';
    case 'draft':
    case 'pending': 
    default: return 'secondary';
  }
}

export function getPriorityVariant(priority: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'normal': return 'secondary';
    case 'low': return 'success';
    default: return 'secondary';
  }
}