import { MockRepository } from './base.repository';

// Define types locally until balance-sheet-server package is available
interface BalanceSheet {
  id: string;
  tenantId: string;
  periodEndDate: string;
  assets: Assets;
  liabilities: Liabilities;
  equity: Equity;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  createdAt: string;
  updatedAt: string;
}

interface Assets {
  current: CurrentAssets;
  nonCurrent: NonCurrentAssets;
  total: number;
}

interface CurrentAssets {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  other: number;
  total: number;
}

interface NonCurrentAssets {
  propertyPlantEquipment: number;
  intangibleAssets: number;
  investments: number;
  other: number;
  total: number;
}

interface Liabilities {
  current: CurrentLiabilities;
  nonCurrent: NonCurrentLiabilities;
  total: number;
}

interface CurrentLiabilities {
  accountsPayable: number;
  shortTermDebt: number;
  accruedExpenses: number;
  other: number;
  total: number;
}

interface NonCurrentLiabilities {
  longTermDebt: number;
  deferredTaxLiabilities: number;
  other: number;
  total: number;
}

interface Equity {
  retainedEarnings: number;
  shareCapital: number;
  other: number;
  total: number;
}

interface FinancialRatios {
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
}

interface GenerateBalanceSheetData {
  periodEndDate: Date;
  includePreviousPeriod?: boolean;
  includeRatios?: boolean;
}

interface UpdateBalanceSheetData {
  assets?: Partial<Assets>;
  liabilities?: Partial<Liabilities>;
  equity?: Partial<Equity>;
}

interface BalanceSheetFilters {
  startDate?: string;
  endDate?: string;
  includeRatios?: boolean;
  compareWithPreviousPeriod?: boolean;
}

const calculateTotalAssets = (assets: Assets): number => assets.total;
const calculateTotalLiabilities = (liabilities: Liabilities): number => liabilities.total;
const calculateTotalEquity = (equity: Equity): number => equity.total;
const checkBalance = (totalAssets: number, totalLiabilities: number, totalEquity: number): boolean => {
  return totalAssets === (totalLiabilities + totalEquity);
};

type PeriodType = 'monthly' | 'quarterly' | 'yearly';
type BalanceSheetStatus = 'draft' | 'finalized' | 'audited';
type AccountType = 'asset' | 'liability' | 'equity';
type BalanceSheetCategory = 'current' | 'non-current';
type TransactionSource = 'manual' | 'import' | 'api';

export class BalanceSheetRepository extends MockRepository<BalanceSheet> {
  protected endpoint = '/balance-sheets';
  protected storageKey = 'ria_balance_sheets';
  
  private generalLedger: GeneralLedgerEntry[] = [];
  private accountMappings: AccountMapping[] = [];
  
  constructor() {
    super();
    this.initializeMockData();
  }
  
