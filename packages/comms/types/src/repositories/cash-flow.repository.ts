import { BaseRepository, MockRepository } from './base.repository';
import type { PaginatedResponse } from '../types';

// Cash Flow Statement Types (copied from server package)
export interface CashFlowStatement {
  id: string;
  tenantId: string;
  
  // Period Information
  periodStart: string;
  periodEnd: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  fiscalYear: number;
  quarter?: number;
  month?: number;
  
  // Method Used
  method: 'direct' | 'indirect';
  
  // Operating Activities
  operatingActivities: OperatingActivities;
  netCashFromOperating: number;
  
  // Investing Activities
  investingActivities: InvestingActivities;
  netCashFromInvesting: number;
  
  // Financing Activities
  financingActivities: FinancingActivities;
  netCashFromFinancing: number;
  
  // Summary
  netChangeInCash: number;
  beginningCashBalance: number;
  endingCashBalance: number;
  
  // Supplemental Information
  supplementalDisclosures: SupplementalDisclosures;
  
  // Metadata
  currency: string;
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  generatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  
  // Audit Trail
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface OperatingActivities {
  // Indirect Method Items (most common)
  indirectMethod: IndirectMethodOperating;
  
  // Common Operating Cash Flows
  operatingCashFlows: OperatingCashFlow[];
}

export interface IndirectMethodOperating {
  // Starting Point
  netIncome: number;
  
  // Non-Cash Adjustments
  depreciation: number;
  amortization: number;
  stockCompensation: number;
  badDebtExpense: number;
  deferredTaxes: number;
  otherNonCashItems: number;
  totalNonCashAdjustments: number;
  
  // Working Capital Changes
  accountsReceivableChange: number;
  inventoryChange: number;
  prepaidExpensesChange: number;
  accountsPayableChange: number;
  accruedExpensesChange: number;
  deferredRevenueChange: number;
  totalWorkingCapitalChanges: number;
  
  // Other Operating Adjustments
  gainLossOnAssetSale: number;
  otherOperatingAdjustments: number;
  totalOtherAdjustments: number;
}

export interface OperatingCashFlow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  subcategory?: string;
  reference?: string;
  isRecurring: boolean;
}

export interface InvestingActivities {
  // Property, Plant & Equipment
  purchaseOfPPE: number;
  proceedsFromSaleOfPPE: number;
  netPPECashFlow: number;
  
  // Investments
  purchaseOfInvestments: number;
  proceedsFromSaleOfInvestments: number;
  maturityOfInvestments: number;
  netInvestmentCashFlow: number;
  
  // Business Acquisitions/Disposals
  acquisitionOfBusinesses: number;
  disposalOfBusinesses: number;
  netAcquisitionCashFlow: number;
  
  // Intangible Assets
  purchaseOfIntangibleAssets: number;
  proceedsFromSaleOfIntangibleAssets: number;
  netIntangibleCashFlow: number;
  
  // Other Investing
  otherInvestingInflows: number;
  otherInvestingOutflows: number;
  netOtherInvesting: number;
  
  // Detailed Cash Flows
  investingCashFlows: InvestingCashFlow[];
}

export interface InvestingCashFlow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  subcategory?: string;
  reference?: string;
  assetType?: string;
}

export interface FinancingActivities {
  // Equity Transactions
  proceedsFromStockIssuance: number;
  treasuryStockPurchases: number;
  dividendsPaid: number;
  netEquityCashFlow: number;
  
  // Debt Transactions
  proceedsFromDebtIssuance: number;
  repaymentOfDebt: number;
  netDebtCashFlow: number;
  
  // Lease Transactions
  principalPaymentsOnLeases: number;
  netLeaseCashFlow: number;
  
  // Other Financing
  otherFinancingInflows: number;
  otherFinancingOutflows: number;
  netOtherFinancing: number;
  
  // Detailed Cash Flows
  financingCashFlows: FinancingCashFlow[];
}

export interface FinancingCashFlow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  subcategory?: string;
  reference?: string;
  securityType?: string;
}

export interface SupplementalDisclosures {
  // Non-Cash Transactions
  nonCashTransactions: NonCashTransaction[];
  
