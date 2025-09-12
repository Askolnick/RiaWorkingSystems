import { BaseRepository, MockRepository } from './base.repository';
import type { 
  BankAccount, 
  BankTransaction, 
  ReconciliationSession,
  ReconciliationMatch,
  BankReconciliationAdjustment,
  OutstandingItem,
  BankStatementImport,
  ReconciliationRule
} from '@ria/bank-reconciliation-server';
import { 
  generateMockBankAccount, 
  generateMockBankTransactions,
  generateMockReconciliationSession,
  calculateMatchConfidence 
} from '@ria/bank-reconciliation-server';

export class BankReconciliationRepository extends BaseRepository<any> {
  protected endpoint = '/bank-reconciliation';

  // Bank Accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    return this.request('GET', '/accounts');
  }

  async getBankAccount(id: string): Promise<BankAccount> {
    return this.request('GET', `/accounts/${id}`);
  }

  async createBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    return this.request('POST', '/accounts', account);
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    return this.request('PATCH', `/accounts/${id}`, updates);
  }

  async deleteBankAccount(id: string): Promise<void> {
    return this.request('DELETE', `/accounts/${id}`);
  }

  // Bank Transactions
  async getBankTransactions(accountId: string, params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
  }): Promise<BankTransaction[]> {
    return this.request('GET', `/accounts/${accountId}/transactions`, params);
  }

  async importBankStatement(
    accountId: string,
    file: File,
    format: any
  ): Promise<BankStatementImport> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', JSON.stringify(format));
    
    return this.request('POST', `/accounts/${accountId}/import`, formData);
  }

  async matchTransactions(
    bankTransactionId: string,
    bookTransactionId: string
  ): Promise<ReconciliationMatch> {
    return this.request('POST', '/matches', {
      bankTransactionId,
      bookTransactionId
    });
  }

  async unmatchTransaction(matchId: string): Promise<void> {
    return this.request('DELETE', `/matches/${matchId}`);
  }

  // Reconciliation Sessions
  async getReconciliationSessions(accountId: string): Promise<ReconciliationSession[]> {
    return this.request('GET', `/accounts/${accountId}/reconciliations`);
  }

  async getReconciliationSession(id: string): Promise<ReconciliationSession> {
    return this.request('GET', `/reconciliations/${id}`);
  }

  async createReconciliationSession(
    session: Omit<ReconciliationSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReconciliationSession> {
    return this.request('POST', '/reconciliations', session);
  }

  async updateReconciliationSession(
    id: string,
    updates: Partial<ReconciliationSession>
  ): Promise<ReconciliationSession> {
    return this.request('PATCH', `/reconciliations/${id}`, updates);
  }

  async completeReconciliation(id: string): Promise<ReconciliationSession> {
    return this.request('POST', `/reconciliations/${id}/complete`);
  }

  // Adjustments
  async createAdjustment(
    adjustment: Omit<BankReconciliationAdjustment, 'id' | 'requestedAt'>
  ): Promise<BankReconciliationAdjustment> {
    return this.request('POST', '/adjustments', adjustment);
  }

  async getAdjustments(reconciliationId: string): Promise<BankReconciliationAdjustment[]> {
    return this.request('GET', `/reconciliations/${reconciliationId}/adjustments`);
  }

  async approveAdjustment(id: string, notes?: string): Promise<BankReconciliationAdjustment> {
    return this.request('POST', `/adjustments/${id}/approve`, { notes });
  }

  // Outstanding Items
  async getOutstandingItems(accountId: string): Promise<OutstandingItem[]> {
    return this.request('GET', `/accounts/${accountId}/outstanding`);
  }

  async createOutstandingItem(
    item: Omit<OutstandingItem, 'id' | 'createdAt' | 'updatedAt' | 'daysOutstanding' | 'ageCategory'>
  ): Promise<OutstandingItem> {
    return this.request('POST', '/outstanding', item);
  }

  async clearOutstandingItem(id: string, clearedDate: string, clearedAmount?: number): Promise<OutstandingItem> {
    return this.request('POST', `/outstanding/${id}/clear`, { clearedDate, clearedAmount });
  }

  // Rules
  async getReconciliationRules(): Promise<ReconciliationRule[]> {
    return this.request('GET', '/rules');
  }

  async createRule(rule: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'timesApplied'>): Promise<ReconciliationRule> {
    return this.request('POST', '/rules', rule);
  }

  async updateRule(id: string, updates: Partial<ReconciliationRule>): Promise<ReconciliationRule> {
    return this.request('PATCH', `/rules/${id}`, updates);
  }

  async deleteRule(id: string): Promise<void> {
    return this.request('DELETE', `/rules/${id}`);
  }

  // Auto-matching
  async runAutoMatching(accountId: string, sessionId?: string): Promise<{
    matchesFound: number;
    suggestions: ReconciliationMatch[];
  }> {
    return this.request('POST', `/accounts/${accountId}/auto-match`, { sessionId });
  }
}

