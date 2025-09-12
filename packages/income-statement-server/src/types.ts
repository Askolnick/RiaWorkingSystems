/**
 * Income Statement (Profit & Loss) System
 * 
 * Comprehensive income statement generation with revenue tracking,
 * expense categorization, and profitability analysis.
 */

// Income Statement Types
export interface IncomeStatement {
  id: string;
  tenantId: string;
  
  // Period Information
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  fiscalYear: number;
  quarter?: number;
  month?: number;
  
  // Revenue
  revenue: Revenue;
  totalRevenue: number;
  
  // Cost of Goods Sold
  costOfGoodsSold: CostOfGoodsSold;
  totalCOGS: number;
  
  // Gross Profit
  grossProfit: number;
  grossProfitMargin: number;
  
  // Operating Expenses
  operatingExpenses: OperatingExpenses;
  totalOperatingExpenses: number;
  
  // Operating Income
  operatingIncome: number;
  operatingMargin: number;
  
  // Other Income/Expenses
  otherIncomeExpenses: OtherIncomeExpenses;
  totalOtherIncomeExpenses: number;
  
  // Pre-tax Income
  incomeBeforeTax: number;
  
  // Taxes
  incomeTax: number;
  effectiveTaxRate: number;
  
  // Net Income
  netIncome: number;
  netProfitMargin: number;
  
  // Earnings Per Share (if applicable)
  earningsPerShare?: number;
  dilutedEPS?: number;
  
  // Metadata
  currency: string;
  status: IncomeStatementStatus;
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

export interface Revenue {
  // Product/Service Revenue
  productRevenue: number;
  serviceRevenue: number;
  subscriptionRevenue: number;
  
  // Revenue by Category
  revenueByCategory: RevenueCategory[];
  
  // Deductions
  salesReturns: number;
  salesDiscounts: number;
  allowances: number;
  
  // Net Revenue
  netRevenue: number;
  
  // Growth Metrics
  yearOverYearGrowth?: number;
  quarterOverQuarterGrowth?: number;
  monthOverMonthGrowth?: number;
}

export interface RevenueCategory {
  category: string;
  amount: number;
  percentage: number;
  unitsSold?: number;
  averagePrice?: number;
}

export interface CostOfGoodsSold {
  // Direct Costs
  directMaterials: number;
  directLabor: number;
  manufacturingOverhead: number;
  
  // Inventory Changes
  beginningInventory: number;
  purchases: number;
  endingInventory: number;
  
  // Other COGS
  freight: number;
  customsDuties: number;
  otherDirectCosts: number;
  
  // Total COGS
  totalCOGS: number;
}

export interface OperatingExpenses {
  // Sales & Marketing
  salesAndMarketing: SalesAndMarketingExpenses;
  totalSalesAndMarketing: number;
  
  // General & Administrative
  generalAndAdministrative: GeneralAdministrativeExpenses;
  totalGeneralAndAdministrative: number;
  
  // Research & Development
  researchAndDevelopment: ResearchDevelopmentExpenses;
  totalResearchAndDevelopment: number;
  
  // Depreciation & Amortization
  depreciation: number;
  amortization: number;
  totalDepreciationAmortization: number;
  
  // Other Operating
  otherOperatingExpenses: number;
}

export interface SalesAndMarketingExpenses {
  advertising: number;
  promotions: number;
  salesSalaries: number;
  salesCommissions: number;
  travelAndEntertainment: number;
  marketingMaterials: number;
  digitalMarketing: number;
  tradeShows: number;
  other: number;
}

export interface GeneralAdministrativeExpenses {
  administrativeSalaries: number;
  officeRent: number;
  utilities: number;
  insurance: number;
  professionalFees: number;
  officeSupplies: number;
  telecommunications: number;
  softwareSubscriptions: number;
  bankFees: number;
  badDebtExpense: number;
  other: number;
}

export interface ResearchDevelopmentExpenses {
  rdSalaries: number;
  rdMaterials: number;
  rdEquipment: number;
  rdContractors: number;
  patents: number;
  prototypes: number;
  testing: number;
  other: number;
}

export interface OtherIncomeExpenses {
  // Other Income
  interestIncome: number;
  dividendIncome: number;
  rentalIncome: number;
  gainOnSaleOfAssets: number;
  foreignExchangeGain: number;
  otherIncome: number;
  totalOtherIncome: number;
  
  // Other Expenses
  interestExpense: number;
  lossOnSaleOfAssets: number;
  foreignExchangeLoss: number;
  writeDowns: number;
  restructuringCosts: number;
  legalSettlements: number;
  otherExpenses: number;
  totalOtherExpenses: number;
}

// Comparative Income Statement
export interface ComparativeIncomeStatement {
  currentPeriod: IncomeStatement;
  previousPeriod?: IncomeStatement;
  yearToDate?: IncomeStatement;
  
  // Changes
  changes: IncomeStatementChanges;
  percentageChanges: IncomeStatementChanges;
  
  // Trends
  trends: TrendAnalysis[];
  
