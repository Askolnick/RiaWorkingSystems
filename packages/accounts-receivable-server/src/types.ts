/**
 * Accounts Receivable (AR) System
 * 
 * Comprehensive customer invoice management, payment tracking,
 * aging analysis, collections management, and revenue recognition.
 */

// Customer Account Types
export interface CustomerAccount {
  id: string;
  tenantId: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  customerNumber: string;
  
  // Contact Information
  billingContact: ContactInfo;
  collectionsContact?: ContactInfo;
  
  // Credit Terms
  creditLimit: number;
  creditTerms: CreditTerms;
  paymentTerms: PaymentTerms;
  
  // Account Status
  accountStatus: AccountStatus;
  creditStatus: CreditStatus;
  creditRating?: string;
  riskLevel: RiskLevel;
  
  // Balance Information
  currentBalance: number;
  availableCredit: number;
  overdueBalance: number;
  unappliedPayments: number;
  
  // Activity Summary
  totalInvoiced: number;
  totalPaid: number;
  totalCredits: number;
  totalWriteOffs: number;
  
  // Collections
  collectionsStatus?: CollectionsStatus;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  averagePaymentDays: number;
  
  // Notes and History
  notes?: string;
  accountHistory: AccountHistoryEntry[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  address: Address;
  preferredContactMethod: ContactMethod;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreditTerms {
  creditLimit: number;
  creditCurrency: string;
  creditReviewDate?: string;
  creditHoldThreshold?: number;
  requiresPO: boolean;
  requiresApproval: boolean;
  approvalThreshold?: number;
}

export interface PaymentTerms {
  termCode: string;
  termDescription: string;
  dueDays: number;
  discountPercent?: number;
  discountDays?: number;
  lateFeePercent?: number;
  gracePeriodDays?: number;
}

export interface AccountHistoryEntry {
  id: string;
  date: string;
  type: HistoryEventType;
  description: string;
  amount?: number;
  reference?: string;
  performedBy: string;
}

// Invoice Types
export interface ARInvoice {
  id: string;
  tenantId: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  billingAddress: Address;
  shippingAddress?: Address;
  
  // Invoice Lines
  lineItems: InvoiceLineItem[];
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  
  // Payment Information
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  paymentHistory: PaymentRecord[];
  
  // Status and Aging
  status: InvoiceStatus;
  agingBucket?: AgingBucket;
  daysPastDue: number;
  
  // References
  purchaseOrderNumber?: string;
  salesOrderNumber?: string;
  contractNumber?: string;
  projectId?: string;
  
  // Collections
  collectionsStatus?: CollectionsStatus;
  lastCollectionDate?: string;
  collectionNotes?: string;
  disputeStatus?: DisputeStatus;
  
  // Revenue Recognition
  revenueRecognition?: RevenueRecognition;
  
  // Documents
  attachments: Attachment[];
  
  // Audit Trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  postedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  lineNumber: number;
  
  // Item Details
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
  
  // Amounts
  extendedAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal: number;
  
  // Tax Information
  taxCode?: string;
  taxRate?: number;
  isTaxable: boolean;
  
  // Revenue Recognition
  revenueAccount?: string;
  revenueRecognitionRule?: string;
  recognitionStartDate?: string;
  recognitionEndDate?: string;
  
  // References
  salesOrderLineId?: string;
  projectTaskId?: string;
  timesheetEntryId?: string;
}

export interface PaymentRecord {
  id: string;
  paymentDate: string;
  paymentNumber: string;
  paymentMethod: PaymentMethod;
  amount: number;
  appliedAmount: number;
  unappliedAmount: number;
  reference?: string;
  notes?: string;
  processedBy: string;
  processedAt: string;
}

export interface RevenueRecognition {
  method: RevenueRecognitionMethod;
  startDate: string;
  endDate?: string;
  recognizedAmount: number;
  deferredAmount: number;
  schedule: RevenueScheduleEntry[];
}

export interface RevenueScheduleEntry {
  periodDate: string;
  amount: number;
  recognized: boolean;
  recognizedDate?: string;
  journalEntryId?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

// Payment Types
export interface ARPayment {
  id: string;
  tenantId: string;
  
  // Payment Information
  paymentNumber: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  
  // Amount Information
  paymentAmount: number;
  appliedAmount: number;
  unappliedAmount: number;
  currency: string;
  
  // Payment Details
  checkNumber?: string;
  creditCardLast4?: string;
  bankAccount?: string;
  transactionId?: string;
  authorizationCode?: string;
  
  // Application Details
  applications: PaymentApplication[];
  
  // Status
  status: PaymentTransactionStatus;
  depositStatus?: DepositStatus;
  clearedDate?: string;
  
  // References
  referenceNumber?: string;
  memo?: string;
  
  // Bank Deposit
  depositId?: string;
  depositDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  voidedBy?: string;
  voidedAt?: string;
  voidReason?: string;
}

export interface PaymentApplication {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  appliedAmount: number;
  discountTaken?: number;
  writeOffAmount?: number;
  applicationDate: string;
  notes?: string;
}

// Credit Memo Types
export interface CreditMemo {
  id: string;
  tenantId: string;
  
  // Credit Memo Details
  creditMemoNumber: string;
  creditMemoDate: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  
  // Original Invoice Reference
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  
  // Credit Lines
  lineItems: CreditMemoLineItem[];
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  
  // Status
  status: CreditMemoStatus;
  reason: CreditMemoReason;
  
  // Application
  applications: CreditMemoApplication[];
  
  // Notes
  internalNotes?: string;
  customerNotes?: string;
  
  // Approval
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreditMemoLineItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  extendedAmount: number;
  taxAmount?: number;
  lineTotal: number;
  originalInvoiceLineId?: string;
  returnReasonCode?: string;
}

export interface CreditMemoApplication {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  appliedAmount: number;
  applicationDate: string;
}

// Aging Report Types
export interface AgingReport {
  id: string;
  tenantId: string;
  
  // Report Parameters
  reportDate: string;
  reportType: AgingReportType;
  agingMethod: AgingMethod;
  includeCredits: boolean;
  
  // Summary
  totalReceivables: number;
  totalCurrent: number;
  totalPastDue: number;
  
  // Aging Buckets
  agingBuckets: AgingBucketSummary[];
  
  // Customer Details
  customerAging: CustomerAging[];
  
  // Statistics
  averageDaysSalesOutstanding: number;
  percentageCurrent: number;
  percentagePastDue: number;
  
  // Risk Analysis
  highRiskAccounts: number;
  highRiskAmount: number;
  collectionRiskScore: number;
  
  // Metadata
  generatedAt: string;
  generatedBy: string;
}

export interface AgingBucketSummary {
  bucket: AgingBucket;
  label: string;
  daysRange: string;
  amount: number;
  percentage: number;
  invoiceCount: number;
  customerCount: number;
}

export interface CustomerAging {
  customerId: string;
  customerName: string;
  customerNumber: string;
  creditLimit: number;
  
  // Balances by Bucket
  currentBalance: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90Days: number;
  totalBalance: number;
  
  // Risk Indicators
  creditStatus: CreditStatus;
  riskLevel: RiskLevel;
  collectionsStatus?: CollectionsStatus;
  
  // Invoice Details
  invoices: AgingInvoiceDetail[];
  
  // Payment History
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  averagePaymentDays: number;
}

export interface AgingInvoiceDetail {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  amountDue: number;
  daysPastDue: number;
  agingBucket: AgingBucket;
  status: InvoiceStatus;
  collectionsStatus?: CollectionsStatus;
}

// Collections Management
export interface CollectionsCase {
  id: string;
  tenantId: string;
  
  // Case Information
  caseNumber: string;
  caseType: CollectionsCaseType;
  priority: CollectionsPriority;
  status: CollectionsCaseStatus;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  
  // Financial Information
  totalAmountDue: number;
  disputedAmount: number;
  promisedAmount: number;
  collectedAmount: number;
  
  // Invoices
  invoices: string[];
  
  // Collection Activities
  activities: CollectionsActivity[];
  
  // Payment Arrangements
  paymentPlan?: PaymentPlan;
  
  // Assignment
  assignedTo?: string;
  assignedAt?: string;
  escalatedTo?: string;
  escalatedAt?: string;
  
  // Dates
  openedDate: string;
  lastActivityDate?: string;
  nextActionDate?: string;
  targetResolutionDate?: string;
  closedDate?: string;
  
  // Notes
  internalNotes?: string;
  resolutionNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CollectionsActivity {
  id: string;
  activityDate: string;
  activityType: CollectionsActivityType;
  description: string;
  outcome?: string;
  promiseAmount?: number;
  promiseDate?: string;
  followUpDate?: string;
  performedBy: string;
  duration?: number;
  contactMethod?: ContactMethod;
  contactPerson?: string;
  attachments?: Attachment[];
}

export interface PaymentPlan {
  id: string;
  planType: PaymentPlanType;
  status: PaymentPlanStatus;
  
  // Terms
  totalAmount: number;
  downPayment?: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: PaymentFrequency;
  
  // Schedule
  startDate: string;
  endDate: string;
  installments: PaymentInstallment[];
  
  // Performance
  totalPaid: number;
  totalRemaining: number;
  missedPayments: number;
  
  // Agreement
  agreementDate: string;
  agreementDocument?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidDate?: string;
  paidAmount?: number;
  paymentId?: string;
}

// Statement Types
export interface CustomerStatement {
  id: string;
  tenantId: string;
  
  // Statement Information
  statementNumber: string;
  statementDate: string;
  statementPeriod: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  billingAddress: Address;
  
  // Balance Summary
  beginningBalance: number;
  totalCharges: number;
  totalCredits: number;
  totalPayments: number;
  endingBalance: number;
  
  // Aging Summary
  currentBalance: number;
  pastDue30Days: number;
  pastDue60Days: number;
  pastDue90Days: number;
  pastDueOver90Days: number;
  
  // Transaction Details
  transactions: StatementTransaction[];
  
  // Payment Information
  minimumPaymentDue?: number;
  paymentDueDate?: string;
  
  // Messages
  customerMessage?: string;
  importantNotices?: string[];
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveryStatus: DeliveryStatus;
  emailedTo?: string;
  emailedAt?: string;
  
  // Metadata
  generatedAt: string;
  generatedBy: string;
}

export interface StatementTransaction {
  date: string;
  type: TransactionType;
  reference: string;
  description: string;
  charges?: number;
  credits?: number;
  payments?: number;
  balance: number;
}

// Dunning Letters
export interface DunningLetter {
  id: string;
  tenantId: string;
  
  // Letter Information
  letterNumber: string;
  letterDate: string;
  letterLevel: DunningLevel;
  templateId: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerAccount: string;
  
  // Financial Information
  totalAmountDue: number;
  oldestInvoiceDate: string;
  daysPastDue: number;
  
  // Invoices Included
  invoices: string[];
  
  // Content
  subject: string;
  body: string;
  attachments?: Attachment[];
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveryStatus: DeliveryStatus;
  sentTo?: string;
  sentAt?: string;
  
  // Response
  responseReceived: boolean;
  responseDate?: string;
  responseType?: string;
  responseNotes?: string;
  
  // Next Action
  nextActionDate?: string;
  nextActionType?: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Enums and Constants
export type CustomerType = 
  | 'business'
  | 'individual'
  | 'government'
  | 'nonprofit';

export type AccountStatus = 
  | 'active'
  | 'inactive'
  | 'on_hold'
  | 'closed';

export type CreditStatus = 
  | 'good_standing'
  | 'credit_watch'
  | 'credit_hold'
  | 'credit_stop';

export type RiskLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type CollectionsStatus = 
  | 'current'
  | 'reminder_sent'
  | 'in_collections'
  | 'payment_plan'
  | 'legal_action'
  | 'write_off';

export type ContactMethod = 
  | 'email'
  | 'phone'
  | 'mail'
  | 'sms'
  | 'in_person';

export type HistoryEventType = 
  | 'account_created'
  | 'credit_limit_changed'
  | 'payment_received'
  | 'invoice_created'
  | 'credit_hold'
  | 'collections_action'
  | 'write_off'
  | 'dispute';

export type PaymentStatus = 
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'overpaid';

export type InvoiceStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'viewed'
  | 'partial_payment'
  | 'paid'
  | 'overdue'
  | 'disputed'
  | 'written_off'
  | 'voided';

export type AgingBucket = 
  | 'current'
  | '1-30'
  | '31-60'
  | '61-90'
  | 'over_90';

export type DisputeStatus = 
  | 'no_dispute'
  | 'disputed'
  | 'resolved'
  | 'escalated';

export type PaymentMethod = 
  | 'check'
  | 'ach'
  | 'wire'
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'other';

export type RevenueRecognitionMethod = 
  | 'immediate'
  | 'over_time'
  | 'milestone'
  | 'percentage_complete';

export type PaymentTransactionStatus = 
  | 'pending'
  | 'processed'
  | 'deposited'
  | 'cleared'
  | 'bounced'
  | 'voided';

export type DepositStatus = 
  | 'undeposited'
  | 'deposited'
  | 'cleared';

export type CreditMemoStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_applied'
  | 'fully_applied'
  | 'voided';

export type CreditMemoReason = 
  | 'return'
  | 'pricing_error'
  | 'damaged_goods'
  | 'customer_satisfaction'
  | 'other';

export type AgingReportType = 
  | 'summary'
  | 'detailed'
  | 'by_customer'
  | 'by_salesperson';

export type AgingMethod = 
  | 'invoice_date'
  | 'due_date';

export type CollectionsCaseType = 
  | 'standard'
  | 'dispute'
  | 'payment_plan'
  | 'legal';

export type CollectionsPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type CollectionsCaseStatus = 
  | 'open'
  | 'in_progress'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'written_off';

export type CollectionsActivityType = 
  | 'phone_call'
  | 'email'
  | 'letter'
  | 'visit'
  | 'payment_received'
  | 'promise_to_pay'
  | 'dispute_logged'
  | 'escalation'
  | 'legal_action';

export type PaymentPlanType = 
  | 'installment'
  | 'deferred'
  | 'settlement';

export type PaymentPlanStatus = 
  | 'proposed'
  | 'active'
  | 'completed'
  | 'defaulted'
  | 'cancelled';

export type PaymentFrequency = 
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly';

export type InstallmentStatus = 
  | 'scheduled'
  | 'due'
  | 'paid'
  | 'partial'
  | 'missed'
  | 'waived';

export type TransactionType = 
  | 'invoice'
  | 'payment'
  | 'credit_memo'
  | 'debit_memo'
  | 'adjustment'
  | 'write_off';

export type DeliveryMethod = 
  | 'email'
  | 'mail'
  | 'fax'
  | 'portal';

export type DeliveryStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'failed';

export type DunningLevel = 
  | 'reminder'
  | 'first_notice'
  | 'second_notice'
  | 'final_notice'
  | 'collection_notice';

// API Request/Response Types
export interface CreateInvoiceData {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  notes?: string;
  attachments?: string[];
}

export interface RecordPaymentData {
  customerId: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  amount: number;
  invoiceApplications?: Array<{
    invoiceId: string;
    amount: number;
    discountTaken?: number;
  }>;
  reference?: string;
  memo?: string;
}

export interface CreateCreditMemoData {
  customerId: string;
  originalInvoiceId?: string;
  lineItems: Omit<CreditMemoLineItem, 'id'>[];
  reason: CreditMemoReason;
  notes?: string;
}

export interface ARFilters {
  customerId?: string[];
  status?: InvoiceStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  agingBucket?: AgingBucket[];
  collectionsStatus?: CollectionsStatus[];
}

// Helper Functions
export function calculateDaysPastDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getAgingBucket(daysPastDue: number): AgingBucket {
  if (daysPastDue <= 0) return 'current';
  if (daysPastDue <= 30) return '1-30';
  if (daysPastDue <= 60) return '31-60';
  if (daysPastDue <= 90) return '61-90';
  return 'over_90';
}

export function calculateDSO(totalReceivables: number, creditSales: number, days: number): number {
  if (creditSales === 0) return 0;
  return (totalReceivables / creditSales) * days;
}

// Error Classes
export class AccountsReceivableError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AccountsReceivableError';
  }
}

export class InvoiceError extends AccountsReceivableError {
  constructor(message: string, details?: any) {
    super(message, 'INVOICE_ERROR', details);
  }
}

export class PaymentError extends AccountsReceivableError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_ERROR', details);
  }
}

export class CollectionsError extends AccountsReceivableError {
  constructor(message: string, details?: any) {
    super(message, 'COLLECTIONS_ERROR', details);
  }
}