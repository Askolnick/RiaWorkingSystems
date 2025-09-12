/**
 * Automated Balance Sheet System
 * 
 * Real-time balance sheet generation with automatic categorization,
 * multi-period comparison, and financial ratio analysis.
 */

// Balance Sheet Types
export interface BalanceSheet {
  id: string;
  tenantId: string;
  
  // Period Information
  periodEnd: string;
  periodStart?: string;
  periodType: PeriodType;
  fiscalYear: number;
  quarter?: number;
  month?: number;
  
  // Assets
  assets: Assets;
  totalAssets: number;
  
  // Liabilities
  liabilities: Liabilities;
  totalLiabilities: number;
  
  // Equity
  equity: Equity;
  totalEquity: number;
  
  // Balance Check
  isBalanced: boolean;
  balanceDifference: number;
  
  // Metadata
  currency: string;
  status: BalanceSheetStatus;
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

export interface Assets {
  // Current Assets
  currentAssets: CurrentAssets;
  totalCurrentAssets: number;
  
  // Non-Current Assets
  nonCurrentAssets: NonCurrentAssets;
  totalNonCurrentAssets: number;
  
  // Other Assets
  otherAssets: OtherAssets;
  totalOtherAssets: number;
}

export interface CurrentAssets {
  // Cash and Cash Equivalents
  cash: number;
  cashEquivalents: number;
  totalCashAndEquivalents: number;
  
  // Receivables
  accountsReceivable: number;
  allowanceForDoubtfulAccounts: number;
  netAccountsReceivable: number;
  notesReceivable: number;
  otherReceivables: number;
  totalReceivables: number;
  
  // Inventory
  rawMaterials: number;
  workInProgress: number;
  finishedGoods: number;
  totalInventory: number;
  
  // Investments
  marketableSecurities: number;
  shortTermInvestments: number;
  totalShortTermInvestments: number;
  
  // Prepaid and Other
  prepaidExpenses: number;
  deferredTaxAssets: number;
  otherCurrentAssets: number;
}

export interface NonCurrentAssets {
  // Property, Plant & Equipment
  land: number;
  buildings: number;
  machinery: number;
  equipment: number;
  vehicles: number;
  grossPPE: number;
  accumulatedDepreciation: number;
  netPPE: number;
  
  // Intangible Assets
  goodwill: number;
  patents: number;
  trademarks: number;
  copyrights: number;
  software: number;
  otherIntangibles: number;
  totalIntangibles: number;
  accumulatedAmortization: number;
  netIntangibles: number;
  
  // Long-term Investments
  longTermInvestments: number;
  investmentProperty: number;
  
  // Other Non-Current
  deferredTaxAssetsNonCurrent: number;
  otherNonCurrentAssets: number;
}

export interface OtherAssets {
  deposits: number;
  advancesToSuppliers: number;
  miscellaneousAssets: number;
}

export interface Liabilities {
  // Current Liabilities
  currentLiabilities: CurrentLiabilities;
  totalCurrentLiabilities: number;
  
  // Non-Current Liabilities
  nonCurrentLiabilities: NonCurrentLiabilities;
  totalNonCurrentLiabilities: number;
}

export interface CurrentLiabilities {
  // Payables
  accountsPayable: number;
  notesPayable: number;
  accruedExpenses: number;
  wagesPayable: number;
  interestPayable: number;
  taxesPayable: number;
  totalPayables: number;
  
  // Short-term Debt
  shortTermDebt: number;
  currentPortionLongTermDebt: number;
  totalShortTermDebt: number;
  
  // Other Current
  deferredRevenue: number;
  customerDeposits: number;
  dividendsPayable: number;
  otherCurrentLiabilities: number;
}

export interface NonCurrentLiabilities {
  // Long-term Debt
  longTermDebt: number;
  bondsPayable: number;
  mortgagesPayable: number;
  totalLongTermDebt: number;
  
  // Other Non-Current
  deferredTaxLiabilities: number;
  pensionLiabilities: number;
  leaseObligations: number;
  otherNonCurrentLiabilities: number;
}

export interface Equity {
  // Share Capital
  commonStock: number;
  preferredStock: number;
  additionalPaidInCapital: number;
  totalPaidInCapital: number;
  
  // Retained Earnings
  retainedEarnings: number;
  currentYearEarnings: number;
  
