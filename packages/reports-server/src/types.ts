// -------------------- Core Types --------------------

export type ReportType = 'balance_sheet' | 'profit_loss' | 'cash_flow' | 'trial_balance' | 'aging_receivables' | 'aging_payables' | 'expense_report' | 'custom';
export type ReportFormat = 'table' | 'chart' | 'dashboard' | 'export';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'column' | 'donut' | 'gauge' | 'scatter';
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ComparisonType = 'none' | 'previous_period' | 'previous_year' | 'budget' | 'forecast';

export interface DateRange {
  from: string;
  to: string;
  period?: TimePoint;
}

export interface TimePoint {
  year: number;
  quarter?: number;
  month?: number;
  week?: number;
  day?: number;
}

export interface ReportFilter {
  accounts?: string[];
  categories?: string[];
  departments?: string[];
  projects?: string[];
  clients?: string[];
  employees?: string[];
  vendors?: string[];
  locations?: string[];
  tags?: string[];
  amountRange?: { min?: number; max?: number };
  dateRange?: DateRange;
  status?: string[];
  customFields?: Record<string, any>;
}

// -------------------- Financial Reports --------------------

export interface BalanceSheetData {
  asOfDate: string;
  currency: string;
  
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      otherCurrentAssets: number;
      total: number;
    };
    nonCurrentAssets: {
      propertyPlantEquipment: number;
      intangibleAssets: number;
      investments: number;
      otherAssets: number;
      total: number;
    };
    totalAssets: number;
  };
  
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      accruedExpenses: number;
      shortTermDebt: number;
      otherCurrentLiabilities: number;
      total: number;
    };
    nonCurrentLiabilities: {
      longTermDebt: number;
      deferredTax: number;
      otherLiabilities: number;
      total: number;
    };
    totalLiabilities: number;
  };
  
  equity: {
    retainedEarnings: number;
    currentYearEarnings: number;
    paidInCapital: number;
    otherEquity: number;
    totalEquity: number;
  };
  
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface ProfitLossData {
  periodStart: string;
  periodEnd: string;
  currency: string;
  
  revenue: {
    operatingRevenue: number;
    otherRevenue: number;
    totalRevenue: number;
  };
  
  costOfGoodsSold: {
    directCosts: number;
    laborCosts: number;
    materialCosts: number;
    totalCOGS: number;
  };
  
  grossProfit: number;
  grossProfitMargin: number;
  
  operatingExpenses: {
    salesExpenses: number;
    administrativeExpenses: number;
    generalExpenses: number;
    depreciation: number;
    totalOperatingExpenses: number;
  };
  
  operatingIncome: number;
  operatingMargin: number;
  
  otherIncomeExpenses: {
    interestIncome: number;
    interestExpense: number;
    otherIncome: number;
    otherExpenses: number;
    total: number;
  };
  
  netIncomeBeforeTax: number;
  taxExpense: number;
  netIncome: number;
  netProfitMargin: number;
  
  // Additional metrics
  ebitda: number;
  ebit: number;
}

export interface CashFlowData {
  periodStart: string;
  periodEnd: string;
  currency: string;
  
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    accountsReceivableChange: number;
    inventoryChange: number;
    accountsPayableChange: number;
    otherWorkingCapitalChanges: number;
    totalOperatingCashFlow: number;
  };
  
  investingActivities: {
    capitalExpenditures: number;
    investments: number;
    assetSales: number;
    otherInvestingActivities: number;
    totalInvestingCashFlow: number;
  };
  
  financingActivities: {
    debtChanges: number;
    equityChanges: number;
    dividendsPaid: number;
    otherFinancingActivities: number;
    totalFinancingCashFlow: number;
  };
  
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  cashFlowFromOperationsRatio: number;
}

export interface AgingReport {
  type: 'receivables' | 'payables';
  asOfDate: string;
  currency: string;
  
  summary: {
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    overNinetyDays: number;
    total: number;
  };
  
  details: Array<{
    id: string;
    name: string;
    type: string;
    invoiceNumber?: string;
    billNumber?: string;
    date: string;
    dueDate: string;
    amount: number;
    daysOverdue: number;
    agingBucket: 'current' | '1-30' | '31-60' | '61-90' | '90+';
    status: string;
  }>;
  
  byCustomer?: Array<{
    customerId: string;
    customerName: string;
    total: number;
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    overNinetyDays: number;
  }>;
}

// -------------------- Chart and Visualization Types --------------------

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: {
    responsive: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      tooltip?: {
        enabled: boolean;
        callbacks?: Record<string, any>;
      };
      title?: {
        display: boolean;
        text?: string;
      };
    };
    scales?: {
      x?: {
        display: boolean;
        title?: { display: boolean; text: string };
        grid?: { display: boolean };
      };
      y?: {
        display: boolean;
        title?: { display: boolean; text: string };
        grid?: { display: boolean };
        beginAtZero?: boolean;
      };
    };
  };
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
  currency?: string;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  target?: number;
  status: 'good' | 'warning' | 'danger' | 'neutral';
  description?: string;
}

// -------------------- Dashboard Types --------------------

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'summary';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; w: number; h: number };
  
  // Widget-specific data
  kpi?: KPIMetric;
  chart?: ChartConfig;
  table?: {
    columns: Array<{
      key: string;
      title: string;
      format?: string;
      width?: number;
    }>;
    data: Array<Record<string, any>>;
    pagination?: boolean;
  };
  summary?: {
    items: Array<{
      label: string;
      value: string | number;
      format?: string;
    }>;
  };
  
  refreshInterval?: number; // in seconds
  lastUpdated?: string;
}

