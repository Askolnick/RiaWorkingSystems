import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  incomeStatementRepository, 
  type IncomeStatement, 
  type ComparativeIncomeStatement,
  type GenerateIncomeStatementData,
  type ExportOptions,
  type ExportResult
} from '../repositories/income-statement.repository';

export interface IncomeStatementState {
  // Data
  statements: IncomeStatement[];
  currentStatement: IncomeStatement | null;
  comparativeData: ComparativeIncomeStatement | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedPeriod: string | null;
  filterBy: {
    periodType?: 'monthly' | 'quarterly' | 'annual';
    fiscalYear?: number;
    status?: 'draft' | 'pending_review' | 'approved' | 'published';
  };
  
  // Pagination
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  
  // Export
  exportLoading: boolean;
  lastExport: ExportResult | null;
}

export interface IncomeStatementActions {
  // Fetch operations
  fetchStatements: (page?: number) => Promise<void>;
  fetchStatement: (id: string) => Promise<void>;
  fetchComparative: (id: string) => Promise<void>;
  
  // CRUD operations
  generateStatement: (data: GenerateIncomeStatementData) => Promise<string>;
  updateStatement: (id: string, data: Partial<IncomeStatement>) => Promise<void>;
  deleteStatement: (id: string) => Promise<void>;
  approveStatement: (id: string, notes?: string) => Promise<void>;
  
  // Export operations
  exportStatement: (id: string, options: ExportOptions) => Promise<string>;
  
  // Filter and search
  setFilter: (filter: Partial<IncomeStatementState['filterBy']>) => void;
  clearFilter: () => void;
  setSelectedPeriod: (periodId: string | null) => void;
  
  // UI helpers
  clearError: () => void;
  setPage: (page: number) => void;
  
  // Calculations
  calculateMetrics: (statement: IncomeStatement) => {
    revenueGrowth: number;
    marginTrends: {
      gross: number;
      operating: number;
      net: number;
    };
    expenseRatios: {
      cogsPct: number;
      opexPct: number;
      taxPct: number;
    };
  };
}

type IncomeStatementStore = IncomeStatementState & IncomeStatementActions;

const initialState: IncomeStatementState = {
  statements: [],
  currentStatement: null,
  comparativeData: null,
  loading: false,
  error: null,
  selectedPeriod: null,
  filterBy: {},
  page: 1,
  limit: 20,
  total: 0,
  hasNextPage: false,
  exportLoading: false,
  lastExport: null,
};

