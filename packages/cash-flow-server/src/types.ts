/**
 * Cash Flow Statement System
 * 
 * Comprehensive cash flow statement generation using direct and indirect methods,
 * with automatic categorization, variance analysis, and cash forecasting.
 */

// Cash Flow Statement Types
export interface CashFlowStatement {
  id: string;
  tenantId: string;
  
  // Period Information
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  fiscalYear: number;
  quarter?: number;
  month?: number;
  
  // Method Used
  method: CashFlowMethod;
  
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
  status: CashFlowStatementStatus;
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
  // Direct Method Items (if used)
  directMethod?: DirectMethodOperating;
  
  // Indirect Method Items (if used)
  indirectMethod?: IndirectMethodOperating;
  
  // Common Operating Cash Flows
  operatingCashFlows: OperatingCashFlow[];
}

export interface DirectMethodOperating {
  // Cash Receipts
  cashReceivedFromCustomers: number;
  cashReceivedFromRoyalties: number;
  cashReceivedFromRents: number;
  otherOperatingReceipts: number;
  totalOperatingReceipts: number;
  
  // Cash Payments
  cashPaidToSuppliersAndEmployees: number;
  cashPaidForInventory: number;
  cashPaidForOperatingExpenses: number;
  cashPaidForInterest: number;
  cashPaidForIncomeTaxes: number;
  otherOperatingPayments: number;
  totalOperatingPayments: number;
}

export interface IndirectMethodOperating {
  // Starting Point
  netIncome: number;
  
  // Non-Cash Adjustments
  nonCashAdjustments: NonCashAdjustment[];
  totalNonCashAdjustments: number;
  
  // Working Capital Changes
  workingCapitalChanges: WorkingCapitalChange[];
  totalWorkingCapitalChanges: number;
  
  // Other Operating Adjustments
  otherOperatingAdjustments: OperatingAdjustment[];
  totalOtherAdjustments: number;
}

export interface NonCashAdjustment {
  item: string;
  amount: number;
  type: 'add_back' | 'subtract';
  category: NonCashCategory;
  description?: string;
}

export interface WorkingCapitalChange {
  item: string;
  currentPeriod: number;
  previousPeriod: number;
  change: number;
  cashImpact: number;
  category: WorkingCapitalCategory;
}

export interface OperatingAdjustment {
  item: string;
  amount: number;
  type: 'add' | 'subtract';
  description?: string;
}

export interface OperatingCashFlow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: OperatingCashFlowCategory;
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
  
  // Loans and Advances
  loansToOthers: number;
  collectionOfLoans: number;
  netLoanCashFlow: number;
  
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
  category: InvestingCashFlowCategory;
  subcategory?: string;
  reference?: string;
  assetType?: AssetType;
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
  category: FinancingCashFlowCategory;
  subcategory?: string;
  reference?: string;
  securityType?: SecurityType;
}

export interface SupplementalDisclosures {
  // Non-Cash Transactions
  nonCashTransactions: NonCashTransaction[];
  
  // Cash and Cash Equivalents Detail
  cashEquivalentsDetail: CashEquivalentDetail[];
  
  // Interest and Tax Payments
  interestPaidDuringPeriod: number;
  incomeTaxesPaidDuringPeriod: number;
  
  // Significant Events
  significantEvents: SignificantCashEvent[];
  
  // Reconciliation Items
  reconciliationItems: ReconciliationItem[];
}

export interface NonCashTransaction {
  date: string;
  description: string;
  amount: number;
  type: NonCashTransactionType;
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

export interface SignificantCashEvent {
  date: string;
  event: string;
  impact: number;
  category: CashFlowCategory;
  description: string;
}

export interface ReconciliationItem {
  item: string;
  bookAmount: number;
  cashAmount: number;
  difference: number;
  explanation: string;
}

// Comparative Cash Flow Statement
export interface ComparativeCashFlowStatement {
  currentPeriod: CashFlowStatement;
  previousPeriod?: CashFlowStatement;
  yearToDate?: CashFlowStatement;
  
  // Changes
  changes: CashFlowChanges;
  percentageChanges: CashFlowChanges;
  
  // Trends
  trends: CashFlowTrendAnalysis[];
  
