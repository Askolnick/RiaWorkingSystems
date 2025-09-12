// -------------------- Core Types --------------------

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash' | 'check' | 'reimbursement' | 'other';
export type ExpenseActivityType = 'created' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed' | 'cancelled' | 'updated' | 'note_added' | 'receipt_uploaded';
export type ReimbursementStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ReceiptProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
export type ExpenseType = 'business' | 'travel' | 'meal' | 'office' | 'equipment' | 'software' | 'transportation' | 'accommodation' | 'other';

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  isDeductible: boolean;
  requiresReceipt: boolean;
  maxAmount?: number;
  parentId?: string;
  accountCode?: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  tenantId: string;
  number: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  
  // Expense Details
  date: string;
  type: ExpenseType;
  categoryId: string;
  categoryName: string;
  status: ExpenseStatus;
  
  // Financial
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  currency: string;
  exchangeRate?: number; // For foreign currency
  
  // Business Details
  description: string;
  businessPurpose: string;
  merchant?: string;
  location?: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  
  // Receipt Information
  receiptIds: string[];
  hasReceipt: boolean;
  receiptProcessingStatus?: ReceiptProcessingStatus;
  
  // Approval Workflow
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Reimbursement
  isReimbursable: boolean;
  reimbursementStatus?: ReimbursementStatus;
  reimbursedAmount?: number;
  reimbursedAt?: string;
  reimbursementMethod?: PaymentMethod;
  
  // Tax and Compliance
  isDeductible: boolean;
  taxCategory?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  paidAt?: string;
}

export interface ExpenseReceipt {
  id: string;
  tenantId: string;
  expenseId?: string; // Optional - can exist before being linked to expense
  
  // File Information
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  
  // OCR Processing
  processingStatus: ReceiptProcessingStatus;
  ocrData?: {
    merchantName?: string;
    date?: string;
    total?: number;
    tax?: number;
    currency?: string;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
    confidence: number;
    rawText?: string;
  };
  
  // Manual Review
  needsReview: boolean;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Metadata
  uploadedBy: string;
  uploadedAt: string;
  processedAt?: string;
}

export interface ExpenseReimbursement {
  id: string;
  tenantId: string;
  expenseIds: string[];
  employeeId: string;
  employeeName: string;
  
  // Reimbursement Details
  totalAmount: number;
  currency: string;
  status: ReimbursementStatus;
  method: PaymentMethod;
  