export const useIncomeStatementStore = create<IncomeStatementStore>()(  
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Fetch operations
      fetchStatements: async (page = 1) => {
        set(state => {
          state.loading = true;
          state.error = null;
          state.page = page;
        });
        
        try {
          const { filterBy, limit } = get();
          const response = await incomeStatementRepository.findAll({
            page,
            limit,
            ...filterBy
          });
          
          set(state => {
            state.statements = response.data;
            state.total = response.pagination.total;
            state.hasNextPage = response.pagination.hasNextPage;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to fetch income statements';
            state.loading = false;
          });
        }
      },
      
      fetchStatement: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const statement = await incomeStatementRepository.findById(id);
          set(state => {
            state.currentStatement = statement;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to fetch income statement';
            state.loading = false;
          });
        }
      },
      
      fetchComparative: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const comparative = await incomeStatementRepository.getComparative(id);
          set(state => {
            state.comparativeData = comparative;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to fetch comparative data';
            state.loading = false;
          });
        }
      },
      
      // CRUD operations
      generateStatement: async (data: GenerateIncomeStatementData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const statement = await incomeStatementRepository.generate(data);
          set(state => {
            state.statements.unshift(statement);
            state.currentStatement = statement;
            state.loading = false;
          });
          return statement.id;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to generate income statement';
            state.loading = false;
          });
          throw error;
        }
      },
      
      updateStatement: async (id: string, data: Partial<IncomeStatement>) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const updated = await incomeStatementRepository.update(id, data);
          set(state => {
            const index = state.statements.findIndex(s => s.id === id);
            if (index !== -1) {
              state.statements[index] = updated;
            }
            if (state.currentStatement?.id === id) {
              state.currentStatement = updated;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to update income statement';
            state.loading = false;
          });
        }
      },
      
      deleteStatement: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          await incomeStatementRepository.delete(id);
          set(state => {
            state.statements = state.statements.filter(s => s.id !== id);
            if (state.currentStatement?.id === id) {
              state.currentStatement = null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to delete income statement';
            state.loading = false;
          });
        }
      },
      
      approveStatement: async (id: string, notes?: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const approved = await incomeStatementRepository.approve(id, notes);
          set(state => {
            const index = state.statements.findIndex(s => s.id === id);
            if (index !== -1) {
              state.statements[index] = approved;
            }
            if (state.currentStatement?.id === id) {
              state.currentStatement = approved;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to approve income statement';
            state.loading = false;
          });
        }
      },
      
      // Export operations
      exportStatement: async (id: string, options: ExportOptions) => {
        set(state => {
          state.exportLoading = true;
          state.error = null;
        });
        
        try {
          const exportResult = await incomeStatementRepository.export(id, options);
          
          // Create and trigger download
          const statement = get().statements.find(s => s.id === id) || get().currentStatement;
          let content = '';
          
          if (options.format === 'json') {
            content = JSON.stringify(statement, null, 2);
          } else if (options.format === 'csv') {
            content = generateCSVContent(statement!);
          } else if (options.format === 'excel') {
            content = generateExcelContent(statement!);
          } else if (options.format === 'pdf') {
            content = generatePDFContent(statement!);
          }
          
          const blob = new Blob([content], { 
            type: getContentType(options.format) 
          });
          const url = URL.createObjectURL(blob);
          
          set(state => {
            state.lastExport = {
              ...exportResult,
              url
            };
            state.exportLoading = false;
          });
          
          return url;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to export income statement';
            state.exportLoading = false;
          });
          throw error;
        }
      },
      
      // Filter and search
      setFilter: (filter) => {
        set(state => {
          state.filterBy = { ...state.filterBy, ...filter };
          state.page = 1;
        });
        get().fetchStatements(1);
      },
      
      clearFilter: () => {
        set(state => {
          state.filterBy = {};
          state.page = 1;
        });
        get().fetchStatements(1);
      },
      
      setSelectedPeriod: (periodId) => {
        set(state => {
          state.selectedPeriod = periodId;
        });
      },
      
      // UI helpers
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      setPage: (page: number) => {
        get().fetchStatements(page);
      },
      
      // Calculations
      calculateMetrics: (statement: IncomeStatement) => {
        // Find previous period for growth calculation
        const { statements } = get();
        let previousStatement: IncomeStatement | undefined;
        
        if (statement.periodType === 'monthly' && statement.month) {
          const prevMonth = statement.month === 1 ? 12 : statement.month - 1;
          const prevYear = statement.month === 1 ? statement.fiscalYear - 1 : statement.fiscalYear;
          previousStatement = statements.find(s => 
            s.periodType === 'monthly' && 
            s.month === prevMonth && 
            s.fiscalYear === prevYear
          );
        } else if (statement.periodType === 'quarterly' && statement.quarter) {
          const prevQuarter = statement.quarter === 1 ? 4 : statement.quarter - 1;
          const prevYear = statement.quarter === 1 ? statement.fiscalYear - 1 : statement.fiscalYear;
          previousStatement = statements.find(s => 
            s.periodType === 'quarterly' && 
            s.quarter === prevQuarter && 
            s.fiscalYear === prevYear
          );
        } else if (statement.periodType === 'annual') {
          previousStatement = statements.find(s => 
            s.periodType === 'annual' && 
            s.fiscalYear === statement.fiscalYear - 1
          );
        }
        
        const revenueGrowth = previousStatement 
          ? ((statement.totalRevenue - previousStatement.totalRevenue) / previousStatement.totalRevenue) * 100
          : 0;
        
        // Calculate margin trends
        const currentGrossMargin = statement.grossProfitMargin;
        const currentOperatingMargin = statement.operatingMargin;
        const currentNetMargin = statement.netProfitMargin;
        
        const prevGrossMargin = previousStatement?.grossProfitMargin || currentGrossMargin;
        const prevOperatingMargin = previousStatement?.operatingMargin || currentOperatingMargin;
        const prevNetMargin = previousStatement?.netProfitMargin || currentNetMargin;
        
        return {
          revenueGrowth,
          marginTrends: {
            gross: currentGrossMargin - prevGrossMargin,
            operating: currentOperatingMargin - prevOperatingMargin,
            net: currentNetMargin - prevNetMargin,
          },
          expenseRatios: {
            cogsPct: (statement.totalCOGS / statement.totalRevenue) * 100,
            opexPct: (statement.totalOperatingExpenses / statement.totalRevenue) * 100,
            taxPct: (statement.incomeTax / statement.incomeBeforeTax) * 100,
          },
        };
      },
    })),
    {
      name: 'income-statement-store',
    }
  )
);