  // Cash and Cash Equivalents Detail
  cashEquivalentsDetail: CashEquivalentDetail[];
  
  // Interest and Tax Payments
  interestPaidDuringPeriod: number;
  incomeTaxesPaidDuringPeriod: number;
}

export interface NonCashTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
  accounts: string[];
  reference?: string;
}

export interface CashEquivalentDetail {
  type: string;
  amount: number;
  maturityDate?: string;
  interestRate?: number;
  description?: string;
}

export interface ComparativeCashFlowStatement {
  currentPeriod: CashFlowStatement;
  previousPeriod?: CashFlowStatement;
  yearToDate?: CashFlowStatement;
  changes: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netChangeInCash: number;
    endingCashBalance: number;
  };
  percentageChanges: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netChangeInCash: number;
    endingCashBalance: number;
  };
}

export interface GenerateCashFlowStatementData {
  periodStart: string;
  periodEnd: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  method: 'direct' | 'indirect';
  includeSupplemental?: boolean;
  currency?: string;
}

export interface CashFlowExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeDetails?: boolean;
  includeSupplemental?: boolean;
  includeCharts?: boolean;
  includeComparisons?: boolean;
}

export interface CashFlowExportResult {
  url: string;
  filename: string;
  size: number;
  generatedAt: string;
}

// Repository Implementation
export class CashFlowStatementRepository extends BaseRepository<CashFlowStatement> {
  protected endpoint = '/finance/cash-flow-statements';

  async generate(data: GenerateCashFlowStatementData): Promise<CashFlowStatement> {
    return this.request('POST', '/generate', data);
  }

  async getComparative(id: string): Promise<ComparativeCashFlowStatement> {
    return this.request('GET', `/${id}/comparative`);
  }

  async approve(id: string, notes?: string): Promise<CashFlowStatement> {
    return this.request('POST', `/${id}/approve`, { notes });
  }

  async export(id: string, options: CashFlowExportOptions): Promise<CashFlowExportResult> {
    return this.request('POST', `/${id}/export`, options);
  }
}

// Mock Implementation
export class MockCashFlowStatementRepository extends MockRepository<CashFlowStatement> {
  protected storageKey = 'ria_cash_flow_statements';
  protected endpoint = '/finance/cash-flow-statements';

  constructor() {
    super();
    // Skip initialization during SSR
    if (typeof window !== 'undefined') {
      this.initializeMockData();
    }
  }

  private initializeMockData(): void {
    const existing = this.getFromStorage();
    if (!existing || existing.length === 0) {
      const mockStatements = this.generateMockStatements();
      this.saveToStorage(mockStatements);
    }
  }

  private generateMockStatements(): CashFlowStatement[] {
    const statements: CashFlowStatement[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Generate last 12 months of cash flow statements
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      statements.push(this.generateMonthlyStatement(year, month));
    }

    // Add quarterly statements
    for (let q = 1; q <= 4; q++) {
      if (year === currentYear && q > Math.floor(currentMonth / 3) + 1) continue;
      statements.push(this.generateQuarterlyStatement(currentYear, q));
    }

    // Add annual statement for last year
    statements.push(this.generateAnnualStatement(currentYear - 1));

    return statements;
  }