export class MockBankReconciliationRepository extends MockRepository<any> {
  protected storageKey = 'ria_bank_reconciliation';
  protected endpoint = '/bank-reconciliation';

  private bankAccounts: BankAccount[] = [];
  private bankTransactions: BankTransaction[] = [];
  private reconciliationSessions: ReconciliationSession[] = [];
  private matches: ReconciliationMatch[] = [];
  private adjustments: BankReconciliationAdjustment[] = [];
  private outstandingItems: OutstandingItem[] = [];
  private rules: ReconciliationRule[] = [];

  constructor() {
    super();
    // Skip initialization during SSR
    if (typeof window !== 'undefined') {
      this.initializeMockData();
    }
  }

  private initializeMockData() {
    // Create mock bank account
    const mockAccount = generateMockBankAccount();
    this.bankAccounts = [mockAccount];

    // Create mock transactions
    this.bankTransactions = generateMockBankTransactions(30);

    // Create mock reconciliation session
    const mockSession = generateMockReconciliationSession();
    this.reconciliationSessions = [mockSession];

    // Create mock outstanding items
    this.outstandingItems = [
      {
        id: 'outstanding_1',
        tenantId: 'demo-tenant',
        bankAccountId: mockAccount.id,
        type: 'outstanding_check',
        description: 'Check #1234 to Office Supplies Inc.',
        amount: 285.50,
        date: '2024-01-10',
        checkNumber: '1234',
        payee: 'Office Supplies Inc.',
        status: 'outstanding',
        daysOutstanding: 6,
        ageCategory: '0-30',
        createdBy: 'john.doe@example.com',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: 'outstanding_2',
        tenantId: 'demo-tenant',
        bankAccountId: mockAccount.id,
        type: 'deposit_in_transit',
        description: 'Client payment - Invoice #INV-001',
        amount: 1250.00,
        date: '2024-01-15',
        referenceNumber: 'INV-001',
        status: 'outstanding',
        daysOutstanding: 1,
        ageCategory: '0-30',
        createdBy: 'john.doe@example.com',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ];

    // Create mock rules
    this.rules = [
      {
        id: 'rule_1',
        tenantId: 'demo-tenant',
        name: 'Auto-match exact amounts',
        description: 'Automatically match transactions with identical amounts within 3 days',
        isActive: true,
        priority: 100,
        criteria: {
          amountExact: undefined,
          dateRange: { daysBeforeAfter: 3 }
        },
        actions: {
          autoMatch: true,
          autoReconcile: false,
          requireApproval: false
        },
        timesApplied: 45,
        lastAppliedAt: '2024-01-15T10:30:00Z',
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'rule_2',
        tenantId: 'demo-tenant',
        name: 'Bank fee categorization',
        description: 'Automatically categorize bank fees',
        isActive: true,
        priority: 50,
        criteria: {
          descriptionContains: ['bank fee', 'service charge', 'maintenance fee'],
          amountRange: { min: 0, max: 100 }
        },
        actions: {
          autoMatch: false,
          autoReconcile: true,
          setCategory: 'Bank Fees',
          requireApproval: false
        },
        timesApplied: 12,
        lastAppliedAt: '2024-01-12T09:15:00Z',
        createdBy: 'john.doe@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T09:15:00Z'
      }
    ];
  }

  // Bank Accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    await this.simulateDelay();
    return [...this.bankAccounts];
  }

  async getBankAccount(id: string): Promise<BankAccount> {
    await this.simulateDelay();
    const account = this.bankAccounts.find(a => a.id === id);
    if (!account) throw new Error('Bank account not found');
    return account;
  }

