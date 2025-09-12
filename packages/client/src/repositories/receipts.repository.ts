import { BaseRepository } from './base.repository';
import type {
  Receipt,
  CreateReceiptData,
  ReceiptFilters,
  ReceiptStatistics,
  ApprovalRequest,
  ExpenseCategory,
  BankTransaction,
  TransactionMatch,
  AuditReport
} from '@ria/receipt-manager-server';

/**
 * Mock receipt data generator
 */
const generateMockReceipts = (): Receipt[] => {
  return [
    {
      id: 'receipt-1',
      tenantId: 'tenant-1',
      receiptNumber: 'RCP-001',
      vendor: 'Starbucks Coffee',
      vendorAddress: '123 Main St, Seattle, WA',
      transactionDate: '2025-01-10',
      amount: 8.50,
      tax: 0.75,
      totalAmount: 9.25,
      currency: 'USD',
      paymentMethod: 'credit_card',
      category: 'Meals & Entertainment',
      subcategory: 'Coffee & Beverages',
      expenseType: 'business',
      lineItems: [
        {
          id: 'item-1',
          description: 'Grande Latte',
          quantity: 1,
          unitPrice: 5.25,
          amount: 5.25,
          tax: 0.46,
          category: 'Beverages'
        },
        {
          id: 'item-2',
          description: 'Blueberry Muffin',
          quantity: 1,
          unitPrice: 3.25,
          amount: 3.25,
          tax: 0.29,
          category: 'Food'
        }
      ],
      fileUrl: '/uploads/tenant-1/receipt-1.jpg',
      ocrData: {
        vendor: 'Starbucks Coffee',
        date: '2025-01-10',
        amount: 8.50,
        tax: 0.75,
        total: 9.25,
        currency: 'USD',
        items: [],
        rawText: 'STARBUCKS COFFEE\n123 Main St\nSeattle, WA 98101\n\nGrande Latte     $5.25\nBlueberry Muffin $3.25\nSubtotal         $8.50\nTax              $0.75\nTotal            $9.25',
        confidence: 94,
        provider: 'tesseract'
      },
      imageUrls: ['/uploads/tenant-1/receipt-1.jpg'],
      matchedTransactionId: 'txn-123',
      matchConfidence: 95,
      matchStatus: 'matched',
      matchedAt: '2025-01-10T14:30:00Z',
      status: 'verified',
      verificationStatus: 'auto_verified',
      notes: 'Client meeting coffee',
      tags: ['client', 'meeting', 'deductible'],
      createdBy: 'user-1',
      createdAt: '2025-01-10T14:25:00Z',
      updatedBy: 'user-1',
      updatedAt: '2025-01-10T14:30:00Z'
    },
    {
      id: 'receipt-2',
      tenantId: 'tenant-1',
      receiptNumber: 'RCP-002',
      vendor: 'Uber',
      transactionDate: '2025-01-09',
      amount: 28.75,
      tax: 2.50,
      totalAmount: 31.25,
      currency: 'USD',
      paymentMethod: 'credit_card',
      category: 'Travel',
      expenseType: 'business',
      lineItems: [
        {
          id: 'item-3',
          description: 'Uber Ride - Downtown to Airport',
          quantity: 1,
          unitPrice: 28.75,
          amount: 28.75,
          tax: 2.50
        }
      ],
      fileUrl: '/uploads/tenant-1/receipt-2.pdf',
      imageUrls: ['/uploads/tenant-1/receipt-2.pdf'],
      matchStatus: 'unmatched',
      status: 'pending',
      verificationStatus: 'unverified',
      notes: 'Airport transportation for business trip',
      tags: ['travel', 'airport', 'deductible'],
      createdBy: 'user-1',
      createdAt: '2025-01-09T16:45:00Z',
      updatedBy: 'user-1',
      updatedAt: '2025-01-09T16:45:00Z'
    },
    {
      id: 'receipt-3',
      tenantId: 'tenant-1',
      receiptNumber: 'RCP-003',
      vendor: 'Office Depot',
      transactionDate: '2025-01-08',
      amount: 156.80,
      tax: 13.20,
      totalAmount: 170.00,
      currency: 'USD',
      paymentMethod: 'credit_card',
      category: 'Office Supplies',
      expenseType: 'business',
      lineItems: [
        {
          id: 'item-4',
          description: 'Printer Paper - 10 reams',
          quantity: 10,
          unitPrice: 8.99,
          amount: 89.90,
          tax: 7.59
        },
        {
          id: 'item-5',
          description: 'Black Ink Cartridges',
          quantity: 4,
          unitPrice: 16.75,
          amount: 67.00,
          tax: 5.65
        }
      ],
      fileUrl: '/uploads/tenant-1/receipt-3.jpg',
      imageUrls: ['/uploads/tenant-1/receipt-3.jpg'],
      matchedTransactionId: 'txn-456',
      matchConfidence: 88,
      matchStatus: 'confirmed',
      matchedAt: '2025-01-08T11:15:00Z',
      status: 'verified',
      verificationStatus: 'manually_verified',
      notes: 'Office supplies for Q1',
      tags: ['office', 'supplies', 'quarterly'],
      createdBy: 'user-2',
      createdAt: '2025-01-08T11:00:00Z',
      updatedBy: 'user-1',
      updatedAt: '2025-01-08T15:30:00Z'
    }
  ];
};