  private generateMonthlyStatement(year: number, month: number): CashFlowStatement {
    // Base cash flows with some variability
    const baseNetIncome = 80000 + Math.random() * 40000;
    const baseDepreciation = 15000 + Math.random() * 5000;
    const baseCapEx = 25000 + Math.random() * 15000;
    
    // Generate indirect method operating activities
    const indirectMethod: IndirectMethodOperating = {
      netIncome: baseNetIncome,
      depreciation: baseDepreciation,
      amortization: 5000 + Math.random() * 3000,
      stockCompensation: 8000 + Math.random() * 4000,
      badDebtExpense: 2000 + Math.random() * 1000,
      deferredTaxes: -1000 + Math.random() * 2000,
      otherNonCashItems: 1000 + Math.random() * 2000,
      totalNonCashAdjustments: 0, // Will be calculated
      
      // Working capital changes (negative means cash outflow)
      accountsReceivableChange: -5000 - Math.random() * 10000,
      inventoryChange: -3000 - Math.random() * 8000,
      prepaidExpensesChange: -1000 - Math.random() * 2000,
      accountsPayableChange: 4000 + Math.random() * 6000,
      accruedExpensesChange: 2000 + Math.random() * 3000,
      deferredRevenueChange: 1000 + Math.random() * 4000,
      totalWorkingCapitalChanges: 0, // Will be calculated
      
      gainLossOnAssetSale: -500 + Math.random() * 1000,
      otherOperatingAdjustments: 500 + Math.random() * 1000,
      totalOtherAdjustments: 0, // Will be calculated
    };

    // Calculate totals
    indirectMethod.totalNonCashAdjustments = indirectMethod.depreciation + 
      indirectMethod.amortization + indirectMethod.stockCompensation + 
      indirectMethod.badDebtExpense + indirectMethod.deferredTaxes + 
      indirectMethod.otherNonCashItems;
      
    indirectMethod.totalWorkingCapitalChanges = indirectMethod.accountsReceivableChange +
      indirectMethod.inventoryChange + indirectMethod.prepaidExpensesChange +
      indirectMethod.accountsPayableChange + indirectMethod.accruedExpensesChange +
      indirectMethod.deferredRevenueChange;
      
    indirectMethod.totalOtherAdjustments = indirectMethod.gainLossOnAssetSale +
      indirectMethod.otherOperatingAdjustments;

    const operatingActivities: OperatingActivities = {
      indirectMethod,
      operatingCashFlows: this.generateOperatingCashFlows(month, year)
    };

    const netCashFromOperating = indirectMethod.netIncome + 
      indirectMethod.totalNonCashAdjustments + 
      indirectMethod.totalWorkingCapitalChanges + 
      indirectMethod.totalOtherAdjustments;

    // Generate investing activities
    const investingActivities: InvestingActivities = {
      purchaseOfPPE: -baseCapEx,
      proceedsFromSaleOfPPE: Math.random() < 0.3 ? 5000 + Math.random() * 10000 : 0,
      netPPECashFlow: 0, // Will be calculated
      
      purchaseOfInvestments: Math.random() < 0.4 ? -(10000 + Math.random() * 20000) : 0,
      proceedsFromSaleOfInvestments: Math.random() < 0.2 ? 8000 + Math.random() * 15000 : 0,
      maturityOfInvestments: Math.random() < 0.3 ? 5000 + Math.random() * 10000 : 0,
      netInvestmentCashFlow: 0, // Will be calculated
      
      acquisitionOfBusinesses: Math.random() < 0.1 ? -(50000 + Math.random() * 100000) : 0,
      disposalOfBusinesses: Math.random() < 0.05 ? 75000 + Math.random() * 150000 : 0,
      netAcquisitionCashFlow: 0, // Will be calculated
      
      purchaseOfIntangibleAssets: Math.random() < 0.3 ? -(3000 + Math.random() * 7000) : 0,
      proceedsFromSaleOfIntangibleAssets: Math.random() < 0.1 ? 2000 + Math.random() * 5000 : 0,
      netIntangibleCashFlow: 0, // Will be calculated
      
      otherInvestingInflows: Math.random() < 0.2 ? 1000 + Math.random() * 3000 : 0,
      otherInvestingOutflows: Math.random() < 0.2 ? -(1000 + Math.random() * 2000) : 0,
      netOtherInvesting: 0, // Will be calculated
      
      investingCashFlows: this.generateInvestingCashFlows(month, year)
    };

    // Calculate investing totals
    investingActivities.netPPECashFlow = investingActivities.proceedsFromSaleOfPPE + investingActivities.purchaseOfPPE;
    investingActivities.netInvestmentCashFlow = investingActivities.proceedsFromSaleOfInvestments + 
      investingActivities.maturityOfInvestments + investingActivities.purchaseOfInvestments;
    investingActivities.netAcquisitionCashFlow = investingActivities.disposalOfBusinesses + investingActivities.acquisitionOfBusinesses;
    investingActivities.netIntangibleCashFlow = investingActivities.proceedsFromSaleOfIntangibleAssets + investingActivities.purchaseOfIntangibleAssets;
    investingActivities.netOtherInvesting = investingActivities.otherInvestingInflows + investingActivities.otherInvestingOutflows;

    const netCashFromInvesting = investingActivities.netPPECashFlow + 
      investingActivities.netInvestmentCashFlow + 
      investingActivities.netAcquisitionCashFlow + 
      investingActivities.netIntangibleCashFlow + 
      investingActivities.netOtherInvesting;

    // Generate financing activities
    const financingActivities: FinancingActivities = {
      proceedsFromStockIssuance: Math.random() < 0.1 ? 50000 + Math.random() * 100000 : 0,
      treasuryStockPurchases: Math.random() < 0.2 ? -(10000 + Math.random() * 20000) : 0,
      dividendsPaid: Math.random() < 0.8 ? -(15000 + Math.random() * 10000) : 0,
      netEquityCashFlow: 0, // Will be calculated
      
      proceedsFromDebtIssuance: Math.random() < 0.3 ? 25000 + Math.random() * 75000 : 0,
      repaymentOfDebt: Math.random() < 0.6 ? -(20000 + Math.random() * 30000) : 0,
      netDebtCashFlow: 0, // Will be calculated
      
      principalPaymentsOnLeases: -(3000 + Math.random() * 2000),
      netLeaseCashFlow: 0, // Will be calculated
      
      otherFinancingInflows: Math.random() < 0.1 ? 2000 + Math.random() * 5000 : 0,
      otherFinancingOutflows: Math.random() < 0.1 ? -(1000 + Math.random() * 3000) : 0,
      netOtherFinancing: 0, // Will be calculated
      
      financingCashFlows: this.generateFinancingCashFlows(month, year)
    };

    // Calculate financing totals
    financingActivities.netEquityCashFlow = financingActivities.proceedsFromStockIssuance + 
      financingActivities.treasuryStockPurchases + financingActivities.dividendsPaid;
    financingActivities.netDebtCashFlow = financingActivities.proceedsFromDebtIssuance + financingActivities.repaymentOfDebt;
    financingActivities.netLeaseCashFlow = financingActivities.principalPaymentsOnLeases;
    financingActivities.netOtherFinancing = financingActivities.otherFinancingInflows + financingActivities.otherFinancingOutflows;

    const netCashFromFinancing = financingActivities.netEquityCashFlow + 
      financingActivities.netDebtCashFlow + 
      financingActivities.netLeaseCashFlow + 
      financingActivities.netOtherFinancing;

    // Calculate net change in cash
    const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing;
    const beginningCashBalance = 150000 + Math.random() * 100000;
    const endingCashBalance = beginningCashBalance + netChangeInCash;

    // Generate supplemental disclosures
    const supplementalDisclosures: SupplementalDisclosures = {
      nonCashTransactions: this.generateNonCashTransactions(),
      cashEquivalentsDetail: this.generateCashEquivalentsDetail(),
      interestPaidDuringPeriod: 3000 + Math.random() * 2000,
      incomeTaxesPaidDuringPeriod: 18000 + Math.random() * 8000
    };

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return {
      id: `cf-${year}-${String(month + 1).padStart(2, '0')}`,
      tenantId: 'tenant-123',
      periodStart: startDate.toISOString().split('T')[0],
      periodEnd: endDate.toISOString().split('T')[0],
      periodType: 'monthly',
      fiscalYear: year,
      month: month + 1,
      method: 'indirect',
      operatingActivities,
      netCashFromOperating,
      investingActivities,
      netCashFromInvesting,
      financingActivities,
      netCashFromFinancing,
      netChangeInCash,
      beginningCashBalance,
      endingCashBalance,
      supplementalDisclosures,
      currency: 'USD',
      status: month === new Date().getMonth() ? 'draft' : 'published',
      generatedAt: new Date().toISOString(),
      approvedBy: month === new Date().getMonth() ? undefined : 'CFO',
      approvedAt: month === new Date().getMonth() ? undefined : new Date(year, month + 1, 5).toISOString(),
      notes: 'Auto-generated monthly cash flow statement using indirect method',
      createdBy: 'system',
      createdAt: new Date(year, month + 1, 1).toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString()
    };
  }

