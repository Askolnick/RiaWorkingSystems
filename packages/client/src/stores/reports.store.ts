import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { reportsRepository } from '../repositories/reports.repository';
import type {
  BalanceSheetData,
  ProfitLossData,
  CashFlowData,
  AgingReport,
  FinancialDashboard,
  DashboardWidget,
  KPIMetric,
  ReportDefinition,
  ReportExecution,
  TrendAnalysis,
  FinancialRatios,
  ReportFilter,
  DateRange
} from '@ria/reports-server';

interface ReportsState {
  // Financial Reports
  balanceSheet: BalanceSheetData | null;
  profitLoss: ProfitLossData | null;
  cashFlow: CashFlowData | null;
  agingReceivables: AgingReport | null;
  agingPayables: AgingReport | null;
  
  // Dashboards
  dashboards: FinancialDashboard[];
  currentDashboard: FinancialDashboard | null;
  widgets: DashboardWidget[];
  
  // KPIs and Analytics
  kpis: KPIMetric[];
  trends: TrendAnalysis[];
  ratios: FinancialRatios | null;
  
  // Report Management
  reportDefinitions: ReportDefinition[];
  reportExecutions: ReportExecution[];
  
  // Filters and Settings
  currentFilters: ReportFilter;
  dateRange: DateRange;
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedReportType: string | null;
  selectedPeriod: string;
}

interface ReportsActions {
  // Financial Reports
  fetchBalanceSheet: (asOfDate: string) => Promise<void>;
  fetchProfitLoss: (periodStart: string, periodEnd: string) => Promise<void>;
  fetchCashFlow: (periodStart: string, periodEnd: string) => Promise<void>;
  fetchAgingReport: (type: 'receivables' | 'payables', asOfDate: string) => Promise<void>;
  
