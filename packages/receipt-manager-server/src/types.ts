/**
 * Receipt Manager System
 * 
 * Comprehensive receipt management with bank integration, transaction matching,
 * and audit documentation generation for complete financial compliance.
 */

// Receipt Management Types
export interface Receipt {
  id: string;
  tenantId: string;
  
  // Basic Information
  receiptNumber?: string;
  vendor: string;
  vendorTaxId?: string;
  vendorAddress?: string;
  
  // Transaction Details
  transactionDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  
  // Categorization
  category: string;
  subcategory?: string;
  expenseType: ExpenseType;
  
  // Line Items
  lineItems: ReceiptLineItem[];
  
  // Document Management
  fileUrl?: string;
  ocrData?: OCRData;
  imageUrls: string[];
  
  // Bank Matching
  matchedTransactionId?: string;
  matchConfidence?: number;
  matchStatus: MatchStatus;
  matchedAt?: string;
  
  // Audit Trail
  status: ReceiptStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  tags: string[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ReceiptLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax: number;
  category?: string;
  sku?: string;
}

// Bank Integration Types
export interface BankAccount {
  id: string;
  tenantId: string;
  
  // Bank Information
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountNumber: string; // Masked
  accountType: AccountType;
  
  // Connection Details
  connectionStatus: ConnectionStatus;
  lastSyncedAt?: string;
  syncFrequency: SyncFrequency;
  
  // Balance Information
  currentBalance: number;
  availableBalance: number;
  currency: string;
  
  // Plaid/Banking API Integration
  accessToken?: string; // Encrypted
  itemId?: string;
  
  // Settings
  autoMatch: boolean;
  autoSync: boolean;
  matchingRules: MatchingRule[];
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  tenantId: string;
  bankAccountId: string;
  
  // Transaction Details
  transactionId: string; // Bank's transaction ID
  transactionDate: string;
  postingDate: string;
  amount: number;
  currency: string;
  
  // Description and Categorization
  description: string;
  merchantName?: string;
  category?: string[];
  subcategory?: string;
  
  // Location
  location?: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  
  // Payment Details
  paymentMethod?: string;
  paymentChannel?: PaymentChannel;
  referenceNumber?: string;
  
  // Matching Status
  matchedReceiptId?: string;
  matchConfidence?: number;
  matchStatus: MatchStatus;
  matchedAt?: string;
  
  // Audit Fields
  isPending: boolean;
  isReconciled: boolean;
  reconciledAt?: string;
  notes?: string;
  
  // Metadata
  importedAt: string;
  updatedAt: string;
}

// Transaction Matching Types
export interface TransactionMatch {
  id: string;
  tenantId: string;
  
  // Match Details
  transactionId: string;
  receiptId: string;
  
  // Confidence Scoring
  overallConfidence: number;
  amountMatchScore: number;
  dateMatchScore: number;
  vendorMatchScore: number;
  
  // Match Metadata
  matchMethod: MatchMethod;
  matchRules: string[];
  
  // Discrepancies
  discrepancies: MatchDiscrepancy[];
  
  // Approval
  status: MatchApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface MatchDiscrepancy {
  field: string;
  transactionValue: any;
  receiptValue: any;
  difference: number | string;
  severity: 'low' | 'medium' | 'high';
}

export interface MatchingRule {
  id: string;
  name: string;
  description?: string;
  
  // Rule Configuration
  ruleType: 'amount' | 'date' | 'vendor' | 'custom';
  conditions: MatchCondition[];
  
  // Tolerance Settings
  amountTolerance?: number;
  amountToleranceType?: 'fixed' | 'percentage';
  dateTolerance?: number; // Days
  
  // Scoring
  weight: number;
  minimumScore: number;
  
  // Status
  isActive: boolean;
  priority: number;
}

export interface MatchCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'within';
  value: any;
  caseSensitive?: boolean;
}

// Audit Documentation Types
export interface AuditReport {
  id: string;
  tenantId: string;
  
  // Report Details
  reportType: AuditReportType;
  title: string;
  description?: string;
  
  // Period
  startDate: string;
  endDate: string;
  
  // Data Summary
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  totalReceipts: number;
  matchRate: number;
  
  // Financial Summary
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  currency: string;
  
  // Categories Breakdown
  categoryBreakdown: CategorySummary[];
  
  // Compliance Metrics
  complianceScore: number;
  missingReceipts: number;
  duplicateReceipts: number;
  flaggedTransactions: number;
  
  // Audit Trail
  generatedBy: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: AuditReportStatus;
  
  // Export Information
  exportUrl?: string;
  exportFormat?: ExportFormat;
}

export interface CategorySummary {
  category: string;
  transactionCount: number;
  receiptCount: number;
  totalAmount: number;
  matchRate: number;
  topVendors: VendorSummary[];
}

export interface VendorSummary {
  vendor: string;
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
}

export interface AuditTrail {
  id: string;
  tenantId: string;
  
  // Entity Reference
  entityType: 'receipt' | 'transaction' | 'match' | 'report';
  entityId: string;
  
  // Action Details
  action: AuditAction;
  actionBy: string;
  actionAt: string;
  
