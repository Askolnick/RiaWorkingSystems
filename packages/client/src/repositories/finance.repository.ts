import { BaseRepository } from './base.repository';
import type { 
  Invoice, 
  Transaction, 
  FinancialStats,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO 
} from '../types';

/**
 * Mock invoice generator
 */
const generateMockInvoices = (): Invoice[] => {
  return [
    {
      id: '1',
      number: 'INV-2025-001',
      clientId: 'client-1',
      clientName: 'ABC Corporation',
      clientEmail: 'billing@abc-corp.com',
      date: '2025-01-15',
      dueDate: '2025-02-15',
      items: [
        { id: '1', description: 'Consulting Services', quantity: 40, rate: 150, amount: 6000 },
        { id: '2', description: 'Development', quantity: 80, rate: 125, amount: 10000 },
      ],
      subtotal: 16000,
      tax: 1600,
      total: 17600,
      status: 'sent',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      number: 'INV-2025-002',
      clientId: 'client-2',
      clientName: 'XYZ Limited',
      clientEmail: 'accounts@xyz-ltd.com',
      date: '2025-01-20',
      dueDate: '2025-02-20',
      items: [
        { id: '3', description: 'Software License', quantity: 5, rate: 500, amount: 2500 },
        { id: '4', description: 'Support Package', quantity: 1, rate: 1000, amount: 1000 },
      ],
      subtotal: 3500,
      tax: 350,
      total: 3850,
      status: 'paid',
      paidAt: '2025-01-25T14:30:00Z',
      createdAt: '2025-01-20T09:00:00Z',
      updatedAt: '2025-01-25T14:30:00Z',
    },
    {
      id: '3',
      number: 'INV-2025-003',
      clientId: 'client-3',
      clientName: 'Tech Startup Inc',
      date: '2025-01-25',
      dueDate: '2025-02-25',
      items: [
        { id: '5', description: 'MVP Development', quantity: 1, rate: 25000, amount: 25000 },
      ],
      subtotal: 25000,
      tax: 2500,
      total: 27500,
      status: 'draft',
      createdAt: '2025-01-25T11:00:00Z',
      updatedAt: '2025-01-25T11:00:00Z',
    },
  ];
};

/**
 * Mock transaction generator
 */
const generateMockTransactions = (): Transaction[] => {
  return [
    {
      id: '1',
      date: '2025-01-26',
      description: 'Office Rent - January',
      category: 'Rent',
      type: 'expense',
      amount: 3500,
      accountName: 'Business Checking',
      reconciled: true,
      tags: ['office', 'monthly'],
      createdAt: '2025-01-26T09:00:00Z',
      updatedAt: '2025-01-26T09:00:00Z',
    },
    {
      id: '2',
      date: '2025-01-25',
      description: 'Payment from ABC Corporation',
      category: 'Revenue',
      type: 'income',
      amount: 17600,
      accountName: 'Business Checking',
      reference: 'INV-2025-001',
      reconciled: false,
      tags: ['consulting'],
      createdAt: '2025-01-25T14:30:00Z',
      updatedAt: '2025-01-25T14:30:00Z',
    },
    {
      id: '3',
      date: '2025-01-24',
      description: 'Software Subscriptions',
      category: 'Software',
      type: 'expense',
      amount: 299,
      accountName: 'Business Credit Card',
      reconciled: true,
      tags: ['monthly', 'saas'],
      createdAt: '2025-01-24T10:00:00Z',
      updatedAt: '2025-01-24T10:00:00Z',
    },
    {
      id: '4',
      date: '2025-01-23',
      description: 'Client Lunch Meeting',
      category: 'Meals',
      type: 'expense',
      amount: 125.50,
      accountName: 'Business Credit Card',
      reconciled: false,
      tags: ['client', 'deductible'],
      createdAt: '2025-01-23T13:00:00Z',
      updatedAt: '2025-01-23T13:00:00Z',
    },
    {
      id: '5',
      date: '2025-01-22',
      description: 'Payment from XYZ Limited',
      category: 'Revenue',
      type: 'income',
      amount: 3850,
      accountName: 'Business Checking',
      reference: 'INV-2025-002',
      reconciled: true,
      tags: ['support'],
      createdAt: '2025-01-22T11:00:00Z',
      updatedAt: '2025-01-22T11:00:00Z',
    },
  ];
};