  private generateQuarterlyStatement(year: number, quarter: number): CashFlowStatement {
    const statement = this.generateMonthlyStatement(year, (quarter - 1) * 3);
    
    // Scale up the quarterly numbers (approximately 3x monthly)
    statement.id = `cf-${year}-Q${quarter}`;
    statement.periodType = 'quarterly';
    statement.quarter = quarter;
    statement.month = undefined;
    statement.periodStart = new Date(year, (quarter - 1) * 3, 1).toISOString().split('T')[0];
    statement.periodEnd = new Date(year, quarter * 3, 0).toISOString().split('T')[0];
    
    // Scale operating activities
    const multiplier = 3.1;
    statement.operatingActivities.indirectMethod.netIncome *= multiplier;
    statement.operatingActivities.indirectMethod.totalNonCashAdjustments *= multiplier;
    statement.operatingActivities.indirectMethod.totalWorkingCapitalChanges *= multiplier;
    statement.netCashFromOperating *= multiplier;
    
    // Scale investing activities
    statement.netCashFromInvesting *= multiplier;
    statement.investingActivities.purchaseOfPPE *= multiplier;
    statement.investingActivities.netPPECashFlow *= multiplier;
    
    // Scale financing activities
    statement.netCashFromFinancing *= multiplier;
    statement.financingActivities.dividendsPaid *= multiplier;
    statement.financingActivities.netEquityCashFlow *= multiplier;
    
    // Update totals
    statement.netChangeInCash *= multiplier;
    statement.endingCashBalance = statement.beginningCashBalance + statement.netChangeInCash;
    
    return statement;
  }