  // Payment Information
  scheduledDate?: string;
  paidDate?: string;
  reference?: string;
  bankAccount?: string;
  notes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface ExpenseActivity {
  id: string;
  tenantId: string;
  expenseId: string;
  
  type: ExpenseActivityType;
  description: string;
  metadata?: Record<string, any>;
  
  createdBy?: string;
  createdAt: string;
}

export interface ExpenseApproval {
  id: string;
  tenantId: string;
  expenseId: string;
  
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// -------------------- Extended Types --------------------

export interface ExpenseWithReceipts extends Expense {
  receipts: ExpenseReceipt[];
}

export interface ExpenseWithRelations extends Expense {
  receipts: ExpenseReceipt[];
  activities: ExpenseActivity[];
  approvals: ExpenseApproval[];
  category: ExpenseCategory;
  reimbursement?: ExpenseReimbursement;
}

// -------------------- API Data Types --------------------

export interface CreateExpenseData {
  date: string;
  type: ExpenseType;
  categoryId: string;
  amount: number;
  taxAmount?: number;
  currency?: string;
  description: string;
  businessPurpose: string;
  merchant?: string;
  location?: string;
  projectId?: string;
  clientId?: string;
  receiptIds?: string[];
  isReimbursable?: boolean;
  taxCategory?: string;
}

export interface UpdateExpenseData {
  date?: string;
  type?: ExpenseType;
  categoryId?: string;
  amount?: number;
  taxAmount?: number;
  currency?: string;
  description?: string;
  businessPurpose?: string;
  merchant?: string;
  location?: string;
  projectId?: string;
  clientId?: string;
  receiptIds?: string[];
  isReimbursable?: boolean;
  taxCategory?: string;
  status?: ExpenseStatus;
}

export interface CreateReimbursementData {
  expenseIds: string[];
  method: PaymentMethod;
  scheduledDate?: string;
  bankAccount?: string;
  notes?: string;
}

export interface UpdateReimbursementData {
  method?: PaymentMethod;
  scheduledDate?: string;
  paidDate?: string;
  reference?: string;
  bankAccount?: string;
  notes?: string;
  status?: ReimbursementStatus;
}

export interface UploadReceiptData {
  file: File | FormData;
  expenseId?: string;
  description?: string;
}

// -------------------- Filter and Sort Types --------------------

export interface ExpenseFilters {
  status?: ExpenseStatus | ExpenseStatus[];
  type?: ExpenseType | ExpenseType[];
  categoryId?: string;
  employeeId?: string;
  employeeName?: string;
  projectId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  hasReceipt?: boolean;
  isReimbursable?: boolean;
  reimbursementStatus?: ReimbursementStatus;
  needsApproval?: boolean;
  search?: string;
}

export interface ReimbursementFilters {
  status?: ReimbursementStatus | ReimbursementStatus[];
  method?: PaymentMethod | PaymentMethod[];
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface ReceiptFilters {
  processingStatus?: ReceiptProcessingStatus | ReceiptProcessingStatus[];
  hasExpense?: boolean;
  needsReview?: boolean;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpenseSort {
  field: keyof Expense;
  direction: 'asc' | 'desc';
}

// -------------------- Stats and Analytics Types --------------------

export interface ExpenseStats {
  totalExpenses: number;
  totalDrafts: number;
  totalSubmitted: number;
  totalApproved: number;
  totalPaid: number;
  totalAmount: number;
  totalReimbursable: number;
  totalReimbursed: number;
  averageExpense: number;
  averageProcessingTime: number;
  reimbursementRate: number;
  
  recentExpenses: Expense[];
  topCategories: {
    categoryName: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }[];
  topEmployees: {
    employeeId: string;
    employeeName: string;
    expenseCount: number;
    totalAmount: number;
    reimbursedAmount: number;
  }[];
  monthlyTrends: {
    month: string;
    expenseCount: number;
    totalAmount: number;
    reimbursedAmount: number;
  }[];
  statusDistribution: {
    status: ExpenseStatus;
    count: number;
    totalAmount: number;
  }[];
  typeBreakdown: {
    type: ExpenseType;
    count: number;
    totalAmount: number;
    percentage: number;
  }[];
}

export interface ExpenseAnalytics extends ExpenseStats {
  receiptProcessingStats: {
    totalReceipts: number;
    processedReceipts: number;
    failedReceipts: number;
    averageProcessingTime: number;
    ocrAccuracy: number;
  };
  complianceMetrics: {
    receiptComplianceRate: number;
    policyViolations: number;
    averageApprovalTime: number;
  };
  costSavings: {
    duplicateDetection: number;
    policyEnforcement: number;
    automatedProcessing: number;
  };
  predictiveInsights: {
    projectedMonthlyExpenses: number;
    seasonalTrends: Array<{
      month: string;
      projectedAmount: number;
    }>;
    riskFactors: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
}

// -------------------- Bulk Operations --------------------

export interface BulkExpenseAction {
  action: 'approve' | 'reject' | 'submit' | 'reimburse' | 'delete' | 'export';
  expenseIds: string[];
  metadata?: Record<string, any>;
}

// -------------------- Export Options --------------------

export interface ExpenseExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  expenseIds?: string[];
  filters?: ExpenseFilters;
  includeReceipts?: boolean;
  includeApprovals?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  groupBy?: 'employee' | 'category' | 'project' | 'month';
}

// -------------------- Settings --------------------

export interface ExpenseSettings {
  id: string;
  tenantId: string;
  
  // Approval settings
  requireApproval: boolean;
  approvalThreshold?: number;
  multiLevelApproval: boolean;
  autoApprovalLimit?: number;
  
  // Receipt settings
  requireReceipts: boolean;
  receiptRequiredThreshold?: number;
  allowMobileCapture: boolean;
  enableOCR: boolean;
  ocrProvider?: 'aws' | 'google' | 'azure' | 'custom';
  
  // Reimbursement settings
  defaultReimbursementMethod: PaymentMethod;
  reimbursementSchedule: 'weekly' | 'bi-weekly' | 'monthly';
  minReimbursementAmount?: number;
  maxReimbursementAmount?: number;
  
  // Currency and tax
  defaultCurrency: string;
  allowMultiCurrency: boolean;
  defaultTaxRate?: number;
  
  // Numbering
  expenseNumberPrefix: string;
  expenseNumberCounter: number;
  expenseNumberPadding: number;
  
  // Notifications
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnReimbursement: boolean;
  reminderDaysBefore: number[];
  
  // Compliance
  enablePolicyChecks: boolean;
  enableDuplicateDetection: boolean;
  mileageRate?: number;
  perDiemRates?: Record<string, number>;
  
  updatedBy: string;
  updatedAt: string;
}

export interface ExpensePolicy {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Policy rules
  rules: {
    categoryId?: string;
    expenseType?: ExpenseType;
    maxAmount?: number;
    requiresReceipt?: boolean;
    requiresApproval?: boolean;
    allowedPaymentMethods?: PaymentMethod[];
    businessPurposeRequired?: boolean;
    projectRequired?: boolean;
  }[];
  
  // Violations
  violationActions: {
    block: boolean;
    requireApproval: boolean;
    flagForReview: boolean;
    notifyAdmin: boolean;
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MileageEntry {
  id: string;
  tenantId: string;
  expenseId: string;
  
  fromLocation: string;
  toLocation: string;
  distance: number; // in miles or kilometers
  rate: number; // per mile/km rate
  businessPurpose: string;
  
  createdAt: string;
  updatedAt: string;
}