  // Insights
  insights: CashFlowInsight[];
}

export interface CashFlowChanges {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netChangeInCash: number;
  endingCashBalance: number;
}

export interface CashFlowTrendAnalysis {
  metric: string;
  values: Array<{
    period: string;
    value: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

export interface CashFlowInsight {
  type: CashFlowInsightType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  metrics?: Record<string, number>;
}

// Cash Flow Ratios and Metrics
export interface CashFlowMetrics {
  // Operating Cash Flow Ratios
  operatingCashFlowRatio: number;
  cashFlowToSalesRatio: number;
  cashFlowPerShare: number;
  
  // Quality Ratios
  cashFlowToNetIncomeRatio: number;
  operatingCashFlowToCurrentLiabilitiesRatio: number;
  
  // Liquidity Ratios
  cashCoverageRatio: number;
  cashRatio: number;
  
  // Investment Ratios
  capitalExpenditureRatio: number;
  freeCashFlow: number;
  freeCashFlowYield: number;
  
  // Debt Ratios
  cashFlowToDebtRatio: number;
  debtServiceCoverageRatio: number;
  
  // Growth and Sustainability
  cashFlowGrowthRate: number;
  sustainableCashFlowGrowthRate: number;
  
  // Efficiency Metrics
  cashConversionCycle: number;
  workingCapitalTurnover: number;
}

// Cash Flow Forecasting
export interface CashFlowForecast {
  id: string;
  tenantId: string;
  
  // Forecast Period
  forecastStart: string;
  forecastEnd: string;
  forecastHorizon: ForecastHorizon;
  
  // Forecast Data
  forecastPeriods: ForecastPeriod[];
  
  // Assumptions
  assumptions: ForecastAssumption[];
  
  // Scenarios
  scenarios: CashFlowScenario[];
  
  // Confidence Levels
  confidenceInterval: ConfidenceInterval;
  
  // Metadata
  generatedAt: string;
  method: ForecastMethod;
  accuracy?: number;
}

export interface ForecastPeriod {
  periodStart: string;
  periodEnd: string;
  
  // Forecasted Cash Flows
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  
  // Cash Position
  beginningCash: number;
  endingCash: number;
  
  // Confidence
  confidenceLevel: number;
  
  // Breakdown
  cashInflows: ForecastCashFlow[];
  cashOutflows: ForecastCashFlow[];
}

export interface ForecastCashFlow {
  description: string;
  amount: number;
  category: CashFlowCategory;
  probability: number;
  timing: 'beginning' | 'middle' | 'end' | 'distributed';
}

export interface ForecastAssumption {
  assumption: string;
  value: number | string;
  category: AssumptionCategory;
  impact: 'high' | 'medium' | 'low';
  source: AssumptionSource;
}

export interface CashFlowScenario {
  name: string;
  description: string;
  probability: number;
  
  // Scenario-specific forecasts
  operatingCashFlowMultiplier: number;
  investingCashFlowMultiplier: number;
  financingCashFlowMultiplier: number;
  
  // Key assumptions changes
  assumptionChanges: AssumptionChange[];
}

export interface AssumptionChange {
  assumptionKey: string;
  baseValue: number;
  scenarioValue: number;
  impact: number;
}

export interface ConfidenceInterval {
  level: number; // e.g., 95
  lowerBound: number;
  upperBound: number;
}

// Enums and Constants
export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'custom';

export type CashFlowStatementStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export type CashFlowMethod = 
  | 'direct'
  | 'indirect'
  | 'hybrid';

export type NonCashCategory = 
  | 'depreciation_amortization'
  | 'impairment'
  | 'stock_compensation'
  | 'deferred_taxes'
  | 'bad_debt'
  | 'foreign_exchange'
  | 'other';

export type WorkingCapitalCategory = 
  | 'accounts_receivable'
  | 'inventory'
  | 'prepaid_expenses'
  | 'accounts_payable'
  | 'accrued_expenses'
  | 'deferred_revenue'
  | 'other';

export type OperatingCashFlowCategory = 
  | 'customer_receipts'
  | 'supplier_payments'
  | 'employee_payments'
  | 'tax_payments'
  | 'interest_payments'
  | 'other_operating';

export type InvestingCashFlowCategory = 
  | 'property_plant_equipment'
  | 'investments'
  | 'acquisitions'
  | 'intangible_assets'
  | 'loans'
  | 'other_investing';

export type FinancingCashFlowCategory = 
  | 'equity_transactions'
  | 'debt_transactions'
  | 'dividend_payments'
  | 'lease_payments'
  | 'other_financing';

export type AssetType = 
  | 'land'
  | 'buildings'
  | 'machinery'
  | 'equipment'
  | 'vehicles'
  | 'furniture'
  | 'technology'
  | 'intangible';

export type SecurityType = 
  | 'common_stock'
  | 'preferred_stock'
  | 'bonds'
  | 'notes'
  | 'convertible_securities'
  | 'warrants'
  | 'other';

export type NonCashTransactionType = 
  | 'asset_acquisition_via_debt'
  | 'debt_to_equity_conversion'
  | 'stock_dividend'
  | 'asset_exchange'
  | 'capital_lease'
  | 'other';

export type CashFlowCategory = 
  | 'operating'
  | 'investing'
  | 'financing';

export type CashFlowInsightType = 
  | 'cash_shortage_warning'
  | 'cash_surplus_opportunity'
  | 'working_capital_efficiency'
  | 'investment_opportunity'
  | 'debt_management'
  | 'operational_efficiency';

export type ForecastHorizon = 
  | 'short_term'    // < 3 months
  | 'medium_term'   // 3-12 months
  | 'long_term';    // > 12 months

export type ForecastMethod = 
  | 'historical_trend'
  | 'regression_analysis'
  | 'moving_average'
  | 'exponential_smoothing'
  | 'monte_carlo'
  | 'machine_learning'
  | 'hybrid';

export type AssumptionCategory = 
  | 'revenue_growth'
  | 'expense_growth'
  | 'working_capital'
  | 'capital_expenditures'
  | 'financing'
  | 'tax_rate'
  | 'interest_rate'
  | 'market_conditions';

export type AssumptionSource = 
  | 'historical_data'
  | 'management_guidance'
  | 'market_research'
  | 'industry_benchmarks'
  | 'economic_indicators'
  | 'expert_opinion';

// API Request/Response Types
export interface GenerateCashFlowStatementData {
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  method: CashFlowMethod;
  includeSupplemental?: boolean;
  includeForecasting?: boolean;
  currency?: string;
}

export interface UpdateCashFlowStatementData {
  adjustments?: Array<{
    category: CashFlowCategory;
    item: string;
    amount: number;
    description: string;
  }>;
  supplementalUpdates?: Partial<SupplementalDisclosures>;
  notes?: string;
  status?: CashFlowStatementStatus;
}

export interface CashFlowStatementFilters {
  periodType?: PeriodType[];
  status?: CashFlowStatementStatus[];
  method?: CashFlowMethod[];
  fiscalYear?: number[];
  currency?: string[];
  dateFrom?: string;
  dateTo?: string;
  minCashFlow?: number;
  hasNegativeCashFlow?: boolean;
}

export interface GenerateForecastData {
  periodStart: string;
  periodEnd: string;
  forecastHorizon: ForecastHorizon;
  method: ForecastMethod;
  confidenceLevel?: number;
  includeScenarios?: boolean;
  assumptions?: ForecastAssumption[];
}

// Helper Functions
export function calculateNetCashFromOperating(
  operatingActivities: OperatingActivities,
  method: CashFlowMethod
): number {
  if (method === 'direct' && operatingActivities.directMethod) {
    return operatingActivities.directMethod.totalOperatingReceipts - 
           operatingActivities.directMethod.totalOperatingPayments;
  }
  
  if (method === 'indirect' && operatingActivities.indirectMethod) {
    return operatingActivities.indirectMethod.netIncome +
           operatingActivities.indirectMethod.totalNonCashAdjustments +
           operatingActivities.indirectMethod.totalWorkingCapitalChanges +
           operatingActivities.indirectMethod.totalOtherAdjustments;
  }
  
  // Calculate from cash flows if available
  return operatingActivities.operatingCashFlows
    .reduce((sum, flow) => {
      return flow.type === 'inflow' ? sum + flow.amount : sum - flow.amount;
    }, 0);
}

export function calculateNetCashFromInvesting(investingActivities: InvestingActivities): number {
  return investingActivities.proceedsFromSaleOfPPE +
         investingActivities.proceedsFromSaleOfInvestments +
         investingActivities.maturityOfInvestments +
         investingActivities.disposalOfBusinesses +
         investingActivities.proceedsFromSaleOfIntangibleAssets +
         investingActivities.collectionOfLoans +
         investingActivities.otherInvestingInflows -
         (investingActivities.purchaseOfPPE +
          investingActivities.purchaseOfInvestments +
          investingActivities.acquisitionOfBusinesses +
          investingActivities.purchaseOfIntangibleAssets +
          investingActivities.loansToOthers +
          investingActivities.otherInvestingOutflows);
}

export function calculateNetCashFromFinancing(financingActivities: FinancingActivities): number {
  return financingActivities.proceedsFromStockIssuance +
         financingActivities.proceedsFromDebtIssuance +
         financingActivities.otherFinancingInflows -
         (financingActivities.treasuryStockPurchases +
          financingActivities.dividendsPaid +
          financingActivities.repaymentOfDebt +
          financingActivities.principalPaymentsOnLeases +
          financingActivities.otherFinancingOutflows);
}

export function calculateFreeCashFlow(
  operatingCashFlow: number,
  capitalExpenditures: number,
  dividendsPaid?: number
): number {
  return operatingCashFlow - capitalExpenditures - (dividendsPaid || 0);
}

export function calculateCashFlowToDebtRatio(
  operatingCashFlow: number,
  totalDebt: number
): number {
  if (totalDebt === 0) return 0;
  return operatingCashFlow / totalDebt;
}

export function calculateCashConversionCycle(
  daysInventoryOutstanding: number,
  daysSalesOutstanding: number,
  daysPayableOutstanding: number
): number {
  return daysInventoryOutstanding + daysSalesOutstanding - daysPayableOutstanding;
}

// Export Options
export interface CashFlowExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeDetails?: boolean;
  includeSupplemental?: boolean;
  includeForecasts?: boolean;
  includeCharts?: boolean;
  includeComparisons?: boolean;
}

export interface CashFlowExportResult {
  url: string;
  filename: string;
  size: number;
  generatedAt: string;
}

// Error Classes
export class CashFlowStatementError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CashFlowStatementError';
  }
}

export class CashFlowCalculationError extends CashFlowStatementError {
  constructor(message: string, details?: any) {
    super(message, 'CASH_FLOW_CALCULATION_ERROR', details);
  }
}

export class ForecastingError extends CashFlowStatementError {
  constructor(message: string, details?: any) {
    super(message, 'FORECASTING_ERROR', details);
  }
}