  // Insights
  insights: FinancialInsight[];
}

export interface IncomeStatementChanges {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
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

// Profitability Metrics
export interface ProfitabilityMetrics {
  // Margins
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  ebitdaMargin: number;
  
  // Returns (requires balance sheet data)
  returnOnAssets?: number;
  returnOnEquity?: number;
  returnOnInvestedCapital?: number;
  
  // Efficiency
  revenuePerEmployee?: number;
  profitPerEmployee?: number;
  
  // Growth
  revenueGrowthRate: number;
  earningsGrowthRate: number;
  
  // Coverage
  interestCoverage?: number;
  debtServiceCoverage?: number;
}

// Budget vs Actual
export interface BudgetComparison {
  budgeted: IncomeStatement;
  actual: IncomeStatement;
  
  // Variances
  variances: VarianceAnalysis;
  percentageVariances: VarianceAnalysis;
  
  // Performance Indicators
  performanceScore: number;
  achievementRate: number;
  
  // Detailed Analysis
  varianceDetails: VarianceDetail[];
}

export interface VarianceAnalysis {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
}

export interface VarianceDetail {
  account: string;
  budgeted: number;
  actual: number;
  variance: number;
  percentageVariance: number;
  explanation?: string;
  isFavorable: boolean;
}

// Segment Reporting
export interface SegmentedIncomeStatement {
  // Segments
  segments: SegmentPerformance[];
  
  // Consolidation
  consolidatedStatement: IncomeStatement;
  interSegmentEliminations: number;
  
  // Analysis
  topPerformingSegments: SegmentPerformance[];
  underperformingSegments: SegmentPerformance[];
}

export interface SegmentPerformance {
  segmentId: string;
  segmentName: string;
  segmentType: 'product' | 'geographic' | 'customer' | 'business_unit';
  
  // Performance
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  
  // Metrics
  grossMargin: number;
  operatingMargin: number;
  contributionMargin: number;
  
  // Contribution
  revenueContribution: number;
  profitContribution: number;
}

// Account Mapping for Income Statement
export interface IncomeStatementAccountMapping {
  id: string;
  tenantId: string;
  
  // Account Information
  accountCode: string;
  accountName: string;
  
  // Income Statement Mapping
  statementCategory: IncomeStatementCategory;
  subcategory: string;
  
  // Rules
  isActive: boolean;
  aggregationRule?: 'sum' | 'average' | 'latest';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Enums and Constants
export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'custom';

export type IncomeStatementStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export type IncomeStatementCategory = 
  | 'revenue'
  | 'cost_of_goods_sold'
  | 'operating_expense'
  | 'other_income'
  | 'other_expense'
  | 'tax';

export type InsightType = 
  | 'profitability_warning'
  | 'expense_alert'
  | 'revenue_growth'
  | 'margin_compression'
  | 'cost_overrun'
  | 'efficiency_opportunity';

// API Request/Response Types
export interface GenerateIncomeStatementData {
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  includeComparison?: boolean;
  includeBudget?: boolean;
  includeSegments?: boolean;
  currency?: string;
}

export interface UpdateIncomeStatementData {
  adjustments?: Array<{
    accountCode: string;
    amount: number;
    description: string;
  }>;
  notes?: string;
  status?: IncomeStatementStatus;
}

export interface IncomeStatementFilters {
  periodType?: PeriodType[];
  status?: IncomeStatementStatus[];
  fiscalYear?: number[];
  currency?: string[];
  dateFrom?: string;
  dateTo?: string;
  minRevenue?: number;
  minProfit?: number;
}

// Helper Functions
export function calculateGrossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

export function calculateGrossMargin(revenue: number, cogs: number): number {
  if (revenue === 0) return 0;
  return ((revenue - cogs) / revenue) * 100;
}

export function calculateOperatingIncome(
  grossProfit: number,
  operatingExpenses: number
): number {
  return grossProfit - operatingExpenses;
}

export function calculateOperatingMargin(
  operatingIncome: number,
  revenue: number
): number {
  if (revenue === 0) return 0;
  return (operatingIncome / revenue) * 100;
}

export function calculateNetIncome(
  incomeBeforeTax: number,
  incomeTax: number
): number {
  return incomeBeforeTax - incomeTax;
}

export function calculateNetMargin(netIncome: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (netIncome / revenue) * 100;
}

export function calculateEBITDA(
  operatingIncome: number,
  depreciation: number,
  amortization: number
): number {
  return operatingIncome + depreciation + amortization;
}

// Export Functions
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeDetails?: boolean;
  includeCharts?: boolean;
  includeComparisons?: boolean;
  includeBudget?: boolean;
}

export interface ExportResult {
  url: string;
  filename: string;
  size: number;
  generatedAt: string;
}

// Error Classes
export class IncomeStatementError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'IncomeStatementError';
  }
}

export class CalculationError extends IncomeStatementError {
  constructor(message: string, details?: any) {
    super(message, 'CALCULATION_ERROR', details);
  }
}

export class DataIntegrityError extends IncomeStatementError {
  constructor(message: string, details?: any) {
    super(message, 'DATA_INTEGRITY_ERROR', details);
  }
}