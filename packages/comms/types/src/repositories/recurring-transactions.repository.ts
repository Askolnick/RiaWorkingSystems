import { BaseRepository, MockRepository, PaginatedResponse, QueryParams } from './base.repository';

// Types from recurring-transactions-server
export interface RecurringTransaction {
  id: string;
  tenantId: string;
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
  status: RecurringTransactionStatus;
  isActive: boolean;
  requiresApproval: boolean;
  lastProcessedDate?: string;
  nextScheduledDate: string;
  processedCount: number;
  failedCount: number;
  tags: string[];
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface RecurrenceSchedule {
  frequency: RecurrenceFrequency;
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: DayOfWeek;
  weekOfMonth?: WeekOfMonth;
  monthsOfYear?: number[];
  businessDaysOnly?: boolean;
  holidayHandling?: HolidayHandling;
  timezone?: string;
  time?: string;
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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  scheduledDate: string;
  processedDate: string;
  status: ProcessedTransactionStatus;
  transactionId?: string;
  errorMessage?: string;
  retryCount: number;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
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

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface RecurringTransactionTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: string;
  defaultAmount?: number;
  defaultCurrency: string;
  defaultType: 'income' | 'expense' | 'transfer';
  defaultSchedule: RecurrenceSchedule;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface RecurringTransactionFilters extends QueryParams {
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
  totalAmountScheduled: Record<string, number>;
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

export interface SchedulePreview {
  dates: string[];
  count: number;
  totalAmount: number;
  currency: string;
}

/**
 * Production repository for recurring transactions
 */
export class RecurringTransactionsRepository extends BaseRepository<
  RecurringTransaction,
  CreateRecurringTransactionData,
  UpdateRecurringTransactionData
> {
  protected endpoint = '/recurring-transactions';

  async getWithFilters(filters: RecurringTransactionFilters): Promise<PaginatedResponse<RecurringTransaction>> {
    const queryString = this.buildQueryString(filters);
    return this.request<PaginatedResponse<RecurringTransaction>>('GET', `/filter${queryString}`);
  }

  async getProcessedTransactions(recurringTransactionId: string): Promise<ProcessedTransaction[]> {
    return this.request<ProcessedTransaction[]>('GET', `/${recurringTransactionId}/processed`);
  }

  async getTemplates(): Promise<RecurringTransactionTemplate[]> {
    return this.request<RecurringTransactionTemplate[]>('GET', '/templates');
  }

  async createFromTemplate(templateId: string, data: Partial<CreateRecurringTransactionData>): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>('POST', `/templates/${templateId}/create`, data);
  }

  async previewSchedule(schedule: RecurrenceSchedule, amount: number, currency: string, startDate: string, endDate?: string): Promise<SchedulePreview> {
    return this.request<SchedulePreview>('POST', '/schedule/preview', {
      schedule,
      amount,
      currency,
      startDate,
      endDate
    });
  }

  async getStats(): Promise<RecurringTransactionStats> {
    return this.request<RecurringTransactionStats>('GET', '/stats');
  }

  async pause(id: string): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>('POST', `/${id}/pause`);
  }

  async resume(id: string): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>('POST', `/${id}/resume`);
  }

  async cancel(id: string): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>('POST', `/${id}/cancel`);
  }

  async processNow(id: string): Promise<ProcessedTransaction> {
    return this.request<ProcessedTransaction>('POST', `/${id}/process-now`);
  }

  async approveProcessedTransaction(processedTransactionId: string, notes?: string): Promise<ProcessedTransaction> {
    return this.request<ProcessedTransaction>('POST', `/processed/${processedTransactionId}/approve`, { notes });
  }

  async rejectProcessedTransaction(processedTransactionId: string, reason: string): Promise<ProcessedTransaction> {
    return this.request<ProcessedTransaction>('POST', `/processed/${processedTransactionId}/reject`, { reason });
  }
}

/**
 * Mock repository for development
 */
export class MockRecurringTransactionsRepository extends MockRepository<
  RecurringTransaction,
  CreateRecurringTransactionData,
  UpdateRecurringTransactionData