// Helper functions for export
function getContentType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'csv':
      return 'text/csv';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'text/plain';
  }
}

function generateCSVContent(statement: IncomeStatement): string {
  const lines = [];
  lines.push('Income Statement (Profit & Loss)');
  lines.push(`Period: ${statement.periodStart} to ${statement.periodEnd}`);
  lines.push(`Status: ${statement.status}`);
  lines.push('');
  
  lines.push('REVENUE');
  lines.push(`Product Revenue,${statement.revenue.productRevenue.toLocaleString()}`);
  lines.push(`Service Revenue,${statement.revenue.serviceRevenue.toLocaleString()}`);
  lines.push(`Subscription Revenue,${statement.revenue.subscriptionRevenue.toLocaleString()}`);
  lines.push(`Less: Returns & Discounts,${(statement.revenue.salesReturns + statement.revenue.salesDiscounts).toLocaleString()}`);
  lines.push(`Net Revenue,${statement.totalRevenue.toLocaleString()}`);
  lines.push('');
  
  lines.push('COST OF GOODS SOLD');
  lines.push(`Direct Materials,${statement.costOfGoodsSold.directMaterials.toLocaleString()}`);
  lines.push(`Direct Labor,${statement.costOfGoodsSold.directLabor.toLocaleString()}`);
  lines.push(`Manufacturing Overhead,${statement.costOfGoodsSold.manufacturingOverhead.toLocaleString()}`);
  lines.push(`Total COGS,${statement.totalCOGS.toLocaleString()}`);
  lines.push('');
  
  lines.push(`Gross Profit,${statement.grossProfit.toLocaleString()}`);
  lines.push(`Gross Margin,${statement.grossProfitMargin.toFixed(2)}%`);
  lines.push('');
  
  lines.push('OPERATING EXPENSES');
  lines.push(`Sales & Marketing,${statement.operatingExpenses.totalSalesAndMarketing.toLocaleString()}`);
  lines.push(`General & Administrative,${statement.operatingExpenses.totalGeneralAndAdministrative.toLocaleString()}`);
  lines.push(`Research & Development,${statement.operatingExpenses.totalResearchAndDevelopment.toLocaleString()}`);
  lines.push(`Depreciation & Amortization,${statement.operatingExpenses.totalDepreciationAmortization.toLocaleString()}`);
  lines.push(`Total Operating Expenses,${statement.totalOperatingExpenses.toLocaleString()}`);
  lines.push('');
  
  lines.push(`Operating Income,${statement.operatingIncome.toLocaleString()}`);
  lines.push(`Operating Margin,${statement.operatingMargin.toFixed(2)}%`);
  lines.push('');
  
  lines.push('OTHER INCOME/EXPENSES');
  lines.push(`Other Income,${statement.otherIncomeExpenses.totalOtherIncome.toLocaleString()}`);
  lines.push(`Other Expenses,${statement.otherIncomeExpenses.totalOtherExpenses.toLocaleString()}`);
  lines.push(`Net Other Income,${statement.totalOtherIncomeExpenses.toLocaleString()}`);
  lines.push('');
  
  lines.push(`Income Before Tax,${statement.incomeBeforeTax.toLocaleString()}`);
  lines.push(`Income Tax,${statement.incomeTax.toLocaleString()}`);
  lines.push(`Effective Tax Rate,${statement.effectiveTaxRate.toFixed(2)}%`);
  lines.push('');
  
  lines.push(`NET INCOME,${statement.netIncome.toLocaleString()}`);
  lines.push(`Net Margin,${statement.netProfitMargin.toFixed(2)}%`);
  
  if (statement.earningsPerShare) {
    lines.push('');
    lines.push(`Earnings Per Share,$${statement.earningsPerShare.toFixed(2)}`);
    lines.push(`Diluted EPS,$${statement.dilutedEPS?.toFixed(2) || 'N/A'}`);
  }
  
  return lines.join('\n');
}

