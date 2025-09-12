// Re-export all types
export * from './types';

// Export utility functions and constants
export const REPORT_TYPES: Record<string, string> = {
  balance_sheet: 'Balance Sheet',
  profit_loss: 'Profit & Loss',
  cash_flow: 'Cash Flow Statement',
  trial_balance: 'Trial Balance',
  aging_receivables: 'Accounts Receivable Aging',
  aging_payables: 'Accounts Payable Aging',
  expense_report: 'Expense Report',
  custom: 'Custom Report',
};

export const CHART_TYPES: Record<string, string> = {
  line: 'Line Chart',
  bar: 'Bar Chart',
  pie: 'Pie Chart',
  area: 'Area Chart',
  column: 'Column Chart',
  donut: 'Donut Chart',
  gauge: 'Gauge Chart',
  scatter: 'Scatter Plot',
};

export const TIME_PERIODS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom Range',
};

export const COMPARISON_TYPES: Record<string, string> = {
  none: 'No Comparison',
  previous_period: 'Previous Period',
  previous_year: 'Previous Year',
  budget: 'Budget',
  forecast: 'Forecast',
};

// Chart color schemes
export const CHART_COLORS = {
  primary: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ],
  blue: [
    '#1E3A8A', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD',
    '#BFDBFE', '#DBEAFE', '#EFF6FF'
  ],
  green: [
    '#14532D', '#166534', '#15803D', '#16A34A', '#22C55E',
    '#4ADE80', '#86EFAC', '#BBF7D0'
  ],
  red: [
    '#7F1D1D', '#991B1B', '#DC2626', '#EF4444', '#F87171',
    '#FCA5A5', '#FECACA', '#FEE2E2'
  ]
};

// Helper functions
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'numeric' = 'short',
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { year: '2-digit', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };
  
  return new Intl.DateTimeFormat(locale, options[format]).format(d);
}

export function calculateVariance(actual: number, budget: number): {
  variance: number;
  variancePercentage: number;
  favorability: 'favorable' | 'unfavorable' | 'neutral';
} {
  const variance = actual - budget;
  const variancePercentage = budget !== 0 ? (variance / Math.abs(budget)) * 100 : 0;
  
  let favorability: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
  if (Math.abs(variancePercentage) > 5) {
    favorability = variance > 0 ? 'favorable' : 'unfavorable';
  }
  
  return {
    variance: Math.round(variance * 100) / 100,
    variancePercentage: Math.round(variancePercentage * 100) / 100,
    favorability
  };
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 10000) / 100;
}

export function calculateRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

export function getKPIStatus(
  value: number,
  target?: number,
  thresholds?: { good: number; warning: number }
): 'good' | 'warning' | 'danger' | 'neutral' {
  if (!target && !thresholds) return 'neutral';
  
  if (thresholds) {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'danger';
  }
  
  if (target) {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'good';
    if (percentage >= 80) return 'warning';
    return 'danger';
  }
  
  return 'neutral';
}

export function getTrendDirection(data: number[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';
  
  const first = data[0];
  const last = data[data.length - 1];
  const threshold = Math.abs(first) * 0.05; // 5% threshold
  
  if (Math.abs(last - first) <= threshold) return 'flat';
  return last > first ? 'up' : 'down';
}

export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  
  return result;
}

export function generateDateRange(
  startDate: string,
  endDate: string,
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year'
): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];
  
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    
    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarter':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'year':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }
  
  return dates;
}

export function getFiscalYear(date: string | Date, fiscalYearStart: number = 1): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  
  return month >= fiscalYearStart ? year : year - 1;
}

export function getFiscalQuarter(date: string | Date, fiscalYearStart: number = 1): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1;
  const adjustedMonth = ((month - fiscalYearStart + 12) % 12) + 1;
  
  return Math.ceil(adjustedMonth / 3);
}

export function createChartConfig(
  type: string,
  data: any,
  options: any = {}
): any {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    }
  };
  
  return {
    type,
    data,
    options: { ...defaultOptions, ...options }
  };
}

