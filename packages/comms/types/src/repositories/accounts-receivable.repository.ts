import { BaseRepository, MockRepository } from './base.repository';
import type { PaginatedResponse } from '../types';

// Accounts Receivable Types (copied from server package - simplified for client)
export interface CustomerAccount {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerNumber: string;
  customerType: 'business' | 'individual' | 'government';
  
  // Credit Terms
  creditLimit: number;
  paymentTerms: string;
  
  // Account Status
  accountStatus: 'active' | 'inactive' | 'on_hold' | 'closed';
  creditStatus: 'good_standing' | 'credit_watch' | 'credit_hold';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Balance Information
  currentBalance: number;
  availableCredit: number;
  overdueBalance: number;
  
  // Activity Summary
  totalInvoiced: number;
  totalPaid: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  averagePaymentDays: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

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
  
  // Invoice Lines
  lineItems: InvoiceLineItem[];
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Payment Information
  amountPaid: number;
  amountDue: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  
  // Status and Aging
  status: InvoiceStatus;
  agingBucket?: AgingBucket;
  daysPastDue: number;
  
  // References
  purchaseOrderNumber?: string;
  salesOrderNumber?: string;
  
  // Collections
  collectionsStatus?: CollectionsStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sentAt?: string;
  viewedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  extendedAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal: number;
}

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
  transactionId?: string;
  
  // Application Details
  applications: PaymentApplication[];
  
  // Status
  status: 'pending' | 'processed' | 'deposited' | 'cleared' | 'voided';
  
  // References
  referenceNumber?: string;
  memo?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PaymentApplication {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  appliedAmount: number;
  discountTaken?: number;
  applicationDate: string;
}

export interface AgingReport {
  reportDate: string;
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
}

export interface AgingBucketSummary {
  bucket: AgingBucket;
  label: string;
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
  creditStatus: string;
  riskLevel: string;
  
  // Payment History
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  averagePaymentDays: number;
}

// Enums
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

export type CollectionsStatus = 
  | 'current'
  | 'reminder_sent'
  | 'in_collections'
  | 'payment_plan'
  | 'legal_action'
  | 'write_off';

export type PaymentMethod = 
  | 'check'
  | 'ach'
  | 'wire'
  | 'credit_card'
  | 'cash'
  | 'other';

// API Types
export interface CreateInvoiceData {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
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

// Repository Implementation
export class AccountsReceivableRepository extends BaseRepository<ARInvoice> {
  protected endpoint = '/finance/accounts-receivable';

  // Customer Account Methods
  async getCustomerAccounts(): Promise<PaginatedResponse<CustomerAccount>> {
    return this.request('GET', '/customers');
  }

  async getCustomerAccount(customerId: string): Promise<CustomerAccount> {
    return this.request('GET', `/customers/${customerId}`);
  }

  async updateCreditLimit(customerId: string, creditLimit: number): Promise<CustomerAccount> {
    return this.request('PUT', `/customers/${customerId}/credit-limit`, { creditLimit });
  }

  // Invoice Methods
  async createInvoice(data: CreateInvoiceData): Promise<ARInvoice> {
    return this.request('POST', '/invoices', data);
  }

  async sendInvoice(invoiceId: string): Promise<ARInvoice> {
    return this.request('POST', `/invoices/${invoiceId}/send`);
  }

  async voidInvoice(invoiceId: string, reason: string): Promise<ARInvoice> {
    return this.request('POST', `/invoices/${invoiceId}/void`, { reason });
  }

  // Payment Methods
  async recordPayment(data: RecordPaymentData): Promise<ARPayment> {
    return this.request('POST', '/payments', data);
  }

  async getPayments(customerId?: string): Promise<PaginatedResponse<ARPayment>> {
    const params = customerId ? { customerId } : {};
    return this.request('GET', '/payments', params);
  }

  async applyPayment(paymentId: string, applications: PaymentApplication[]): Promise<ARPayment> {
    return this.request('POST', `/payments/${paymentId}/apply`, { applications });
  }

  // Aging Report
  async getAgingReport(asOfDate?: string): Promise<AgingReport> {
    const params = asOfDate ? { asOfDate } : {};
    return this.request('GET', '/aging-report', params);
  }

  // Collections
  async markForCollections(invoiceId: string): Promise<ARInvoice> {
    return this.request('POST', `/invoices/${invoiceId}/collections`);
  }
}

// Mock Implementation
export class MockAccountsReceivableRepository extends MockRepository<ARInvoice> {
  protected storageKey = 'ria_ar_invoices';
  protected endpoint = '/finance/accounts-receivable';
  
