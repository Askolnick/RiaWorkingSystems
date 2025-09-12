// -------------------- Core Types --------------------

export type BillStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash' | 'check' | 'ach' | 'wire' | 'other';
export type BillActivityType = 'created' | 'submitted' | 'approved' | 'rejected' | 'payment_scheduled' | 'payment_sent' | 'payment_failed' | 'cancelled' | 'updated' | 'note_added';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requires_review';
export type BillPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface VendorAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Bill {
  id: string;
  tenantId: string;
  number: string;
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress?: VendorAddress;
  
  // Bill Details
  billDate: string;
  dueDate: string;
  status: BillStatus;
  priority: BillPriority;
  
  // Financial
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  
  // Currency
  currency: string;
  
  // Content
  description?: string;
  notes?: string;
  terms?: string;
  poNumber?: string; // Purchase Order Number
  
  // Approval Workflow
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Attachments
  attachmentIds: string[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  paidAt?: string;
}

export interface BillItem {
  id: string;
  tenantId: string;
  billId: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  category?: string;
  accountCode?: string; // Chart of accounts code
  projectId?: string; // Link to project
  sortOrder: number;
}

export interface BillPayment {
  id: string;
  tenantId: string;
  billId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  paymentDate: string;
  processedAt?: string;
  scheduledAt?: string; // For scheduled payments
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillActivity {
  id: string;
  tenantId: string;
  billId: string;
  type: BillActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
}

export interface BillApproval {
  id: string;
  tenantId: string;
  billId: string;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillAttachment {
  id: string;
  tenantId: string;
  billId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdBy: string;
  createdAt: string;
}

// -------------------- Extended Types --------------------

export interface BillWithItems extends Bill {
  items: BillItem[];
}

export interface BillWithRelations extends Bill {
  items: BillItem[];
  payments: BillPayment[];
  activities: BillActivity[];
  approvals: BillApproval[];
  attachments: BillAttachment[];
  totalPayments: number;
  isOverdue: boolean;
  daysPastDue: number;
}

// -------------------- API Data Types --------------------

export interface CreateBillData {
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress?: VendorAddress;
  billDate: string;
  dueDate: string;
  priority?: BillPriority;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  description?: string;
  notes?: string;
  terms?: string;
  poNumber?: string;
  items: Omit<BillItem, 'id' | 'tenantId' | 'billId'>[];
  attachmentIds?: string[];
}

export interface UpdateBillData {
  vendorId?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorAddress?: VendorAddress;
  billDate?: string;
  dueDate?: string;
  status?: BillStatus;
  priority?: BillPriority;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  description?: string;
  notes?: string;
  terms?: string;
  poNumber?: string;
  attachmentIds?: string[];
}

export interface CreateBillPaymentData {
  billId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentDate: string;
  scheduledAt?: string;
}

export interface UpdateBillPaymentData {
  amount?: number;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentDate?: string;
  scheduledAt?: string;
  status?: PaymentStatus;
}

export interface CreateBillApprovalData {
  billId: string;
  status: ApprovalStatus;
  comments?: string;
}

// -------------------- Filter and Sort Types --------------------

export interface BillFilters {
  status?: BillStatus | BillStatus[];
  approvalStatus?: ApprovalStatus | ApprovalStatus[];
  vendorId?: string;
  vendorName?: string;
  priority?: BillPriority | BillPriority[];
  dueDateFrom?: string;
  dueDateTo?: string;
  billDateFrom?: string;
  billDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
  overdue?: boolean;
  hasAttachments?: boolean;
  createdBy?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus | PaymentStatus[];
  method?: PaymentMethod | PaymentMethod[];
  billId?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface BillSort {
  field: keyof Bill;
  direction: 'asc' | 'desc';
}

// -------------------- Stats and Analytics Types --------------------

export interface BillStats {
  totalBills: number;
  totalDrafts: number;
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  totalOverdue: number;
  totalAmount: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  averageBillValue: number;
  averagePaymentTime: number;
  paymentSuccessRate: number;
  recentBills: Bill[];
  topVendors: {
    vendorName: string;
    totalBills: number;
    totalAmount: number;
    totalPaid: number;
  }[];
  monthlySpending: {
    month: string;
    amount: number;
    billCount: number;
  }[];
  statusDistribution: {
    status: BillStatus;
    count: number;
    totalAmount: number;
  }[];
  paymentMethodStats: {
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }[];
}

export interface BillAnalytics extends BillStats {
  cashFlowForecast: {
    date: string;
    expectedPayments: number;
    projectedBalance: number;
  }[];
  vendorPaymentHistory: {
    vendorId: string;
    vendorName: string;
    averagePaymentDays: number;
    onTimePaymentRate: number;
    totalTransactions: number;
  }[];
  approvalMetrics: {
    averageApprovalTime: number;
    approvalRate: number;
    topApprovers: {
      approverId: string;
      approverName: string;
      approvalCount: number;
      averageTime: number;
    }[];
  };
}

// -------------------- Bulk Operations --------------------

export interface BulkBillAction {
  action: 'approve' | 'reject' | 'pay' | 'cancel' | 'delete' | 'export';
  billIds: string[];
  metadata?: Record<string, any>;
}

// -------------------- Export Options --------------------

export interface BillExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  billIds?: string[];
  filters?: BillFilters;
  includeItems?: boolean;
  includePayments?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// -------------------- Settings --------------------

export interface BillSettings {
  id: string;
  tenantId: string;
  
  // Default values
  defaultCurrency: string;
  defaultPaymentTerms: number; // Days
  defaultTaxRate: number;
  
  // Approval settings
  requireApproval: boolean;
  approvalThreshold?: number; // Amount above which approval is required
  multiLevelApproval: boolean;
  approvalTimeout: number; // Days before auto-approval
  
  // Numbering
  billNumberPrefix: string;
  billNumberCounter: number;
  billNumberPadding: number;
  
  // Notifications
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnPayment: boolean;
  reminderDaysBefore: number[];
  
  // Features
  allowScheduledPayments: boolean;
  requirePONumber: boolean;
  allowPartialPayments: boolean;
  requireAttachments: boolean;
  
  updatedBy: string;
  updatedAt: string;
}

export interface BillTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  isDefault: boolean;
  
  // Template data
  templateData: {
    currency?: string;
    taxRate?: number;
    paymentTerms?: number;
    notes?: string;
    terms?: string;
    defaultItems?: Omit<BillItem, 'id' | 'tenantId' | 'billId'>[];
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}