  private initializeMockData() {
    // Initialize account mappings
    this.accountMappings = [
      {
        id: 'am-1',
        tenantId: 'tenant-1',
        accountCode: '1000',
        accountName: 'Cash',
        accountType: 'asset',
        balanceSheetCategory: 'current_assets',
        balanceSheetSubcategory: 'cash',
        isActive: true,
        isContraAccount: false,
        normalBalance: 'debit',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'am-2',
        tenantId: 'tenant-1',
        accountCode: '1200',
        accountName: 'Accounts Receivable',
        accountType: 'asset',
        balanceSheetCategory: 'current_assets',
        balanceSheetSubcategory: 'accountsReceivable',
        isActive: true,
        isContraAccount: false,
        normalBalance: 'debit',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'am-3',
        tenantId: 'tenant-1',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'liability',
        balanceSheetCategory: 'current_liabilities',
        balanceSheetSubcategory: 'accountsPayable',
        isActive: true,
        isContraAccount: false,
        normalBalance: 'credit',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    
    // Initialize general ledger entries
    this.generalLedger = [
      {
        id: 'gl-1',
        tenantId: 'tenant-1',
        transactionId: 'tx-001',
        transactionDate: '2024-01-15',
        postingDate: '2024-01-15',
        accountCode: '1000',
        accountName: 'Cash',
        debit: 50000,
        credit: 0,
        balance: 50000,
        currency: 'USD',
        description: 'Initial capital investment',
        source: 'manual_entry',
        isPosted: true,
        isReconciled: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'gl-2',
        tenantId: 'tenant-1',
        transactionId: 'tx-002',
        transactionDate: '2024-01-20',
        postingDate: '2024-01-20',
        accountCode: '1200',
        accountName: 'Accounts Receivable',
        debit: 15000,
        credit: 0,
        balance: 15000,
        currency: 'USD',
        description: 'Invoice to client',
        source: 'invoice',
        isPosted: true,
        isReconciled: false,
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z'
      }
    ];
    
    // Initialize balance sheets
    const currentAssets: CurrentAssets = {
      cash: 125000,
      cashEquivalents: 25000,
      totalCashAndEquivalents: 150000,
      accountsReceivable: 85000,
      allowanceForDoubtfulAccounts: -5000,
      netAccountsReceivable: 80000,
      notesReceivable: 10000,
      otherReceivables: 5000,
      totalReceivables: 95000,
      rawMaterials: 15000,
      workInProgress: 10000,
      finishedGoods: 25000,
      totalInventory: 50000,
      marketableSecurities: 30000,
      shortTermInvestments: 20000,
      totalShortTermInvestments: 50000,
      prepaidExpenses: 8000,
      deferredTaxAssets: 3000,
      otherCurrentAssets: 2000
    };
    
    const nonCurrentAssets: NonCurrentAssets = {
      land: 100000,
      buildings: 500000,
      machinery: 200000,
      equipment: 150000,
      vehicles: 50000,
      grossPPE: 1000000,
      accumulatedDepreciation: -300000,
      netPPE: 700000,
      goodwill: 50000,
      patents: 20000,
      trademarks: 10000,
      copyrights: 5000,
      software: 15000,
      otherIntangibles: 5000,
      totalIntangibles: 105000,
      accumulatedAmortization: -25000,
      netIntangibles: 80000,
      longTermInvestments: 100000,
      investmentProperty: 150000,
      deferredTaxAssetsNonCurrent: 10000,
      otherNonCurrentAssets: 5000
    };
    
    const currentLiabilities: CurrentLiabilities = {
      accountsPayable: 65000,
      notesPayable: 20000,
      accruedExpenses: 15000,
      wagesPayable: 12000,
      interestPayable: 3000,
      taxesPayable: 8000,
      totalPayables: 123000,
      shortTermDebt: 50000,
      currentPortionLongTermDebt: 25000,
      totalShortTermDebt: 75000,
      deferredRevenue: 10000,
      customerDeposits: 5000,
      dividendsPayable: 8000,
      otherCurrentLiabilities: 4000
    };
    
    const nonCurrentLiabilities: NonCurrentLiabilities = {
      longTermDebt: 200000,
      bondsPayable: 100000,
      mortgagesPayable: 150000,
      totalLongTermDebt: 450000,
      deferredTaxLiabilities: 15000,
      pensionLiabilities: 25000,
      leaseObligations: 30000,
      otherNonCurrentLiabilities: 10000
    };
    
    const equity: Equity = {
      commonStock: 100000,
      preferredStock: 50000,
      additionalPaidInCapital: 200000,
      totalPaidInCapital: 350000,
      retainedEarnings: 450000,
      currentYearEarnings: 125000,
      treasuryStock: -25000,
      otherComprehensiveIncome: 15000,
      minorityInterest: 10000,
      otherEquity: 5000,
      total: 350000 + 450000 + 125000 - 25000 + 15000 + 10000 + 5000  // 930000
    };
    
    const assets: Assets = {
      currentAssets,
      totalCurrentAssets: 358000,
      nonCurrentAssets,
      totalNonCurrentAssets: 1045000,
      otherAssets: {
        deposits: 5000,
        advancesToSuppliers: 3000,
        miscellaneousAssets: 2000
      },
      totalOtherAssets: 10000,
      total: 358000 + 1045000 + 10000  // 1413000
    };
    
    const liabilities: Liabilities = {
      currentLiabilities,
      totalCurrentLiabilities: 225000,
      nonCurrentLiabilities,
      totalNonCurrentLiabilities: 530000,
      total: 225000 + 530000  // 755000
    };
    
    const totalAssets = calculateTotalAssets(assets);
    const totalLiabilities = calculateTotalLiabilities(liabilities);
    const totalEquity = calculateTotalEquity(equity);
    
    this.data = [
      {
        id: 'bs-current',
        tenantId: 'tenant-1',
        periodEnd: '2024-12-31',
        periodStart: '2024-01-01',
        periodType: 'annual',
        fiscalYear: 2024,
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        equity,
        totalEquity,
        isBalanced: checkBalance(totalAssets, totalLiabilities, totalEquity),
        balanceDifference: totalAssets - (totalLiabilities + totalEquity),
        currency: 'USD',
        status: 'approved',
        generatedAt: '2025-01-05T10:00:00Z',
        approvedBy: 'CFO',
        approvedAt: '2025-01-06T15:00:00Z',
        notes: 'Year-end balance sheet for 2024',
        createdBy: 'system',
        createdAt: '2025-01-05T10:00:00Z',
        updatedBy: 'CFO',
        updatedAt: '2025-01-06T15:00:00Z'
      },
      {
        id: 'bs-q3',
        tenantId: 'tenant-1',
        periodEnd: '2024-09-30',
        periodStart: '2024-07-01',
        periodType: 'quarterly',
        fiscalYear: 2024,
        quarter: 3,
        assets: {
          currentAssets: { ...currentAssets, cash: 110000 },
          totalCurrentAssets: 343000,
          nonCurrentAssets,
          totalNonCurrentAssets: 1045000,
          otherAssets: {
            deposits: 5000,
            advancesToSuppliers: 3000,
            miscellaneousAssets: 2000
          },
          totalOtherAssets: 10000
        },
        totalAssets: 1398000,
        liabilities: {
          currentLiabilities: { ...currentLiabilities, accountsPayable: 55000 },
          totalCurrentLiabilities: 215000,
          nonCurrentLiabilities,
          totalNonCurrentLiabilities: 530000
        },
        totalLiabilities: 745000,
        equity: { ...equity, currentYearEarnings: 95000 },
        totalEquity: 653000,
        isBalanced: true,
        balanceDifference: 0,
        currency: 'USD',
        status: 'approved',
        generatedAt: '2024-10-05T10:00:00Z',
        createdBy: 'system',
        createdAt: '2024-10-05T10:00:00Z',
        updatedBy: 'system',
        updatedAt: '2024-10-05T10:00:00Z'
      }
    ];
  }
  
  // Generate Balance Sheet
  async generateBalanceSheet(data: GenerateBalanceSheetData): Promise<{ data: BalanceSheet }> {
    // Aggregate general ledger entries
    const entries = this.generalLedger.filter(
      e => e.postingDate <= data.periodEnd
    );
    
    // Calculate balances from ledger
    const balances = this.calculateBalancesFromLedger(entries);
    
    // Create balance sheet structure
    const balanceSheet: BalanceSheet = {
      id: `bs-${Date.now()}`,
      tenantId: 'tenant-1',
      periodEnd: data.periodEnd,
      periodType: data.periodType,
      fiscalYear: new Date(data.periodEnd).getFullYear(),
      assets: balances.assets,
      totalAssets: calculateTotalAssets(balances.assets),
      liabilities: balances.liabilities,
      totalLiabilities: calculateTotalLiabilities(balances.liabilities),
      equity: balances.equity,
      totalEquity: calculateTotalEquity(balances.equity),
      isBalanced: true,
      balanceDifference: 0,
      currency: data.currency || 'USD',
      status: 'draft',
      generatedAt: new Date().toISOString(),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString()
    };
    
    // Check balance
    balanceSheet.isBalanced = checkBalance(
      balanceSheet.totalAssets,
      balanceSheet.totalLiabilities,
      balanceSheet.totalEquity
    );
    balanceSheet.balanceDifference = balanceSheet.totalAssets - 
      (balanceSheet.totalLiabilities + balanceSheet.totalEquity);
    
    this.data.push(balanceSheet);
    this.setStorage(this.data);
    
    return { data: balanceSheet };
  }
  
  // Update Balance Sheet
  async updateBalanceSheet(id: string, data: UpdateBalanceSheetData): Promise<{ data: BalanceSheet }> {
    const balanceSheet = this.data.find(bs => bs.id === id);
    if (!balanceSheet) {
      throw new Error('Balance sheet not found');
    }
    
    // Apply adjustments
    if (data.adjustments) {
      for (const adjustment of data.adjustments) {
        // Create general ledger entry for adjustment
        const glEntry: GeneralLedgerEntry = {
          id: `gl-adj-${Date.now()}`,
          tenantId: 'tenant-1',
          transactionId: `adj-${Date.now()}`,
          transactionDate: balanceSheet.periodEnd,
          postingDate: new Date().toISOString().split('T')[0],
          accountCode: adjustment.accountCode,
          accountName: 'Adjustment',
          debit: adjustment.type === 'debit' ? adjustment.amount : 0,
          credit: adjustment.type === 'credit' ? adjustment.amount : 0,
          balance: adjustment.amount,
          currency: balanceSheet.currency,
          description: adjustment.description,
          source: 'adjustment',
          isPosted: true,
          isReconciled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.generalLedger.push(glEntry);
      }
      
      // Recalculate balance sheet
      const entries = this.generalLedger.filter(
        e => e.postingDate <= balanceSheet.periodEnd
      );
      const balances = this.calculateBalancesFromLedger(entries);
      
      balanceSheet.assets = balances.assets;
      balanceSheet.totalAssets = calculateTotalAssets(balances.assets);
      balanceSheet.liabilities = balances.liabilities;
      balanceSheet.totalLiabilities = calculateTotalLiabilities(balances.liabilities);
      balanceSheet.equity = balances.equity;
      balanceSheet.totalEquity = calculateTotalEquity(balances.equity);
      
      balanceSheet.isBalanced = checkBalance(
        balanceSheet.totalAssets,
        balanceSheet.totalLiabilities,
        balanceSheet.totalEquity
      );
      balanceSheet.balanceDifference = balanceSheet.totalAssets - 
        (balanceSheet.totalLiabilities + balanceSheet.totalEquity);
    }
    
    if (data.notes) {
      balanceSheet.notes = data.notes;
    }
    
    if (data.status) {
      balanceSheet.status = data.status;
      if (data.status === 'approved') {
        balanceSheet.approvedBy = 'user-1';
        balanceSheet.approvedAt = new Date().toISOString();
      }
    }
    
    balanceSheet.updatedBy = 'user-1';
    balanceSheet.updatedAt = new Date().toISOString();
    
    this.setStorage(this.data);
    
    return { data: balanceSheet };
  }
  
  // Get Comparative Balance Sheet
  async getComparativeBalanceSheet(currentId: string, previousId?: string): Promise<{ data: ComparativeBalanceSheet }> {
    const currentPeriod = this.data.find(bs => bs.id === currentId);
    if (!currentPeriod) {
      throw new Error('Current balance sheet not found');
    }
    
    const previousPeriod = previousId ? 
      this.data.find(bs => bs.id === previousId) : 
      this.data.find(bs => 
        bs.periodEnd < currentPeriod.periodEnd && 
        bs.periodType === currentPeriod.periodType
      );
    
    // Calculate changes
    const changes = previousPeriod ? {
      assets: {
        currentAssets: currentPeriod.assets.totalCurrentAssets - previousPeriod.assets.totalCurrentAssets,
        nonCurrentAssets: currentPeriod.assets.totalNonCurrentAssets - previousPeriod.assets.totalNonCurrentAssets,
        totalAssets: currentPeriod.totalAssets - previousPeriod.totalAssets
      },
      liabilities: {
        currentLiabilities: currentPeriod.liabilities.totalCurrentLiabilities - previousPeriod.liabilities.totalCurrentLiabilities,
        nonCurrentLiabilities: currentPeriod.liabilities.totalNonCurrentLiabilities - previousPeriod.liabilities.totalNonCurrentLiabilities,
        totalLiabilities: currentPeriod.totalLiabilities - previousPeriod.totalLiabilities
      },
      equity: {
        totalEquity: currentPeriod.totalEquity - previousPeriod.totalEquity,
        retainedEarnings: currentPeriod.equity.retainedEarnings - previousPeriod.equity.retainedEarnings
      }
    } : {
      assets: { currentAssets: 0, nonCurrentAssets: 0, totalAssets: 0 },
      liabilities: { currentLiabilities: 0, nonCurrentLiabilities: 0, totalLiabilities: 0 },
      equity: { totalEquity: 0, retainedEarnings: 0 }
    };
    
    // Calculate percentage changes
    const percentageChanges = previousPeriod ? {
      assets: {
        currentAssets: (changes.assets.currentAssets / previousPeriod.assets.totalCurrentAssets) * 100,
        nonCurrentAssets: (changes.assets.nonCurrentAssets / previousPeriod.assets.totalNonCurrentAssets) * 100,
        totalAssets: (changes.assets.totalAssets / previousPeriod.totalAssets) * 100
      },
      liabilities: {
        currentLiabilities: (changes.liabilities.currentLiabilities / previousPeriod.liabilities.totalCurrentLiabilities) * 100,
        nonCurrentLiabilities: (changes.liabilities.nonCurrentLiabilities / previousPeriod.liabilities.totalNonCurrentLiabilities) * 100,
        totalLiabilities: (changes.liabilities.totalLiabilities / previousPeriod.totalLiabilities) * 100
      },
      equity: {
        totalEquity: (changes.equity.totalEquity / previousPeriod.totalEquity) * 100,
        retainedEarnings: (changes.equity.retainedEarnings / previousPeriod.equity.retainedEarnings) * 100
      }
    } : changes;
    
    // Generate trends
    const trends: TrendAnalysis[] = [
      {
        metric: 'Total Assets',
        values: [
          { period: previousPeriod?.periodEnd || '', value: previousPeriod?.totalAssets || 0 },
          { period: currentPeriod.periodEnd, value: currentPeriod.totalAssets }
        ],
        trend: changes.assets.totalAssets > 0 ? 'increasing' : changes.assets.totalAssets < 0 ? 'decreasing' : 'stable',
        changeRate: percentageChanges.assets.totalAssets
      },
      {
        metric: 'Working Capital',
        values: [
          { 
            period: previousPeriod?.periodEnd || '', 
            value: previousPeriod ? previousPeriod.assets.totalCurrentAssets - previousPeriod.liabilities.totalCurrentLiabilities : 0 
          },
          { 
            period: currentPeriod.periodEnd, 
            value: currentPeriod.assets.totalCurrentAssets - currentPeriod.liabilities.totalCurrentLiabilities 
          }
        ],
        trend: 'stable',
        changeRate: 0
      }
    ];
    
    // Generate insights
    const insights: FinancialInsight[] = [];
    
    // Check liquidity
    const currentRatio = currentPeriod.assets.totalCurrentAssets / currentPeriod.liabilities.totalCurrentLiabilities;
    if (currentRatio < 1.2) {
      insights.push({
        type: 'liquidity_warning',
        severity: currentRatio < 1 ? 'critical' : 'warning',
        title: 'Low Liquidity',
        description: `Current ratio is ${currentRatio.toFixed(2)}, which indicates potential liquidity issues.`,
        recommendation: 'Consider improving cash collection or reducing short-term obligations.',
        metrics: { currentRatio }
      });
    }
    
    // Check leverage
    const debtToEquity = currentPeriod.totalLiabilities / currentPeriod.totalEquity;
    if (debtToEquity > 2) {
      insights.push({
        type: 'leverage_alert',
        severity: debtToEquity > 3 ? 'critical' : 'warning',
        title: 'High Leverage',
        description: `Debt-to-equity ratio is ${debtToEquity.toFixed(2)}, indicating high leverage.`,
        recommendation: 'Consider reducing debt or increasing equity to improve financial stability.',
        metrics: { debtToEquity }
      });
    }
    
    return {
      data: {
        currentPeriod,
        previousPeriod,
        changes,
        percentageChanges,
        trends,
        insights
      }
    };
  }
  
  // Get Financial Ratios
  async getFinancialRatios(balanceSheetId: string): Promise<{ data: FinancialRatios }> {
    const balanceSheet = this.data.find(bs => bs.id === balanceSheetId);
    if (!balanceSheet) {
      throw new Error('Balance sheet not found');
    }
    
    const ratios = calculateFinancialRatios(balanceSheet);
    return { data: ratios };
  }
  
  // Get General Ledger Entries
  async getGeneralLedgerEntries(filters?: {
    accountCode?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: GeneralLedgerEntry[] }> {
    let entries = [...this.generalLedger];
    
    if (filters) {
      if (filters.accountCode) {
        entries = entries.filter(e => e.accountCode === filters.accountCode);
      }
      if (filters.dateFrom) {
        entries = entries.filter(e => e.postingDate >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        entries = entries.filter(e => e.postingDate <= filters.dateTo!);
      }
    }
    
    return { data: entries };
  }
  
  // Post Journal Entry
  async postJournalEntry(entry: Omit<GeneralLedgerEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: GeneralLedgerEntry }> {
    const newEntry: GeneralLedgerEntry = {
      ...entry,
      id: `gl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.generalLedger.push(newEntry);
    
    return { data: newEntry };
  }
  
  // Private helper to calculate balances from ledger
  private calculateBalancesFromLedger(entries: GeneralLedgerEntry[]): {
    assets: Assets;
    liabilities: Liabilities;
    equity: Equity;
  } {
    // This is a simplified calculation - in reality would be much more complex
    const cashBalance = entries
      .filter(e => e.accountCode === '1000')
      .reduce((sum, e) => sum + e.debit - e.credit, 0);
    
    const receivablesBalance = entries
      .filter(e => e.accountCode === '1200')
      .reduce((sum, e) => sum + e.debit - e.credit, 0);
    
    const payablesBalance = entries
      .filter(e => e.accountCode === '2000')
      .reduce((sum, e) => sum + e.credit - e.debit, 0);
    
    // Return mock structure with calculated values
    return {
      assets: {
        currentAssets: {
          cash: cashBalance,
          cashEquivalents: 25000,
          totalCashAndEquivalents: cashBalance + 25000,
          accountsReceivable: receivablesBalance,
          allowanceForDoubtfulAccounts: -5000,
          netAccountsReceivable: receivablesBalance - 5000,
          notesReceivable: 10000,
          otherReceivables: 5000,
          totalReceivables: receivablesBalance + 10000,
          rawMaterials: 15000,
          workInProgress: 10000,
          finishedGoods: 25000,
          totalInventory: 50000,
          marketableSecurities: 30000,
          shortTermInvestments: 20000,
          totalShortTermInvestments: 50000,
          prepaidExpenses: 8000,
          deferredTaxAssets: 3000,
          otherCurrentAssets: 2000
        },
        totalCurrentAssets: cashBalance + receivablesBalance + 158000,
        nonCurrentAssets: {
          land: 100000,
          buildings: 500000,
          machinery: 200000,
          equipment: 150000,
          vehicles: 50000,
          grossPPE: 1000000,
          accumulatedDepreciation: -300000,
          netPPE: 700000,
          goodwill: 50000,
          patents: 20000,
          trademarks: 10000,
          copyrights: 5000,
          software: 15000,
          otherIntangibles: 5000,
          totalIntangibles: 105000,
          accumulatedAmortization: -25000,
          netIntangibles: 80000,
          longTermInvestments: 100000,
          investmentProperty: 150000,
          deferredTaxAssetsNonCurrent: 10000,
          otherNonCurrentAssets: 5000
        },
        totalNonCurrentAssets: 1045000,
        otherAssets: {
          deposits: 5000,
          advancesToSuppliers: 3000,
          miscellaneousAssets: 2000
        },
        totalOtherAssets: 10000
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: payablesBalance,
          notesPayable: 20000,
          accruedExpenses: 15000,
          wagesPayable: 12000,
          interestPayable: 3000,
          taxesPayable: 8000,
          totalPayables: payablesBalance + 58000,
          shortTermDebt: 50000,
          currentPortionLongTermDebt: 25000,
          totalShortTermDebt: 75000,
          deferredRevenue: 10000,
          customerDeposits: 5000,
          dividendsPayable: 8000,
          otherCurrentLiabilities: 4000
        },
        totalCurrentLiabilities: payablesBalance + 160000,
        nonCurrentLiabilities: {
          longTermDebt: 200000,
          bondsPayable: 100000,
          mortgagesPayable: 150000,
          totalLongTermDebt: 450000,
          deferredTaxLiabilities: 15000,
          pensionLiabilities: 25000,
          leaseObligations: 30000,
          otherNonCurrentLiabilities: 10000
        },
        totalNonCurrentLiabilities: 530000
      },
      equity: {
        commonStock: 100000,
        preferredStock: 50000,
        additionalPaidInCapital: 200000,
        totalPaidInCapital: 350000,
        retainedEarnings: 450000,
        currentYearEarnings: 125000,
        treasuryStock: -25000,
        otherComprehensiveIncome: 15000,
        minorityInterest: 10000,
        otherEquity: 5000
      }
    };
  }
}

export class MockBalanceSheetRepository extends BalanceSheetRepository {
  // All functionality is already in the base class
}

export const balanceSheetRepository = new MockBalanceSheetRepository();