  private customerAccounts: CustomerAccount[] = [];
  private payments: ARPayment[] = [];

  constructor() {
    super();
    // Skip initialization during SSR
    if (typeof window !== 'undefined') {
      this.initializeMockData();
    }
  }

  private initializeMockData(): void {
    this.initializeCustomerAccounts();
    this.initializeInvoices();
    this.initializePayments();
  }

  private initializeCustomerAccounts(): void {
    const customers = [
      'Acme Corporation', 'TechStart Inc', 'Global Industries', 'Local Services LLC',
      'Innovation Labs', 'Enterprise Solutions', 'Digital Dynamics', 'Cloud Systems'
    ];

    this.customerAccounts = customers.map((name, index) => ({
      id: `cust-${index + 1}`,
      tenantId: 'tenant-123',
      customerId: `cust-${index + 1}`,
      customerName: name,
      customerNumber: `C${String(1000 + index).padStart(5, '0')}`,
      customerType: index % 3 === 0 ? 'business' : index % 3 === 1 ? 'individual' : 'government',
      creditLimit: 50000 + Math.random() * 100000,
      paymentTerms: index % 2 === 0 ? 'Net 30' : 'Net 60',
      accountStatus: 'active',
      creditStatus: index < 6 ? 'good_standing' : 'credit_watch',
      riskLevel: index < 4 ? 'low' : index < 6 ? 'medium' : 'high',
      currentBalance: Math.random() * 75000,
      availableCredit: 0,
      overdueBalance: index > 5 ? Math.random() * 20000 : 0,
      totalInvoiced: 100000 + Math.random() * 500000,
      totalPaid: 80000 + Math.random() * 400000,
      lastPaymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastPaymentAmount: 5000 + Math.random() * 20000,
      averagePaymentDays: 25 + Math.random() * 20,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Calculate available credit
    this.customerAccounts.forEach(account => {
      account.availableCredit = Math.max(0, account.creditLimit - account.currentBalance);
    });

    localStorage.setItem('ria_ar_customers', JSON.stringify(this.customerAccounts));
  }

  private initializeInvoices(): void {
    const invoices: ARInvoice[] = [];
    const currentDate = new Date();

    // Generate invoices for last 6 months
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
      
      // Generate 3-8 invoices per month
      const invoiceCount = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < invoiceCount; i++) {
        const customer = this.customerAccounts[Math.floor(Math.random() * this.customerAccounts.length)];
        const dayOfMonth = Math.floor(Math.random() * 28) + 1;
        const invDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), dayOfMonth);
        const dueDate = new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const lineItems = this.generateLineItems();
        const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const taxAmount = subtotal * 0.08;
        const discountAmount = Math.random() < 0.3 ? subtotal * 0.02 : 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        
        // Determine payment status based on age
        const daysPastDue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const isOld = monthOffset > 2;
        const isPaid = isOld && Math.random() < 0.7;
        const isPartial = !isPaid && isOld && Math.random() < 0.3;
        
        const amountPaid = isPaid ? totalAmount : isPartial ? totalAmount * (0.3 + Math.random() * 0.5) : 0;
        const amountDue = totalAmount - amountPaid;
        
        const invoice: ARInvoice = {
          id: `inv-${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          tenantId: 'tenant-123',
          invoiceNumber: `INV-${invDate.getFullYear()}${String(invDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
          invoiceDate: invDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          terms: customer.paymentTerms,
          customerId: customer.customerId,
          customerName: customer.customerName,
          customerAccount: customer.customerNumber,
          lineItems,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          amountPaid,
          amountDue,
          paymentStatus: isPaid ? 'paid' : isPartial ? 'partial' : 'unpaid',
          status: this.determineInvoiceStatus(isPaid, isPartial, daysPastDue),
          agingBucket: this.getAgingBucket(daysPastDue),
          daysPastDue: Math.max(0, daysPastDue),
          purchaseOrderNumber: Math.random() < 0.6 ? `PO-${Math.floor(Math.random() * 10000)}` : undefined,
          collectionsStatus: daysPastDue > 60 ? 'in_collections' : daysPastDue > 30 ? 'reminder_sent' : 'current',
          createdAt: invDate.toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          sentAt: new Date(invDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          viewedAt: Math.random() < 0.8 ? new Date(invDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : undefined
        };

        invoices.push(invoice);
      }
    }

    this.saveToStorage(invoices);
  }

  private generateLineItems(): InvoiceLineItem[] {
    const itemCount = 1 + Math.floor(Math.random() * 5);
    const items: InvoiceLineItem[] = [];
    
    const products = [
      { description: 'Professional Services', unitPrice: 150 },
      { description: 'Software License', unitPrice: 299 },
      { description: 'Consulting Hours', unitPrice: 200 },
      { description: 'Training Session', unitPrice: 500 },
      { description: 'Support Package', unitPrice: 99 },
      { description: 'Implementation Fee', unitPrice: 2500 },
      { description: 'Custom Development', unitPrice: 175 },
      { description: 'Data Migration', unitPrice: 1000 }
    ];

    for (let i = 0; i < itemCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = 1 + Math.floor(Math.random() * 10);
      const extendedAmount = quantity * product.unitPrice;
      const discountAmount = Math.random() < 0.2 ? extendedAmount * 0.05 : 0;
      const taxAmount = (extendedAmount - discountAmount) * 0.08;
      
      items.push({
        id: `line-${i + 1}`,
        lineNumber: i + 1,
        description: product.description,
        quantity,
        unitPrice: product.unitPrice,
        extendedAmount,
        discountAmount,
        taxAmount,
        lineTotal: extendedAmount - discountAmount + taxAmount
      });
    }

    return items;
  }

  private initializePayments(): void {
    const invoices = this.getFromStorage();
    const payments: ARPayment[] = [];
    
    // Generate payments for paid and partially paid invoices
    invoices.forEach((invoice, index) => {
      if (invoice.paymentStatus === 'paid' || invoice.paymentStatus === 'partial') {
        const paymentDate = new Date(invoice.dueDate);
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 10));
        
        const payment: ARPayment = {
          id: `pmt-${index + 1}`,
          tenantId: 'tenant-123',
          paymentNumber: `PMT-${String(1000 + index).padStart(5, '0')}`,
          paymentDate: paymentDate.toISOString().split('T')[0],
          paymentMethod: Math.random() < 0.4 ? 'check' : Math.random() < 0.7 ? 'ach' : 'credit_card',
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          customerAccount: invoice.customerAccount,
          paymentAmount: invoice.amountPaid,
          appliedAmount: invoice.amountPaid,
          unappliedAmount: 0,
          currency: 'USD',
          checkNumber: Math.random() < 0.4 ? String(Math.floor(Math.random() * 10000)) : undefined,
          transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
          applications: [{
            id: `app-${index + 1}`,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            appliedAmount: invoice.amountPaid,
            discountTaken: invoice.discountAmount,
            applicationDate: paymentDate.toISOString().split('T')[0]
          }],
          status: 'cleared',
          referenceNumber: `REF-${Math.floor(Math.random() * 100000)}`,
          memo: 'Payment received',
          createdAt: paymentDate.toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        };
        
        payments.push(payment);
      }
    });

    this.payments = payments;
    localStorage.setItem('ria_ar_payments', JSON.stringify(payments));
  }

  private determineInvoiceStatus(isPaid: boolean, isPartial: boolean, daysPastDue: number): InvoiceStatus {
    if (isPaid) return 'paid';
    if (isPartial) return 'partial_payment';
    if (daysPastDue > 0) return 'overdue';
    return 'sent';
  }

  private getAgingBucket(daysPastDue: number): AgingBucket {
    if (daysPastDue <= 0) return 'current';
    if (daysPastDue <= 30) return '1-30';
    if (daysPastDue <= 60) return '31-60';
    if (daysPastDue <= 90) return '61-90';
    return 'over_90';
  }

  // Override methods
  async getCustomerAccounts(): Promise<PaginatedResponse<CustomerAccount>> {
    return {
      data: this.customerAccounts,
      pagination: {
        page: 1,
        limit: 100,
        total: this.customerAccounts.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  async getCustomerAccount(customerId: string): Promise<CustomerAccount> {
    const account = this.customerAccounts.find(a => a.customerId === customerId);
    if (!account) throw new Error('Customer account not found');
    return account;
  }

  async updateCreditLimit(customerId: string, creditLimit: number): Promise<CustomerAccount> {
    const account = this.customerAccounts.find(a => a.customerId === customerId);
    if (!account) throw new Error('Customer account not found');
    
    account.creditLimit = creditLimit;
    account.availableCredit = Math.max(0, creditLimit - account.currentBalance);
    account.updatedAt = new Date().toISOString();
    
    localStorage.setItem('ria_ar_customers', JSON.stringify(this.customerAccounts));
    return account;
  }

  async createInvoice(data: CreateInvoiceData): Promise<ARInvoice> {
    const customer = this.customerAccounts.find(a => a.customerId === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const dueDate = data.dueDate || new Date(new Date(data.invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalAmount = subtotal + (data.taxAmount || 0) - (data.discountAmount || 0);

    const invoice: ARInvoice = {
      id: `inv-${Date.now()}`,
      tenantId: 'tenant-123',
      invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate,
      terms: customer.paymentTerms,
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerAccount: customer.customerNumber,
      lineItems: data.lineItems.map((item, index) => ({
        ...item,
        id: `line-${index + 1}`
      })),
      subtotal,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount,
      amountPaid: 0,
      amountDue: totalAmount,
      paymentStatus: 'unpaid',
      status: 'draft',
      daysPastDue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    const invoices = this.getFromStorage();
    invoices.unshift(invoice);
    this.saveToStorage(invoices);

    // Update customer balance
    customer.currentBalance += totalAmount;
    customer.availableCredit = Math.max(0, customer.creditLimit - customer.currentBalance);
    localStorage.setItem('ria_ar_customers', JSON.stringify(this.customerAccounts));

    return invoice;
  }

  async sendInvoice(invoiceId: string): Promise<ARInvoice> {
    const invoices = this.getFromStorage();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();
    invoice.updatedAt = new Date().toISOString();

    this.saveToStorage(invoices);
    return invoice;
  }

  async voidInvoice(invoiceId: string, reason: string): Promise<ARInvoice> {
    const invoices = this.getFromStorage();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.status = 'voided';
    invoice.updatedAt = new Date().toISOString();

    // Update customer balance if invoice was unpaid
    if (invoice.paymentStatus === 'unpaid') {
      const customer = this.customerAccounts.find(a => a.customerId === invoice.customerId);
      if (customer) {
        customer.currentBalance -= invoice.totalAmount;
        customer.availableCredit = Math.max(0, customer.creditLimit - customer.currentBalance);
        localStorage.setItem('ria_ar_customers', JSON.stringify(this.customerAccounts));
      }
    }

    this.saveToStorage(invoices);
    return invoice;
  }

  async recordPayment(data: RecordPaymentData): Promise<ARPayment> {
    const customer = this.customerAccounts.find(a => a.customerId === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const payment: ARPayment = {
      id: `pmt-${Date.now()}`,
      tenantId: 'tenant-123',
      paymentNumber: `PMT-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerAccount: customer.customerNumber,
      paymentAmount: data.amount,
      appliedAmount: 0,
      unappliedAmount: data.amount,
      currency: 'USD',
      transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
      applications: [],
      status: 'pending',
      referenceNumber: data.reference,
      memo: data.memo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    // Apply to invoices if specified
    if (data.invoiceApplications) {
      const invoices = this.getFromStorage();
      
      data.invoiceApplications.forEach(app => {
        const invoice = invoices.find(i => i.id === app.invoiceId);
        if (invoice) {
          const applicationAmount = Math.min(app.amount, invoice.amountDue);
          
          payment.applications.push({
            id: `app-${Date.now()}-${Math.random()}`,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            appliedAmount: applicationAmount,
            discountTaken: app.discountTaken,
            applicationDate: data.paymentDate
          });

          payment.appliedAmount += applicationAmount;
          payment.unappliedAmount -= applicationAmount;

          // Update invoice
          invoice.amountPaid += applicationAmount;
          invoice.amountDue -= applicationAmount;
          invoice.paymentStatus = invoice.amountDue === 0 ? 'paid' : 'partial';
          invoice.status = invoice.amountDue === 0 ? 'paid' : 'partial_payment';
        }
      });

      this.saveToStorage(invoices);
    }

    // Update customer balance
    customer.currentBalance -= payment.appliedAmount;
    customer.availableCredit = Math.max(0, customer.creditLimit - customer.currentBalance);
    customer.lastPaymentDate = data.paymentDate;
    customer.lastPaymentAmount = data.amount;
    localStorage.setItem('ria_ar_customers', JSON.stringify(this.customerAccounts));

    payment.status = 'processed';
    this.payments.push(payment);
    localStorage.setItem('ria_ar_payments', JSON.stringify(this.payments));

    return payment;
  }

  async getPayments(customerId?: string): Promise<PaginatedResponse<ARPayment>> {
    let payments = this.payments;
    
    if (customerId) {
      payments = payments.filter(p => p.customerId === customerId);
    }

    return {
      data: payments,
      pagination: {
        page: 1,
        limit: 100,
        total: payments.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  async getAgingReport(asOfDate?: string): Promise<AgingReport> {
    const invoices = this.getFromStorage();
    const reportDate = asOfDate || new Date().toISOString().split('T')[0];
    const reportDateObj = new Date(reportDate);

    // Initialize aging buckets
    const buckets: AgingBucketSummary[] = [
      { bucket: 'current', label: 'Current', amount: 0, percentage: 0, invoiceCount: 0, customerCount: 0 },
      { bucket: '1-30', label: '1-30 Days', amount: 0, percentage: 0, invoiceCount: 0, customerCount: 0 },
      { bucket: '31-60', label: '31-60 Days', amount: 0, percentage: 0, invoiceCount: 0, customerCount: 0 },
      { bucket: '61-90', label: '61-90 Days', amount: 0, percentage: 0, invoiceCount: 0, customerCount: 0 },
      { bucket: 'over_90', label: 'Over 90 Days', amount: 0, percentage: 0, invoiceCount: 0, customerCount: 0 }
    ];

    const customerAgingMap = new Map<string, CustomerAging>();
    let totalReceivables = 0;

    // Process invoices
    invoices.forEach(invoice => {
      if (invoice.amountDue > 0 && invoice.status !== 'voided') {
        const dueDate = new Date(invoice.dueDate);
        const daysPastDue = Math.floor((reportDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const bucket = this.getAgingBucket(daysPastDue);
        const bucketIndex = buckets.findIndex(b => b.bucket === bucket);

        if (bucketIndex !== -1) {
          buckets[bucketIndex].amount += invoice.amountDue;
          buckets[bucketIndex].invoiceCount++;
          totalReceivables += invoice.amountDue;

          // Update customer aging
          if (!customerAgingMap.has(invoice.customerId)) {
            const customer = this.customerAccounts.find(c => c.customerId === invoice.customerId);
            if (customer) {
              customerAgingMap.set(invoice.customerId, {
                customerId: customer.customerId,
                customerName: customer.customerName,
                customerNumber: customer.customerNumber,
                creditLimit: customer.creditLimit,
                currentBalance: 0,
                days1to30: 0,
                days31to60: 0,
                days61to90: 0,
                over90Days: 0,
                totalBalance: 0,
                creditStatus: customer.creditStatus,
                riskLevel: customer.riskLevel,
                lastPaymentDate: customer.lastPaymentDate,
                lastPaymentAmount: customer.lastPaymentAmount,
                averagePaymentDays: customer.averagePaymentDays
              });
            }
          }

          const customerAging = customerAgingMap.get(invoice.customerId);
          if (customerAging) {
            switch (bucket) {
              case 'current':
                customerAging.currentBalance += invoice.amountDue;
                break;
              case '1-30':
                customerAging.days1to30 += invoice.amountDue;
                break;
              case '31-60':
                customerAging.days31to60 += invoice.amountDue;
                break;
              case '61-90':
                customerAging.days61to90 += invoice.amountDue;
                break;
              case 'over_90':
                customerAging.over90Days += invoice.amountDue;
                break;
            }
            customerAging.totalBalance += invoice.amountDue;
          }
        }
      }
    });

    // Calculate percentages and customer counts
    buckets.forEach(bucket => {
      bucket.percentage = totalReceivables > 0 ? (bucket.amount / totalReceivables) * 100 : 0;
      
      // Count unique customers in this bucket
      const customersInBucket = new Set<string>();
      invoices.forEach(invoice => {
        if (invoice.amountDue > 0 && invoice.status !== 'voided') {
          const dueDate = new Date(invoice.dueDate);
          const daysPastDue = Math.floor((reportDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (this.getAgingBucket(daysPastDue) === bucket.bucket) {
            customersInBucket.add(invoice.customerId);
          }
        }
      });
      bucket.customerCount = customersInBucket.size;
    });

    const totalCurrent = buckets[0].amount;
    const totalPastDue = totalReceivables - totalCurrent;

    return {
      reportDate,
      totalReceivables,
      totalCurrent,
      totalPastDue,
      agingBuckets: buckets,
      customerAging: Array.from(customerAgingMap.values()),
      averageDaysSalesOutstanding: 45, // Mock value
      percentageCurrent: totalReceivables > 0 ? (totalCurrent / totalReceivables) * 100 : 0,
      percentagePastDue: totalReceivables > 0 ? (totalPastDue / totalReceivables) * 100 : 0
    };
  }

  async markForCollections(invoiceId: string): Promise<ARInvoice> {
    const invoices = this.getFromStorage();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.collectionsStatus = 'in_collections';
    invoice.updatedAt = new Date().toISOString();

    this.saveToStorage(invoices);
    return invoice;
  }
}

export const accountsReceivableRepository = new MockAccountsReceivableRepository();