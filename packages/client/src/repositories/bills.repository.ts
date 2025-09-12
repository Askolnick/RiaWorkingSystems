import { BaseRepository, MockRepository } from './base.repository';
import type {
  Bill,
  BillWithItems,
  BillWithRelations,
  BillItem,
  BillPayment,
  BillActivity,
  BillApproval,
  BillAttachment,
  BillStats,
  BillAnalytics,
  BillTemplate,
  BillSettings,
  CreateBillData,
  UpdateBillData,
  CreateBillPaymentData,
  UpdateBillPaymentData,
  CreateBillApprovalData,
  BillFilters,
  PaymentFilters,
  BillSort,
  BillStatus,
  PaymentStatus,
  PaymentMethod,
  BillPriority,
  ApprovalStatus,
  BulkBillAction,
  BillExportOptions,
} from '@ria/bills-server';

export class BillsRepository extends BaseRepository<Bill> {
  protected endpoint = '/bills';

  // Bill CRUD operations
  async getBills(filters?: BillFilters, sort?: BillSort, page = 1, limit = 25) {
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

  async getBillWithItems(id: string): Promise<{ data: BillWithItems }> {
    return this.request('GET', `/${id}/with-items`);
  }

  async getBillWithRelations(id: string): Promise<{ data: BillWithRelations }> {
    return this.request('GET', `/${id}/relations`);
  }

  async createBill(data: CreateBillData): Promise<{ data: Bill }> {
    return this.request('POST', '', data);
  }

  async updateBill(id: string, data: UpdateBillData): Promise<{ data: Bill }> {
    return this.request('PUT', `/${id}`, data);
  }

  async deleteBill(id: string): Promise<void> {
    return this.request('DELETE', `/${id}`);
  }

  async duplicateBill(id: string): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/duplicate`);
  }

  // Bill status operations
  async submitForApproval(id: string): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/submit`);
  }

  async approveBill(id: string, comments?: string): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/approve`, { comments });
  }

  async rejectBill(id: string, reason: string): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/reject`, { reason });
  }

  async markAsPaid(id: string, paymentData?: CreateBillPaymentData): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/mark-paid`, paymentData);
  }

  async cancelBill(id: string, reason?: string): Promise<{ data: Bill }> {
    return this.request('POST', `/${id}/cancel`, { reason });
  }

  // Bill items operations
  async getBillItems(billId: string) {
    return this.request('GET', `/${billId}/items`);
  }

  async addBillItem(billId: string, item: Omit<BillItem, 'id' | 'tenantId' | 'billId'>) {
    return this.request('POST', `/${billId}/items`, item);
  }

  async updateBillItem(billId: string, itemId: string, item: Partial<BillItem>) {
    return this.request('PUT', `/${billId}/items/${itemId}`, item);
  }

  async deleteBillItem(billId: string, itemId: string) {
    return this.request('DELETE', `/${billId}/items/${itemId}`);
  }

  // Payment operations
  async getBillPayments(billId: string) {
    return this.request('GET', `/${billId}/payments`);
  }

  async getPayments(filters?: PaymentFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return this.request('GET', `/payments?${params}`);
  }

  async createPayment(data: CreateBillPaymentData): Promise<{ data: BillPayment }> {
    return this.request('POST', `/payments`, data);
  }

  async updatePayment(paymentId: string, data: UpdateBillPaymentData): Promise<{ data: BillPayment }> {
    return this.request('PUT', `/payments/${paymentId}`, data);
  }

  async deletePayment(paymentId: string): Promise<void> {
    return this.request('DELETE', `/payments/${paymentId}`);
  }

  async schedulePayment(paymentId: string, scheduledDate: string): Promise<{ data: BillPayment }> {
    return this.request('POST', `/payments/${paymentId}/schedule`, { scheduledDate });
  }

  // Approval operations
  async getBillApprovals(billId: string) {
    return this.request('GET', `/${billId}/approvals`);
  }

  async createApproval(data: CreateBillApprovalData): Promise<{ data: BillApproval }> {
    return this.request('POST', '/approvals', data);
  }

  async getPendingApprovals() {
    return this.request('GET', '/approvals/pending');
  }

  // Activity operations
  async getBillActivities(billId: string) {
    return this.request('GET', `/${billId}/activities`);
  }

  async addBillActivity(billId: string, activity: Pick<BillActivity, 'type' | 'description' | 'metadata'>) {
    return this.request('POST', `/${billId}/activities`, activity);
  }

  // Attachment operations
  async getBillAttachments(billId: string) {
    return this.request('GET', `/${billId}/attachments`);
  }

  async uploadAttachment(billId: string, file: FormData): Promise<{ data: BillAttachment }> {
    return this.request('POST', `/${billId}/attachments`, file, {
      'Content-Type': 'multipart/form-data',
    });
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    return this.request('DELETE', `/attachments/${attachmentId}`);
  }

  // Statistics and analytics
  async getStats(): Promise<{ data: BillStats }> {
    return this.request('GET', '/stats');
  }

  async getAnalytics(dateRange?: { from: string; to: string }): Promise<{ data: BillAnalytics }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }
    return this.request('GET', `/analytics?${params}`);
  }

  // Templates operations
  async getTemplates() {
    return this.request('GET', '/templates');
  }

  async createTemplate(template: Omit<BillTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    return this.request('POST', '/templates', template);
  }

  async updateTemplate(templateId: string, template: Partial<BillTemplate>) {
    return this.request('PUT', `/templates/${templateId}`, template);
  }

  async deleteTemplate(templateId: string) {
    return this.request('DELETE', `/templates/${templateId}`);
  }

  // Settings operations
  async getSettings(): Promise<{ data: BillSettings }> {
    return this.request('GET', '/settings');
  }

  async updateSettings(settings: Partial<BillSettings>): Promise<{ data: BillSettings }> {
    return this.request('PUT', '/settings', settings);
  }

  // Bulk operations
  async bulkAction(action: BulkBillAction) {
    return this.request('POST', '/bulk', action);
  }

  // Export operations
  async exportBills(options: BillExportOptions) {
    return this.request('POST', '/export', options);
  }

  // Vendor operations
  async getVendors(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return this.request('GET', `/vendors?${params}`);
  }

  async createVendor(vendor: { name: string; email?: string; address?: any }) {
    return this.request('POST', '/vendors', vendor);
  }
}

export class MockBillsRepository extends MockRepository<Bill> {
  protected storageKey = 'ria_bills';
  protected endpoint = '/bills';

  // Mock data generators
  private generateMockBills(): Bill[] {
    const statuses: BillStatus[] = ['draft', 'pending', 'approved', 'rejected', 'partial', 'paid', 'overdue'];
    const priorities: BillPriority[] = ['low', 'normal', 'high', 'urgent'];
    const currencies = ['USD', 'EUR', 'GBP'];
    const vendors = [
      { id: '1', name: 'Office Depot', email: 'billing@officedepot.com' },
      { id: '2', name: 'Amazon Business', email: 'invoices@amazon.com' },
      { id: '3', name: 'Staples Inc.', email: 'accounts@staples.com' },
      { id: '4', name: 'FedEx Corporation', email: 'billing@fedex.com' },
      { id: '5', name: 'Microsoft Corporation', email: 'billing@microsoft.com' },
      { id: '6', name: 'Adobe Systems', email: 'invoicing@adobe.com' },
      { id: '7', name: 'Salesforce', email: 'billing@salesforce.com' },
      { id: '8', name: 'AWS', email: 'billing@aws.amazon.com' }
    ];

    const bills: Bill[] = [];
    const now = new Date();

    for (let i = 1; i <= 30; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const currency = currencies[Math.floor(Math.random() * currencies.length)];
      const subtotal = Math.round((Math.random() * 5000 + 100) * 100) / 100;
      const taxRate = Math.round(Math.random() * 15 * 100) / 100;
      const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
      const discountAmount = Math.round(Math.random() * 100 * 100) / 100;
      const total = subtotal + taxAmount - discountAmount;
      const paidAmount = status === 'paid' ? total : 
                       status === 'partial' ? Math.round(total * (0.3 + Math.random() * 0.4) * 100) / 100 : 0;
      
      const billDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(billDate.getTime() + (15 + Math.random() * 45) * 24 * 60 * 60 * 1000);

      bills.push({
        id: `bill_${i.toString().padStart(3, '0')}`,
        tenantId: 'tenant_1',
        number: `BILL-${new Date().getFullYear()}-${i.toString().padStart(4, '0')}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorAddress: {
          name: vendor.name,
          line1: `${Math.floor(Math.random() * 9999)} Business Ave`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Seattle'][Math.floor(Math.random() * 5)],
          state: 'CA',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'US'
        },
        billDate: billDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status,
        priority,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        total,
        paidAmount,
        balanceDue: total - paidAmount,
        currency,
        description: this.generateBillDescription(vendor.name),
        notes: 'Thank you for your service!',
        terms: 'Payment due within 30 days',
        poNumber: Math.random() > 0.5 ? `PO-${Math.floor(Math.random() * 10000)}` : undefined,
        approvalStatus: status === 'draft' ? 'pending' : 'approved',
        approvedBy: status !== 'draft' ? 'user_1' : undefined,
        approvedAt: status !== 'draft' ? new Date(billDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        attachmentIds: [],
        createdBy: 'user_1',
        createdAt: billDate.toISOString(),
        updatedAt: billDate.toISOString(),
        submittedAt: status !== 'draft' ? new Date(billDate.getTime() + 12 * 60 * 60 * 1000).toISOString() : undefined,
        paidAt: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }

    return bills;
  }

  private generateBillDescription(vendorName: string): string {
    const services = {
      'Office Depot': 'Office supplies and equipment',
      'Amazon Business': 'Business equipment and software',
      'Staples Inc.': 'Office supplies and printing services',
      'FedEx Corporation': 'Shipping and logistics services',
      'Microsoft Corporation': 'Software licenses and cloud services',
      'Adobe Systems': 'Creative software subscriptions',
      'Salesforce': 'CRM software subscription',
      'AWS': 'Cloud infrastructure services'
    };
    
    return services[vendorName] || `Professional services from ${vendorName}`;
  }

  private generateMockItems(billId: string): BillItem[] {
    const itemTypes = [
      'Office Supplies', 'Software License', 'Professional Services', 'Equipment',
      'Maintenance Contract', 'Shipping Services', 'Cloud Services', 'Consulting'
    ];

    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items: BillItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const quantity = Math.floor(Math.random() * 20) + 1;
      const rate = Math.round((Math.random() * 500 + 25) * 100) / 100;
      
      items.push({
        id: `item_${billId}_${i + 1}`,
        tenantId: 'tenant_1',
        billId,
        name: itemTypes[Math.floor(Math.random() * itemTypes.length)],
        description: 'Professional services as per agreement',
        quantity,
        rate,
        amount: quantity * rate,
        category: 'Business Expense',
        accountCode: `${4000 + Math.floor(Math.random() * 999)}`,
        sortOrder: i
      });
    }

    return items;
  }

  private generateMockStats(): BillStats {
    const bills = this.getStoredData();
    const totalBills = bills.length;
    const totalDrafts = bills.filter(bill => bill.status === 'draft').length;
    const totalPending = bills.filter(bill => bill.status === 'pending').length;
    const totalApproved = bills.filter(bill => bill.status === 'approved').length;
    const totalPaid = bills.filter(bill => bill.status === 'paid').length;
    const totalOverdue = bills.filter(bill => bill.status === 'overdue').length;
    
    const totalAmount = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalOutstanding = bills.filter(bill => !['paid', 'cancelled', 'draft'].includes(bill.status)).reduce((sum, bill) => sum + bill.balanceDue, 0);
    const totalOverdueAmount = bills.filter(bill => bill.status === 'overdue').reduce((sum, bill) => sum + bill.balanceDue, 0);

    return {
      totalBills,
      totalDrafts,
      totalPending,
      totalApproved,
      totalPaid,
      totalOverdue,
      totalAmount,
      totalOutstanding,
      totalOverdueAmount,
      averageBillValue: totalBills > 0 ? totalAmount / totalBills : 0,
      averagePaymentTime: 25, // Mock average of 25 days
      paymentSuccessRate: totalApproved > 0 ? (totalPaid / totalApproved) * 100 : 0,
      recentBills: bills.slice(0, 5),
      topVendors: [
        { vendorName: 'Microsoft Corporation', totalBills: 5, totalAmount: 15000, totalPaid: 12000 },
        { vendorName: 'AWS', totalBills: 8, totalAmount: 8500, totalPaid: 8500 },
        { vendorName: 'Adobe Systems', totalBills: 3, totalAmount: 5500, totalPaid: 4000 }
      ],
      monthlySpending: [
        { month: '2024-01', amount: 45000, billCount: 15 },
        { month: '2024-02', amount: 38000, billCount: 12 },
        { month: '2024-03', amount: 52000, billCount: 18 }
      ],
      statusDistribution: [
        { status: 'paid', count: totalPaid, totalAmount: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0) },
        { status: 'approved', count: totalApproved, totalAmount: bills.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.total, 0) },
        { status: 'pending', count: totalPending, totalAmount: bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0) }
      ],
      paymentMethodStats: [
        { method: 'bank_transfer', count: 12, totalAmount: 45000 },
        { method: 'check', count: 8, totalAmount: 25000 },
        { method: 'ach', count: 5, totalAmount: 15000 }
      ],
      categoryBreakdown: [
        { category: 'Software', count: 8, totalAmount: 25000, percentage: 35 },
        { category: 'Office Supplies', count: 12, totalAmount: 8000, percentage: 15 },
        { category: 'Services', count: 6, totalAmount: 18000, percentage: 28 },
        { category: 'Equipment', count: 4, totalAmount: 12000, percentage: 22 }
      ]
    };
  }

  // Override base methods
  async findAll(page = 1, limit = 25) {
    let bills = this.getStoredData();
    if (bills.length === 0) {
      bills = this.generateMockBills();
      this.setStoredData(bills);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: bills.slice(start, end),
      pagination: {
        page,
        limit,
        total: bills.length,
        totalPages: Math.ceil(bills.length / limit)
      }
    };
  }

  async getBills(filters?: BillFilters, sort?: BillSort, page = 1, limit = 25) {
    let bills = this.getStoredData();
    if (bills.length === 0) {
      bills = this.generateMockBills();
      this.setStoredData(bills);
    }

    // Apply filters
    if (filters) {
      bills = bills.filter(bill => {
        if (filters.status && !Array.isArray(filters.status) && bill.status !== filters.status) return false;
        if (filters.status && Array.isArray(filters.status) && !filters.status.includes(bill.status)) return false;
        if (filters.vendorId && bill.vendorId !== filters.vendorId) return false;
        if (filters.vendorName && !bill.vendorName.toLowerCase().includes(filters.vendorName.toLowerCase())) return false;
        if (filters.priority && !Array.isArray(filters.priority) && bill.priority !== filters.priority) return false;
        if (filters.priority && Array.isArray(filters.priority) && !filters.priority.includes(bill.priority)) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!bill.number.toLowerCase().includes(searchLower) &&
              !bill.vendorName.toLowerCase().includes(searchLower) &&
              !bill.description?.toLowerCase().includes(searchLower)) return false;
        }
        if (filters.overdue && bill.status !== 'overdue') return false;
        return true;
      });
    }

    // Apply sorting
    if (sort) {
      bills.sort((a, b) => {
        const aVal = a[sort.field as keyof Bill];
        const bVal = b[sort.field as keyof Bill];
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'desc' ? -result : result;
      });
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: bills.slice(start, end),
      pagination: {
        page,
        limit,
        total: bills.length,
        totalPages: Math.ceil(bills.length / limit)
      }
    };
  }

  async getBillWithItems(id: string): Promise<{ data: BillWithItems }> {
    const bill = await this.findById(id);
    const items = this.generateMockItems(id);
    
    return {
      data: {
        ...bill.data,
        items
      }
    };
  }

  async getBillWithRelations(id: string): Promise<{ data: BillWithRelations }> {
    const bill = await this.findById(id);
    const items = this.generateMockItems(id);
    const now = new Date();
    const dueDate = new Date(bill.data.dueDate);
    const isOverdue = now > dueDate && bill.data.status !== 'paid';
    const daysPastDue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      data: {
        ...bill.data,
        items,
        payments: [],
        activities: [],
        approvals: [],
        attachments: [],
        totalPayments: bill.data.paidAmount,
        isOverdue,
        daysPastDue
      }
    };
  }

  async createBill(data: CreateBillData): Promise<{ data: Bill }> {
    const bills = this.getStoredData();
    const nextNumber = bills.length + 1;
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * ((data.taxRate || 0) / 100);
    const total = subtotal + taxAmount - (data.discountAmount || 0);

    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      tenantId: 'tenant_1',
      number: `BILL-${new Date().getFullYear()}-${nextNumber.toString().padStart(4, '0')}`,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      vendorEmail: data.vendorEmail,
      vendorAddress: data.vendorAddress,
      billDate: data.billDate,
      dueDate: data.dueDate,
      status: 'draft',
      priority: data.priority || 'normal',
      subtotal,
      taxRate: data.taxRate || 0,
      taxAmount,
      discountAmount: data.discountAmount || 0,
      total,
      paidAmount: 0,
      balanceDue: total,
      currency: data.currency || 'USD',
      description: data.description,
      notes: data.notes,
      terms: data.terms,
      poNumber: data.poNumber,
      approvalStatus: 'pending',
      attachmentIds: data.attachmentIds || [],
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bills.push(newBill);
    this.setStoredData(bills);
    
    return { data: newBill };
  }

  async submitForApproval(id: string): Promise<{ data: Bill }> {
    const bill = await this.findById(id);
    const updatedBill = {
      ...bill.data,
      status: 'pending' as BillStatus,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedBill);
  }

  async approveBill(id: string, comments?: string): Promise<{ data: Bill }> {
    const bill = await this.findById(id);
    const updatedBill = {
      ...bill.data,
      status: 'approved' as BillStatus,
      approvalStatus: 'approved' as ApprovalStatus,
      approvedBy: 'user_1',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedBill);
  }

  async markAsPaid(id: string, paymentData?: CreateBillPaymentData): Promise<{ data: Bill }> {
    const bill = await this.findById(id);
    const updatedBill = {
      ...bill.data,
      status: 'paid' as BillStatus,
      paidAmount: bill.data.total,
      balanceDue: 0,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.update(id, updatedBill);
  }

  async getStats(): Promise<{ data: BillStats }> {
    const bills = this.getStoredData();
    if (bills.length === 0) {
      const mockBills = this.generateMockBills();
      this.setStoredData(mockBills);
    }
    
    return { data: this.generateMockStats() };
  }

  async getVendors(search?: string) {
    const vendors = [
      { id: '1', name: 'Office Depot', email: 'billing@officedepot.com' },
      { id: '2', name: 'Amazon Business', email: 'invoices@amazon.com' },
      { id: '3', name: 'Staples Inc.', email: 'accounts@staples.com' },
      { id: '4', name: 'FedEx Corporation', email: 'billing@fedex.com' },
      { id: '5', name: 'Microsoft Corporation', email: 'billing@microsoft.com' },
      { id: '6', name: 'Adobe Systems', email: 'invoicing@adobe.com' },
      { id: '7', name: 'Salesforce', email: 'billing@salesforce.com' },
      { id: '8', name: 'AWS', email: 'billing@aws.amazon.com' }
    ];

    let filteredVendors = vendors;
    if (search) {
      filteredVendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        vendor.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return { data: filteredVendors };
  }
}

// Lazy initialization to prevent bundle bloat
let _billsRepository: MockBillsRepository | null = null;

export const billsRepository = {
  get instance(): MockBillsRepository {
    if (!_billsRepository) {
      _billsRepository = new MockBillsRepository();
    }
    return _billsRepository;
  }
};