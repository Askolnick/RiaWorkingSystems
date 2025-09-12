import { BaseRepository, MockRepository } from './base.repository';
import type {
  Expense,
  ExpenseWithReceipts,
  ExpenseWithRelations,
  ExpenseReceipt,
  ExpenseReimbursement,
  ExpenseActivity,
  ExpenseApproval,
  ExpenseCategory,
  ExpenseStats,
  ExpenseAnalytics,
  ExpenseSettings,
  CreateExpenseData,
  UpdateExpenseData,
  CreateReimbursementData,
  UpdateReimbursementData,
  UploadReceiptData,
  ExpenseFilters,
  ReimbursementFilters,
  ReceiptFilters,
  ExpenseSort,
  ExpenseStatus,
  ExpenseType,
  PaymentMethod,
  ReimbursementStatus,
  ReceiptProcessingStatus,
  BulkExpenseAction,
  ExpenseExportOptions,
} from '@ria/expenses-server';
import { mockProcessReceipt } from '@ria/expenses-server';
import { 
  ExpenseCategorizationEngine, 
  generateMockPrediction, 
  generateMockExpenseCategories,
  generateMockCategorizationRules
} from '@ria/ai-categorization-server';
import type {
  CategorizationPrediction,
  CategorizationRule,
  CategorizationFeedback,
  ExpenseCategory as AIExpenseCategory
} from '@ria/ai-categorization-server';

export class ExpensesRepository extends BaseRepository<Expense> {
  protected endpoint = '/expenses';