function generateExcelContent(statement: IncomeStatement): string {
  // For mock purposes, return CSV-like content
  // In a real implementation, you'd use a library like xlsx
  return generateCSVContent(statement);
}

function generatePDFContent(statement: IncomeStatement): string {
  // For mock purposes, return formatted text
  // In a real implementation, you'd use a library like jsPDF
  return `
INCOME STATEMENT (PROFIT & LOSS)\n
` +
    `Period: ${statement.periodStart} to ${statement.periodEnd}\n` +
    `Status: ${statement.status.toUpperCase()}\n` +
    `Currency: ${statement.currency}\n\n` +
    
    `REVENUE\n` +
    `Product Revenue: $${statement.revenue.productRevenue.toLocaleString()}\n` +
    `Service Revenue: $${statement.revenue.serviceRevenue.toLocaleString()}\n` +
    `Subscription Revenue: $${statement.revenue.subscriptionRevenue.toLocaleString()}\n` +
    `Less: Returns & Discounts: ($${(statement.revenue.salesReturns + statement.revenue.salesDiscounts).toLocaleString()})\n` +
    `Net Revenue: $${statement.totalRevenue.toLocaleString()}\n\n` +
    
    `COST OF GOODS SOLD\n` +
    `Direct Materials: $${statement.costOfGoodsSold.directMaterials.toLocaleString()}\n` +
    `Direct Labor: $${statement.costOfGoodsSold.directLabor.toLocaleString()}\n` +
    `Manufacturing Overhead: $${statement.costOfGoodsSold.manufacturingOverhead.toLocaleString()}\n` +
    `Total COGS: $${statement.totalCOGS.toLocaleString()}\n\n` +
    
    `GROSS PROFIT: $${statement.grossProfit.toLocaleString()} (${statement.grossProfitMargin.toFixed(2)}%)\n\n` +
    
    `OPERATING EXPENSES\n` +
    `Sales & Marketing: $${statement.operatingExpenses.totalSalesAndMarketing.toLocaleString()}\n` +
    `General & Administrative: $${statement.operatingExpenses.totalGeneralAndAdministrative.toLocaleString()}\n` +
    `Research & Development: $${statement.operatingExpenses.totalResearchAndDevelopment.toLocaleString()}\n` +
    `Depreciation & Amortization: $${statement.operatingExpenses.totalDepreciationAmortization.toLocaleString()}\n` +
    `Total Operating Expenses: $${statement.totalOperatingExpenses.toLocaleString()}\n\n` +
    
    `OPERATING INCOME: $${statement.operatingIncome.toLocaleString()} (${statement.operatingMargin.toFixed(2)}%)\n\n` +
    
    `OTHER INCOME/EXPENSES\n` +
    `Other Income: $${statement.otherIncomeExpenses.totalOtherIncome.toLocaleString()}\n` +
    `Other Expenses: $${statement.otherIncomeExpenses.totalOtherExpenses.toLocaleString()}\n` +
    `Net Other Income: $${statement.totalOtherIncomeExpenses.toLocaleString()}\n\n` +
    
    `INCOME BEFORE TAX: $${statement.incomeBeforeTax.toLocaleString()}\n` +
    `Income Tax: $${statement.incomeTax.toLocaleString()} (${statement.effectiveTaxRate.toFixed(2)}%)\n\n` +
    
    `NET INCOME: $${statement.netIncome.toLocaleString()} (${statement.netProfitMargin.toFixed(2)}%)\n\n` +
    
    (statement.earningsPerShare ? 
      `EARNINGS PER SHARE\n` +
      `Basic EPS: $${statement.earningsPerShare.toFixed(2)}\n` +
      `Diluted EPS: $${statement.dilutedEPS?.toFixed(2) || 'N/A'}\n`
      : '') +
    
    `\nGenerated: ${new Date(statement.generatedAt).toLocaleString()}\n` +
    (statement.approvedBy ? `Approved by: ${statement.approvedBy}\n` : '') +
    (statement.notes ? `Notes: ${statement.notes}\n` : '');
}