import { BaseRepository, MockRepository } from './base.repository';
import type {
  ReportDefinition,
  ReportExecution,
  FinancialDashboard,
  DashboardWidget,
  BalanceSheetData,
  ProfitLossData,
  CashFlowData,
  AgingReport,
  BudgetData,
  ForecastData,
  TrendAnalysis,
  FinancialRatios,
  BenchmarkAnalysis,
  KPIMetric,
  ChartConfig,
  ReportFilter,
  ReportType,
  ChartType,
  TimePeriod,
  ReportExportOptions,
  ReportSchedule,
  AnalyticsQuery,
  AnalyticsResult,
} from '@ria/reports-server';
import { 
  generateMockBalanceSheet, 
  generateMockProfitLoss, 
  generateMockCashFlow, 
  CHART_COLORS,
  formatCurrency,
  formatPercentage,
  calculateGrowthRate 
} from '@ria/reports-server';

export class ReportsRepository extends BaseRepository<ReportDefinition> {
  protected endpoint = '/reports';

  // Report definition operations
  async getReports(filters?: { type?: ReportType; isTemplate?: boolean }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    return this.request('GET', `?${params}`);
  }

  async createReport(data: Omit<ReportDefinition, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    return this.request('POST', '', data);
  }

  async updateReport(id: string, data: Partial<ReportDefinition>) {
    return this.request('PUT', `/${id}`, data);
  }

  async deleteReport(id: string) {
    return this.request('DELETE', `/${id}`);
  }

  async duplicateReport(id: string) {
    return this.request('POST', `/${id}/duplicate`);
  }

  // Report execution
  async executeReport(reportId: string, parameters?: ReportFilter): Promise<{ data: ReportExecution }> {
    return this.request('POST', `/${reportId}/execute`, { parameters });
  }

  async getReportExecution(executionId: string): Promise<{ data: ReportExecution }> {
    return this.request('GET', `/executions/${executionId}`);
  }

  async cancelReportExecution(executionId: string) {
    return this.request('POST', `/executions/${executionId}/cancel`);
  }

  // Financial reports
  async getBalanceSheet(filters?: ReportFilter): Promise<{ data: BalanceSheetData }> {
    return this.request('GET', '/financial/balance-sheet', filters);
  }

  async getProfitLoss(filters?: ReportFilter): Promise<{ data: ProfitLossData }> {
    return this.request('GET', '/financial/profit-loss', filters);
  }

  async getCashFlow(filters?: ReportFilter): Promise<{ data: CashFlowData }> {
    return this.request('GET', '/financial/cash-flow', filters);
  }

  async getAgingReport(type: 'receivables' | 'payables', filters?: ReportFilter): Promise<{ data: AgingReport }> {
    return this.request('GET', `/financial/aging/${type}`, filters);
  }

  // Analytics
  async executeAnalyticsQuery(query: AnalyticsQuery): Promise<{ data: AnalyticsResult }> {
    return this.request('POST', '/analytics/query', query);
  }

  async getTrendAnalysis(metric: string, period: TimePeriod, filters?: ReportFilter): Promise<{ data: TrendAnalysis }> {
    return this.request('GET', `/analytics/trends/${metric}`, { period, ...filters });
  }

  async getFinancialRatios(asOfDate: string): Promise<{ data: FinancialRatios }> {
    return this.request('GET', '/analytics/ratios', { asOfDate });
  }

  async getBenchmarkAnalysis(metric: string, filters?: ReportFilter): Promise<{ data: BenchmarkAnalysis }> {
    return this.request('GET', `/analytics/benchmarks/${metric}`, filters);
  }

  // Dashboards
  async getDashboards(): Promise<{ data: FinancialDashboard[] }> {
    return this.request('GET', '/dashboards');
  }

  async getDashboard(id: string): Promise<{ data: FinancialDashboard }> {
    return this.request('GET', `/dashboards/${id}`);
  }

  async createDashboard(data: Omit<FinancialDashboard, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    return this.request('POST', '/dashboards', data);
  }

  async updateDashboard(id: string, data: Partial<FinancialDashboard>) {
    return this.request('PUT', `/dashboards/${id}`, data);
  }

  async deleteDashboard(id: string) {
    return this.request('DELETE', `/dashboards/${id}`);
  }

