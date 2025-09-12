import { MockRepository } from './base.repository';

// Define types locally until receipt-manager-server is available
interface Receipt {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  vendor?: string;
  description?: string;
  imageUrl?: string;
  status: 'pending' | 'processed' | 'matched';
}

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
}

interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  description: string;
  category?: string;
  status: 'unmatched' | 'matched' | 'reviewed';
}

interface TransactionMatch {
  transactionId: string;
  receiptId: string;
  confidence: number;
  matchedAt: string;
}

interface AuditReport {
  id: string;
  period: string;
  totalReceipts: number;
  totalTransactions: number;
  matchedCount: number;
  unmatchedCount: number;
  discrepancies: any[];
}

interface CreateReceiptData {
  name: string;
  amount: number;
  date: string;
  category?: string;
  vendor?: string;
  description?: string;
}

interface ConnectBankAccountData {
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
}

interface MatchTransactionData {
  transactionId: string;
  receiptId: string;
}
interface GenerateAuditReportData {
  startDate: string;
  endDate: string;
  includeUnmatched?: boolean;
}

interface ReceiptFilters {
  status?: 'pending' | 'processed' | 'matched';
  startDate?: string;
  endDate?: string;
  category?: string;
  vendor?: string;
}

interface TransactionFilters {
  status?: 'unmatched' | 'matched' | 'reviewed';
  startDate?: string;
  endDate?: string;
  accountId?: string;
}

interface ReceiptStatistics {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  processedCount: number;
  matchedCount: number;
}
interface MatchingStatistics {
  totalMatched: number;
  totalUnmatched: number;
  averageConfidence: number;
  lastMatchedAt?: string;
}

interface MatchingRule {
  id: string;
  field: 'amount' | 'date' | 'description';
  tolerance?: number;
  weight: number;
}

