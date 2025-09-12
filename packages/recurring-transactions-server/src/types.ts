/**
 * Automated Recurring Transactions System
 * 
 * Handles scheduled, automated financial transactions with sophisticated
 * scheduling options, approval workflows, and integration with accounting systems.
 */

export interface RecurringTransaction {
  id: string;
  tenantId: string;
  
  // Template Information
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  
  // Transaction Details
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  
  // Account Information
  fromAccount?: string;
  toAccount?: string;
  chartOfAccountsId: string;
  
  // Scheduling Configuration
  schedule: RecurrenceSchedule;
  startDate: string;
  endDate?: string;
  
  // Status and Control
  status: RecurringTransactionStatus;
  isActive: boolean;
  requiresApproval: boolean;
  
  // Processing Information
  lastProcessedDate?: string;
  nextScheduledDate: string;
  processedCount: number;
  failedCount: number;
  
  // Metadata
  tags: string[];
  notes?: string;
  attachments?: string[];
  
  // Audit Trail
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface RecurrenceSchedule {
  frequency: RecurrenceFrequency;
  interval: number; // Every N periods (e.g., every 2 weeks)
  
  // Advanced scheduling options
  dayOfMonth?: number; // For monthly (e.g., 15th of each month)
  dayOfWeek?: DayOfWeek; // For weekly (e.g., Monday)
  weekOfMonth?: WeekOfMonth; // For monthly (e.g., first Monday)
  monthsOfYear?: number[]; // For yearly (e.g., [1, 7] for Jan and July)
  
  // Business day handling
  businessDaysOnly?: boolean;
  holidayHandling?: HolidayHandling;
  
  // Time zone handling
  timezone?: string;
  time?: string; // HH:MM format for execution time
}

export type RecurrenceFrequency = 
  | 'daily' 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'semiannually' 
  | 'annually'
  | 'custom';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

export type WeekOfMonth = 'first' | 'second' | 'third' | 'fourth' | 'last';

export type HolidayHandling = 'skip' | 'previous' | 'next' | 'ignore';

export type RecurringTransactionStatus = 
  | 'draft'
  | 'active' 
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface ProcessedTransaction {
  id: string;
  tenantId: string;
  recurringTransactionId: string;
  
  // Transaction Details
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  
  // Processing Information
  scheduledDate: string;
  processedDate: string;
  status: ProcessedTransactionStatus;
  
  // Generated Transaction Reference
  transactionId?: string; // Reference to actual financial transaction
  
  // Error Handling
  errorMessage?: string;
  retryCount: number;
  
  // Approval Workflow
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  
  // Metadata
  processingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessedTransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'requires_approval';

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface RecurringTransactionTemplate {
  id: string;
  tenantId: string;
  
  // Template Information
  name: string;
  description?: string;
  category: string;
  
  // Default Values
  defaultAmount?: number;
  defaultCurrency: string;
  defaultType: 'income' | 'expense' | 'transfer';
  defaultSchedule: RecurrenceSchedule;
  
  // Template Settings
  isPublic: boolean;
  usageCount: number;
  
  // Metadata
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  id: string;
  tenantId: string;
  
  // Rule Configuration
  name: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  
  // Status
  isActive: boolean;
  priority: number;
  
  // Statistics
  executionCount: number;
  lastExecutedAt?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'modify_amount' | 'change_account' | 'add_note' | 'require_approval' | 'skip_processing';
  parameters: Record<string, any>;
}

// API Request/Response Types
export interface CreateRecurringTransactionData {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  fromAccount?: string;
  toAccount?: string;
  chartOfAccountsId: string;
  schedule: RecurrenceSchedule;
  startDate: string;
  endDate?: string;
  requiresApproval?: boolean;
  tags?: string[];
  notes?: string;
}

export interface UpdateRecurringTransactionData {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  amount?: number;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
  chartOfAccountsId?: string;
  schedule?: RecurrenceSchedule;
  startDate?: string;
  endDate?: string;
  status?: RecurringTransactionStatus;
  isActive?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
  notes?: string;
}

export interface RecurringTransactionFilters {
  status?: RecurringTransactionStatus[];
  type?: ('income' | 'expense' | 'transfer')[];
  category?: string[];
  isActive?: boolean;
  requiresApproval?: boolean;
  frequency?: RecurrenceFrequency[];
  amountMin?: number;
  amountMax?: number;
  currency?: string[];
  nextScheduledBefore?: string;
  nextScheduledAfter?: string;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
}

export interface RecurringTransactionStats {
  totalActive: number;
  totalPaused: number;
  totalCompleted: number;
  totalFailed: number;
  
  scheduledToday: number;
  scheduledThisWeek: number;
  scheduledThisMonth: number;
  
  processedToday: number;
  processedThisWeek: number;
  processedThisMonth: number;
  
  totalAmountScheduled: Record<string, number>; // by currency
  averageAmount: Record<string, number>;
  
  topCategories: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
  
  frequencyDistribution: Record<RecurrenceFrequency, number>;
  
  upcomingTransactions: ProcessedTransaction[];
  failedTransactions: ProcessedTransaction[];
}

// Processing Engine Types
export interface ProcessingJob {
  id: string;
  tenantId: string;
  recurringTransactionId: string;
  scheduledDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  priority: number;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  shouldRetry: boolean;
  retryAfter?: string;
}

// Notification Types
export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notifyOnApprovalRequired: boolean;
  
  dailySummary: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
}

// Utility Types
export interface SchedulePreview {
  dates: string[];
  count: number;
  totalAmount: number;
  currency: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// Constants
export const RECURRENCE_FREQUENCIES: Record<RecurrenceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannually: 'Semi-annually',
  annually: 'Annually',
  custom: 'Custom'
};

export const TRANSACTION_STATUSES: Record<RecurringTransactionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
  error: 'Error'
};