  // Expense CRUD operations
  async getExpenses(filters?: ExpenseFilters, sort?: ExpenseSort, page = 1, limit = 25) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    return this.request('GET', `?${params}`);
  }

  async getExpenseWithReceipts(id: string): Promise<{ data: ExpenseWithReceipts }> {
    return this.request('GET', `/${id}/with-receipts`);
  }

  async getExpenseWithRelations(id: string): Promise<{ data: ExpenseWithRelations }> {
    return this.request('GET', `/${id}/relations`);
  }

  async createExpense(data: CreateExpenseData): Promise<{ data: Expense }> {
    return this.request('POST', '', data);
  }

  async updateExpense(id: string, data: UpdateExpenseData): Promise<{ data: Expense }> {
    return this.request('PUT', `/${id}`, data);
  }

  async deleteExpense(id: string): Promise<void> {
    return this.request('DELETE', `/${id}`);
  }

  async duplicateExpense(id: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/duplicate`);
  }

  // Expense status operations
  async submitExpense(id: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/submit`);
  }

  async approveExpense(id: string, comments?: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/approve`, { comments });
  }

  async rejectExpense(id: string, reason: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/reject`, { reason });
  }

  async markAsPaid(id: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/mark-paid`);
  }

  async cancelExpense(id: string, reason?: string): Promise<{ data: Expense }> {
    return this.request('POST', `/${id}/cancel`, { reason });
  }

  // Receipt operations
  async uploadReceipt(data: UploadReceiptData): Promise<{ data: ExpenseReceipt }> {
    return this.request('POST', '/receipts', data, {
      'Content-Type': 'multipart/form-data',
    });
  }

  async getReceipts(filters?: ReceiptFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return this.request('GET', `/receipts?${params}`);
  }

  async getExpenseReceipts(expenseId: string) {
    return this.request('GET', `/${expenseId}/receipts`);
  }

  async linkReceiptToExpense(receiptId: string, expenseId: string): Promise<{ data: ExpenseReceipt }> {
    return this.request('POST', `/receipts/${receiptId}/link`, { expenseId });
  }

  async unlinkReceiptFromExpense(receiptId: string): Promise<{ data: ExpenseReceipt }> {
    return this.request('POST', `/receipts/${receiptId}/unlink`);
  }

  async processReceiptOCR(receiptId: string): Promise<{ data: ExpenseReceipt }> {
    return this.request('POST', `/receipts/${receiptId}/process`);
  }

  async updateReceiptOCR(receiptId: string, ocrData: any): Promise<{ data: ExpenseReceipt }> {
    return this.request('PUT', `/receipts/${receiptId}/ocr`, { ocrData });
  }

  async deleteReceipt(receiptId: string): Promise<void> {
    return this.request('DELETE', `/receipts/${receiptId}`);
  }

  // Reimbursement operations
  async getReimbursements(filters?: ReimbursementFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return this.request('GET', `/reimbursements?${params}`);
  }

  async createReimbursement(data: CreateReimbursementData): Promise<{ data: ExpenseReimbursement }> {
    return this.request('POST', '/reimbursements', data);
  }

  async updateReimbursement(id: string, data: UpdateReimbursementData): Promise<{ data: ExpenseReimbursement }> {
    return this.request('PUT', `/reimbursements/${id}`, data);
  }

  async processReimbursement(id: string): Promise<{ data: ExpenseReimbursement }> {
    return this.request('POST', `/reimbursements/${id}/process`);
  }

  async cancelReimbursement(id: string): Promise<{ data: ExpenseReimbursement }> {
    return this.request('POST', `/reimbursements/${id}/cancel`);
  }

  // Category operations
  async getCategories() {
    return this.request('GET', '/categories');
  }

  async createCategory(category: Omit<ExpenseCategory, 'id'>) {
    return this.request('POST', '/categories', category);
  }

  async updateCategory(id: string, category: Partial<ExpenseCategory>) {
    return this.request('PUT', `/categories/${id}`, category);
  }

  async deleteCategory(id: string) {
    return this.request('DELETE', `/categories/${id}`);
  }

  // Activity operations
  async getExpenseActivities(expenseId: string) {
    return this.request('GET', `/${expenseId}/activities`);
  }

  async addExpenseActivity(expenseId: string, activity: Pick<ExpenseActivity, 'type' | 'description' | 'metadata'>) {
    return this.request('POST', `/${expenseId}/activities`, activity);
  }

  // Approval operations
  async getExpenseApprovals(expenseId: string) {
    return this.request('GET', `/${expenseId}/approvals`);
  }

  async getPendingApprovals() {
    return this.request('GET', '/approvals/pending');
  }

  // Statistics and analytics
  async getStats(): Promise<{ data: ExpenseStats }> {
    return this.request('GET', '/stats');
  }

  async getAnalytics(dateRange?: { from: string; to: string }): Promise<{ data: ExpenseAnalytics }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }
    return this.request('GET', `/analytics?${params}`);
  }

  // Settings operations
  async getSettings(): Promise<{ data: ExpenseSettings }> {
    return this.request('GET', '/settings');
  }

  async updateSettings(settings: Partial<ExpenseSettings>): Promise<{ data: ExpenseSettings }> {
    return this.request('PUT', '/settings', settings);
  }

  // Bulk operations
  async bulkAction(action: BulkExpenseAction) {
    return this.request('POST', '/bulk', action);
  }

  // Export operations
  async exportExpenses(options: ExpenseExportOptions) {
    return this.request('POST', '/export', options);
  }

  // AI Categorization operations
  async predictCategory(expense: {
    vendor: string;
    description: string;
    amount: number;
    date: string;
  }): Promise<CategorizationPrediction> {
    return this.request('POST', '/ai/predict-category', expense);
  }

  async getCategorizationRules(): Promise<{ data: CategorizationRule[] }> {
    return this.request('GET', '/ai/rules');
  }

  async createCategorizationRule(rule: Omit<CategorizationRule, 'id' | 'createdAt' | 'updatedAt' | 'timesApplied'>): Promise<{ data: CategorizationRule }> {
    return this.request('POST', '/ai/rules', rule);
  }

  async updateCategorizationRule(id: string, rule: Partial<CategorizationRule>): Promise<{ data: CategorizationRule }> {
    return this.request('PUT', `/ai/rules/${id}`, rule);
  }

  async deleteCategorizationRule(id: string): Promise<void> {
    return this.request('DELETE', `/ai/rules/${id}`);
  }

  async provideFeedback(feedback: Omit<CategorizationFeedback, 'id' | 'providedAt'>): Promise<{ data: CategorizationFeedback }> {
    return this.request('POST', '/ai/feedback', feedback);
  }

  async runBatchCategorization(expenseIds: string[], options?: {
    overwriteExisting?: boolean;
    minimumConfidence?: number;
  }): Promise<{ jobId: string; processed: number }> {
    return this.request('POST', '/ai/batch-categorize', { expenseIds, options });
  }

  async getAICategories(): Promise<{ data: AIExpenseCategory[] }> {
    return this.request('GET', '/ai/categories');
  }
}

export class MockExpensesRepository extends MockRepository<Expense> {
  protected storageKey = 'ria_expenses';
  protected endpoint = '/expenses';

  // Mock data generators
  private generateMockExpenses(): Expense[] {
    const statuses: ExpenseStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'paid', 'reimbursed'];
    const types: ExpenseType[] = ['business', 'travel', 'meal', 'office', 'equipment', 'software', 'transportation', 'accommodation'];
    const currencies = ['USD', 'EUR', 'GBP'];
    const employees = [
      { id: '1', name: 'John Smith', email: 'john.smith@company.com' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
      { id: '3', name: 'Mike Davis', email: 'mike.davis@company.com' },
      { id: '4', name: 'Emily Brown', email: 'emily.brown@company.com' },
      { id: '5', name: 'David Wilson', email: 'david.wilson@company.com' }
    ];
    
    const categories = this.generateMockCategories();
    const expenses: Expense[] = [];
    const now = new Date();

    for (let i = 1; i <= 35; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const currency = currencies[Math.floor(Math.random() * currencies.length)];
      
      const amount = Math.round((Math.random() * 500 + 10) * 100) / 100;
      const taxAmount = Math.round(amount * 0.08 * 100) / 100;
      const totalAmount = amount + taxAmount;
      const isReimbursable = Math.random() > 0.3;
      
      const date = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const submittedAt = status !== 'draft' ? new Date(date.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined;

      expenses.push({
        id: `exp_${i.toString().padStart(3, '0')}`,
        tenantId: 'tenant_1',
        number: `EXP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(4, '0')}`,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        
        // Expense Details
        date: date.toISOString(),
        type,
        categoryId: category.id,
        categoryName: category.name,
        status,
        
        // Financial
        amount,
        taxAmount,
        totalAmount,
        currency,
        
        // Business Details
        description: this.generateExpenseDescription(type),
        businessPurpose: this.generateBusinessPurpose(type),
        merchant: this.generateMerchant(type),
        location: this.generateLocation(),
        projectId: Math.random() > 0.6 ? `proj_${Math.floor(Math.random() * 5) + 1}` : undefined,
        projectName: Math.random() > 0.6 ? 'Project Alpha' : undefined,
        clientId: Math.random() > 0.7 ? `client_${Math.floor(Math.random() * 3) + 1}` : undefined,
        clientName: Math.random() > 0.7 ? 'Acme Corp' : undefined,
        
        // Receipt Information
        receiptIds: Math.random() > 0.4 ? [`receipt_${i}`] : [],
        hasReceipt: Math.random() > 0.4,
        receiptProcessingStatus: Math.random() > 0.4 ? 'completed' : undefined,
        
        // Approval Workflow
        approvalRequired: amount > 100,
        approvedBy: status === 'approved' || status === 'paid' || status === 'reimbursed' ? 'manager_1' : undefined,
        approvedAt: status === 'approved' || status === 'paid' || status === 'reimbursed' ? 
          new Date(date.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        rejectionReason: status === 'rejected' ? 'Missing receipt or insufficient justification' : undefined,
        
        // Reimbursement
        isReimbursable,
        reimbursementStatus: isReimbursable ? (status === 'reimbursed' ? 'completed' : status === 'approved' ? 'pending' : undefined) : undefined,
        reimbursedAmount: status === 'reimbursed' ? totalAmount : undefined,
        reimbursedAt: status === 'reimbursed' ? new Date(date.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        reimbursementMethod: status === 'reimbursed' ? 'bank_transfer' : undefined,
        
        // Tax and Compliance
        isDeductible: category.isDeductible,
        taxCategory: type === 'meal' ? 'meals' : 'general',
        
        // Metadata
        createdBy: employee.id,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
        submittedAt,
        paidAt: status === 'paid' ? new Date(date.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }

    return expenses;
  }

  private generateMockCategories(): ExpenseCategory[] {
    return [
      {
        id: 'cat_1',
        name: 'Travel',
        code: 'TRV',
        description: 'Business travel expenses',
        isDeductible: true,
        requiresReceipt: true,
        maxAmount: 5000,
        accountCode: '6100',
        isActive: true
      },
      {
        id: 'cat_2',
        name: 'Meals & Entertainment',
        code: 'MEL',
        description: 'Business meals and entertainment',
        isDeductible: true,
        requiresReceipt: true,
        maxAmount: 200,
        accountCode: '6110',
        isActive: true
      },
      {
        id: 'cat_3',
        name: 'Office Supplies',
        code: 'OFF',
        description: 'Office supplies and equipment',
        isDeductible: true,
        requiresReceipt: false,
        maxAmount: 500,
        accountCode: '6120',
        isActive: true
      },
      {
        id: 'cat_4',
        name: 'Software',
        code: 'SFW',
        description: 'Software and subscriptions',
        isDeductible: true,
        requiresReceipt: true,
        maxAmount: 1000,
        accountCode: '6130',
        isActive: true
      },
      {
        id: 'cat_5',
        name: 'Transportation',
        code: 'TRS',
        description: 'Local transportation',
        isDeductible: true,
        requiresReceipt: true,
        maxAmount: 300,
        accountCode: '6140',
        isActive: true
      }
    ];
  }

  private generateExpenseDescription(type: ExpenseType): string {
    const descriptions = {
      travel: ['Flight to client meeting', 'Hotel accommodation', 'Conference registration'],
      meal: ['Business lunch with client', 'Team dinner', 'Conference catering'],
      office: ['Office supplies', 'Printer paper', 'Desk accessories'],
      equipment: ['Laptop for development', 'Monitor upgrade', 'Ergonomic keyboard'],
      software: ['Software license', 'Monthly subscription', 'Development tools'],
      transportation: ['Taxi to airport', 'Parking fees', 'Gas for company car'],
      accommodation: ['Hotel stay', 'Airbnb rental', 'Extended stay'],
      business: ['Business consultation', 'Professional services', 'Legal fees']
    };
    
    const options = descriptions[type] || descriptions.business;
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateBusinessPurpose(type: ExpenseType): string {
    const purposes = {
      travel: 'Client meeting and business development',
      meal: 'Business relationship building and negotiations',
      office: 'Maintaining productive work environment',
      equipment: 'Improving work efficiency and productivity',
      software: 'Essential tools for business operations',
      transportation: 'Business travel and client visits',
      accommodation: 'Overnight business travel requirement',
      business: 'Professional business services'
    };
    
    return purposes[type] || purposes.business;
  }

  private generateMerchant(type: ExpenseType): string {
    const merchants = {
      travel: ['United Airlines', 'Delta Airlines', 'American Airlines'],
      meal: ['The Business Bistro', 'Executive Dining', 'Corporate Cafe'],
      office: ['Staples', 'Office Depot', 'Amazon Business'],
      equipment: ['Apple Store', 'Best Buy', 'Dell'],
      software: ['Microsoft', 'Adobe', 'Salesforce'],
      transportation: ['Uber', 'Lyft', 'Enterprise Rent-A-Car'],
      accommodation: ['Marriott', 'Hilton', 'Holiday Inn'],
      business: ['Professional Services Inc', 'Business Consultants LLC', 'Expert Advisors']
    };
    
    const options = merchants[type] || merchants.business;
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateLocation(): string {
    const locations = [
      'New York, NY', 'San Francisco, CA', 'Chicago, IL', 
      'Boston, MA', 'Seattle, WA', 'Austin, TX',
      'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateMockReceipts(expenseId: string): ExpenseReceipt[] {
    const receipts: ExpenseReceipt[] = [];
    const receiptCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < receiptCount; i++) {
      receipts.push({
        id: `receipt_${expenseId}_${i + 1}`,
        tenantId: 'tenant_1',
        expenseId,
        filename: `receipt_${i + 1}.jpg`,
        originalName: `Receipt ${i + 1}.jpg`,
        mimeType: 'image/jpeg',
        size: Math.floor(Math.random() * 2000000) + 100000,
        url: `/api/files/receipts/receipt_${expenseId}_${i + 1}.jpg`,
        thumbnailUrl: `/api/files/receipts/thumb_receipt_${expenseId}_${i + 1}.jpg`,
        processingStatus: 'completed',
        ocrData: {
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
          rawText: 'Mock OCR extracted text from receipt...'
        },
        needsReview: false,
        uploadedBy: 'user_1',
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      });
    }

    return receipts;
  }

  private generateMockStats(): ExpenseStats {
    const expenses = this.getStoredData();
    const totalExpenses = expenses.length;
    const totalDrafts = expenses.filter(exp => exp.status === 'draft').length;
    const totalSubmitted = expenses.filter(exp => exp.status === 'submitted').length;
    const totalApproved = expenses.filter(exp => exp.status === 'approved').length;
    const totalPaid = expenses.filter(exp => exp.status === 'paid').length;
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const totalReimbursable = expenses.filter(exp => exp.isReimbursable).reduce((sum, exp) => sum + exp.totalAmount, 0);
    const totalReimbursed = expenses.filter(exp => exp.status === 'reimbursed').reduce((sum, exp) => sum + exp.totalAmount, 0);

    return {
      totalExpenses,
      totalDrafts,
      totalSubmitted,
      totalApproved,
      totalPaid,
      totalAmount,
      totalReimbursable,
      totalReimbursed,
      averageExpense: totalExpenses > 0 ? totalAmount / totalExpenses : 0,
      averageProcessingTime: 3.5, // Mock average of 3.5 days
      reimbursementRate: totalReimbursable > 0 ? (totalReimbursed / totalReimbursable) * 100 : 0,
      
      recentExpenses: expenses.slice(0, 5),
      topCategories: [
        { categoryName: 'Travel', count: 8, totalAmount: 12500, percentage: 35 },
        { categoryName: 'Meals & Entertainment', count: 12, totalAmount: 8500, percentage: 24 },
        { categoryName: 'Software', count: 5, totalAmount: 6500, percentage: 18 },
        { categoryName: 'Office Supplies', count: 7, totalAmount: 3200, percentage: 9 },
        { categoryName: 'Transportation', count: 6, totalAmount: 2800, percentage: 8 }
      ],
      topEmployees: [
        { employeeId: '1', employeeName: 'John Smith', expenseCount: 8, totalAmount: 5500, reimbursedAmount: 4200 },
        { employeeId: '2', employeeName: 'Sarah Johnson', expenseCount: 6, totalAmount: 4200, reimbursedAmount: 3800 },
        { employeeId: '3', employeeName: 'Mike Davis', expenseCount: 5, totalAmount: 3800, reimbursedAmount: 2900 }
      ],
      monthlyTrends: [
        { month: '2024-01', expenseCount: 12, totalAmount: 8500, reimbursedAmount: 6200 },
        { month: '2024-02', expenseCount: 15, totalAmount: 11200, reimbursedAmount: 8900 },
        { month: '2024-03', expenseCount: 18, totalAmount: 13800, reimbursedAmount: 10100 }
      ],
      statusDistribution: [
        { status: 'approved', count: totalApproved, totalAmount: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.totalAmount, 0) },
        { status: 'submitted', count: totalSubmitted, totalAmount: expenses.filter(e => e.status === 'submitted').reduce((sum, e) => sum + e.totalAmount, 0) },
        { status: 'draft', count: totalDrafts, totalAmount: expenses.filter(e => e.status === 'draft').reduce((sum, e) => sum + e.totalAmount, 0) }
      ],
      typeBreakdown: [
        { type: 'travel', count: 8, totalAmount: 12500, percentage: 35 },
        { type: 'meal', count: 12, totalAmount: 8500, percentage: 24 },
        { type: 'software', count: 5, totalAmount: 6500, percentage: 18 },
        { type: 'office', count: 7, totalAmount: 3200, percentage: 9 },
        { type: 'transportation', count: 6, totalAmount: 2800, percentage: 8 }
      ]
    };
  }

  // Override base methods
  async findAll(page = 1, limit = 25) {
    let expenses = this.getStoredData();
    if (expenses.length === 0) {
      expenses = this.generateMockExpenses();
      this.setStoredData(expenses);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: expenses.slice(start, end),
      pagination: {
        page,
        limit,
        total: expenses.length,
        totalPages: Math.ceil(expenses.length / limit)
      }
    };
  }

  async getExpenses(filters?: ExpenseFilters, sort?: ExpenseSort, page = 1, limit = 25) {
    let expenses = this.getStoredData();
    if (expenses.length === 0) {
      expenses = this.generateMockExpenses();
      this.setStoredData(expenses);
    }

    // Apply filters
    if (filters) {
      expenses = expenses.filter(expense => {
        if (filters.status && !Array.isArray(filters.status) && expense.status !== filters.status) return false;
        if (filters.status && Array.isArray(filters.status) && !filters.status.includes(expense.status)) return false;
        if (filters.type && !Array.isArray(filters.type) && expense.type !== filters.type) return false;
        if (filters.type && Array.isArray(filters.type) && !filters.type.includes(expense.type)) return false;
        if (filters.employeeId && expense.employeeId !== filters.employeeId) return false;
        if (filters.employeeName && !expense.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())) return false;
        if (filters.categoryId && expense.categoryId !== filters.categoryId) return false;
        if (filters.hasReceipt !== undefined && expense.hasReceipt !== filters.hasReceipt) return false;
        if (filters.isReimbursable !== undefined && expense.isReimbursable !== filters.isReimbursable) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!expense.number.toLowerCase().includes(searchLower) &&
              !expense.employeeName.toLowerCase().includes(searchLower) &&
              !expense.description?.toLowerCase().includes(searchLower) &&
              !expense.businessPurpose?.toLowerCase().includes(searchLower)) return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (sort) {
      expenses.sort((a, b) => {
        const aVal = a[sort.field as keyof Expense];
        const bVal = b[sort.field as keyof Expense];
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'desc' ? -result : result;
      });
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: expenses.slice(start, end),
      pagination: {
        page,
        limit,
        total: expenses.length,
        totalPages: Math.ceil(expenses.length / limit)
      }
    };
  }

  async getExpenseWithReceipts(id: string): Promise<{ data: ExpenseWithReceipts }> {
    const expense = await this.findById(id);
    const receipts = this.generateMockReceipts(id);
    
    return {
      data: {
        ...expense.data,
        receipts
      }
    };
  }

  async getExpenseWithRelations(id: string): Promise<{ data: ExpenseWithRelations }> {
    const expense = await this.findById(id);
    const receipts = this.generateMockReceipts(id);
    const categories = this.generateMockCategories();
    const category = categories.find(c => c.id === expense.data.categoryId)!;

    return {
      data: {
        ...expense.data,
        receipts,
        activities: [],
        approvals: [],
        category,
        reimbursement: undefined
      }
    };
  }

  async createExpense(data: CreateExpenseData): Promise<{ data: Expense }> {
    const expenses = this.getStoredData();
    const nextNumber = expenses.length + 1;
    const totalAmount = data.amount + (data.taxAmount || 0);
    const categories = this.generateMockCategories();
    const category = categories.find(c => c.id === data.categoryId);

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      tenantId: 'tenant_1',
      number: `EXP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${nextNumber.toString().padStart(4, '0')}`,
      employeeId: 'user_1',
      employeeName: 'Current User',
      employeeEmail: 'user@company.com',
      
      date: data.date,
      type: data.type,
      categoryId: data.categoryId,
      categoryName: category?.name || 'Unknown',
      status: 'draft',
      
      amount: data.amount,
      taxAmount: data.taxAmount,
      totalAmount,
      currency: data.currency || 'USD',
      
      description: data.description,
      businessPurpose: data.businessPurpose,
      merchant: data.merchant,
      location: data.location,
      projectId: data.projectId,
      clientId: data.clientId,
      
      receiptIds: data.receiptIds || [],
      hasReceipt: (data.receiptIds?.length || 0) > 0,
      
      approvalRequired: data.amount > 100,
      
      isReimbursable: data.isReimbursable !== undefined ? data.isReimbursable : true,
      isDeductible: category?.isDeductible || true,
      taxCategory: data.taxCategory,
      
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    this.setStoredData(expenses);
    
    return { data: newExpense };
  }

  async submitExpense(id: string): Promise<{ data: Expense }> {
    const expense = await this.findById(id);
    const updatedExpense = {
      ...expense.data,
      status: 'submitted' as ExpenseStatus,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedExpense);
  }

  async approveExpense(id: string, comments?: string): Promise<{ data: Expense }> {
    const expense = await this.findById(id);
    const updatedExpense = {
      ...expense.data,
      status: 'approved' as ExpenseStatus,
      approvedBy: 'manager_1',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedExpense);
  }

  async rejectExpense(id: string, reason: string): Promise<{ data: Expense }> {
    const expense = await this.findById(id);
    const updatedExpense = {
      ...expense.data,
      status: 'rejected' as ExpenseStatus,
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedExpense);
  }

  async uploadReceipt(data: UploadReceiptData): Promise<{ data: ExpenseReceipt }> {
    // Simulate file upload processing
    const receipt: ExpenseReceipt = {
      id: `receipt_${Date.now()}`,
      tenantId: 'tenant_1',
      expenseId: data.expenseId,
      filename: `receipt_${Date.now()}.jpg`,
      originalName: 'receipt.jpg',
      mimeType: 'image/jpeg',
      size: 150000,
      url: `/api/files/receipts/receipt_${Date.now()}.jpg`,
      processingStatus: 'processing',
      needsReview: false,
      uploadedBy: 'user_1',
      uploadedAt: new Date().toISOString()
    };

    // Simulate OCR processing
    setTimeout(async () => {
      try {
        const ocrResult = await mockProcessReceipt(data.file);
        receipt.processingStatus = 'completed';
        receipt.ocrData = ocrResult.data;
        receipt.processedAt = new Date().toISOString();
        receipt.needsReview = ocrResult.confidence < 0.7;
      } catch (error) {
        receipt.processingStatus = 'failed';
      }
    }, 3000);

    return { data: receipt };
  }

  async getStats(): Promise<{ data: ExpenseStats }> {
    const expenses = this.getStoredData();
    if (expenses.length === 0) {
      const mockExpenses = this.generateMockExpenses();
      this.setStoredData(mockExpenses);
    }
    
    return { data: this.generateMockStats() };
  }

  async getCategories() {
    return { data: this.generateMockCategories() };
  }

  // AI Categorization mock methods
  private categorizationEngine = new ExpenseCategorizationEngine();
  private aiCategories = generateMockExpenseCategories();
  private categorizationRules = generateMockCategorizationRules();

  async predictCategory(expense: {
    vendor: string;
    description: string;
    amount: number;
    date: string;
  }): Promise<CategorizationPrediction> {
    await this.simulateDelay(500); // Simulate AI processing time
    return this.categorizationEngine.categorizeExpense(expense);
  }

  async getCategorizationRules(): Promise<{ data: CategorizationRule[] }> {
    await this.simulateDelay();
    return { data: this.categorizationRules };
  }

  async createCategorizationRule(ruleData: any): Promise<{ data: CategorizationRule }> {
    await this.simulateDelay();
    const rule: CategorizationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      timesApplied: 0,
      accuracyRate: 0,
      feedbackCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.categorizationRules.push(rule);
    return { data: rule };
  }

  async updateCategorizationRule(id: string, updates: Partial<CategorizationRule>): Promise<{ data: CategorizationRule }> {
    await this.simulateDelay();
    const index = this.categorizationRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    this.categorizationRules[index] = {
      ...this.categorizationRules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return { data: this.categorizationRules[index] };
  }

  async deleteCategorizationRule(id: string): Promise<void> {
    await this.simulateDelay();
    const index = this.categorizationRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    this.categorizationRules.splice(index, 1);
  }

  async provideFeedback(feedbackData: any): Promise<{ data: CategorizationFeedback }> {
    await this.simulateDelay();
    
    // Add feedback to learning engine
    this.categorizationEngine.addFeedback({
      vendor: feedbackData.vendor || 'Unknown',
      description: feedbackData.description || 'Unknown',
      amount: feedbackData.amount || 0,
      actualCategoryId: feedbackData.actualCategoryId,
      wasCorrect: feedbackData.wasCorrect
    });
    
    const feedback: CategorizationFeedback = {
      ...feedbackData,
      id: `feedback_${Date.now()}`,
      providedAt: new Date().toISOString()
    };
    
    return { data: feedback };
  }

  async runBatchCategorization(expenseIds: string[], options = {}): Promise<{ jobId: string; processed: number }> {
    await this.simulateDelay(2000); // Simulate batch processing time
    
    // Mock batch processing
    const processed = Math.floor(expenseIds.length * 0.9); // 90% success rate
    
    return {
      jobId: `batch_${Date.now()}`,
      processed
    };
  }

  async getAICategories(): Promise<{ data: AIExpenseCategory[] }> {
    await this.simulateDelay();
    return { data: this.aiCategories };
  }
}

// Lazy initialization to prevent bundle bloat
let _expensesRepository: MockExpensesRepository | null = null;

export const expensesRepository = {
  get instance(): MockExpensesRepository {
    if (!_expensesRepository) {
      _expensesRepository = new MockExpensesRepository();
    }
    return _expensesRepository;
  }
};