  // Change Details
  previousValue?: any;
  newValue?: any;
  changeDescription: string;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// OCR and AI Types
export interface OCRData {
  vendor?: string;
  date?: string;
  amount?: number;
  tax?: number;
  total?: number;
  currency?: string;
  items?: OCRLineItem[];
  rawText: string;
  confidence: number;
  provider: 'tesseract' | 'aws-textract' | 'google-vision' | 'azure';
}

export interface OCRLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  confidence: number;
}

// Enums and Constants
export type PaymentMethod = 
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'check'
  | 'digital_wallet'
  | 'cryptocurrency'
  | 'other';

export type ExpenseType = 
  | 'business'
  | 'personal'
  | 'reimbursable'
  | 'non_reimbursable'
  | 'tax_deductible'
  | 'capital';

export type ReceiptStatus = 
  | 'draft'
  | 'pending'
  | 'verified'
  | 'matched'
  | 'archived'
  | 'deleted';

export type VerificationStatus = 
  | 'unverified'
  | 'auto_verified'
  | 'manually_verified'
  | 'failed'
  | 'suspicious';

export type AccountType = 
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment'
  | 'loan'
  | 'mortgage';

export type ConnectionStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'pending'
  | 'expired';

export type SyncFrequency = 
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export type PaymentChannel = 
  | 'online'
  | 'in_store'
  | 'atm'
  | 'pos'
  | 'mobile'
  | 'telephone'
  | 'mail';

export type MatchStatus = 
  | 'unmatched'
  | 'suggested'
  | 'matched'
  | 'confirmed'
  | 'disputed'
  | 'ignored';

export type MatchMethod = 
  | 'exact'
  | 'fuzzy'
  | 'ai'
  | 'manual'
  | 'rule_based';

export type MatchApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'auto_approved';

export type AuditReportType = 
  | 'expense_report'
  | 'tax_report'
  | 'compliance_report'
  | 'reconciliation_report'
  | 'vendor_analysis'
  | 'category_analysis'
  | 'custom';

export type AuditReportStatus = 
  | 'draft'
  | 'generated'
  | 'reviewed'
  | 'approved'
  | 'exported';

export type ExportFormat = 
  | 'pdf'
  | 'excel'
  | 'csv'
  | 'json'
  | 'xml';

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'match'
  | 'unmatch'
  | 'verify'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import';

// API Request/Response Types
export interface CreateReceiptData {
  vendor: string;
  transactionDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  category: string;
  subcategory?: string;
  expenseType: ExpenseType;
  lineItems?: ReceiptLineItem[];
  notes?: string;
  tags?: string[];
}

export interface ConnectBankAccountData {
  publicToken: string; // From Plaid Link
  institutionId: string;
  accountIds: string[];
}

export interface MatchTransactionData {
  transactionId: string;
  receiptId: string;
  confidence?: number;
  notes?: string;
}

export interface GenerateAuditReportData {
  reportType: AuditReportType;
  startDate: string;
  endDate: string;
  includeUnmatched?: boolean;
  categories?: string[];
  exportFormat?: ExportFormat;
}

export interface ReceiptFilters {
  status?: ReceiptStatus[];
  verificationStatus?: VerificationStatus[];
  matchStatus?: MatchStatus[];
  categories?: string[];
  vendors?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  hasReceipt?: boolean;
  tags?: string[];
}

export interface TransactionFilters {
  bankAccountIds?: string[];
  matchStatus?: MatchStatus[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  categories?: string[];
  merchants?: string[];
  isReconciled?: boolean;
}

// Statistics Types
export interface ReceiptStatistics {
  totalReceipts: number;
  totalAmount: number;
  averageAmount: number;
  
  matchedCount: number;
  unmatchedCount: number;
  matchRate: number;
  
  byStatus: Record<ReceiptStatus, number>;
  byCategory: Record<string, { count: number; amount: number }>;
  byVendor: Array<{ vendor: string; count: number; amount: number }>;
  byPaymentMethod: Record<PaymentMethod, number>;
  
  recentActivity: Array<{
    date: string;
    receiptsAdded: number;
    receiptsMatched: number;
  }>;
}

export interface MatchingStatistics {
  totalMatches: number;
  pendingMatches: number;
  approvedMatches: number;
  rejectedMatches: number;
  
  averageConfidence: number;
  highConfidenceMatches: number;
  lowConfidenceMatches: number;
  
  matchMethodDistribution: Record<MatchMethod, number>;
  discrepancyRate: number;
  
  processingTime: {
    average: number;
    median: number;
    p95: number;
  };
}

// Helper Functions
export function calculateMatchConfidence(
  transaction: BankTransaction,
  receipt: Receipt,
  rules: MatchingRule[]
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  // Amount matching
  const amountDiff = Math.abs(transaction.amount - receipt.totalAmount);
  const amountScore = amountDiff === 0 ? 100 : Math.max(0, 100 - (amountDiff * 10));
  totalScore += amountScore * 0.4;
  totalWeight += 0.4;
  
  // Date matching
  const dateDiff = Math.abs(
    new Date(transaction.transactionDate).getTime() - 
    new Date(receipt.transactionDate).getTime()
  ) / (1000 * 60 * 60 * 24); // Days
  const dateScore = dateDiff === 0 ? 100 : Math.max(0, 100 - (dateDiff * 20));
  totalScore += dateScore * 0.3;
  totalWeight += 0.3;
  
  // Vendor matching (fuzzy)
  const vendorSimilarity = calculateStringSimilarity(
    transaction.merchantName || transaction.description,
    receipt.vendor
  );
  totalScore += vendorSimilarity * 0.3;
  totalWeight += 0.3;
  
  return Math.round(totalScore / totalWeight);
}

export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  // Simple Levenshtein distance-based similarity
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(s1, s2);
  return Math.round((1 - distance / maxLen) * 100);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Error Classes
export class ReceiptManagerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ReceiptManagerError';
  }
}

export class BankConnectionError extends ReceiptManagerError {
  constructor(message: string, details?: any) {
    super(message, 'BANK_CONNECTION_ERROR', details);
  }
}

export class MatchingError extends ReceiptManagerError {
  constructor(message: string, details?: any) {
    super(message, 'MATCHING_ERROR', details);
  }
}

export class OCRError extends ReceiptManagerError {
  constructor(message: string, details?: any) {
    super(message, 'OCR_ERROR', details);
  }
}