  async updateDashboardWidget(dashboardId: string, widgetId: string, widget: DashboardWidget) {
    return this.request('PUT', `/dashboards/${dashboardId}/widgets/${widgetId}`, widget);
  }

  // Budget and forecast
  async getBudgets(): Promise<{ data: BudgetData[] }> {
    return this.request('GET', '/budgets');
  }

  async getBudget(id: string): Promise<{ data: BudgetData }> {
    return this.request('GET', `/budgets/${id}`);
  }

  async createBudget(data: Omit<BudgetData, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    return this.request('POST', '/budgets', data);
  }

  async getForecast(id: string): Promise<{ data: ForecastData }> {
    return this.request('GET', `/forecasts/${id}`);
  }

  async generateForecast(type: 'revenue' | 'expense' | 'cashflow', parameters: any): Promise<{ data: ForecastData }> {
    return this.request('POST', '/forecasts/generate', { type, ...parameters });
  }

  // Export
  async exportReport(reportId: string, options: ReportExportOptions) {
    return this.request('POST', `/${reportId}/export`, options, {}, 'blob');
  }

  // Scheduling
  async getReportSchedules(): Promise<{ data: ReportSchedule[] }> {
    return this.request('GET', '/schedules');
  }

  async createReportSchedule(data: Omit<ReportSchedule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    return this.request('POST', '/schedules', data);
  }

  async updateReportSchedule(id: string, data: Partial<ReportSchedule>) {
    return this.request('PUT', `/schedules/${id}`, data);
  }

  async deleteReportSchedule(id: string) {
    return this.request('DELETE', `/schedules/${id}`);
  }
}

export class MockReportsRepository extends MockRepository<ReportDefinition> {
  protected storageKey = 'ria_reports';
  protected endpoint = '/reports';