export const DAYS_OF_WEEK: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

export const WEEKS_OF_MONTH: Record<WeekOfMonth, string> = {
  first: 'First',
  second: 'Second',
  third: 'Third',
  fourth: 'Fourth',
  last: 'Last'
};

// Error Classes
export class RecurringTransactionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RecurringTransactionError';
  }
}

export class ScheduleValidationError extends RecurringTransactionError {
  constructor(message: string, details?: any) {
    super(message, 'SCHEDULE_VALIDATION_ERROR', details);
  }
}

export class ProcessingError extends RecurringTransactionError {
  constructor(message: string, details?: any) {
    super(message, 'PROCESSING_ERROR', details);
  }
}

// Helper Functions
export function calculateNextScheduleDate(
  schedule: RecurrenceSchedule,
  fromDate: Date = new Date()
): Date {
  // Implementation would calculate the next occurrence based on schedule rules
  // This is a placeholder for the actual scheduling logic
  const result = new Date(fromDate);
  
  switch (schedule.frequency) {
    case 'daily':
      result.setDate(result.getDate() + schedule.interval);
      break;
    case 'weekly':
      result.setDate(result.getDate() + (7 * schedule.interval));
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + schedule.interval);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() + (3 * schedule.interval));
      break;
    case 'annually':
      result.setFullYear(result.getFullYear() + schedule.interval);
      break;
  }
  
  return result;
}

export function generateSchedulePreview(
  schedule: RecurrenceSchedule,
  amount: number,
  currency: string,
  startDate: Date,
  endDate?: Date,
  maxCount: number = 10
): SchedulePreview {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  let count = 0;
  
  while (count < maxCount) {
    if (endDate && currentDate > endDate) break;
    
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate = calculateNextScheduleDate(schedule, currentDate);
    count++;
  }
  
  return {
    dates,
    count,
    totalAmount: amount * count,
    currency
  };
}