  async createBankAccount(accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    await this.simulateDelay();
    const account: BankAccount = {
      ...accountData,
      id: `bank_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.bankAccounts.push(account);
    return account;
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    await this.simulateDelay();
    const index = this.bankAccounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Bank account not found');
    
    this.bankAccounts[index] = {
      ...this.bankAccounts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.bankAccounts[index];
  }

  async deleteBankAccount(id: string): Promise<void> {
    await this.simulateDelay();
    const index = this.bankAccounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Bank account not found');
    this.bankAccounts.splice(index, 1);
  }

  // Bank Transactions
  async getBankTransactions(accountId: string, params?: any): Promise<BankTransaction[]> {
    await this.simulateDelay();
    let transactions = this.bankTransactions.filter(t => t.bankAccountId === accountId);
    
    if (params?.startDate) {
      transactions = transactions.filter(t => t.date >= params.startDate);
    }
    if (params?.endDate) {
      transactions = transactions.filter(t => t.date <= params.endDate);
    }
    if (params?.status) {
      transactions = transactions.filter(t => t.status === params.status);
    }
    if (params?.limit) {
      transactions = transactions.slice(0, params.limit);
    }
    
    return transactions;
  }

  async importBankStatement(accountId: string, file: File, format: any): Promise<BankStatementImport> {
    await this.simulateDelay(2000); // Simulate file processing time
    
    // Generate mock imported transactions
    const newTransactions = generateMockBankTransactions(15);
    newTransactions.forEach(t => {
      t.bankAccountId = accountId;
      t.importedAt = new Date().toISOString();
    });
    
    this.bankTransactions.push(...newTransactions);
    
    return {
      id: `import_${Date.now()}`,
      tenantId: 'demo-tenant',
      bankAccountId: accountId,
      fileName: file.name,
      fileType: 'csv',
      fileSize: file.size,
      importMethod: 'manual_upload',
      status: 'completed',
      totalRows: 15,
      processedRows: 15,
      successfulImports: 15,
      skippedRows: 0,
      errorRows: 0,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      importedBy: 'current-user',
      importedAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
  }

  async matchTransactions(bankTransactionId: string, bookTransactionId: string): Promise<ReconciliationMatch> {
    await this.simulateDelay();
    
    const bankTransaction = this.bankTransactions.find(t => t.id === bankTransactionId);
    if (!bankTransaction) throw new Error('Bank transaction not found');
    
    // Mock book transaction data
    const mockBookTransaction = {
      id: bookTransactionId,
      description: 'Mock book transaction',
      amount: bankTransaction.amount,
      date: bankTransaction.date
    };
    
    const confidence = calculateMatchConfidence(bankTransaction, mockBookTransaction);
    
    const match: ReconciliationMatch = {
      id: `match_${Date.now()}`,
      tenantId: 'demo-tenant',
      reconciliationSessionId: this.reconciliationSessions[0]?.id || 'session_1',
      bankTransactionId,
      bookTransactionId,
      matchType: 'manual',
      matchConfidence: confidence,
      matchReason: 'Manual match by user',
      status: 'matched',
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.matches.push(match);
    
    // Update transaction status
    bankTransaction.status = 'matched';
    bankTransaction.matchedTransactionId = bookTransactionId;
    bankTransaction.matchConfidence = confidence;
    
    return match;
  }

  async unmatchTransaction(matchId: string): Promise<void> {
    await this.simulateDelay();
    const matchIndex = this.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) throw new Error('Match not found');
    
    const match = this.matches[matchIndex];
    const bankTransaction = this.bankTransactions.find(t => t.id === match.bankTransactionId);
    
    if (bankTransaction) {
      bankTransaction.status = 'unreconciled';
      bankTransaction.matchedTransactionId = undefined;
      bankTransaction.matchConfidence = undefined;
    }
    
    this.matches.splice(matchIndex, 1);
  }

  // Reconciliation Sessions
  async getReconciliationSessions(accountId: string): Promise<ReconciliationSession[]> {
    await this.simulateDelay();
    return this.reconciliationSessions.filter(s => s.bankAccountId === accountId);
  }

  async getReconciliationSession(id: string): Promise<ReconciliationSession> {
    await this.simulateDelay();
    const session = this.reconciliationSessions.find(s => s.id === id);
    if (!session) throw new Error('Reconciliation session not found');
    return session;
  }

  async createReconciliationSession(sessionData: Omit<ReconciliationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReconciliationSession> {
    await this.simulateDelay();
    const session: ReconciliationSession = {
      ...sessionData,
      id: `recon_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reconciliationSessions.push(session);
    return session;
  }

  async updateReconciliationSession(id: string, updates: Partial<ReconciliationSession>): Promise<ReconciliationSession> {
    await this.simulateDelay();
    const index = this.reconciliationSessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Reconciliation session not found');
    
    this.reconciliationSessions[index] = {
      ...this.reconciliationSessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.reconciliationSessions[index];
  }

  async completeReconciliation(id: string): Promise<ReconciliationSession> {
    return this.updateReconciliationSession(id, { status: 'completed' });
  }

  // Outstanding Items
  async getOutstandingItems(accountId: string): Promise<OutstandingItem[]> {
    await this.simulateDelay();
    return this.outstandingItems.filter(item => item.bankAccountId === accountId);
  }

  async createOutstandingItem(itemData: any): Promise<OutstandingItem> {
    await this.simulateDelay();
    const item: OutstandingItem = {
      ...itemData,
      id: `outstanding_${Date.now()}`,
      daysOutstanding: 0,
      ageCategory: '0-30',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.outstandingItems.push(item);
    return item;
  }

  async clearOutstandingItem(id: string, clearedDate: string, clearedAmount?: number): Promise<OutstandingItem> {
    await this.simulateDelay();
    const index = this.outstandingItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Outstanding item not found');
    
    this.outstandingItems[index] = {
      ...this.outstandingItems[index],
      status: 'cleared',
      clearedDate,
      clearedAmount: clearedAmount || this.outstandingItems[index].amount,
      updatedAt: new Date().toISOString()
    };
    
    return this.outstandingItems[index];
  }

  // Rules
  async getReconciliationRules(): Promise<ReconciliationRule[]> {
    await this.simulateDelay();
    return [...this.rules];
  }

  async createRule(ruleData: any): Promise<ReconciliationRule> {
    await this.simulateDelay();
    const rule: ReconciliationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      timesApplied: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.rules.push(rule);
    return rule;
  }

  async updateRule(id: string, updates: Partial<ReconciliationRule>): Promise<ReconciliationRule> {
    await this.simulateDelay();
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    this.rules[index] = {
      ...this.rules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.rules[index];
  }

  async deleteRule(id: string): Promise<void> {
    await this.simulateDelay();
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    this.rules.splice(index, 1);
  }

  // Auto-matching
  async runAutoMatching(accountId: string, sessionId?: string): Promise<{ matchesFound: number; suggestions: ReconciliationMatch[] }> {
    await this.simulateDelay(3000); // Simulate processing time
    
    const unmatchedTransactions = this.bankTransactions.filter(
      t => t.bankAccountId === accountId && t.status === 'unreconciled'
    );
    
    const matchesFound = Math.floor(unmatchedTransactions.length * 0.7); // 70% match rate
    const suggestions: ReconciliationMatch[] = [];
    
    for (let i = 0; i < matchesFound; i++) {
      const transaction = unmatchedTransactions[i];
      if (transaction) {
        suggestions.push({
          id: `suggestion_${Date.now()}_${i}`,
          tenantId: 'demo-tenant',
          reconciliationSessionId: sessionId || 'session_1',
          bankTransactionId: transaction.id,
          bookTransactionId: `book_${Date.now()}_${i}`,
          matchType: 'automatic',
          matchConfidence: Math.floor(Math.random() * 30) + 70,
          matchReason: 'Auto-matched by amount and date',
          status: 'matched',
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return { matchesFound, suggestions };
  }

  // Adjustments
  async createAdjustment(adjustmentData: any): Promise<BankReconciliationAdjustment> {
    await this.simulateDelay();
    const adjustment: BankReconciliationAdjustment = {
      ...adjustmentData,
      id: `adj_${Date.now()}`,
      requestedAt: new Date().toISOString()
    };
    this.adjustments.push(adjustment);
    return adjustment;
  }

  async getAdjustments(reconciliationId: string): Promise<BankReconciliationAdjustment[]> {
    await this.simulateDelay();
    return this.adjustments.filter(adj => adj.reconciliationSessionId === reconciliationId);
  }

  async approveAdjustment(id: string, notes?: string): Promise<BankReconciliationAdjustment> {
    await this.simulateDelay();
    const index = this.adjustments.findIndex(adj => adj.id === id);
    if (index === -1) throw new Error('Adjustment not found');
    
    this.adjustments[index] = {
      ...this.adjustments[index],
      status: 'approved',
      reviewedBy: 'current-user',
      reviewedAt: new Date().toISOString(),
      approvalNotes: notes
    };
    
    return this.adjustments[index];
  }
}

export const bankReconciliationRepository = new MockBankReconciliationRepository();