  // Dashboard Management
  fetchDashboards: () => Promise<void>;
  createDashboard: (dashboard: Omit<FinancialDashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDashboard: (id: string, updates: Partial<FinancialDashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  setCurrentDashboard: (dashboard: FinancialDashboard | null) => void;
  
  // Widget Management
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => Promise<void>;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => Promise<void>;
  removeWidget: (id: string) => Promise<void>;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  
  // KPIs and Analytics
  fetchKPIs: (period?: string) => Promise<void>;
  fetchTrends: (metrics: string[], period: string) => Promise<void>;
  fetchFinancialRatios: (asOfDate: string) => Promise<void>;
  
  // Report Builder
  fetchReportDefinitions: () => Promise<void>;
  createReport: (definition: Omit<ReportDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  executeReport: (reportId: string, parameters?: ReportFilter) => Promise<void>;
  fetchReportExecutions: (reportId?: string) => Promise<void>;
  
  // Filters and Utilities
  setFilters: (filters: Partial<ReportFilter>) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedReportType: (type: string | null) => void;
  setSelectedPeriod: (period: string) => void;
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

type ReportsStore = ReportsState & ReportsActions;

export const useReportsStore = create<ReportsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      balanceSheet: null,
      profitLoss: null,
      cashFlow: null,
      agingReceivables: null,
      agingPayables: null,
      dashboards: [],
      currentDashboard: null,
      widgets: [],
      kpis: [],
      trends: [],
      ratios: null,
      reportDefinitions: [],
      reportExecutions: [],
      currentFilters: {},
      dateRange: {
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      loading: false,
      error: null,
      selectedReportType: null,
      selectedPeriod: 'current_month',

      // Financial Reports Actions
      fetchBalanceSheet: async (asOfDate: string) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const balanceSheet = await reportsRepository.getBalanceSheet(asOfDate);
          set(state => {
            state.balanceSheet = balanceSheet;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchProfitLoss: async (periodStart: string, periodEnd: string) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const profitLoss = await reportsRepository.getProfitLoss(periodStart, periodEnd);
          set(state => {
            state.profitLoss = profitLoss;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchCashFlow: async (periodStart: string, periodEnd: string) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const cashFlow = await reportsRepository.getCashFlow(periodStart, periodEnd);
          set(state => {
            state.cashFlow = cashFlow;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchAgingReport: async (type: 'receivables' | 'payables', asOfDate: string) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const report = await reportsRepository.getAgingReport(type, asOfDate);
          set(state => {
            if (type === 'receivables') {
              state.agingReceivables = report;
            } else {
              state.agingPayables = report;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      // Dashboard Management
      fetchDashboards: async () => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const response = await reportsRepository.findAll();
          const dashboards = response.data.filter((item: any) => item.type === 'dashboard');
          set(state => {
            state.dashboards = dashboards;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      createDashboard: async (dashboard) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const newDashboard = await reportsRepository.create(dashboard);
          set(state => {
            state.dashboards.push(newDashboard);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateDashboard: async (id, updates) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const updatedDashboard = await reportsRepository.update(id, updates);
          set(state => {
            const index = state.dashboards.findIndex(d => d.id === id);
            if (index !== -1) {
              state.dashboards[index] = updatedDashboard;
            }
            if (state.currentDashboard?.id === id) {
              state.currentDashboard = updatedDashboard;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      deleteDashboard: async (id) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          await reportsRepository.delete(id);
          set(state => {
            state.dashboards = state.dashboards.filter(d => d.id !== id);
            if (state.currentDashboard?.id === id) {
              state.currentDashboard = null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      setCurrentDashboard: (dashboard) => {
        set(state => {
          state.currentDashboard = dashboard;
          if (dashboard) {
            state.widgets = dashboard.widgets;
          }
        });
      },

      // Widget Management
      addWidget: async (widget) => {
        try {
          const newWidget = await reportsRepository.addWidget(widget);
          set(state => {
            state.widgets.push(newWidget);
            if (state.currentDashboard) {
              state.currentDashboard.widgets.push(newWidget);
            }
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },

      updateWidget: async (id, updates) => {
        try {
          const updatedWidget = await reportsRepository.updateWidget(id, updates);
          set(state => {
            const index = state.widgets.findIndex(w => w.id === id);
            if (index !== -1) {
              state.widgets[index] = updatedWidget;
            }
            if (state.currentDashboard) {
              const dashboardIndex = state.currentDashboard.widgets.findIndex(w => w.id === id);
              if (dashboardIndex !== -1) {
                state.currentDashboard.widgets[dashboardIndex] = updatedWidget;
              }
            }
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },

      removeWidget: async (id) => {
        try {
          await reportsRepository.removeWidget(id);
          set(state => {
            state.widgets = state.widgets.filter(w => w.id !== id);
            if (state.currentDashboard) {
              state.currentDashboard.widgets = state.currentDashboard.widgets.filter(w => w.id !== id);
            }
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },

      reorderWidgets: (widgets) => {
        set(state => {
          state.widgets = widgets;
          if (state.currentDashboard) {
            state.currentDashboard.widgets = widgets;
          }
        });
      },

      // KPIs and Analytics
      fetchKPIs: async (period = 'current_month') => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const kpis = await reportsRepository.getKPIs(period);
          set(state => {
            state.kpis = kpis;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchTrends: async (metrics, period) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const trends = await reportsRepository.getTrends(metrics, period);
          set(state => {
            state.trends = trends;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchFinancialRatios: async (asOfDate) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const ratios = await reportsRepository.getFinancialRatios(asOfDate);
          set(state => {
            state.ratios = ratios;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      // Report Builder
      fetchReportDefinitions: async () => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const response = await reportsRepository.getReportDefinitions();
          set(state => {
            state.reportDefinitions = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      createReport: async (definition) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const newReport = await reportsRepository.createReport(definition);
          set(state => {
            state.reportDefinitions.push(newReport);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      executeReport: async (reportId, parameters) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const execution = await reportsRepository.executeReport(reportId, parameters);
          set(state => {
            state.reportExecutions.unshift(execution);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchReportExecutions: async (reportId) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const response = await reportsRepository.getReportExecutions(reportId);
          set(state => {
            state.reportExecutions = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      // Utility Actions
      setFilters: (filters) => {
        set(state => {
          state.currentFilters = { ...state.currentFilters, ...filters };
        });
      },

      setDateRange: (range) => {
        set(state => {
          state.dateRange = range;
        });
      },

      setSelectedReportType: (type) => {
        set(state => {
          state.selectedReportType = type;
        });
      },

      setSelectedPeriod: (period) => {
        set(state => {
          state.selectedPeriod = period;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      refreshAll: async () => {
        const { dateRange } = get();
        const asOfDate = dateRange.to;
        const periodStart = dateRange.from;
        const periodEnd = dateRange.to;

        await Promise.all([
          get().fetchBalanceSheet(asOfDate),
          get().fetchProfitLoss(periodStart, periodEnd),
          get().fetchCashFlow(periodStart, periodEnd),
          get().fetchKPIs(),
          get().fetchDashboards()
        ]);
      }
    })),
    { name: 'reports-store' }
  )
);