  // Other Equity
  treasuryStock: number;
  otherComprehensiveIncome: number;
  minorityInterest: number;
  otherEquity: number;
}

// Financial Ratios
export interface FinancialRatios {
  // Liquidity Ratios
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
  
  // Leverage Ratios
  debtToEquity: number;
  debtToAssets: number;
  equityRatio: number;
  debtRatio: number;
  
  // Efficiency Ratios
  assetTurnover?: number;
  inventoryTurnover?: number;
  receivablesTurnover?: number;
  
  // Profitability Ratios (requires income statement)
  returnOnAssets?: number;
  returnOnEquity?: number;
  grossProfitMargin?: number;
  netProfitMargin?: number;
}

// Chart of Accounts Mapping
export interface AccountMapping {
  id: string;
  tenantId: string;
  
  // Account Information
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  
  // Balance Sheet Mapping
  balanceSheetCategory: BalanceSheetCategory;
  balanceSheetSubcategory: string;
  
  // Rules
  isActive: boolean;
  isContraAccount: boolean;
  normalBalance: 'debit' | 'credit';
  
  // Aggregation
  parentAccountId?: string;
  consolidationRule?: ConsolidationRule;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface GeneralLedgerEntry {
  id: string;
  tenantId: string;
  
  // Transaction Details
  transactionId: string;
  transactionDate: string;
  postingDate: string;
  
  // Account Information
  accountCode: string;
  accountName: string;
  
  // Amounts
  debit: number;
  credit: number;
  balance: number;
  currency: string;
  
  // Reference
  referenceNumber?: string;
  description: string;
  source: TransactionSource;
  
  // Status
  isPosted: boolean;
  isReconciled: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Comparative Analysis
export interface ComparativeBalanceSheet {
  currentPeriod: BalanceSheet;
  previousPeriod?: BalanceSheet;
  yearOverYear?: BalanceSheet;
  
  // Changes
  changes: BalanceSheetChanges;
  percentageChanges: BalanceSheetChanges;
  
  // Trends
  trends: TrendAnalysis[];
  
  // Insights
  insights: FinancialInsight[];
}

export interface BalanceSheetChanges {
  assets: {
    currentAssets: number;
    nonCurrentAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: number;
    nonCurrentLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    totalEquity: number;
    retainedEarnings: number;
  };
}

export interface TrendAnalysis {
  metric: string;
  values: Array<{
    period: string;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

export interface FinancialInsight {
  type: InsightType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  metrics?: Record<string, number>;
}

// Automation Rules
export interface AutomationRule {
  id: string;
  tenantId: string;
  
  // Rule Configuration
  name: string;
  description?: string;
  ruleType: AutomationRuleType;
  
  // Trigger
  trigger: AutomationTrigger;
  frequency?: ScheduleFrequency;
  
  // Actions
  actions: AutomationAction[];
  
  // Status
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'threshold';
  schedule?: {
    frequency: ScheduleFrequency;
    time?: string;
    dayOfMonth?: number;
    dayOfWeek?: number;
  };
  event?: {
    eventType: string;
    conditions?: Record<string, any>;
  };
  threshold?: {
    metric: string;
    operator: 'greater' | 'less' | 'equals';
    value: number;
  };
}

export interface AutomationAction {
  type: 'generate_report' | 'send_notification' | 'update_accounts' | 'reconcile';
  parameters: Record<string, any>;
}

// Consolidation
export interface ConsolidatedBalanceSheet {
  id: string;
  tenantId: string;
  
  // Consolidation Info
  parentCompany: string;
  subsidiaries: string[];
  consolidationMethod: ConsolidationMethod;
  
  // Consolidated Figures
  consolidatedAssets: Assets;
  consolidatedLiabilities: Liabilities;
  consolidatedEquity: Equity;
  
  // Eliminations
  intercompanyEliminations: IntercompanyElimination[];
  minorityInterests: MinorityInterest[];
  
  // Totals
  totalConsolidatedAssets: number;
  totalConsolidatedLiabilities: number;
  totalConsolidatedEquity: number;
  
  // Metadata
  periodEnd: string;
  currency: string;
  generatedAt: string;
}

export interface IntercompanyElimination {
  type: 'receivable' | 'payable' | 'investment' | 'revenue' | 'expense';
  fromEntity: string;
  toEntity: string;
  amount: number;
  description: string;
}

export interface MinorityInterest {
  subsidiary: string;
  ownershipPercentage: number;
  minorityPercentage: number;
  minorityInterestAmount: number;
}

// Enums and Constants
export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'custom';

export type BalanceSheetStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export type AccountType = 
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense';

export type BalanceSheetCategory = 
  | 'current_assets'
  | 'non_current_assets'
  | 'current_liabilities'
  | 'non_current_liabilities'
  | 'equity';

export type TransactionSource = 
  | 'manual_entry'
  | 'bank_import'
  | 'invoice'
  | 'payment'
  | 'payroll'
  | 'adjustment'
  | 'system';

export type ConsolidationRule = 
  | 'sum'
  | 'average'
  | 'latest'
  | 'custom';

export type ConsolidationMethod = 
  | 'full_consolidation'
  | 'proportional'
  | 'equity_method';

export type AutomationRuleType = 
  | 'balance_sheet_generation'
  | 'account_reconciliation'
  | 'ratio_calculation'
  | 'alert_notification';

export type ScheduleFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually';

export type InsightType = 
  | 'liquidity_warning'
  | 'leverage_alert'
  | 'working_capital'
  | 'asset_efficiency'
  | 'growth_opportunity'
  | 'risk_indicator';

// API Request/Response Types
export interface GenerateBalanceSheetData {
  periodEnd: string;
  periodType: PeriodType;
  includeComparison?: boolean;
  includePreviousPeriod?: boolean;
  includeRatios?: boolean;
  currency?: string;
}

export interface UpdateBalanceSheetData {
  adjustments?: Array<{
    accountCode: string;
    amount: number;
    type: 'debit' | 'credit';
    description: string;
  }>;
  notes?: string;
  status?: BalanceSheetStatus;
}

export interface BalanceSheetFilters {
  periodType?: PeriodType[];
  status?: BalanceSheetStatus[];
  fiscalYear?: number[];
  currency?: string[];
  dateFrom?: string;
  dateTo?: string;
}

// Helper Functions
export function calculateTotalAssets(assets: Assets): number {
  return assets.totalCurrentAssets + assets.totalNonCurrentAssets + assets.totalOtherAssets;
}

export function calculateTotalLiabilities(liabilities: Liabilities): number {
  return liabilities.totalCurrentLiabilities + liabilities.totalNonCurrentLiabilities;
}

export function calculateTotalEquity(equity: Equity): number {
  return equity.totalPaidInCapital + equity.retainedEarnings + equity.currentYearEarnings - 
         equity.treasuryStock + equity.otherComprehensiveIncome + equity.minorityInterest + equity.otherEquity;
}

export function checkBalance(assets: number, liabilities: number, equity: number): boolean {
  const difference = Math.abs(assets - (liabilities + equity));
  return difference < 0.01; // Allow for minor rounding differences
}

export function calculateFinancialRatios(balanceSheet: BalanceSheet): FinancialRatios {
  const { assets, liabilities, equity } = balanceSheet;
  
  return {
    // Liquidity Ratios
    currentRatio: assets.currentAssets.totalCurrentAssets / liabilities.currentLiabilities.totalCurrentLiabilities,
    quickRatio: (assets.currentAssets.totalCurrentAssets - assets.currentAssets.totalInventory) / 
                liabilities.currentLiabilities.totalCurrentLiabilities,
    cashRatio: assets.currentAssets.totalCashAndEquivalents / liabilities.currentLiabilities.totalCurrentLiabilities,
    workingCapital: assets.currentAssets.totalCurrentAssets - liabilities.currentLiabilities.totalCurrentLiabilities,
    
    // Leverage Ratios
    debtToEquity: balanceSheet.totalLiabilities / balanceSheet.totalEquity,
    debtToAssets: balanceSheet.totalLiabilities / balanceSheet.totalAssets,
    equityRatio: balanceSheet.totalEquity / balanceSheet.totalAssets,
    debtRatio: balanceSheet.totalLiabilities / balanceSheet.totalAssets
  };
}

// Error Classes
export class BalanceSheetError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BalanceSheetError';
  }
}

export class AccountingError extends BalanceSheetError {
  constructor(message: string, details?: any) {
    super(message, 'ACCOUNTING_ERROR', details);
  }
}

export class ConsolidationError extends BalanceSheetError {
  constructor(message: string, details?: any) {
    super(message, 'CONSOLIDATION_ERROR', details);
  }
}