  private generateAnnualStatement(year: number): CashFlowStatement {
    const statement = this.generateMonthlyStatement(year, 0);
    
    // Scale up the annual numbers (approximately 12x monthly)
    statement.id = `cf-${year}-annual`;
    statement.periodType = 'annual';
    statement.quarter = undefined;
    statement.month = undefined;
    statement.periodStart = new Date(year, 0, 1).toISOString().split('T')[0];
    statement.periodEnd = new Date(year, 11, 31).toISOString().split('T')[0];
    
    // Scale all figures by approximately 12x
    const multiplier = 12.2;
    statement.operatingActivities.indirectMethod.netIncome *= multiplier;
    statement.operatingActivities.indirectMethod.totalNonCashAdjustments *= multiplier;
    statement.operatingActivities.indirectMethod.totalWorkingCapitalChanges *= multiplier;
    statement.netCashFromOperating *= multiplier;
    
    statement.netCashFromInvesting *= multiplier;
    statement.netCashFromFinancing *= multiplier;
    statement.netChangeInCash *= multiplier;
    statement.endingCashBalance = statement.beginningCashBalance + statement.netChangeInCash;
    
    statement.status = 'published';
    statement.approvedBy = 'CFO';
    statement.approvedAt = new Date(year + 1, 0, 15).toISOString();
    
    return statement;
  }

  private generateOperatingCashFlows(month: number, year: number): OperatingCashFlow[] {
    return [
      {
        id: `op-${year}-${month}-1`,
        date: new Date(year, month, 5).toISOString().split('T')[0],
        description: 'Customer payments received',
        amount: 450000 + Math.random() * 100000,
        type: 'inflow',
        category: 'customer_receipts',
        reference: 'AR-COLLECTION',
        isRecurring: true
      },
      {
        id: `op-${year}-${month}-2`,
        date: new Date(year, month, 15).toISOString().split('T')[0],
        description: 'Supplier payments',
        amount: 250000 + Math.random() * 50000,
        type: 'outflow',
        category: 'supplier_payments',
        reference: 'AP-PAYMENT',
        isRecurring: true
      },
      {
        id: `op-${year}-${month}-3`,
        date: new Date(year, month, 30).toISOString().split('T')[0],
        description: 'Payroll payments',
        amount: 120000 + Math.random() * 20000,
        type: 'outflow',
        category: 'employee_payments',
        reference: 'PAYROLL',
        isRecurring: true
      },
      {
        id: `op-${year}-${month}-4`,
        date: new Date(year, month, 25).toISOString().split('T')[0],
        description: 'Tax payments',
        amount: 25000 + Math.random() * 10000,
        type: 'outflow',
        category: 'tax_payments',
        reference: 'TAX-PAYMENT',
        isRecurring: false
      }
    ];
  }