/**
 * Receipt Repository for managing expense receipts
 */
export class ReceiptsRepository extends BaseRepository<Receipt, CreateReceiptData, Partial<Receipt>> {
  protected endpoint = '/api/receipts';
  private mockData: Receipt[] = generateMockReceipts();

  async findAll(filters?: ReceiptFilters) {
    let filteredData = [...this.mockData];

    if (filters) {
      // Apply status filter
      if (filters.status && filters.status.length > 0) {
        filteredData = filteredData.filter(r => filters.status!.includes(r.status));
      }

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        filteredData = filteredData.filter(r => filters.categories!.includes(r.category));
      }

      // Apply vendor filter
      if (filters.vendors && filters.vendors.length > 0) {
        filteredData = filteredData.filter(r => 
          filters.vendors!.some(v => r.vendor.toLowerCase().includes(v.toLowerCase()))
        );
      }

      // Apply date range filter
      if (filters.dateFrom) {
        filteredData = filteredData.filter(r => r.transactionDate >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredData = filteredData.filter(r => r.transactionDate <= filters.dateTo!);
      }

      // Apply amount range filter
      if (filters.amountMin !== undefined) {
        filteredData = filteredData.filter(r => r.totalAmount >= filters.amountMin!);
      }
      if (filters.amountMax !== undefined) {
        filteredData = filteredData.filter(r => r.totalAmount <= filters.amountMax!);
      }

      // Apply receipt requirement filter
      if (filters.hasReceipt !== undefined) {
        filteredData = filteredData.filter(r => 
          filters.hasReceipt ? r.fileUrl !== undefined : r.fileUrl === undefined
        );
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(r => 
          filters.tags!.some(tag => r.tags.includes(tag))
        );
      }
    }

    const pageSize = 20;
    const totalPages = Math.ceil(filteredData.length / pageSize);
    
    return {
      data: filteredData,
      total: filteredData.length,
      page: 1,
      limit: pageSize,
      hasMore: 1 < totalPages,
    };
  }

  async findById(id: string): Promise<Receipt> {
    const receipt = this.mockData.find(r => r.id === id);
    if (!receipt) throw new Error('Receipt not found');
    return receipt;
  }

  /**
   * Upload and process receipt
   */
  async uploadReceipt(formData: FormData): Promise<Receipt> {
    // In production, this would handle file upload and OCR processing
    const mockReceipt: Receipt = {
      id: `receipt-${Date.now()}`,
      tenantId: 'tenant-1',
      receiptNumber: `RCP-${String(this.mockData.length + 1).padStart(3, '0')}`,
      vendor: 'New Vendor',
      transactionDate: new Date().toISOString().split('T')[0],
      amount: 50.00,
      tax: 4.00,
      totalAmount: 54.00,
      currency: 'USD',
      paymentMethod: 'credit_card',
      category: 'Uncategorized',
      expenseType: 'business',
      lineItems: [],
      fileUrl: `/uploads/tenant-1/receipt-${Date.now()}.jpg`,
      imageUrls: [`/uploads/tenant-1/receipt-${Date.now()}.jpg`],
      matchStatus: 'unmatched',
      status: 'pending',
      verificationStatus: 'unverified',
      notes: '',
      tags: [],
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedBy: 'current-user',
      updatedAt: new Date().toISOString()
    };

    this.mockData.push(mockReceipt);
    return mockReceipt;
  }

  /**
   * Categorize receipt
   */
  async categorizeReceipt(id: string, categoryId: string, subcategory?: string): Promise<Receipt> {
    const receipt = await this.findById(id);
    const updatedReceipt = {
      ...receipt,
      category: categoryId,
      subcategory,
      updatedAt: new Date().toISOString()
    };
    
    const index = this.mockData.findIndex(r => r.id === id);
    this.mockData[index] = updatedReceipt;
    
    return updatedReceipt;
  }