/**
 * Repository for invoice operations
 */
export class InvoiceRepository extends BaseRepository<Invoice, CreateInvoiceDTO, UpdateInvoiceDTO> {
  protected endpoint = '/api/finance/invoices';
  private mockData: Invoice[] = generateMockInvoices();

  async findAll() {
    // Return mock data for development  
    const pageSize = 10;
    const totalPages = Math.ceil(this.mockData.length / pageSize);
    return {
      data: this.mockData,
      total: this.mockData.length,
      page: 1,
      limit: pageSize,
      hasMore: 1 < totalPages,
    };
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = this.mockData.find(i => i.id === id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string): Promise<Invoice> {
    return this.update(id, { status: 'paid', paidAt: new Date().toISOString() });
  }

  /**
   * Send invoice to client
   */
  async sendToClient(id: string): Promise<void> {
    // In production, this would send an email
    console.log(`Sending invoice ${id} to client`);
  }

  /**
   * Generate PDF for invoice
   */
  async generatePDF(id: string): Promise<Blob> {
    // In production, this would generate a real PDF
    return new Blob(['PDF content'], { type: 'application/pdf' });
  }
}

/**
 * Repository for transaction operations
 */
export class TransactionRepository extends BaseRepository<Transaction, CreateTransactionDTO, UpdateTransactionDTO> {
  protected endpoint = '/api/finance/transactions';
  private mockData: Transaction[] = generateMockTransactions();

  async findAll() {
    // Return mock data for development
    const pageSize = 10;
    const totalPages = Math.ceil(this.mockData.length / pageSize);
    return {
      data: this.mockData,
      total: this.mockData.length,
      page: 1,
      limit: pageSize,
      hasMore: 1 < totalPages,
    };
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = this.mockData.find(t => t.id === id);
    if (!transaction) throw new Error('Transaction not found');
    return transaction;
  }

  /**
   * Get transactions by category
   */
  async getByCategory(category: string): Promise<Transaction[]> {
    const response = await this.findAll({ category });
    return response.data;
  }

  /**
   * Get transactions for date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const response = await this.findAll({ startDate, endDate });
    return response.data;
  }

  /**
   * Reconcile transaction
   */
  async reconcile(id: string): Promise<Transaction> {
    return this.update(id, { reconciled: true });
  }
}

/**
 * Repository for financial statistics
 */
export class FinanceStatsRepository {
  private endpoint = '/api/finance/stats';

  /**
   * Get financial overview stats
   */
  async getOverview(): Promise<FinancialStats> {
    // Mock data for development
    return {
      totalRevenue: 125430.00,
      totalExpenses: 45200.00,
      netProfit: 80230.00,
      profitMargin: 64.0,
      pendingInvoices: 8,
      overdueInvoices: 2,
      monthlyRevenue: [
        { month: 'Jan', revenue: 12000, expenses: 4500 },
        { month: 'Feb', revenue: 15000, expenses: 5200 },
        { month: 'Mar', revenue: 18000, expenses: 6100 },
        { month: 'Apr', revenue: 14500, expenses: 4800 },
        { month: 'May', revenue: 19000, expenses: 5500 },
        { month: 'Jun', revenue: 21500, expenses: 6200 },
      ],
      revenueByCategory: [
        { category: 'Consulting', amount: 45000 },
        { category: 'Development', amount: 60000 },
        { category: 'Support', amount: 20430 },
      ],
    };
  }

  /**
   * Get cash flow data
   */
  async getCashFlow(period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<any> {
    // Mock data for development
    return {
      period,
      data: [
        { date: '2024-01', inflow: 15000, outflow: 8000 },
        { date: '2024-02', inflow: 18000, outflow: 9500 },
        { date: '2024-03', inflow: 22000, outflow: 11000 },
        { date: '2024-04', inflow: 19500, outflow: 10200 },
      ]
    };
  }

  /**
   * Get accounts receivable aging
   */
  async getReceivableAging(): Promise<any> {
    return {
      current: 45000,
      thirtyDays: 12000,
      sixtyDays: 5000,
      ninetyDays: 2000,
      overNinetyDays: 500,
    };
  }
}

// Export singleton instances
export const invoiceRepository = new InvoiceRepository();
export const transactionRepository = new TransactionRepository();
export const financeStatsRepository = new FinanceStatsRepository();