  private generateInvestingCashFlows(month: number, year: number): InvestingCashFlow[] {
    const flows: InvestingCashFlow[] = [];
    
    if (Math.random() < 0.4) {
      flows.push({
        id: `inv-${year}-${month}-1`,
        date: new Date(year, month, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        description: 'Equipment purchase',
        amount: 15000 + Math.random() * 20000,
        type: 'outflow',
        category: 'property_plant_equipment',
        assetType: 'equipment',
        reference: 'CAPEX-' + Math.floor(Math.random() * 1000)
      });
    }

    if (Math.random() < 0.2) {
      flows.push({
        id: `inv-${year}-${month}-2`,
        date: new Date(year, month, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        description: 'Investment purchase',
        amount: 10000 + Math.random() * 15000,
        type: 'outflow',
        category: 'investments',
        reference: 'INV-' + Math.floor(Math.random() * 1000)
      });
    }

    return flows;
  }

  private generateFinancingCashFlows(month: number, year: number): FinancingCashFlow[] {
    const flows: FinancingCashFlow[] = [];
    
    if (Math.random() < 0.6) {
      flows.push({
        id: `fin-${year}-${month}-1`,
        date: new Date(year, month, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        description: 'Debt service payment',
        amount: 8000 + Math.random() * 5000,
        type: 'outflow',
        category: 'debt_transactions',
        reference: 'DEBT-PAYMENT-' + Math.floor(Math.random() * 100)
      });
    }

    if (Math.random() < 0.8) {
      flows.push({
        id: `fin-${year}-${month}-2`,
        date: new Date(year, month, 15).toISOString().split('T')[0],
        description: 'Dividend payment',
        amount: 12000 + Math.random() * 8000,
        type: 'outflow',
        category: 'dividend_payments',
        reference: 'DIV-' + year + '-' + (month + 1)
      });
    }

    return flows;
  }

  private generateNonCashTransactions(): NonCashTransaction[] {
    return [
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Asset acquired through capital lease',
        amount: 25000,
        type: 'capital_lease',
        accounts: ['Equipment', 'Capital Lease Obligation'],
        reference: 'LEASE-2024-001'
      },
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Stock dividend distributed',
        amount: 5000,
        type: 'stock_dividend',
        accounts: ['Retained Earnings', 'Common Stock'],
        reference: 'STOCK-DIV-2024'
      }
    ];
  }

  private generateCashEquivalentsDetail(): CashEquivalentDetail[] {
    return [
      {
        type: 'Money Market Fund',
        amount: 75000,
        interestRate: 4.5,
        description: 'High-yield money market account'
      },
      {
        type: 'Commercial Paper',
        amount: 50000,
        maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interestRate: 4.2,
        description: '30-day commercial paper'
      },
      {
        type: 'Treasury Bills',
        amount: 25000,
        maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interestRate: 4.8,
        description: '90-day U.S. Treasury bills'
      }
    ];
  }

  async generate(data: GenerateCashFlowStatementData): Promise<CashFlowStatement> {
    // Simulate generating a new cash flow statement
    const year = new Date(data.periodEnd).getFullYear();
    const month = new Date(data.periodEnd).getMonth();
    
    let statement: CashFlowStatement;
    if (data.periodType === 'monthly') {
      statement = this.generateMonthlyStatement(year, month);
    } else if (data.periodType === 'quarterly') {
      const quarter = Math.floor(month / 3) + 1;
      statement = this.generateQuarterlyStatement(year, quarter);
    } else {
      statement = this.generateAnnualStatement(year);
    }
    
    statement.periodStart = data.periodStart;
    statement.periodEnd = data.periodEnd;
    statement.method = data.method;
    statement.currency = data.currency || 'USD';
    statement.status = 'draft';
    statement.generatedAt = new Date().toISOString();
    
    const existing = this.getFromStorage();
    this.saveToStorage([...existing, statement]);
    
    return statement;
  }

  async getComparative(id: string): Promise<ComparativeCashFlowStatement> {
    const statements = this.getFromStorage();
    const currentPeriod = statements.find(s => s.id === id);
    
    if (!currentPeriod) {
      throw new Error('Cash flow statement not found');
    }
    
    // Find previous period
    let previousPeriod: CashFlowStatement | undefined;
    if (currentPeriod.periodType === 'monthly' && currentPeriod.month) {
      const prevMonth = currentPeriod.month === 1 ? 12 : currentPeriod.month - 1;
      const prevYear = currentPeriod.month === 1 ? currentPeriod.fiscalYear - 1 : currentPeriod.fiscalYear;
      previousPeriod = statements.find(s => 
        s.periodType === 'monthly' && 
        s.month === prevMonth && 
        s.fiscalYear === prevYear
      );
    } else if (currentPeriod.periodType === 'quarterly' && currentPeriod.quarter) {
      const prevQuarter = currentPeriod.quarter === 1 ? 4 : currentPeriod.quarter - 1;
      const prevYear = currentPeriod.quarter === 1 ? currentPeriod.fiscalYear - 1 : currentPeriod.fiscalYear;
      previousPeriod = statements.find(s => 
        s.periodType === 'quarterly' && 
        s.quarter === prevQuarter && 
        s.fiscalYear === prevYear
      );
    }
    
    // Calculate changes
    const changes = previousPeriod ? {
      operatingCashFlow: currentPeriod.netCashFromOperating - previousPeriod.netCashFromOperating,
      investingCashFlow: currentPeriod.netCashFromInvesting - previousPeriod.netCashFromInvesting,
      financingCashFlow: currentPeriod.netCashFromFinancing - previousPeriod.netCashFromFinancing,
      netChangeInCash: currentPeriod.netChangeInCash - previousPeriod.netChangeInCash,
      endingCashBalance: currentPeriod.endingCashBalance - previousPeriod.endingCashBalance
    } : {
      operatingCashFlow: 0,
      investingCashFlow: 0,
      financingCashFlow: 0,
      netChangeInCash: 0,
      endingCashBalance: 0
    };
    
    const percentageChanges = previousPeriod ? {
      operatingCashFlow: previousPeriod.netCashFromOperating !== 0 ? 
        (changes.operatingCashFlow / Math.abs(previousPeriod.netCashFromOperating)) * 100 : 0,
      investingCashFlow: previousPeriod.netCashFromInvesting !== 0 ? 
        (changes.investingCashFlow / Math.abs(previousPeriod.netCashFromInvesting)) * 100 : 0,
      financingCashFlow: previousPeriod.netCashFromFinancing !== 0 ? 
        (changes.financingCashFlow / Math.abs(previousPeriod.netCashFromFinancing)) * 100 : 0,
      netChangeInCash: previousPeriod.netChangeInCash !== 0 ? 
        (changes.netChangeInCash / Math.abs(previousPeriod.netChangeInCash)) * 100 : 0,
      endingCashBalance: (changes.endingCashBalance / previousPeriod.endingCashBalance) * 100
    } : {
      operatingCashFlow: 0,
      investingCashFlow: 0,
      financingCashFlow: 0,
      netChangeInCash: 0,
      endingCashBalance: 0
    };
    
    return {
      currentPeriod,
      previousPeriod,
      changes,
      percentageChanges
    };
  }

  async approve(id: string, notes?: string): Promise<CashFlowStatement> {
    const statements = this.getFromStorage();
    const index = statements.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Cash flow statement not found');
    }
    
    statements[index].status = 'approved';
    statements[index].approvedBy = 'Current User';
    statements[index].approvedAt = new Date().toISOString();
    if (notes) {
      statements[index].notes = notes;
    }
    
    this.saveToStorage(statements);
    return statements[index];
  }

  async export(id: string, options: CashFlowExportOptions): Promise<CashFlowExportResult> {
    const statements = this.getFromStorage();
    const statement = statements.find(s => s.id === id);
    
    if (!statement) {
      throw new Error('Cash flow statement not found');
    }
    
    // Simulate export
    const filename = `cash-flow-statement-${statement.periodStart}-to-${statement.periodEnd}.${options.format}`;
    const size = Math.floor(Math.random() * 500000) + 100000;
    
    return {
      url: `blob:mock-export-${id}`,
      filename,
      size,
      generatedAt: new Date().toISOString()
    };
  }
}

export const cashFlowStatementRepository = new MockCashFlowStatementRepository();