  /**
   * Approve or reject receipt
   */
  async updateReceiptStatus(
    id: string, 
    status: 'verified' | 'archived' | 'deleted',
    notes?: string
  ): Promise<Receipt> {
    const receipt = await this.findById(id);
    const updatedReceipt = {
      ...receipt,
      status,
      notes: notes || receipt.notes,
      verificationStatus: status === 'verified' ? 'manually_verified' as const : receipt.verificationStatus,
      updatedAt: new Date().toISOString()
    };
    
    const index = this.mockData.findIndex(r => r.id === id);
    this.mockData[index] = updatedReceipt;
    
    return updatedReceipt;
  }

  /**
   * Match receipt with bank transaction
   */
  async matchWithTransaction(receiptId: string, transactionId: string): Promise<Receipt> {
    const receipt = await this.findById(receiptId);
    const updatedReceipt = {
      ...receipt,
      matchedTransactionId: transactionId,
      matchConfidence: 95,
      matchStatus: 'matched' as const,
      matchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const index = this.mockData.findIndex(r => r.id === receiptId);
    this.mockData[index] = updatedReceipt;
    
    return updatedReceipt;
  }

  /**
   * Get receipt statistics
   */
  async getStatistics(filters?: ReceiptFilters): Promise<ReceiptStatistics> {
    const receipts = (await this.findAll(filters)).data;
    
    const totalAmount = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const matchedReceipts = receipts.filter(r => r.matchStatus === 'matched' || r.matchStatus === 'confirmed');
    
    // Group by category
    const byCategory: Record<string, { count: number; amount: number }> = {};
    receipts.forEach(r => {
      if (!byCategory[r.category]) {
        byCategory[r.category] = { count: 0, amount: 0 };
      }
      byCategory[r.category].count++;
      byCategory[r.category].amount += r.totalAmount;
    });

    // Group by vendor (top 10)
    const vendorGroups: Record<string, { count: number; amount: number }> = {};
    receipts.forEach(r => {
      if (!vendorGroups[r.vendor]) {
        vendorGroups[r.vendor] = { count: 0, amount: 0 };
      }
      vendorGroups[r.vendor].count++;
      vendorGroups[r.vendor].amount += r.totalAmount;
    });

    const byVendor = Object.entries(vendorGroups)
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Group by payment method
    const byPaymentMethod: Record<string, number> = {};
    receipts.forEach(r => {
      byPaymentMethod[r.paymentMethod] = (byPaymentMethod[r.paymentMethod] || 0) + 1;
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReceipts = receipts.filter(r => r.createdAt.split('T')[0] === dateStr);
      const dayMatched = receipts.filter(r => r.matchedAt && r.matchedAt.split('T')[0] === dateStr);
      
      recentActivity.push({
        date: dateStr,
        receiptsAdded: dayReceipts.length,
        receiptsMatched: dayMatched.length
      });
    }

    return {
      totalReceipts: receipts.length,
      totalAmount,
      averageAmount: receipts.length > 0 ? totalAmount / receipts.length : 0,
      
      matchedCount: matchedReceipts.length,
      unmatchedCount: receipts.length - matchedReceipts.length,
      matchRate: receipts.length > 0 ? (matchedReceipts.length / receipts.length) * 100 : 0,
      
      byStatus: {
        draft: receipts.filter(r => r.status === 'draft').length,
        pending: receipts.filter(r => r.status === 'pending').length,
        verified: receipts.filter(r => r.status === 'verified').length,
        matched: receipts.filter(r => r.status === 'matched').length,
        archived: receipts.filter(r => r.status === 'archived').length,
        deleted: receipts.filter(r => r.status === 'deleted').length
      },
      
      byCategory,
      byVendor,
      byPaymentMethod,
      recentActivity
    };
  }

  /**
   * Bulk operations
   */
  async bulkApprove(receiptIds: string[], notes?: string): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const id of receiptIds) {
      try {
        await this.updateReceiptStatus(id, 'verified', notes);
        successful.push(id);
      } catch (error) {
        failed.push(id);
      }
    }

    return { successful, failed };
  }

  async bulkCategorize(receiptIds: string[], categoryId: string): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const id of receiptIds) {
      try {
        await this.categorizeReceipt(id, categoryId);
        successful.push(id);
      } catch (error) {
        failed.push(id);
      }
    }

    return { successful, failed };
  }

  /**
   * Export receipts
   */
  async exportReceipts(
    format: 'pdf' | 'csv' | 'excel',
    filters?: ReceiptFilters
  ): Promise<{ url: string; filename: string }> {
    // In production, this would generate actual export files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `receipts-export-${timestamp}.${format}`;
    const url = `/api/exports/${filename}`;
    
    return { url, filename };
  }
}

// Singleton instance
let _receiptsRepository: ReceiptsRepository | null = null;

export const receiptsRepository = {
  get instance(): ReceiptsRepository {
    if (!_receiptsRepository) {
      _receiptsRepository = new ReceiptsRepository();
    }
    return _receiptsRepository;
  }
};