  // Generate mock KPI metrics
  private generateMockKPIs(): KPIMetric[] {
    return [
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: 875000,
        format: 'currency',
        currency: 'USD',
        change: {
          value: 125000,
          percentage: 16.7,
          direction: 'up',
          period: 'vs last quarter'
        },
        status: 'good',
        description: 'Quarterly revenue performance'
      },
      {
        id: 'gross_profit_margin',
        name: 'Gross Profit Margin',
        value: 48.5,
        format: 'percentage',
        change: {
          value: 3.2,
          percentage: 7.1,
          direction: 'up',
          period: 'vs last quarter'
        },
        target: 50,
        status: 'warning',
        description: 'Gross profit as percentage of revenue'
      },
      {
        id: 'net_profit_margin',
        name: 'Net Profit Margin',
        value: 12.8,
        format: 'percentage',
        change: {
          value: 1.5,
          percentage: 13.3,
          direction: 'up',
          period: 'vs last quarter'
        },
        target: 15,
        status: 'warning',
        description: 'Net profit as percentage of revenue'
      },
      {
        id: 'current_ratio',
        name: 'Current Ratio',
        value: 1.875,
        format: 'ratio',
        change: {
          value: 0.125,
          percentage: 7.1,
          direction: 'up',
          period: 'vs last quarter'
        },
        target: 2.0,
        status: 'warning',
        description: 'Current assets to current liabilities ratio'
      },
      {
        id: 'cash_balance',
        name: 'Cash Balance',
        value: 185000,
        format: 'currency',
        currency: 'USD',
        change: {
          value: -15000,
          percentage: -7.5,
          direction: 'down',
          period: 'vs last month'
        },
        status: 'warning',
        description: 'Total cash and cash equivalents'
      },
      {
        id: 'accounts_receivable',
        name: 'Accounts Receivable',
        value: 92000,
        format: 'currency',
        currency: 'USD',
        change: {
          value: 8500,
          percentage: 10.2,
          direction: 'up',
          period: 'vs last month'
        },
        status: 'neutral',
        description: 'Outstanding customer invoices'
      }
    ];
  }

  // Generate mock chart data
  private generateRevenueChart(): ChartConfig {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentYear = [280000, 295000, 310000, 285000, 325000, 340000];
    const previousYear = [245000, 260000, 275000, 255000, 290000, 305000];

    return {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: '2024',
            data: currentYear,
            borderColor: CHART_COLORS.primary[0],
            backgroundColor: CHART_COLORS.primary[0] + '20',
            fill: true,
            tension: 0.4
          },
          {
            label: '2023',
            data: previousYear,
            borderColor: CHART_COLORS.primary[1],
            backgroundColor: CHART_COLORS.primary[1] + '20',
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Month' }
          },
          y: {
            display: true,
            title: { display: true, text: 'Revenue' },
            beginAtZero: true
          }
        }
      }
    };
  }

  private generateExpenseBreakdownChart(): ChartConfig {
    const categories = ['Salaries', 'Rent', 'Marketing', 'Software', 'Utilities', 'Other'];
    const amounts = [125000, 45000, 35000, 25000, 15000, 30000];
    
    return {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: CHART_COLORS.primary.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                const total = amounts.reduce((sum, val) => sum + val, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  private generateCashFlowChart(): ChartConfig {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const operating = [85000, 92000, 78000, 95000, 88000, 105000];
    const investing = [-25000, -15000, -45000, -12000, -35000, -20000];
    const financing = [-15000, -8000, -5000, -18000, -10000, -12000];
    
    return {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Operating',
            data: operating,
            backgroundColor: CHART_COLORS.green[3],
            borderColor: CHART_COLORS.green[4],
            borderWidth: 1
          },
          {
            label: 'Investing',
            data: investing,
            backgroundColor: CHART_COLORS.blue[3],
            borderColor: CHART_COLORS.blue[4],
            borderWidth: 1
          },
          {
            label: 'Financing',
            data: financing,
            backgroundColor: CHART_COLORS.red[3],
            borderColor: CHART_COLORS.red[4],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Month' }
          },
          y: {
            display: true,
            title: { display: true, text: 'Cash Flow' },
            beginAtZero: true
          }
        }
      }
    };
  }

  // Generate mock dashboards
  private generateMockDashboards(): FinancialDashboard[] {
    const kpis = this.generateMockKPIs();
    
    return [
      {
        id: 'executive_dashboard',
        tenantId: 'tenant_1',
        name: 'Executive Dashboard',
        description: 'High-level financial overview for executives',
        type: 'executive',
        isDefault: true,
        
        widgets: [
          // KPI widgets
          {
            id: 'revenue_kpi',
            type: 'kpi',
            title: 'Total Revenue',
            size: 'small',
            position: { x: 0, y: 0, w: 3, h: 2 },
            kpi: kpis.find(k => k.id === 'total_revenue')!,
            refreshInterval: 3600
          },
          {
            id: 'profit_margin_kpi',
            type: 'kpi',
            title: 'Gross Profit Margin',
            size: 'small',
            position: { x: 3, y: 0, w: 3, h: 2 },
            kpi: kpis.find(k => k.id === 'gross_profit_margin')!,
            refreshInterval: 3600
          },
          {
            id: 'net_margin_kpi',
            type: 'kpi',
            title: 'Net Profit Margin',
            size: 'small',
            position: { x: 6, y: 0, w: 3, h: 2 },
            kpi: kpis.find(k => k.id === 'net_profit_margin')!,
            refreshInterval: 3600
          },
          {
            id: 'current_ratio_kpi',
            type: 'kpi',
            title: 'Current Ratio',
            size: 'small',
            position: { x: 9, y: 0, w: 3, h: 2 },
            kpi: kpis.find(k => k.id === 'current_ratio')!,
            refreshInterval: 3600
          },
          
          // Chart widgets
          {
            id: 'revenue_trend',
            type: 'chart',
            title: 'Revenue Trend',
            size: 'large',
            position: { x: 0, y: 2, w: 6, h: 4 },
            chart: this.generateRevenueChart(),
            refreshInterval: 1800
          },
          {
            id: 'expense_breakdown',
            type: 'chart',
            title: 'Expense Breakdown',
            size: 'medium',
            position: { x: 6, y: 2, w: 6, h: 4 },
            chart: this.generateExpenseBreakdownChart(),
            refreshInterval: 3600
          },
          {
            id: 'cash_flow',
            type: 'chart',
            title: 'Cash Flow Analysis',
            size: 'full',
            position: { x: 0, y: 6, w: 12, h: 4 },
            chart: this.generateCashFlowChart(),
            refreshInterval: 3600
          }
        ],
        
        layout: {
          columns: 12,
          rowHeight: 60,
          margin: [10, 10],
          padding: [20, 20]
        },
        
        filters: {
          dateRange: {
            from: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        },
        
        refreshInterval: 1800,
        
        permissions: {
          canView: ['executive', 'finance'],
          canEdit: ['admin'],
          isPublic: false
        },
        
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'operational_dashboard',
        tenantId: 'tenant_1',
        name: 'Operational Dashboard',
        description: 'Detailed operational metrics and trends',
        type: 'operational',
        isDefault: false,
        
        widgets: [
          {
            id: 'cash_kpi',
            type: 'kpi',
            title: 'Cash Balance',
            size: 'small',
            position: { x: 0, y: 0, w: 4, h: 2 },
            kpi: kpis.find(k => k.id === 'cash_balance')!,
            refreshInterval: 3600
          },
          {
            id: 'ar_kpi',
            type: 'kpi',
            title: 'Accounts Receivable',
            size: 'small',
            position: { x: 4, y: 0, w: 4, h: 2 },
            kpi: kpis.find(k => k.id === 'accounts_receivable')!,
            refreshInterval: 3600
          },
          {
            id: 'summary_widget',
            type: 'summary',
            title: 'Financial Summary',
            size: 'medium',
            position: { x: 8, y: 0, w: 4, h: 4 },
            summary: {
              items: [
                { label: 'Total Assets', value: 975000, format: 'currency' },
                { label: 'Total Liabilities', value: 525000, format: 'currency' },
                { label: 'Shareholders Equity', value: 450000, format: 'currency' },
                { label: 'Working Capital', value: 140000, format: 'currency' }
              ]
            },
            refreshInterval: 3600
          }
        ],
        
        layout: {
          columns: 12,
          rowHeight: 60,
          margin: [10, 10],
          padding: [20, 20]
        },
        
        filters: {
          dateRange: {
            from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        },
        
        refreshInterval: 900,
        
        permissions: {
          canView: ['finance', 'accounting'],
          canEdit: ['finance_manager'],
          isPublic: false
        },
        
        createdBy: 'finance_manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Override base methods
  async getReports() {
    return {
      data: [
        {
          id: 'balance_sheet_template',
          tenantId: 'tenant_1',
          name: 'Balance Sheet',
          description: 'Standard balance sheet report',
          type: 'balance_sheet' as ReportType,
          dataSource: { tables: ['accounts', 'transactions'] },
          columns: [],
          filters: {},
          formatting: {
            currencyCode: 'USD',
            dateFormat: 'MM/DD/YYYY',
            numberFormat: '#,##0.00',
            showGridLines: true,
            alternateRowColors: true
          },
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTemplate: true,
          isPublic: true
        }
      ]
    };
  }

  async getBalanceSheet(filters?: ReportFilter): Promise<{ data: BalanceSheetData }> {
    const asOfDate = filters?.dateRange?.to || new Date().toISOString().split('T')[0];
    return { data: generateMockBalanceSheet(asOfDate) };
  }

  async getProfitLoss(filters?: ReportFilter): Promise<{ data: ProfitLossData }> {
    const endDate = filters?.dateRange?.to || new Date().toISOString().split('T')[0];
    const startDate = filters?.dateRange?.from || 
      new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0];
    
    return { data: generateMockProfitLoss(startDate, endDate) };
  }

  async getCashFlow(filters?: ReportFilter): Promise<{ data: CashFlowData }> {
    const endDate = filters?.dateRange?.to || new Date().toISOString().split('T')[0];
    const startDate = filters?.dateRange?.from || 
      new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0];
    
    return { data: generateMockCashFlow(startDate, endDate) };
  }

  async getAgingReport(type: 'receivables' | 'payables', filters?: ReportFilter): Promise<{ data: AgingReport }> {
    const asOfDate = filters?.dateRange?.to || new Date().toISOString().split('T')[0];
    
    // Generate mock aging data
    const mockDetails = Array.from({ length: 15 }, (_, i) => {
      const daysOverdue = Math.floor(Math.random() * 120);
      const amount = Math.round((Math.random() * 5000 + 500) * 100) / 100;
      
      return {
        id: `${type}_${i + 1}`,
        name: type === 'receivables' ? `Customer ${i + 1}` : `Vendor ${i + 1}`,
        type: type === 'receivables' ? 'invoice' : 'bill',
        invoiceNumber: type === 'receivables' ? `INV-2024-${(i + 1).toString().padStart(4, '0')}` : undefined,
        billNumber: type === 'payables' ? `BILL-2024-${(i + 1).toString().padStart(4, '0')}` : undefined,
        date: new Date(Date.now() - (daysOverdue + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount,
        daysOverdue,
        agingBucket: daysOverdue === 0 ? 'current' :
                     daysOverdue <= 30 ? '1-30' :
                     daysOverdue <= 60 ? '31-60' :
                     daysOverdue <= 90 ? '61-90' : '90+' as any,
        status: daysOverdue > 60 ? 'overdue' : 'current'
      };
    });
    
    const summary = mockDetails.reduce((acc, item) => {
      switch (item.agingBucket) {
        case 'current': acc.current += item.amount; break;
        case '1-30': acc.thirtyDays += item.amount; break;
        case '31-60': acc.sixtyDays += item.amount; break;
        case '61-90': acc.ninetyDays += item.amount; break;
        case '90+': acc.overNinetyDays += item.amount; break;
      }
      acc.total += item.amount;
      return acc;
    }, { current: 0, thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, overNinetyDays: 0, total: 0 });
    
    return {
      data: {
        type,
        asOfDate,
        currency: 'USD',
        summary,
        details: mockDetails
      }
    };
  }

  async getDashboards(): Promise<{ data: FinancialDashboard[] }> {
    return { data: this.generateMockDashboards() };
  }

  async getDashboard(id: string): Promise<{ data: FinancialDashboard }> {
    const dashboards = this.generateMockDashboards();
    const dashboard = dashboards.find(d => d.id === id);
    
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    
    // Update last viewed time
    dashboard.lastViewedAt = new Date().toISOString();
    
    return { data: dashboard };
  }

  async getFinancialRatios(asOfDate: string): Promise<{ data: FinancialRatios }> {
    // Generate mock financial ratios
    return {
      data: {
        asOfDate,
        liquidity: {
          currentRatio: 1.875,
          quickRatio: 1.45,
          cashRatio: 0.92,
          workingCapital: 140000
        },
        profitability: {
          grossProfitMargin: 48.5,
          operatingProfitMargin: 18.2,
          netProfitMargin: 12.8,
          returnOnAssets: 8.5,
          returnOnEquity: 16.7,
          returnOnInvestment: 12.3
        },
        leverage: {
          debtToEquity: 1.17,
          debtToAssets: 0.54,
          interestCoverageRatio: 8.5,
          debtServiceCoverage: 2.1
        },
        efficiency: {
          assetTurnover: 0.87,
          inventoryTurnover: 12.5,
          receivablesTurnover: 8.2,
          payablesTurnover: 6.8,
          daysInInventory: 29,
          daysInReceivables: 45,
          daysInPayables: 54,
          cashCycle: 20
        },
        growth: {
          revenueGrowth: 16.7,
          profitGrowth: 22.3,
          assetGrowth: 8.9,
          equityGrowth: 12.5
        }
      }
    };
  }

  async getTrendAnalysis(metric: string, period: TimePeriod): Promise<{ data: TrendAnalysis }> {
    // Generate mock trend data
    const months = 12;
    const data = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      
      const baseValue = 100000;
      const trend = 0.05; // 5% growth trend
      const seasonality = Math.sin((i / 12) * 2 * Math.PI) * 10000;
      const noise = (Math.random() - 0.5) * 5000;
      
      const value = baseValue + (baseValue * trend * i / 12) + seasonality + noise;
      const previousValue = i > 0 ? data[i - 1].value : value * 0.95;
      
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        change: Math.round(value - previousValue),
        changePercentage: Math.round(((value - previousValue) / previousValue) * 10000) / 100
      };
    });
    
    return {
      data: {
        metric,
        period: { year: new Date().getFullYear() },
        data,
        trend: {
          direction: 'up',
          strength: 'moderate',
          seasonality: true,
          growthRate: 5.2,
          volatility: 12.5
        },
        insights: [
          'Revenue shows consistent upward trend over the past 12 months',
          'Seasonal patterns indicate stronger performance in Q4',
          'Growth rate has accelerated in recent quarters'
        ],
        recommendations: [
          'Consider increasing marketing spend during peak seasons',
          'Prepare for potential seasonal dips in Q1',
          'Maintain current growth trajectory with strategic investments'
        ]
      }
    };
  }
}

// Lazy initialization
let _reportsRepository: MockReportsRepository | null = null;

export const reportsRepository = {
  get instance(): MockReportsRepository {
    if (!_reportsRepository) {
      _reportsRepository = new MockReportsRepository();
    }
    return _reportsRepository;
  }
};