> {
  protected storageKey = 'ria_recurring_transactions';
  protected endpoint = '/recurring-transactions';

  private mockProcessedTransactions: ProcessedTransaction[] = [
    {
      id: 'pt-1',
      tenantId: 'tenant-1',
      recurringTransactionId: 'rt-1',
      amount: 2500.00,
      currency: 'USD',
      type: 'income',
      scheduledDate: '2024-09-01',
      processedDate: '2024-09-01T09:00:00Z',
      status: 'completed',
      transactionId: 'txn-001',
      retryCount: 0,
      approvalStatus: 'approved',
      approvedBy: 'user-1',
      approvedAt: '2024-09-01T08:55:00Z',
      createdAt: '2024-09-01T08:45:00Z',
      updatedAt: '2024-09-01T09:00:00Z'
    },
    {
      id: 'pt-2',
      tenantId: 'tenant-1',
      recurringTransactionId: 'rt-2',
      amount: 1200.00,
      currency: 'USD',
      type: 'expense',
      scheduledDate: '2024-09-10',
      processedDate: '2024-09-10T10:00:00Z',
      status: 'completed',
      transactionId: 'txn-002',
      retryCount: 0,
      createdAt: '2024-09-10T09:45:00Z',
      updatedAt: '2024-09-10T10:00:00Z'
    },
    {
      id: 'pt-3',
      tenantId: 'tenant-1',
      recurringTransactionId: 'rt-3',
      amount: 500.00,
      currency: 'USD',
      type: 'expense',
      scheduledDate: '2024-09-15',
      processedDate: '2024-09-15T11:00:00Z',
      status: 'failed',
      errorMessage: 'Insufficient funds in source account',
      retryCount: 2,
      createdAt: '2024-09-15T10:45:00Z',
      updatedAt: '2024-09-15T11:30:00Z'
    }
  ];

  private mockTemplates: RecurringTransactionTemplate[] = [
    {
      id: 'template-1',
      tenantId: 'tenant-1',
      name: 'Monthly Salary',
      description: 'Standard monthly salary payment template',
      category: 'Salary',
      defaultAmount: 5000.00,
      defaultCurrency: 'USD',
      defaultType: 'income',
      defaultSchedule: {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 1,
        businessDaysOnly: true,
        holidayHandling: 'next',
        time: '09:00'
      },
      isPublic: true,
      usageCount: 25,
      tags: ['salary', 'income', 'standard'],
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-2',
      tenantId: 'tenant-1',
      name: 'Office Rent',
      description: 'Monthly office rent payment',
      category: 'Rent',
      defaultAmount: 3000.00,
      defaultCurrency: 'USD',
      defaultType: 'expense',
      defaultSchedule: {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 1,
        time: '10:00'
      },
      isPublic: true,
      usageCount: 18,
      tags: ['rent', 'expense', 'office'],
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-3',
      tenantId: 'tenant-1',
      name: 'Quarterly Tax Payment',
      description: 'Estimated quarterly tax payment',
      category: 'Taxes',
      defaultAmount: 2500.00,
      defaultCurrency: 'USD',
      defaultType: 'expense',
      defaultSchedule: {
        frequency: 'quarterly',
        interval: 1,
        dayOfMonth: 15,
        time: '14:00'
      },
      isPublic: true,
      usageCount: 8,
      tags: ['taxes', 'quarterly', 'expense'],
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  private mockRecurringTransactions: RecurringTransaction[] = [
    {
      id: 'rt-1',
      tenantId: 'tenant-1',
      name: 'Monthly Client Retainer - Acme Corp',
      description: 'Regular monthly retainer payment from Acme Corporation',
      category: 'Client Payments',
      subcategory: 'Retainers',
      amount: 2500.00,
      currency: 'USD',
      type: 'income',
      toAccount: 'acc-business-checking',
      chartOfAccountsId: 'coa-client-income',
      schedule: {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 1,
        businessDaysOnly: true,
        holidayHandling: 'next',
        timezone: 'America/New_York',
        time: '09:00'
      },
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      isActive: true,
      requiresApproval: true,
      lastProcessedDate: '2024-09-01',
      nextScheduledDate: '2024-10-01',
      processedCount: 9,
      failedCount: 0,
      tags: ['client', 'retainer', 'acme'],
      notes: 'High-value client - priority processing',
      createdBy: 'user-1',
      createdAt: '2023-12-15T10:00:00Z',
      updatedBy: 'user-1',
      updatedAt: '2024-08-15T14:30:00Z'
    },
    {
      id: 'rt-2',
      tenantId: 'tenant-1',
      name: 'Office Rent Payment',
      description: 'Monthly office space rental payment',
      category: 'Operating Expenses',
      subcategory: 'Rent',
      amount: 1200.00,
      currency: 'USD',
      type: 'expense',
      fromAccount: 'acc-business-checking',
      toAccount: 'vendor-landlord',
      chartOfAccountsId: 'coa-rent-expense',
      schedule: {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 1,
        time: '10:00'
      },
      startDate: '2024-01-01',
      status: 'active',
      isActive: true,
      requiresApproval: false,
      lastProcessedDate: '2024-09-01',
      nextScheduledDate: '2024-10-01',
      processedCount: 9,
      failedCount: 0,
      tags: ['rent', 'office', 'fixed-cost'],
      createdBy: 'user-2',
      createdAt: '2023-12-20T15:00:00Z',
      updatedBy: 'user-2',
      updatedAt: '2023-12-20T15:00:00Z'
    },
    {
      id: 'rt-3',
      tenantId: 'tenant-1',
      name: 'Software Subscriptions',
      description: 'Monthly software subscription payments',
      category: 'Operating Expenses',
      subcategory: 'Software',
      amount: 500.00,
      currency: 'USD',
      type: 'expense',
      fromAccount: 'acc-business-checking',
      chartOfAccountsId: 'coa-software-expense',
      schedule: {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
        time: '11:00'
      },
      startDate: '2024-01-15',
      status: 'active',
      isActive: true,
      requiresApproval: false,
      lastProcessedDate: '2024-09-15',
      nextScheduledDate: '2024-10-15',
      processedCount: 8,
      failedCount: 1,
      tags: ['software', 'subscriptions', 'tools'],
      notes: 'Bundle includes CRM, accounting, and project management tools',
      createdBy: 'user-1',
      createdAt: '2024-01-10T12:00:00Z',
      updatedBy: 'user-1',
      updatedAt: '2024-07-15T16:20:00Z'
    },
    {
      id: 'rt-4',
      tenantId: 'tenant-1',
      name: 'Weekly Team Lunch',
      description: 'Weekly team building lunch expense',
      category: 'Employee Benefits',
      subcategory: 'Meals',
      amount: 150.00,
      currency: 'USD',
      type: 'expense',
      fromAccount: 'acc-business-checking',
      chartOfAccountsId: 'coa-meals-expense',
      schedule: {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 5, // Friday
        time: '12:00'
      },
      startDate: '2024-01-05',
      status: 'paused',
      isActive: false,
      requiresApproval: false,
      lastProcessedDate: '2024-08-30',
      nextScheduledDate: '2024-10-04',
      processedCount: 34,
      failedCount: 0,
      tags: ['team', 'lunch', 'benefits'],
      notes: 'Temporarily paused due to remote work policy',
      createdBy: 'user-3',
      createdAt: '2024-01-02T09:00:00Z',
      updatedBy: 'user-1',
      updatedAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'rt-5',
      tenantId: 'tenant-1',
      name: 'Quarterly Insurance Premium',
      description: 'Business liability insurance quarterly payment',
      category: 'Insurance',
      subcategory: 'Liability',
      amount: 750.00,
      currency: 'USD',
      type: 'expense',
      fromAccount: 'acc-business-checking',
      chartOfAccountsId: 'coa-insurance-expense',
      schedule: {
        frequency: 'quarterly',
        interval: 1,
        dayOfMonth: 1,
        time: '14:00'
      },
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      status: 'active',
      isActive: true,
      requiresApproval: true,
      lastProcessedDate: '2024-07-01',
      nextScheduledDate: '2024-10-01',
      processedCount: 3,
      failedCount: 0,
      tags: ['insurance', 'quarterly', 'liability'],
      createdBy: 'user-2',
      createdAt: '2023-12-28T11:00:00Z',
      updatedBy: 'user-2',
      updatedAt: '2023-12-28T11:00:00Z'
    }
  ];

  constructor() {
    super();
    this.loadMockData();
  }

  private loadMockData() {
    if (!this.getStorage().length) {
      this.setStorage(this.mockRecurringTransactions);
    }
  }

  async getWithFilters(filters: RecurringTransactionFilters): Promise<PaginatedResponse<RecurringTransaction>> {
    await this.simulateDelay();
    
    let items = this.getStorage();
    
    // Apply specific filters
    if (filters.status?.length) {
      items = items.filter(item => filters.status!.includes(item.status));
    }
    
    if (filters.type?.length) {
      items = items.filter(item => filters.type!.includes(item.type));
    }
    
    if (filters.category?.length) {
      items = items.filter(item => filters.category!.includes(item.category));
    }
    
    if (filters.isActive !== undefined) {
      items = items.filter(item => item.isActive === filters.isActive);
    }
    
    if (filters.requiresApproval !== undefined) {
      items = items.filter(item => item.requiresApproval === filters.requiresApproval);
    }
    
    if (filters.frequency?.length) {
      items = items.filter(item => filters.frequency!.includes(item.schedule.frequency));
    }
    
    if (filters.amountMin !== undefined) {
      items = items.filter(item => item.amount >= filters.amountMin!);
    }
    
    if (filters.amountMax !== undefined) {
      items = items.filter(item => item.amount <= filters.amountMax!);
    }
    
    if (filters.currency?.length) {
      items = items.filter(item => filters.currency!.includes(item.currency));
    }
    
    if (filters.tags?.length) {
      items = items.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }
    
    // Apply base filters from parent
    const baseResult = await this.findAll(filters);
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);
    
    return {
      data: paginatedItems,
      total: items.length,
      page,
      limit,
      hasMore: start + limit < items.length
    };
  }

  async getProcessedTransactions(recurringTransactionId: string): Promise<ProcessedTransaction[]> {
    await this.simulateDelay();
    return this.mockProcessedTransactions.filter(
      pt => pt.recurringTransactionId === recurringTransactionId
    );
  }

  async getTemplates(): Promise<RecurringTransactionTemplate[]> {
    await this.simulateDelay();
    return [...this.mockTemplates];
  }

  async createFromTemplate(templateId: string, data: Partial<CreateRecurringTransactionData>): Promise<RecurringTransaction> {
    await this.simulateDelay();
    
    const template = this.mockTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newTransaction: RecurringTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      tenantId: 'tenant-1',
      name: data.name || template.name,
      description: data.description || template.description,
      category: data.category || template.category,
      subcategory: data.subcategory,
      amount: data.amount || template.defaultAmount || 0,
      currency: data.currency || template.defaultCurrency,
      type: data.type || template.defaultType,
      fromAccount: data.fromAccount,
      toAccount: data.toAccount,
      chartOfAccountsId: data.chartOfAccountsId || 'default-coa',
      schedule: data.schedule || template.defaultSchedule,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      status: 'draft',
      isActive: false,
      requiresApproval: data.requiresApproval || false,
      nextScheduledDate: data.startDate || new Date().toISOString().split('T')[0],
      processedCount: 0,
      failedCount: 0,
      tags: data.tags || [],
      notes: data.notes,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedBy: 'user-1',
      updatedAt: new Date().toISOString()
    };

    const items = this.getStorage();
    items.push(newTransaction);
    this.setStorage(items);
    
    // Increment template usage
    template.usageCount++;

    return newTransaction;
  }

  async previewSchedule(
    schedule: RecurrenceSchedule, 
    amount: number, 
    currency: string, 
    startDate: string, 
    endDate?: string
  ): Promise<SchedulePreview> {
    await this.simulateDelay();

    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;
    let count = 0;
    const maxCount = 10;

    while (count < maxCount) {
      if (endDateObj && currentDate > endDateObj) break;

      dates.push(currentDate.toISOString().split('T')[0]);
      
      // Calculate next date based on frequency
      switch (schedule.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + schedule.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * schedule.interval));
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + (14 * schedule.interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + schedule.interval);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + (3 * schedule.interval));
          break;
        case 'semiannually':
          currentDate.setMonth(currentDate.getMonth() + (6 * schedule.interval));
          break;
        case 'annually':
          currentDate.setFullYear(currentDate.getFullYear() + schedule.interval);
          break;
      }
      
      count++;
    }

    return {
      dates,
      count,
      totalAmount: amount * count,
      currency
    };
  }

  async getStats(): Promise<RecurringTransactionStats> {
    await this.simulateDelay();
    
    const items = this.getStorage();
    const processedTransactions = this.mockProcessedTransactions;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalActive: items.filter(item => item.status === 'active').length,
      totalPaused: items.filter(item => item.status === 'paused').length,
      totalCompleted: items.filter(item => item.status === 'completed').length,
      totalFailed: items.filter(item => item.status === 'error').length,
      
      scheduledToday: items.filter(item => item.nextScheduledDate === today).length,
      scheduledThisWeek: items.filter(item => {
        const scheduleDate = new Date(item.nextScheduledDate);
        return scheduleDate >= thisWeekStart && scheduleDate <= now;
      }).length,
      scheduledThisMonth: items.filter(item => {
        const scheduleDate = new Date(item.nextScheduledDate);
        return scheduleDate >= thisMonthStart && scheduleDate <= now;
      }).length,

      processedToday: processedTransactions.filter(pt => 
        pt.processedDate.startsWith(today)
      ).length,
      processedThisWeek: processedTransactions.filter(pt => {
        const processedDate = new Date(pt.processedDate);
        return processedDate >= thisWeekStart && processedDate <= now;
      }).length,
      processedThisMonth: processedTransactions.filter(pt => {
        const processedDate = new Date(pt.processedDate);
        return processedDate >= thisMonthStart && processedDate <= now;
      }).length,

      totalAmountScheduled: {
        USD: items
          .filter(item => item.currency === 'USD' && item.isActive)
          .reduce((sum, item) => sum + item.amount, 0)
      },
      averageAmount: {
        USD: items
          .filter(item => item.currency === 'USD')
          .reduce((sum, item) => sum + item.amount, 0) / 
          items.filter(item => item.currency === 'USD').length
      },

      topCategories: [
        { category: 'Client Payments', count: 1, totalAmount: 2500.00 },
        { category: 'Operating Expenses', count: 2, totalAmount: 1700.00 },
        { category: 'Employee Benefits', count: 1, totalAmount: 150.00 },
        { category: 'Insurance', count: 1, totalAmount: 750.00 }
      ],

      frequencyDistribution: {
        daily: 0,
        weekly: 1,
        biweekly: 0,
        monthly: 3,
        quarterly: 1,
        semiannually: 0,
        annually: 0,
        custom: 0
      },

      upcomingTransactions: processedTransactions.filter(pt => 
        pt.status === 'pending' || pt.status === 'processing'
      ),
      failedTransactions: processedTransactions.filter(pt => 
        pt.status === 'failed'
      )
    };
  }

  async pause(id: string): Promise<RecurringTransaction> {
    await this.simulateDelay();
    return this.update(id, { status: 'paused', isActive: false });
  }

  async resume(id: string): Promise<RecurringTransaction> {
    await this.simulateDelay();
    return this.update(id, { status: 'active', isActive: true });
  }

  async cancel(id: string): Promise<RecurringTransaction> {
    await this.simulateDelay();
    return this.update(id, { status: 'cancelled', isActive: false });
  }

  async processNow(id: string): Promise<ProcessedTransaction> {
    await this.simulateDelay();
    
    const item = await this.findById(id);
    const newProcessedTransaction: ProcessedTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      tenantId: item.tenantId,
      recurringTransactionId: id,
      amount: item.amount,
      currency: item.currency,
      type: item.type,
      scheduledDate: new Date().toISOString().split('T')[0],
      processedDate: new Date().toISOString(),
      status: 'processing',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockProcessedTransactions.push(newProcessedTransaction);
    return newProcessedTransaction;
  }

  async approveProcessedTransaction(processedTransactionId: string, notes?: string): Promise<ProcessedTransaction> {
    await this.simulateDelay();
    
    const transaction = this.mockProcessedTransactions.find(pt => pt.id === processedTransactionId);
    if (!transaction) {
      throw new Error('Processed transaction not found');
    }

    transaction.approvalStatus = 'approved';
    transaction.approvedBy = 'user-1';
    transaction.approvedAt = new Date().toISOString();
    transaction.status = 'completed';
    transaction.processingNotes = notes;
    transaction.updatedAt = new Date().toISOString();

    return transaction;
  }

  async rejectProcessedTransaction(processedTransactionId: string, reason: string): Promise<ProcessedTransaction> {
    await this.simulateDelay();
    
    const transaction = this.mockProcessedTransactions.find(pt => pt.id === processedTransactionId);
    if (!transaction) {
      throw new Error('Processed transaction not found');
    }

    transaction.approvalStatus = 'rejected';
    transaction.status = 'cancelled';
    transaction.processingNotes = reason;
    transaction.updatedAt = new Date().toISOString();

    return transaction;
  }
}

// Export the appropriate implementation
export const recurringTransactionsRepository = new MockRecurringTransactionsRepository();