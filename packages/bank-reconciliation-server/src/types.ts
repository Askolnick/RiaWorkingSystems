// -------------------- Core Bank Reconciliation Types --------------------

export interface BankAccount {
  id: string;
  tenantId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings' | 'credit' | 'line_of_credit' | 'money_market';
  currency: string;
  isActive: boolean;
  
  // Balance tracking
  bookBalance: number;
  bankBalance: number;
  reconciledBalance: number;
  lastReconciliationDate?: string;
  
  // Bank connection (for automated imports)
  bankConnection?: {
    institutionId: string;
    institutionName: string;
    connectionType: 'plaid' | 'yodlee' | 'manual';
    isConnected: boolean;
    lastSyncDate?: string;
    accessToken?: string; // encrypted
  };
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BankTransaction {
  id: string;
  tenantId: string;
  bankAccountId: string;
  
  // Transaction details
  date: string;
  description: string;
  amount: number; // positive for credits, negative for debits
  transactionType: 'debit' | 'credit';
  checkNumber?: string;
  referenceNumber?: string;
  
  // Bank-provided information
  bankTransactionId?: string; // unique ID from bank
  bankCategory?: string;
  bankMemo?: string;
  
  // Reconciliation status
  status: 'unreconciled' | 'matched' | 'reconciled' | 'ignored';
  matchedTransactionId?: string; // ID of matched accounting transaction
  matchConfidence?: number; // 0-100, for AI matching
  
  // Manual reconciliation
  reconciledBy?: string;
  reconciledAt?: string;
  reconciliationNotes?: string;
  
  createdAt: string;
  updatedAt: string;
  importedAt?: string; // when imported from bank
}

export interface ReconciliationSession {
  id: string;
  tenantId: string;
  bankAccountId: string;
  
  // Session details
  sessionName: string;
  startDate: string;
  endDate: string;
  status: 'in_progress' | 'completed' | 'review' | 'approved';
  
  // Balances
  startingBookBalance: number;
  endingBookBalance: number;
  startingBankBalance: number;
  endingBankBalance: number;
  adjustmentAmount: number;
  
  // Reconciliation statistics
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedBankTransactions: number;
  unmatchedBookTransactions: number;
  