type ReceiptStatus = 'pending' | 'processed' | 'matched';
type MatchStatus = 'unmatched' | 'matched' | 'reviewed';
type ConnectionStatus = 'connected' | 'disconnected' | 'pending';
type AuditReportType = 'monthly' | 'quarterly' | 'yearly' | 'custom';
type PaymentMethod = 'cash' | 'credit' | 'debit' | 'check' | 'transfer';
type ExpenseType = 'business' | 'personal' | 'travel' | 'entertainment' | 'other';
type VerificationStatus = 'verified' | 'unverified' | 'pending';
type AccountType = 'checking' | 'savings' | 'credit';
type SyncFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';
type MatchMethod = 'automatic' | 'manual' | 'suggested';
type MatchApprovalStatus = 'approved' | 'rejected' | 'pending';
type AuditReportStatus = 'draft' | 'finalized' | 'archived';
type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export class ReceiptManagerRepository extends MockRepository<Receipt> {
  protected endpoint = '/receipts';
  protected storageKey = 'ria_receipts';
  
  private bankAccounts: BankAccount[] = [];
  private bankTransactions: BankTransaction[] = [];
  private transactionMatches: TransactionMatch[] = [];
  private auditReports: AuditReport[] = [];
  private matchingRules: MatchingRule[] = [];
  
  constructor() {
    super();
    // Skip initialization during SSR
    if (typeof window !== 'undefined') {
      this.initializeMockData();
    }
  }
  
  private initializeMockData() {
    // Initialize mock receipts
    this.data = [
      {
        id: '1',
        tenantId: 'tenant-1',
        vendor: 'Office Supplies Co',
        vendorTaxId: '12-3456789',
        transactionDate: '2024-01-15',
        amount: 450.00,
        tax: 40.50,
        totalAmount: 490.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        category: 'Office Supplies',
        subcategory: 'Equipment',
        expenseType: 'business',
        lineItems: [
          {
            id: 'li-1',
            description: 'Ergonomic Office Chair',
            quantity: 1,
            unitPrice: 350.00,
            amount: 350.00,
            tax: 31.50,
            category: 'Furniture'
          },
          {
            id: 'li-2',
            description: 'Desk Lamp',
            quantity: 2,
            unitPrice: 50.00,
            amount: 100.00,
            tax: 9.00,
            category: 'Lighting'
          }
        ],
        imageUrls: ['/receipts/receipt-1.jpg'],
        matchedTransactionId: 'bt-1',
        matchConfidence: 95,
        matchStatus: 'confirmed',
        matchedAt: '2024-01-16T10:30:00Z',
        status: 'verified',
        verificationStatus: 'manually_verified',
        tags: ['q1-2024', 'office-setup'],
        createdBy: 'user-1',
        createdAt: '2024-01-15T14:30:00Z',
        updatedBy: 'user-1',
        updatedAt: '2024-01-16T10:30:00Z'
      },
      {
        id: '2',
        tenantId: 'tenant-1',
        vendor: 'Tech Solutions Inc',
        transactionDate: '2024-01-20',
        amount: 1200.00,
        tax: 108.00,
        totalAmount: 1308.00,
        currency: 'USD',
        paymentMethod: 'bank_transfer',
        category: 'Technology',
        subcategory: 'Software',
        expenseType: 'business',
        lineItems: [
          {
            id: 'li-3',
            description: 'Annual Software License',
            quantity: 1,
            unitPrice: 1200.00,
            amount: 1200.00,
            tax: 108.00,
            category: 'Software'
          }
        ],
        imageUrls: ['/receipts/receipt-2.pdf'],
        matchStatus: 'suggested',
        status: 'pending',
        verificationStatus: 'unverified',
        tags: ['software', 'annual'],
        createdBy: 'user-1',
        createdAt: '2024-01-20T09:15:00Z',
        updatedBy: 'user-1',
        updatedAt: '2024-01-20T09:15:00Z'
      },
      {
        id: '3',
        tenantId: 'tenant-1',
        vendor: 'Restaurant ABC',
        transactionDate: '2024-01-22',
        amount: 85.00,
        tax: 7.65,
        totalAmount: 92.65,
        currency: 'USD',
        paymentMethod: 'credit_card',
        category: 'Meals & Entertainment',
        subcategory: 'Client Meals',
        expenseType: 'business',
        lineItems: [],
        imageUrls: ['/receipts/receipt-3.jpg'],
        matchStatus: 'unmatched',
        status: 'pending',
        verificationStatus: 'auto_verified',
        notes: 'Client lunch meeting - Project X',
        tags: ['client-meeting', 'project-x'],
        createdBy: 'user-1',
        createdAt: '2024-01-22T13:45:00Z',
        updatedBy: 'user-1',
        updatedAt: '2024-01-22T13:45:00Z'
      }
    ];
    
    // Initialize mock bank accounts
    this.bankAccounts = [
      {
        id: 'ba-1',
        tenantId: 'tenant-1',
        institutionId: 'chase',
        institutionName: 'Chase Bank',
        accountName: 'Business Checking',
        accountNumber: '****1234',
        accountType: 'checking',
        connectionStatus: 'connected',
        lastSyncedAt: '2024-01-25T08:00:00Z',
        syncFrequency: 'daily',
        currentBalance: 25000.00,
        availableBalance: 24500.00,
        currency: 'USD',
        autoMatch: true,
        autoSync: true,
        matchingRules: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-25T08:00:00Z'
      },
      {
        id: 'ba-2',
        tenantId: 'tenant-1',
        institutionId: 'amex',
        institutionName: 'American Express',
        accountName: 'Business Card',
        accountNumber: '****5678',
        accountType: 'credit',
        connectionStatus: 'connected',
        lastSyncedAt: '2024-01-25T08:00:00Z',
        syncFrequency: 'realtime',
        currentBalance: -3500.00,
        availableBalance: 16500.00,
        currency: 'USD',
        autoMatch: true,
        autoSync: true,
        matchingRules: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-25T08:00:00Z'
      }
    ];
    
    // Initialize mock bank transactions
    this.bankTransactions = [
      {
        id: 'bt-1',
        tenantId: 'tenant-1',
        bankAccountId: 'ba-2',
        transactionId: 'amex-tx-001',
        transactionDate: '2024-01-15',
        postingDate: '2024-01-16',
        amount: -490.50,
        currency: 'USD',
        description: 'OFFICE SUPPLIES CO',
        merchantName: 'Office Supplies Co',
        category: ['Shops', 'Office Supplies'],
        paymentChannel: 'in_store',
        matchedReceiptId: '1',
        matchConfidence: 95,
        matchStatus: 'confirmed',
        matchedAt: '2024-01-16T10:30:00Z',
        isPending: false,
        isReconciled: true,
        reconciledAt: '2024-01-16T10:30:00Z',
        importedAt: '2024-01-16T08:00:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      },
      {
        id: 'bt-2',
        tenantId: 'tenant-1',
        bankAccountId: 'ba-1',
        transactionId: 'chase-tx-002',
        transactionDate: '2024-01-20',
        postingDate: '2024-01-20',
        amount: -1308.00,
        currency: 'USD',
        description: 'TECH SOLUTIONS INC ACH',
        merchantName: 'Tech Solutions Inc',
        category: ['Service', 'Technology'],
        paymentChannel: 'online',
        matchStatus: 'suggested',
        isPending: false,
        isReconciled: false,
        importedAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:00:00Z'
      },
      {
        id: 'bt-3',
        tenantId: 'tenant-1',
        bankAccountId: 'ba-2',
        transactionId: 'amex-tx-003',
        transactionDate: '2024-01-22',
        postingDate: '2024-01-22',
        amount: -92.65,
        currency: 'USD',
        description: 'RESTAURANT ABC',
        merchantName: 'Restaurant ABC',
        category: ['Food & Drink', 'Restaurants'],
        location: {
          city: 'New York',
          region: 'NY',
          country: 'US'
        },
        paymentChannel: 'in_store',
        matchStatus: 'unmatched',
        isPending: false,
        isReconciled: false,
        importedAt: '2024-01-22T14:00:00Z',
        updatedAt: '2024-01-22T14:00:00Z'
      },
      {
        id: 'bt-4',
        tenantId: 'tenant-1',
        bankAccountId: 'ba-2',
        transactionId: 'amex-tx-004',
        transactionDate: '2024-01-23',
        postingDate: '2024-01-23',
        amount: -156.80,
        currency: 'USD',
        description: 'AMAZON.COM',
        merchantName: 'Amazon',
        category: ['Shops', 'Online Marketplace'],
        paymentChannel: 'online',
        matchStatus: 'unmatched',
        isPending: false,
        isReconciled: false,
        notes: 'Multiple items - need receipt',
        importedAt: '2024-01-23T10:00:00Z',
        updatedAt: '2024-01-23T10:00:00Z'
      }
    ];
    
    // Initialize matching rules
    this.matchingRules = [
      {
        id: 'rule-1',
        name: 'Exact Amount Match',
        description: 'Match transactions with exact same amount',
        ruleType: 'amount',
        conditions: [
          {
            field: 'amount',
            operator: 'equals',
            value: 0
          }
        ],
        amountTolerance: 0,
        amountToleranceType: 'fixed',
        weight: 0.4,
        minimumScore: 100,
        isActive: true,
        priority: 1
      },
      {
        id: 'rule-2',
        name: 'Same Day Match',
        description: 'Match transactions on the same day',
        ruleType: 'date',
        conditions: [
          {
            field: 'date',
            operator: 'within',
            value: 0
          }
        ],
        dateTolerance: 0,
        weight: 0.3,
        minimumScore: 100,
        isActive: true,
        priority: 2
      },
      {
        id: 'rule-3',
        name: 'Fuzzy Vendor Match',
        description: 'Match vendors with similar names',
        ruleType: 'vendor',
        conditions: [
          {
            field: 'vendor',
            operator: 'contains',
            value: '',
            caseSensitive: false
          }
        ],
        weight: 0.3,
        minimumScore: 70,
        isActive: true,
        priority: 3
      }
    ];
    
    // Initialize audit reports
    this.auditReports = [
      {
        id: 'ar-1',
        tenantId: 'tenant-1',
        reportType: 'expense_report',
        title: 'Q1 2024 Expense Report',
        description: 'Quarterly expense report for Q1 2024',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        totalTransactions: 45,
        matchedTransactions: 38,
        unmatchedTransactions: 7,
        totalReceipts: 40,
        matchRate: 84.4,
        totalExpenses: 15680.50,
        totalIncome: 0,
        netAmount: -15680.50,
        currency: 'USD',
        categoryBreakdown: [
          {
            category: 'Office Supplies',
            transactionCount: 8,
            receiptCount: 8,
            totalAmount: 2450.00,
            matchRate: 100,
            topVendors: [
              {
                vendor: 'Office Supplies Co',
                transactionCount: 5,
                totalAmount: 1850.00,
                averageAmount: 370.00
              }
            ]
          },
          {
            category: 'Technology',
            transactionCount: 12,
            receiptCount: 10,
            totalAmount: 8500.00,
            matchRate: 83.3,
            topVendors: [
              {
                vendor: 'Tech Solutions Inc',
                transactionCount: 3,
                totalAmount: 3924.00,
                averageAmount: 1308.00
              }
            ]
          }
        ],
        complianceScore: 85,
        missingReceipts: 7,
        duplicateReceipts: 2,
        flaggedTransactions: 3,
        generatedBy: 'user-1',
        generatedAt: '2024-04-01T10:00:00Z',
        status: 'generated',
        exportFormat: 'pdf'
      }
    ];
  }
  
  // Receipt CRUD Operations
  async createReceipt(data: CreateReceiptData): Promise<{ data: Receipt }> {
    const receipt: Receipt = {
      id: Math.random().toString(36).substring(2),
      tenantId: 'tenant-1',
      vendor: data.vendor,
      transactionDate: data.transactionDate,
      amount: data.amount,
      tax: data.tax,
      totalAmount: data.totalAmount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      category: data.category,
      subcategory: data.subcategory,
      expenseType: data.expenseType,
      lineItems: data.lineItems || [],
      imageUrls: [],
      matchStatus: 'unmatched',
      status: 'pending',
      verificationStatus: 'unverified',
      notes: data.notes,
      tags: data.tags || [],
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedBy: 'user-1',
      updatedAt: new Date().toISOString()
    };
    
    this.data.push(receipt);
    this.setStorage(this.data);
    
    // Try to auto-match with transactions
    await this.autoMatchReceipt(receipt);
    
    return { data: receipt };
  }
  
  async uploadReceiptImage(receiptId: string, imageUrl: string): Promise<{ data: Receipt }> {
    const receipt = this.data.find(r => r.id === receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    
    receipt.imageUrls.push(imageUrl);
    receipt.updatedAt = new Date().toISOString();
    this.setStorage(this.data);
    
    // Trigger OCR processing (mock)
    await this.processOCR(receiptId);
    
    return { data: receipt };
  }
  
  async processOCR(receiptId: string): Promise<{ data: Receipt }> {
    const receipt = this.data.find(r => r.id === receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    
    // Mock OCR data
    receipt.ocrData = {
      vendor: receipt.vendor,
      date: receipt.transactionDate,
      amount: receipt.amount,
      tax: receipt.tax,
      total: receipt.totalAmount,
      currency: receipt.currency,
      items: receipt.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        confidence: 0.95
      })),
      rawText: 'Mock OCR raw text...',
      confidence: 0.92,
      provider: 'tesseract'
    };
    
    receipt.verificationStatus = 'auto_verified';
    receipt.updatedAt = new Date().toISOString();
    this.setStorage(this.data);
    
    return { data: receipt };
  }
  
  // Bank Account Operations
  async connectBankAccount(data: ConnectBankAccountData): Promise<{ data: BankAccount }> {
    // Mock Plaid connection
    const account: BankAccount = {
      id: `ba-${Math.random().toString(36).substring(2)}`,
      tenantId: 'tenant-1',
      institutionId: data.institutionId,
      institutionName: 'Mock Bank',
      accountName: 'Business Account',
      accountNumber: '****' + Math.floor(Math.random() * 10000),
      accountType: 'checking',
      connectionStatus: 'connected',
      lastSyncedAt: new Date().toISOString(),
      syncFrequency: 'daily',
      currentBalance: 10000,
      availableBalance: 9500,
      currency: 'USD',
      accessToken: 'mock-access-token',
      itemId: 'mock-item-id',
      autoMatch: true,
      autoSync: true,
      matchingRules: this.matchingRules,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.bankAccounts.push(account);
    
    // Trigger initial sync
    await this.syncBankTransactions(account.id);
    
    return { data: account };
  }
  
  async getBankAccounts(): Promise<{ data: BankAccount[] }> {
    return { data: this.bankAccounts };
  }
  
  async syncBankTransactions(bankAccountId: string): Promise<{ data: BankTransaction[] }> {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    if (!account) {
      throw new Error('Bank account not found');
    }
    
    // Mock syncing new transactions
    const newTransactions: BankTransaction[] = [
      {
        id: `bt-${Math.random().toString(36).substring(2)}`,
        tenantId: 'tenant-1',
        bankAccountId,
        transactionId: `mock-tx-${Date.now()}`,
        transactionDate: new Date().toISOString().split('T')[0],
        postingDate: new Date().toISOString().split('T')[0],
        amount: -(Math.random() * 500 + 50),
        currency: 'USD',
        description: 'Mock Transaction',
        merchantName: 'Mock Merchant',
        category: ['Mock Category'],
        paymentChannel: 'online',
        matchStatus: 'unmatched',
        isPending: false,
        isReconciled: false,
        importedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.bankTransactions.push(...newTransactions);
    account.lastSyncedAt = new Date().toISOString();
    
    // Auto-match new transactions
    for (const transaction of newTransactions) {
      await this.autoMatchTransaction(transaction);
    }
    
    return { data: newTransactions };
  }
  
  async getBankTransactions(filters?: TransactionFilters): Promise<{ data: BankTransaction[] }> {
    let transactions = [...this.bankTransactions];
    
    if (filters) {
      if (filters.bankAccountIds?.length) {
        transactions = transactions.filter(t => 
          filters.bankAccountIds!.includes(t.bankAccountId)
        );
      }
      if (filters.matchStatus?.length) {
        transactions = transactions.filter(t => 
          filters.matchStatus!.includes(t.matchStatus)
        );
      }
      if (filters.dateFrom) {
        transactions = transactions.filter(t => 
          t.transactionDate >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        transactions = transactions.filter(t => 
          t.transactionDate <= filters.dateTo!
        );
      }
    }
    
    return { data: transactions };
  }
  
  // Transaction Matching Operations
  async autoMatchReceipt(receipt: Receipt): Promise<void> {
    const unmatchedTransactions = this.bankTransactions.filter(
      t => t.matchStatus === 'unmatched' || t.matchStatus === 'suggested'
    );
    
    for (const transaction of unmatchedTransactions) {
      const confidence = calculateMatchConfidence(
        transaction,
        receipt,
        this.matchingRules
      );
      
      if (confidence >= 70) {
        await this.suggestMatch(transaction.id, receipt.id, confidence);
      }
    }
  }
  
  async autoMatchTransaction(transaction: BankTransaction): Promise<void> {
    const unmatchedReceipts = this.data.filter(
      r => r.matchStatus === 'unmatched' || r.matchStatus === 'suggested'
    );
    
    for (const receipt of unmatchedReceipts) {
      const confidence = calculateMatchConfidence(
        transaction,
        receipt,
        this.matchingRules
      );
      
      if (confidence >= 70) {
        await this.suggestMatch(transaction.id, receipt.id, confidence);
      }
    }
  }
  
  async suggestMatch(
    transactionId: string,
    receiptId: string,
    confidence: number
  ): Promise<{ data: TransactionMatch }> {
    const transaction = this.bankTransactions.find(t => t.id === transactionId);
    const receipt = this.data.find(r => r.id === receiptId);
    
    if (!transaction || !receipt) {
      throw new Error('Transaction or receipt not found');
    }
    
    const match: TransactionMatch = {
      id: `tm-${Math.random().toString(36).substring(2)}`,
      tenantId: 'tenant-1',
      transactionId,
      receiptId,
      overallConfidence: confidence,
      amountMatchScore: Math.abs(transaction.amount) === receipt.totalAmount ? 100 : 80,
      dateMatchScore: transaction.transactionDate === receipt.transactionDate ? 100 : 70,
      vendorMatchScore: 85,
      matchMethod: confidence >= 90 ? 'exact' : 'fuzzy',
      matchRules: ['amount', 'date', 'vendor'],
      discrepancies: [],
      status: confidence >= 85 ? 'auto_approved' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check for discrepancies
    if (Math.abs(transaction.amount) !== receipt.totalAmount) {
      match.discrepancies.push({
        field: 'amount',
        transactionValue: Math.abs(transaction.amount),
        receiptValue: receipt.totalAmount,
        difference: Math.abs(Math.abs(transaction.amount) - receipt.totalAmount),
        severity: 'medium'
      });
    }
    
    this.transactionMatches.push(match);
    
    // Update transaction and receipt
    transaction.matchedReceiptId = receiptId;
    transaction.matchConfidence = confidence;
    transaction.matchStatus = 'suggested';
    
    receipt.matchedTransactionId = transactionId;
    receipt.matchConfidence = confidence;
    receipt.matchStatus = 'suggested';
    
    this.setStorage(this.data);
    
    return { data: match };
  }
  
  async confirmMatch(matchId: string): Promise<{ data: TransactionMatch }> {
    const match = this.transactionMatches.find(m => m.id === matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    const transaction = this.bankTransactions.find(t => t.id === match.transactionId);
    const receipt = this.data.find(r => r.id === match.receiptId);
    
    if (!transaction || !receipt) {
      throw new Error('Transaction or receipt not found');
    }
    
    // Update match status
    match.status = 'approved';
    match.approvedBy = 'user-1';
    match.approvedAt = new Date().toISOString();
    
    // Update transaction and receipt
    transaction.matchStatus = 'confirmed';
    transaction.matchedAt = new Date().toISOString();
    transaction.isReconciled = true;
    transaction.reconciledAt = new Date().toISOString();
    
    receipt.matchStatus = 'confirmed';
    receipt.matchedAt = new Date().toISOString();
    receipt.status = 'verified';
    
    this.setStorage(this.data);
    
    return { data: match };
  }
  
  async rejectMatch(matchId: string, reason?: string): Promise<{ data: TransactionMatch }> {
    const match = this.transactionMatches.find(m => m.id === matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    const transaction = this.bankTransactions.find(t => t.id === match.transactionId);
    const receipt = this.data.find(r => r.id === match.receiptId);
    
    if (!transaction || !receipt) {
      throw new Error('Transaction or receipt not found');
    }
    
    // Update match status
    match.status = 'rejected';
    match.rejectedReason = reason;
    
    // Reset transaction and receipt
    transaction.matchedReceiptId = undefined;
    transaction.matchConfidence = undefined;
    transaction.matchStatus = 'unmatched';
    
    receipt.matchedTransactionId = undefined;
    receipt.matchConfidence = undefined;
    receipt.matchStatus = 'unmatched';
    
    this.setStorage(this.data);
    
    return { data: match };
  }
  
  async getMatches(): Promise<{ data: TransactionMatch[] }> {
    return { data: this.transactionMatches };
  }
  
  // Audit and Reporting
  async generateAuditReport(data: GenerateAuditReportData): Promise<{ data: AuditReport }> {
    const receipts = this.data.filter(r => 
      r.transactionDate >= data.startDate && 
      r.transactionDate <= data.endDate
    );
    
    const transactions = this.bankTransactions.filter(t => 
      t.transactionDate >= data.startDate && 
      t.transactionDate <= data.endDate
    );
    
    const matchedTransactions = transactions.filter(t => 
      t.matchStatus === 'confirmed'
    );
    
    const report: AuditReport = {
      id: `ar-${Math.random().toString(36).substring(2)}`,
      tenantId: 'tenant-1',
      reportType: data.reportType,
      title: `${data.reportType.replace('_', ' ').toUpperCase()} - ${data.startDate} to ${data.endDate}`,
      startDate: data.startDate,
      endDate: data.endDate,
      totalTransactions: transactions.length,
      matchedTransactions: matchedTransactions.length,
      unmatchedTransactions: transactions.length - matchedTransactions.length,
      totalReceipts: receipts.length,
      matchRate: (matchedTransactions.length / transactions.length) * 100,
      totalExpenses: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalIncome: 0,
      netAmount: -transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      currency: 'USD',
      categoryBreakdown: [],
      complianceScore: 85,
      missingReceipts: transactions.length - matchedTransactions.length,
      duplicateReceipts: 0,
      flaggedTransactions: 0,
      generatedBy: 'user-1',
      generatedAt: new Date().toISOString(),
      status: 'generated',
      exportFormat: data.exportFormat
    };
    
    this.auditReports.push(report);
    
    return { data: report };
  }
  
  async getAuditReports(): Promise<{ data: AuditReport[] }> {
    return { data: this.auditReports };
  }
  
  async exportAuditReport(reportId: string, format: ExportFormat): Promise<{ data: string }> {
    const report = this.auditReports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Mock export URL
    const exportUrl = `/exports/audit-report-${reportId}.${format}`;
    report.exportUrl = exportUrl;
    report.exportFormat = format;
    
    return { data: exportUrl };
  }
  
  // Statistics
  async getReceiptStatistics(): Promise<{ data: ReceiptStatistics }> {
    const totalAmount = this.data.reduce((sum, r) => sum + r.totalAmount, 0);
    const matchedCount = this.data.filter(r => r.matchStatus === 'confirmed').length;
    
    return {
      data: {
        totalReceipts: this.data.length,
        totalAmount,
        averageAmount: totalAmount / this.data.length,
        matchedCount,
        unmatchedCount: this.data.length - matchedCount,
        matchRate: (matchedCount / this.data.length) * 100,
        byStatus: {
          draft: this.data.filter(r => r.status === 'draft').length,
          pending: this.data.filter(r => r.status === 'pending').length,
          verified: this.data.filter(r => r.status === 'verified').length,
          matched: this.data.filter(r => r.status === 'matched').length,
          archived: this.data.filter(r => r.status === 'archived').length,
          deleted: 0
        },
        byCategory: {},
        byVendor: [],
        byPaymentMethod: {
          cash: this.data.filter(r => r.paymentMethod === 'cash').length,
          credit_card: this.data.filter(r => r.paymentMethod === 'credit_card').length,
          debit_card: this.data.filter(r => r.paymentMethod === 'debit_card').length,
          bank_transfer: this.data.filter(r => r.paymentMethod === 'bank_transfer').length,
          check: this.data.filter(r => r.paymentMethod === 'check').length,
          digital_wallet: this.data.filter(r => r.paymentMethod === 'digital_wallet').length,
          cryptocurrency: 0,
          other: 0
        },
        recentActivity: []
      }
    };
  }
  
  async getMatchingStatistics(): Promise<{ data: MatchingStatistics }> {
    const totalMatches = this.transactionMatches.length;
    const pendingMatches = this.transactionMatches.filter(m => m.status === 'pending').length;
    const approvedMatches = this.transactionMatches.filter(m => m.status === 'approved').length;
    const rejectedMatches = this.transactionMatches.filter(m => m.status === 'rejected').length;
    
    const avgConfidence = this.transactionMatches.reduce(
      (sum, m) => sum + m.overallConfidence, 0
    ) / totalMatches;
    
    return {
      data: {
        totalMatches,
        pendingMatches,
        approvedMatches,
        rejectedMatches,
        averageConfidence: avgConfidence,
        highConfidenceMatches: this.transactionMatches.filter(m => m.overallConfidence >= 85).length,
        lowConfidenceMatches: this.transactionMatches.filter(m => m.overallConfidence < 70).length,
        matchMethodDistribution: {
          exact: this.transactionMatches.filter(m => m.matchMethod === 'exact').length,
          fuzzy: this.transactionMatches.filter(m => m.matchMethod === 'fuzzy').length,
          ai: 0,
          manual: 0,
          rule_based: 0
        },
        discrepancyRate: this.transactionMatches.filter(m => m.discrepancies.length > 0).length / totalMatches,
        processingTime: {
          average: 250,
          median: 200,
          p95: 500
        }
      }
    };
  }
}

export class MockReceiptManagerRepository extends ReceiptManagerRepository {
  // All functionality is already in the base class
}

export const receiptManagerRepository = new MockReceiptManagerRepository();