export interface FinancialDashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'executive' | 'operational' | 'custom';
  isDefault: boolean;
  
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rowHeight: number;
    margin: [number, number];
    padding: [number, number];
  };
  
  filters: ReportFilter;
  refreshInterval: number;
  
  permissions: {
    canView: string[];
    canEdit: string[];
    isPublic: boolean;
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

// -------------------- Report Builder Types --------------------

export interface ReportDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ReportType;
  
  dataSource: {
    tables: string[];
    joins?: Array<{
      table: string;
      joinType: 'inner' | 'left' | 'right' | 'full';
      on: string;
    }>;
  };
  
  columns: Array<{
    id: string;
    field: string;
    alias?: string;
    title: string;
    dataType: 'string' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean';
    format?: string;
    aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'group';
    calculation?: string; // Custom calculation formula
    width?: number;
    sortable: boolean;
    filterable: boolean;
    visible: boolean;
  }>;
  
  filters: ReportFilter;
  
  groupBy?: string[];
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  
  formatting: {
    currencyCode: string;
    dateFormat: string;
    numberFormat: string;
    showGridLines: boolean;
    alternateRowColors: boolean;
  };
  
  visualization?: {
    enableCharts: boolean;
    defaultChart?: ChartType;
    chartOptions?: any;
  };
  
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  isPublic: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  tenantId: string;
  
  parameters: ReportFilter;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  result?: {
    data: Array<Record<string, any>>;
    summary: {
      totalRows: number;
      totalPages: number;
      executionTime: number;
      generatedAt: string;
    };
    charts?: ChartConfig[];
    errors?: string[];
  };
  
  format: 'json' | 'csv' | 'excel' | 'pdf';
  downloadUrl?: string;
  
  executedBy: string;
  executedAt: string;
  completedAt?: string;
  expiresAt: string;
}

// -------------------- Budget and Forecast Types --------------------

export interface BudgetData {
  id: string;
  tenantId: string;
  name: string;
  fiscalYear: number;
  currency: string;
  status: 'draft' | 'active' | 'locked' | 'archived';
  
  categories: Array<{
    categoryId: string;
    categoryName: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    monthlyBudgets: Array<{
      month: number;
      budgeted: number;
      actual: number;
      forecast: number;
    }>;
  }>;
  
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  utilizationRate: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ForecastData {
  id: string;
  tenantId: string;
  name: string;
  type: 'revenue' | 'expense' | 'cashflow';
  method: 'linear' | 'seasonal' | 'moving_average' | 'exponential_smoothing';
  
  historicalPeriods: number;
  forecastPeriods: number;
  confidence: number;
  
  historical: Array<{
    period: string;
    actual: number;
  }>;
  
  forecast: Array<{
    period: string;
    predicted: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  
  accuracy?: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    r2: number;   // R-squared
  };
  
  createdAt: string;
  updatedAt: string;
}

// -------------------- Analysis Types --------------------

export interface TrendAnalysis {
  metric: string;
  period: TimePoint;
  data: Array<{
    date: string;
    value: number;
    change: number;
    changePercentage: number;
  }>;
  
  trend: {
    direction: 'up' | 'down' | 'flat';
    strength: 'strong' | 'moderate' | 'weak';
    seasonality: boolean;
    growthRate: number;
    volatility: number;
  };
  
  insights: string[];
  recommendations: string[];
}

export interface FinancialRatios {
  asOfDate: string;
  
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    workingCapital: number;
  };
  
  profitability: {
    grossProfitMargin: number;
    operatingProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
    returnOnInvestment: number;
  };
  
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverageRatio: number;
    debtServiceCoverage: number;
  };
  
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
    payablesTurnover: number;
    daysInInventory: number;
    daysInReceivables: number;
    daysInPayables: number;
    cashCycle: number;
  };
  
  growth: {
    revenueGrowth: number;
    profitGrowth: number;
    assetGrowth: number;
    equityGrowth: number;
  };
}

export interface BenchmarkAnalysis {
  metric: string;
  value: number;
  
  benchmarks: {
    industry: {
      value: number;
      percentile: number;
      source: string;
    };
    peers: {
      median: number;
      average: number;
      min: number;
      max: number;
      sampleSize: number;
    };
    historical: {
      oneYear: number;
      twoYears: number;
      threeYears: number;
    };
  };
  
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  insights: string[];
  recommendations: string[];
}

// -------------------- Export and API Types --------------------

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeFilters: boolean;
  template?: string;
  customization?: {
    logo?: string;
    header?: string;
    footer?: string;
    watermark?: string;
  };
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  tenantId: string;
  
  name: string;
  enabled: boolean;
  
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  schedule: {
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6, for weekly
    dayOfMonth?: number; // 1-31, for monthly
    month?: number; // 1-12, for yearly
  };
  
  recipients: Array<{
    email: string;
    name?: string;
    role?: string;
  }>;
  
  format: 'pdf' | 'excel' | 'csv';
  filters: ReportFilter;
  
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsQuery {
  dimensions: string[];
  metrics: string[];
  filters: ReportFilter;
  dateRange: DateRange;
  granularity: TimePoint;
  limit?: number;
  offset?: number;
}

export interface AnalyticsResult {
  query: AnalyticsQuery;
  data: Array<Record<string, any>>;
  summary: {
    totalRows: number;
    executionTime: number;
    fromCache: boolean;
  };
  metadata: {
    columns: Array<{
      name: string;
      type: string;
      format?: string;
    }>;
    aggregations: Record<string, any>;
  };
}