  // Review and approval
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationRule {
  id: string;
  tenantId: string;
  
  // Rule configuration
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // higher number = higher priority
  
  // Matching criteria
  criteria: {
    amountRange?: { min?: number; max?: number };
    amountExact?: number;
    descriptionContains?: string[];
    descriptionRegex?: string;
    dateRange?: { daysBeforeAfter: number };
    bankCategory?: string[];
    checkNumberRange?: { min?: number; max?: number };
  };
  
  // Actions
  actions: {
    autoMatch: boolean;
    autoReconcile: boolean;
    setCategory?: string;
    addNote?: string;
    requireApproval?: boolean;
  };
  
  // Statistics
  timesApplied: number;
  lastAppliedAt?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankStatementImport {
  id: string;
  tenantId: string;
  bankAccountId: string;
  
  // Import details
  fileName: string;
  fileType: 'csv' | 'qif' | 'ofx' | 'mt940' | 'json';
  fileSize: number;
  importMethod: 'manual_upload' | 'bank_api' | 'email' | 'sftp';
  
  // Processing status
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'partial';
  
  // Results
  totalRows: number;
  processedRows: number;
  successfulImports: number;
  skippedRows: number;
  errorRows: number;
  
  // Date range of imported transactions
  startDate?: string;
  endDate?: string;
  
  // Error details
  errors?: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
  
  // Preview data (first 10 rows)
  preview?: Array<Record<string, any>>;
  
  importedBy: string;
  importedAt: string;
  processedAt?: string;
}

export interface ReconciliationMatch {
  id: string;
  tenantId: string;
  reconciliationSessionId: string;
  
  // Matched items
  bankTransactionId: string;
  bookTransactionId?: string; // accounting system transaction
  
  // Match details
  matchType: 'automatic' | 'manual' | 'suggested';
  matchConfidence: number; // 0-100
  matchReason: string;
  
  // Differences (if any)
  amountDifference?: number;
  dateDifference?: number; // days
  descriptionSimilarity?: number; // 0-100
  
  // Status
  status: 'matched' | 'reconciled' | 'disputed' | 'unmatched';
  
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankReconciliationAdjustment {
  id: string;
  tenantId: string;
  reconciliationSessionId: string;
  bankAccountId: string;
  
  // Adjustment details
  type: 'bank_error' | 'book_error' | 'outstanding_check' | 'deposit_in_transit' | 'bank_fee' | 'interest' | 'other';
  description: string;
  amount: number;
  date: string;
  
  // Supporting information
  referenceNumber?: string;
  supportingDocuments?: string[]; // file URLs
  
  // Approval workflow
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNotes?: string;
  
  // Journal entry (if created)
  journalEntryId?: string;
}

// -------------------- Analytics and Reporting Types --------------------

export interface ReconciliationAnalytics {
  tenantId: string;
  bankAccountId: string;
  periodStart: string;
  periodEnd: string;
  
  // Reconciliation performance
  reconciliationFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    average: number;
  };
  
  // Matching statistics
  matchingStats: {
    totalTransactions: number;
    automaticMatches: number;
    manualMatches: number;
    unmatchedTransactions: number;
    averageMatchConfidence: number;
  };
  
  // Time analysis
  timeToReconcile: {
    averageDays: number;
    medianDays: number;
    longestDelay: number;
    shortestDelay: number;
  };
  
  // Exception analysis
  exceptions: {
    totalExceptions: number;
    bankErrors: number;
    bookErrors: number;
    outstandingItems: number;
    adjustments: number;
  };
  
  // Trends
  trends: Array<{
    date: string;
    reconciledAmount: number;
    exceptionsCount: number;
    averageMatchTime: number;
  }>;
}

export interface OutstandingItem {
  id: string;
  tenantId: string;
  bankAccountId: string;
  
  // Item details
  type: 'outstanding_check' | 'deposit_in_transit' | 'bank_transfer' | 'ach_payment' | 'wire_transfer';
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  
  // Reference information
  checkNumber?: string;
  payee?: string;
  referenceNumber?: string;
  
  // Status tracking
  status: 'outstanding' | 'cleared' | 'void' | 'cancelled';
  clearedDate?: string;
  clearedAmount?: number;
  
  // Aging
  daysOutstanding: number;
  ageCategory: '0-30' | '31-60' | '61-90' | '90+';
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Configuration Types --------------------

export interface BankReconciliationSettings {
  tenantId: string;
  
  // General settings
  defaultReconciliationFrequency: 'daily' | 'weekly' | 'monthly';
  autoReconciliationEnabled: boolean;
  requireApprovalForAdjustments: boolean;
  
  // Matching settings
  autoMatchingEnabled: boolean;
  matchToleranceAmount: number; // dollar amount
  matchTolerancePercentage: number; // percentage
  dateTolerance: number; // days
  
  // Outstanding items
  outstandingCheckClearanceDays: number;
  depositInTransitDays: number;
  autoVoidOldChecks: boolean;
  autoVoidDays: number;
  
  // Notifications
  notifications: {
    reconciliationOverdue: boolean;
    largeAdjustments: boolean;
    unmatchedTransactions: boolean;
    exceptionThreshold: number;
  };
  
  // Integration settings
  bankConnectionSettings: {
    autoImportEnabled: boolean;
    importFrequency: 'real_time' | 'hourly' | 'daily';
    duplicateHandling: 'skip' | 'merge' | 'create_new';
  };
  
  updatedBy: string;
  updatedAt: string;
}

// -------------------- Bank Connection Types --------------------

export interface BankConnectionInstitution {
  id: string;
  name: string;
  type: 'bank' | 'credit_union' | 'credit_card' | 'investment' | 'loan';
  country: string;
  logo?: string;
  websiteUrl?: string;
  
  // Connection capabilities
  supportsTransactions: boolean;
  supportsBalances: boolean;
  supportsIdentity: boolean;
  supportsInvestments: boolean;
  
  // API details
  provider: 'plaid' | 'yodlee' | 'mx' | 'finicity';
  institutionCode: string;
  
  // Status
  isActive: boolean;
  maintenanceSchedule?: Array<{
    startTime: string;
    endTime: string;
    timezone: string;
    recurring: 'daily' | 'weekly' | 'monthly';
  }>;
}

export interface BankConnectionHealth {
  bankAccountId: string;
  status: 'healthy' | 'degraded' | 'error' | 'disconnected';
  lastSuccessfulSync: string;
  lastSyncAttempt: string;
  
  // Error details
  errorCode?: string;
  errorMessage?: string;
  errorType?: 'credentials' | 'mfa' | 'institution' | 'network' | 'rate_limit';
  
  // Performance metrics
  averageSyncTime: number; // seconds
  successRate: number; // percentage over last 30 days
  
  // Next actions
  nextSyncScheduled?: string;
  requiresUserAction?: boolean;
  userActionType?: 'update_credentials' | 'complete_mfa' | 'reauthorize';
}

// -------------------- Import/Export Types --------------------

export interface BankStatementFormat {
  name: string;
  fileType: 'csv' | 'qif' | 'ofx' | 'mt940';
  
  // Field mapping for CSV
  fieldMapping?: {
    date: string;
    description: string;
    amount: string;
    balance?: string;
    transactionType?: string;
    checkNumber?: string;
    reference?: string;
  };
  
  // Format specifications
  dateFormat: string;
  amountFormat: 'positive_negative' | 'separate_columns' | 'credit_debit_indicators';
  encoding: 'utf-8' | 'latin-1' | 'windows-1252';
  delimiter?: ',' | ';' | '\t' | '|';
  hasHeader: boolean;
  
  // Validation rules
  validationRules?: {
    requiredFields: string[];
    amountValidation: 'numeric' | 'currency';
    dateValidation: 'strict' | 'flexible';
  };
}

export interface ReconciliationExport {
  reconciliationSessionId: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  
  // Export options
  includeMatched: boolean;
  includeUnmatched: boolean;
  includeAdjustments: boolean;
  includeOutstandingItems: boolean;
  
  // Customization
  template?: string;
  customFields?: string[];
  
  // Generated file
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  
  exportedBy: string;
  exportedAt: string;
}