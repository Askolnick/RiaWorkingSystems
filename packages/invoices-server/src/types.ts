// -------------------- Core Types --------------------

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash' | 'check' | 'other';
export type InvoiceActivityType = 'created' | 'sent' | 'viewed' | 'payment_received' | 'payment_failed' | 'reminded' | 'cancelled' | 'refunded' | 'updated' | 'note_added';
export type ReminderType = 'before_due' | 'on_due_date' | 'after_due' | 'custom';

export interface InvoiceAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  number: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: InvoiceAddress;
  
  // Invoice Details
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  
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
  footer?: string;
  
  // Settings
  sendReminders: boolean;
  allowPartialPay: boolean;
  requireSignature: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
}

export interface InvoiceItem {
  id: string;
  tenantId: string;
  invoiceId: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  category?: string;
  sortOrder: number;
}

export interface InvoicePayment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  paymentDate: string;
  processedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceActivity {
  id: string;
  tenantId: string;
  invoiceId: string;
  type: InvoiceActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
}

export interface InvoiceReminder {
  id: string;
  tenantId: string;
  invoiceId: string;
  type: ReminderType;
  daysOffset: number;
  subject: string;
  message: string;
  sent: boolean;
  sentAt?: string;
  scheduledAt: string;
  createdAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface InvoiceWithRelations extends Invoice {
  items: InvoiceItem[];
  payments: InvoicePayment[];
  activities: InvoiceActivity[];
  reminders: InvoiceReminder[];
  totalPayments: number;
  isOverdue: boolean;
  daysPastDue: number;
}

// -------------------- Create/Update Types --------------------

export interface CreateInvoiceData {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: InvoiceAddress;
  dueDate: string;
  description?: string;
  notes?: string;
  terms?: string;
  footer?: string;
  currency?: string;
  taxRate?: number;
  discountAmount?: number;
  sendReminders?: boolean;
  allowPartialPay?: boolean;
  requireSignature?: boolean;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
}

export interface CreateInvoiceItemData {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  category?: string;
  sortOrder?: number;
}

export interface UpdateInvoiceItemData extends Partial<CreateInvoiceItemData> {
  id?: string;
}

export interface CreateInvoicePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentDate?: string;
}

export interface UpdateInvoicePaymentData extends Partial<CreateInvoicePaymentData> {
  status?: PaymentStatus;
  processedAt?: string;
}

export interface CreateInvoiceReminderData {
  invoiceId: string;
  type: ReminderType;
  daysOffset: number;
  subject: string;
  message: string;
  scheduledAt?: string;
}

// -------------------- Filter/Search Types --------------------

export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  clientId?: string;
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  isOverdue?: boolean;
  search?: string;
  createdBy?: string;
}

export interface PaymentFilters {
  invoiceId?: string;
  status?: PaymentStatus | PaymentStatus[];
  method?: PaymentMethod | PaymentMethod[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface InvoiceSort {
  field: keyof Invoice | 'number' | 'clientName' | 'total' | 'balanceDue' | 'dueDate';
  direction: 'asc' | 'desc';
}

// -------------------- Stats Types --------------------

export interface InvoiceStats {
  totalInvoices: number;
  totalDrafts: number;
  totalSent: number;
  totalPaid: number;
  totalOverdue: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  averageInvoiceValue: number;
  averagePaymentTime: number; // days
  paymentSuccessRate: number; // percentage
  recentInvoices: Invoice[];
  topClients: Array<{
    clientId?: string;
    clientName: string;
    totalInvoices: number;
    totalAmount: number;
    totalPaid: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    invoiceCount: number;
  }>;
  statusDistribution: Array<{
    status: InvoiceStatus;
    count: number;
    totalAmount: number;
  }>;
  paymentMethodStats: Array<{
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }>;
}

export interface InvoiceAnalytics {
  revenueTrend: Array<{
    date: string;
    revenue: number;
    invoiceCount: number;
    averageValue: number;
  }>;
  collectionEfficiency: Array<{
    month: string;
    sent: number;
    paid: number;
    overdue: number;
    efficiency: number;
  }>;
  clientAnalytics: Array<{
    clientId?: string;
    clientName: string;
    totalInvoiced: number;
    totalPaid: number;
    averagePaymentDays: number;
    riskScore: number;
  }>;
  seasonalPatterns: Array<{
    month: number;
    averageRevenue: number;
    averageInvoiceCount: number;
    paymentRate: number;
  }>;
}

// -------------------- Templates and Settings --------------------

export interface InvoiceTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  
  // Template content
  terms?: string;
  footer?: string;
  notes?: string;
  
  // Default settings
  currency: string;
  taxRate: number;
  paymentTerms: number; // days
  sendReminders: boolean;
  allowPartialPay: boolean;
  requireSignature: boolean;
  
  // Design settings
  logoUrl?: string;
  primaryColor?: string;
  fontFamily?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSettings {
  tenantId: string;
  
  // Numbering
  invoicePrefix: string;
  nextInvoiceNumber: number;
  numberFormat: string; // e.g., "INV-{YYYY}-{####}"
  
  // Default values
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultPaymentTerms: number;
  defaultTemplateId?: string;
  
  // Payment settings
  acceptedPaymentMethods: PaymentMethod[];
  paymentInstructions?: string;
  lateFeePercentage: number;
  lateFeeAmount: number;
  
  // Reminder settings
  sendAutomaticReminders: boolean;
  reminderDaysBefore: number[];
  reminderDaysAfter: number[];
  
  // Email settings
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  
  // Company information
  companyName: string;
  companyAddress: InvoiceAddress;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxId?: string;
  
  updatedBy: string;
  updatedAt: string;
}

// -------------------- Export Types --------------------

export interface InvoiceExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  invoiceIds?: string[];
  filters?: InvoiceFilters;
  includeItems: boolean;
  includePayments: boolean;
  includeActivities: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface BulkInvoiceAction {
  action: 'send' | 'mark_paid' | 'cancel' | 'delete' | 'duplicate' | 'export';
  invoiceIds: string[];
  parameters?: Record<string, any>;
}

// -------------------- Validation Types --------------------

export interface InvoiceValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  canProcess: boolean;
  suggestedAmount?: number;
}

// -------------------- Integration Types --------------------

export interface PaymentGatewayConfig {
  provider: 'stripe' | 'paypal' | 'square' | 'braintree';
  apiKey: string;
  webhookSecret?: string;
  enabled: boolean;
  supportedMethods: PaymentMethod[];
}

export interface InvoiceWebhook {
  id: string;
  tenantId: string;
  url: string;
  events: InvoiceActivityType[];
  secret?: string;
  enabled: boolean;
  lastTriggered?: string;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Reporting Types --------------------

export interface InvoiceReport {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'aging' | 'revenue' | 'client' | 'custom';
  filters: InvoiceFilters;
  groupBy: string[];
  sortBy: InvoiceSort[];
  columns: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceReportResult {
  reportId: string;
  generatedAt: string;
  totalRows: number;
  summary: Record<string, any>;
  data: Record<string, any>[];
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: any[];
  }>;
}