import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'percentage' | 'number';
  icon?: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'client' | 'performance' | 'custom';
  createdAt: string;
  updatedAt: string;
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  isPublic: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

interface InsightsStore {
  // Metrics
  metrics: MetricCard[];
  metricsLoading: boolean;
  
  // Charts
  charts: {
    revenueChart: ChartData;
    clientGrowthChart: ChartData;
    portfolioPerformanceChart: ChartData;
    aumChart: ChartData;
  };
  chartsLoading: boolean;
  chartsError: string | null;
  
  // Reports
  reports: Report[];
  currentReport: Report | null;
  reportsLoading: boolean;
  
  // Dashboards
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  dashboardsLoading: boolean;
  
  // Filters
  dateRange: {
    start: string;
    end: string;
  };
  selectedMetrics: string[];
  
  // Actions
  fetchMetrics: () => Promise<void>;
  fetchCharts: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchDashboards: () => Promise<void>;
  
  // Reports
  generateReport: (type: Report['type'], config: any) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  scheduleReport: (id: string, schedule: Report['schedule']) => Promise<void>;
  
  // Dashboards
  createDashboard: (name: string) => Promise<Dashboard>;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  setDefaultDashboard: (id: string) => Promise<void>;
  
  // Filters
  setDateRange: (start: string, end: string) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  refreshData: () => Promise<void>;
}

// Mock data generators
const generateMockMetrics = (): MetricCard[] => [
  {
    id: '1',
    title: 'Total AUM',
    value: '$124.5M',
    change: 8.2,
    changeType: 'increase',
    format: 'currency',
    icon: '💰'
  },
  {
    id: '2',
    title: 'Active Clients',
    value: 248,
    change: 5.1,
    changeType: 'increase',
    format: 'number',
    icon: '👥'
  },
  {
    id: '3',
    title: 'Portfolio Performance',
    value: '12.8%',
    change: 2.3,
    changeType: 'increase',
    format: 'percentage',
    icon: '📈'
  },
  {
    id: '4',
    title: 'Client Satisfaction',
    value: '94%',
    change: -1.2,
    changeType: 'decrease',
    format: 'percentage',
    icon: '⭐'
  }
];

const generateMockChartData = () => ({
  revenueChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [450000, 520000, 480000, 610000, 580000, 650000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  },
  clientGrowthChart: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'New Clients',
      data: [12, 19, 15, 22],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    }]
  },
  portfolioPerformanceChart: {
    labels: ['Conservative', 'Moderate', 'Aggressive', 'Income'],
    datasets: [{
      label: 'Returns (%)',
      data: [6.2, 9.8, 14.1, 4.7],
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgb(16, 185, 129)'
    }]
  },
  aumChart: {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      label: 'AUM (Millions)',
      data: [85, 92, 108, 115, 118, 124.5],
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true
    }]
  }
});

const generateMockReports = (): Report[] => [
  {
    id: '1',
    name: 'Monthly Performance Report',
    description: 'Comprehensive portfolio performance analysis',
    type: 'performance',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    schedule: 'monthly',
    isPublic: false
  },
  {
    id: '2',
    name: 'Client Activity Summary',
    description: 'Client engagement and activity metrics',
    type: 'client',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    schedule: 'weekly',
    isPublic: true
  }
];

export const useInsightsStore = create<InsightsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      metrics: [],
      metricsLoading: false,
      
      charts: generateMockChartData(),
      chartsLoading: false,
      chartsError: null,
      
      reports: [],
      currentReport: null,
      reportsLoading: false,
      
      dashboards: [],
      currentDashboard: null,
      dashboardsLoading: false,
      
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      selectedMetrics: [],
      
      // Actions
      fetchMetrics: async () => {
        set(state => { state.metricsLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set(state => {
            state.metrics = generateMockMetrics();
            state.metricsLoading = false;
          });
        } catch (error) {
          set(state => { state.metricsLoading = false; });
        }
      },
      
      fetchCharts: async () => {
        set(state => {
          state.chartsLoading = true;
          state.chartsError = null;
        });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          set(state => {
            state.charts = generateMockChartData();
            state.chartsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.chartsError = error instanceof Error ? error.message : 'Failed to fetch charts';
            state.chartsLoading = false;
          });
        }
      },
      
      fetchReports: async () => {
        set(state => { state.reportsLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          set(state => {
            state.reports = generateMockReports();
            state.reportsLoading = false;
          });
        } catch (error) {
          set(state => { state.reportsLoading = false; });
        }
      },
      
      fetchDashboards: async () => {
        set(state => { state.dashboardsLoading = true; });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          // Mock dashboard data
          set(state => {
            state.dashboards = [
              {
                id: '1',
                name: 'Executive Dashboard',
                widgets: [],
                isDefault: true,
                createdAt: new Date().toISOString()
              }
            ];
            state.dashboardsLoading = false;
          });
        } catch (error) {
          set(state => { state.dashboardsLoading = false; });
        }
      },
      
      generateReport: async (type: Report['type'], config: any) => {
        const newReport: Report = {
          id: Date.now().toString(),
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          description: `Generated ${type} report`,
          type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: false
        };
        
        set(state => {
          state.reports.unshift(newReport);
        });
        
        return newReport;
      },
      
      deleteReport: async (id: string) => {
        set(state => {
          state.reports = state.reports.filter(r => r.id !== id);
          if (state.currentReport?.id === id) {
            state.currentReport = null;
          }
        });
      },
      
      scheduleReport: async (id: string, schedule: Report['schedule']) => {
        set(state => {
          const report = state.reports.find(r => r.id === id);
          if (report) {
            report.schedule = schedule;
            report.updatedAt = new Date().toISOString();
          }
        });
      },
      
      createDashboard: async (name: string) => {
        const newDashboard: Dashboard = {
          id: Date.now().toString(),
          name,
          widgets: [],
          isDefault: false,
          createdAt: new Date().toISOString()
        };
        
        set(state => {
          state.dashboards.push(newDashboard);
        });
        
        return newDashboard;
      },
      
      updateDashboard: async (id: string, updates: Partial<Dashboard>) => {
        set(state => {
          const index = state.dashboards.findIndex(d => d.id === id);
          if (index !== -1) {
            state.dashboards[index] = { ...state.dashboards[index], ...updates };
          }
        });
      },
      
      deleteDashboard: async (id: string) => {
        set(state => {
          state.dashboards = state.dashboards.filter(d => d.id !== id);
          if (state.currentDashboard?.id === id) {
            state.currentDashboard = null;
          }
        });
      },
      
      setDefaultDashboard: async (id: string) => {
        set(state => {
          state.dashboards.forEach(d => {
            d.isDefault = d.id === id;
          });
        });
      },
      
      setDateRange: (start: string, end: string) => {
        set(state => {
          state.dateRange = { start, end };
        });
      },
      
      setSelectedMetrics: (metrics: string[]) => {
        set(state => {
          state.selectedMetrics = metrics;
        });
      },
      
      refreshData: async () => {
        await Promise.all([
          get().fetchMetrics(),
          get().fetchCharts(),
          get().fetchReports()
        ]);
      },
    }))
  )
);