export function aggregateData(
  data: Array<Record<string, any>>,
  groupBy: string,
  aggregations: Record<string, 'sum' | 'avg' | 'count' | 'min' | 'max'>
): Array<Record<string, any>> {
  const grouped = data.reduce((acc, item) => {
    const key = item[groupBy];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  return Object.entries(grouped).map(([key, items]) => {
    const result: Record<string, any> = { [groupBy]: key };
    
    Object.entries(aggregations).forEach(([field, operation]) => {
      const values = items.map(item => Number(item[field]) || 0);
      
      switch (operation) {
        case 'sum':
          result[field] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          result[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'count':
          result[field] = values.length;
          break;
        case 'min':
          result[field] = Math.min(...values);
          break;
        case 'max':
          result[field] = Math.max(...values);
          break;
      }
    });
    
    return result;
  });
}

// Mock data generators
export function generateMockBalanceSheet(asOfDate: string): any {
  return {
    asOfDate,
    currency: 'USD',
    assets: {
      currentAssets: {
        cash: 150000,
        accountsReceivable: 85000,
        inventory: 45000,
        prepaidExpenses: 12000,
        otherCurrentAssets: 8000,
        total: 300000
      },
      nonCurrentAssets: {
        propertyPlantEquipment: 450000,
        intangibleAssets: 75000,
        investments: 125000,
        otherAssets: 25000,
        total: 675000
      },
      totalAssets: 975000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 65000,
        accruedExpenses: 35000,
        shortTermDebt: 45000,
        otherCurrentLiabilities: 15000,
        total: 160000
      },
      nonCurrentLiabilities: {
        longTermDebt: 325000,
        deferredTax: 25000,
        otherLiabilities: 15000,
        total: 365000
      },
      totalLiabilities: 525000
    },
    equity: {
      retainedEarnings: 350000,
      currentYearEarnings: 75000,
      paidInCapital: 25000,
      otherEquity: 0,
      totalEquity: 450000
    },
    totalLiabilitiesAndEquity: 975000,
    isBalanced: true
  };
}

export function generateMockProfitLoss(periodStart: string, periodEnd: string): any {
  const totalRevenue = 850000;
  const totalCOGS = 425000;
  const grossProfit = totalRevenue - totalCOGS;
  const operatingExpenses = 275000;
  const operatingIncome = grossProfit - operatingExpenses;
  const otherTotal = -15000;
  const netIncomeBeforeTax = operatingIncome + otherTotal;
  const taxExpense = 25000;
  const netIncome = netIncomeBeforeTax - taxExpense;
  
  return {
    periodStart,
    periodEnd,
    currency: 'USD',
    revenue: {
      operatingRevenue: 825000,
      otherRevenue: 25000,
      totalRevenue
    },
    costOfGoodsSold: {
      directCosts: 225000,
      laborCosts: 125000,
      materialCosts: 75000,
      totalCOGS
    },
    grossProfit,
    grossProfitMargin: (grossProfit / totalRevenue) * 100,
    operatingExpenses: {
      salesExpenses: 125000,
      administrativeExpenses: 85000,
      generalExpenses: 45000,
      depreciation: 20000,
      totalOperatingExpenses: operatingExpenses
    },
    operatingIncome,
    operatingMargin: (operatingIncome / totalRevenue) * 100,
    otherIncomeExpenses: {
      interestIncome: 5000,
      interestExpense: -18000,
      otherIncome: 2000,
      otherExpenses: -4000,
      total: otherTotal
    },
    netIncomeBeforeTax,
    taxExpense,
    netIncome,
    netProfitMargin: (netIncome / totalRevenue) * 100,
    ebitda: operatingIncome + 20000, // Add back depreciation
    ebit: operatingIncome
  };
}

export function generateMockCashFlow(periodStart: string, periodEnd: string): any {
  return {
    periodStart,
    periodEnd,
    currency: 'USD',
    operatingActivities: {
      netIncome: 75000,
      depreciation: 20000,
      accountsReceivableChange: -15000,
      inventoryChange: -8000,
      accountsPayableChange: 12000,
      otherWorkingCapitalChanges: 3000,
      totalOperatingCashFlow: 87000
    },
    investingActivities: {
      capitalExpenditures: -45000,
      investments: -25000,
      assetSales: 8000,
      otherInvestingActivities: 2000,
      totalInvestingCashFlow: -60000
    },
    financingActivities: {
      debtChanges: -15000,
      equityChanges: 0,
      dividendsPaid: -12000,
      otherFinancingActivities: 0,
      totalFinancingCashFlow: -27000
    },
    netCashFlow: 0,
    beginningCash: 150000,
    endingCash: 150000,
    cashFlowFromOperationsRatio: 1.16
  };
}