// Re-export all types
export * from './types';

// Export utility functions and constants
export const EXPENSE_STATUSES: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
  reimbursed: 'Reimbursed',
  cancelled: 'Cancelled',
};

export const EXPENSE_TYPES: Record<string, string> = {
  business: 'General Business',
  travel: 'Travel',
  meal: 'Meals & Entertainment',
  office: 'Office Supplies',
  equipment: 'Equipment',
  software: 'Software & Subscriptions',
  transportation: 'Transportation',
  accommodation: 'Accommodation',
  other: 'Other',
};

export const PAYMENT_METHODS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  paypal: 'PayPal',
  stripe: 'Stripe',
  cash: 'Cash',
  check: 'Check',
  reimbursement: 'Reimbursement',
  other: 'Other',
};

export const REIMBURSEMENT_STATUSES: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const RECEIPT_PROCESSING_STATUSES: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  manual_review: 'Manual Review Required',
};

// Helper functions
export function calculateExpenseTotal(
  amount: number,
  taxAmount: number = 0
): { totalAmount: number } {
  const total = amount + taxAmount;
  
  return {
    totalAmount: Math.round(total * 100) / 100,
  };
}

export function generateExpenseNumber(
  prefix: string = 'EXP',
  counter: number,
  padding: number = 4
): string {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const paddedCounter = counter.toString().padStart(padding, '0');
  return `${prefix}-${year}${month}-${paddedCounter}`;
}

export function isExpenseOverdue(submittedAt: string, approvalDays: number = 7): boolean {
  if (!submittedAt) return false;
  
  const submitted = new Date(submittedAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff > approvalDays;
}

export function calculateDaysOverdue(submittedAt: string, approvalDays: number = 7): number {
  if (!submittedAt) return 0;
  
  const submitted = new Date(submittedAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysDiff - approvalDays);
}

export function getExpenseStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'approved':
    case 'paid':
    case 'reimbursed': return 'success';
    case 'submitted': return 'warning';
    case 'rejected':
    case 'cancelled': return 'error';
    case 'draft':
    default: return 'secondary';
  }
}

export function getExpenseTypeIcon(type: string): string {
  switch (type) {
    case 'travel': return '✈️';
    case 'meal': return '🍽️';
    case 'office': return '📎';
    case 'equipment': return '💻';
    case 'software': return '💾';
    case 'transportation': return '🚗';
    case 'accommodation': return '🏨';
    case 'business':
    default: return '💼';
  }
}

export function getReimbursementStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'failed':
    case 'cancelled': return 'error';
    case 'pending':
    default: return 'secondary';
  }
}

export function getReceiptProcessingStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'failed': return 'error';
    case 'manual_review': return 'warning';
    case 'pending':
    default: return 'secondary';
  }
}

// OCR Confidence thresholds
export const OCR_CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
};

export function getOCRConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

export function shouldRequireManualReview(confidence: number): boolean {
  return confidence < OCR_CONFIDENCE_THRESHOLDS.MEDIUM;
}

// Validation helpers
export function validateExpenseAmount(amount: number, maxAmount?: number): boolean {
  if (amount <= 0) return false;
  if (maxAmount && amount > maxAmount) return false;
  return true;
}

export function validateReceiptRequired(amount: number, threshold?: number): boolean {
  if (!threshold) return false;
  return amount >= threshold;
}

export function calculateMileageAmount(distance: number, rate: number): number {
  return Math.round(distance * rate * 100) / 100;
}

// Date helpers
export function formatExpenseDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Policy validation
export function checkExpensePolicy(
  expense: any,
  policy: any
): { violations: string[]; warnings: string[] } {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check rules
  if (policy.rules) {
    for (const rule of policy.rules) {
      if (rule.categoryId && expense.categoryId !== rule.categoryId) continue;
      if (rule.expenseType && expense.type !== rule.expenseType) continue;
      
      // Check amount limits
      if (rule.maxAmount && expense.amount > rule.maxAmount) {
        violations.push(`Amount exceeds maximum allowed (${formatCurrency(rule.maxAmount)})`);
      }
      
      // Check receipt requirements
      if (rule.requiresReceipt && !expense.hasReceipt) {
        violations.push('Receipt is required for this expense type');
      }
      
      // Check business purpose requirement
      if (rule.businessPurposeRequired && !expense.businessPurpose?.trim()) {
        violations.push('Business purpose is required');
      }
      
      // Check project requirement
      if (rule.projectRequired && !expense.projectId) {
        violations.push('Project assignment is required');
      }
    }
  }

  return { violations, warnings };
}

// Mock receipt OCR processing (for development)
export function mockProcessReceipt(file: any): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        merchantName: 'Mock Restaurant',
        date: new Date().toISOString().split('T')[0],
        total: Math.round((Math.random() * 100 + 10) * 100) / 100,
        tax: Math.round((Math.random() * 10 + 1) * 100) / 100,
        currency: 'USD',
        items: [
          {
            description: 'Business Lunch',
            amount: Math.round((Math.random() * 50 + 20) * 100) / 100,
            quantity: 1
          }
        ],
        confidence: 0.85,
        rawText: 'Mock OCR extracted text...'
      };
      
      resolve({
        success: true,
        data: mockData,
        confidence: mockData.confidence,
        processingTime: 2500
      });
    }, 2500);
  });
}