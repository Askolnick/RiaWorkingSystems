import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  cashFlowStatementRepository, 
  type CashFlowStatement, 
  type ComparativeCashFlowStatement,
  type GenerateCashFlowStatementData,
  type CashFlowExportOptions,
  type CashFlowExportResult
} from '../repositories/cash-flow.repository';

export interface CashFlowStatementState {
  // Data
  statements: CashFlowStatement[];
  currentStatement: CashFlowStatement | null;
  comparativeData: ComparativeCashFlowStatement | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedPeriod: string | null;
  filterBy: {
    periodType?: 'monthly' | 'quarterly' | 'annual';
    method?: 'direct' | 'indirect';
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
  lastExport: CashFlowExportResult | null;
  
  // Analytics
  cashFlowMetrics: CashFlowMetrics | null;
}

export interface CashFlowMetrics {
  // Operating Cash Flow Ratios
  operatingCashFlowRatio: number;
  cashFlowToSalesRatio: number;
  
  // Quality Ratios
  cashFlowToNetIncomeRatio: number;
  
  // Liquidity Ratios
  freeCashFlow: number;
  freeCashFlowMargin: number;
  
  // Trends
  operatingCashFlowTrend: number;
  investingCashFlowTrend: number;
  financingCashFlowTrend: number;
  
  // Working Capital Impact
  workingCapitalImpact: number;
  
  // Cash Generation Efficiency
  cashConversionEfficiency: number;
}

export interface CashFlowStatementActions {
  // Fetch operations
  fetchStatements: (page?: number) => Promise<void>;
  fetchStatement: (id: string) => Promise<void>;
  fetchComparative: (id: string) => Promise<void>;
  
  // CRUD operations
  generateStatement: (data: GenerateCashFlowStatementData) => Promise<string>;
  updateStatement: (id: string, data: Partial<CashFlowStatement>) => Promise<void>;
  deleteStatement: (id: string) => Promise<void>;
  approveStatement: (id: string, notes?: string) => Promise<void>;
  
  // Export operations
  exportStatement: (id: string, options: CashFlowExportOptions) => Promise<string>;
  
  // Filter and search
  setFilter: (filter: Partial<CashFlowStatementState['filterBy']>) => void;
  clearFilter: () => void;
  setSelectedPeriod: (periodId: string | null) => void;
  
  // UI helpers
  clearError: () => void;
  setPage: (page: number) => void;
  
  // Analytics
  calculateMetrics: (statement: CashFlowStatement) => CashFlowMetrics;
  refreshMetrics: () => void;
  
  // Cash Flow Analysis
  analyzeCashFlowPatterns: (statements: CashFlowStatement[]) => {
    operatingTrend: 'improving' | 'stable' | 'declining';
    liquidityRisk: 'low' | 'medium' | 'high';
    cashGenerationQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
}

type CashFlowStatementStore = CashFlowStatementState & CashFlowStatementActions;

const initialState: CashFlowStatementState = {
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
  cashFlowMetrics: null,
};

export const useCashFlowStatementStore = create<CashFlowStatementStore>()(  
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
          const response = await cashFlowStatementRepository.findAll({
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
          
          // Update metrics after fetching
          get().refreshMetrics();
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to fetch cash flow statements';
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
          const statement = await cashFlowStatementRepository.findById(id);
          set(state => {
            state.currentStatement = statement;
            state.cashFlowMetrics = get().calculateMetrics(statement);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to fetch cash flow statement';
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
          const comparative = await cashFlowStatementRepository.getComparative(id);
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
      generateStatement: async (data: GenerateCashFlowStatementData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const statement = await cashFlowStatementRepository.generate(data);
          set(state => {
            state.statements.unshift(statement);
            state.currentStatement = statement;
            state.cashFlowMetrics = get().calculateMetrics(statement);
            state.loading = false;
          });
          return statement.id;
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to generate cash flow statement';
            state.loading = false;
          });
          throw error;
        }
      },
      
      updateStatement: async (id: string, data: Partial<CashFlowStatement>) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const updated = await cashFlowStatementRepository.update(id, data);
          set(state => {
            const index = state.statements.findIndex(s => s.id === id);
            if (index !== -1) {
              state.statements[index] = updated;
            }
            if (state.currentStatement?.id === id) {
              state.currentStatement = updated;
              state.cashFlowMetrics = get().calculateMetrics(updated);
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to update cash flow statement';
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
          await cashFlowStatementRepository.delete(id);
          set(state => {
            state.statements = state.statements.filter(s => s.id !== id);
            if (state.currentStatement?.id === id) {
              state.currentStatement = null;
              state.cashFlowMetrics = null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Failed to delete cash flow statement';
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
          const approved = await cashFlowStatementRepository.approve(id, notes);
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
            state.error = error.message || 'Failed to approve cash flow statement';
            state.loading = false;
          });
        }
      },
      
      // Export operations
      exportStatement: async (id: string, options: CashFlowExportOptions) => {
        set(state => {
          state.exportLoading = true;
          state.error = null;
        });
        
        try {
          const exportResult = await cashFlowStatementRepository.export(id, options);
          
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
            state.error = error.message || 'Failed to export cash flow statement';
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
      
      // Analytics
      calculateMetrics: (statement: CashFlowStatement) => {
        const { statements } = get();
        
        // Find previous period for comparison
        let previousStatement: CashFlowStatement | undefined;
        if (statement.periodType === 'monthly' && statement.month) {
          const prevMonth = statement.month === 1 ? 12 : statement.month - 1;
          const prevYear = statement.month === 1 ? statement.fiscalYear - 1 : statement.fiscalYear;
          previousStatement = statements.find(s => 
            s.periodType === 'monthly' && 
            s.month === prevMonth && 
            s.fiscalYear === prevYear
          );
        }
        
        // Calculate free cash flow
        const capitalExpenditures = Math.abs(statement.investingActivities.purchaseOfPPE) + 
          Math.abs(statement.investingActivities.purchaseOfIntangibleAssets);
        const freeCashFlow = statement.netCashFromOperating - capitalExpenditures;
        
        // Calculate trends
        const operatingTrend = previousStatement 
          ? ((statement.netCashFromOperating - previousStatement.netCashFromOperating) / Math.abs(previousStatement.netCashFromOperating)) * 100
          : 0;
        const investingTrend = previousStatement 
          ? ((statement.netCashFromInvesting - previousStatement.netCashFromInvesting) / Math.abs(previousStatement.netCashFromInvesting || 1)) * 100
          : 0;
        const financingTrend = previousStatement 
          ? ((statement.netCashFromFinancing - previousStatement.netCashFromFinancing) / Math.abs(previousStatement.netCashFromFinancing || 1)) * 100
          : 0;
        
        // Calculate working capital impact (sum of working capital changes)
        const workingCapitalImpact = statement.operatingActivities.indirectMethod.totalWorkingCapitalChanges;
        
        // Calculate cash conversion efficiency (operating cash flow / net income)
        const cashConversionEfficiency = statement.operatingActivities.indirectMethod.netIncome !== 0 
          ? statement.netCashFromOperating / statement.operatingActivities.indirectMethod.netIncome
          : 0;
        
        return {
          operatingCashFlowRatio: statement.netCashFromOperating / (statement.endingCashBalance || 1),
          cashFlowToSalesRatio: statement.netCashFromOperating / 1000000, // Assuming revenue from P&L
          cashFlowToNetIncomeRatio: statement.operatingActivities.indirectMethod.netIncome !== 0 
            ? statement.netCashFromOperating / statement.operatingActivities.indirectMethod.netIncome 
            : 0,
          freeCashFlow,
          freeCashFlowMargin: freeCashFlow / 1000000, // Assuming revenue
          operatingCashFlowTrend: operatingTrend,
          investingCashFlowTrend: investingTrend,
          financingCashFlowTrend: financingTrend,
          workingCapitalImpact,
          cashConversionEfficiency,
        };
      },
      
      refreshMetrics: () => {
        const { currentStatement } = get();
        if (currentStatement) {
          set(state => {
            state.cashFlowMetrics = get().calculateMetrics(currentStatement);
          });
        }
      },
      
      // Cash Flow Analysis
      analyzeCashFlowPatterns: (statements: CashFlowStatement[]) => {
        if (statements.length < 3) {
          return {
            operatingTrend: 'stable' as const,
            liquidityRisk: 'medium' as const,
            cashGenerationQuality: 'fair' as const,
            recommendations: ['More historical data needed for comprehensive analysis']
          };
        }
        
        // Analyze operating cash flow trend
        const recentStatements = statements.slice(-3);
        const operatingCashFlows = recentStatements.map(s => s.netCashFromOperating);
        const operatingTrend = operatingCashFlows.every((flow, i) => 
          i === 0 || flow >= operatingCashFlows[i - 1]
        ) ? 'improving' : operatingCashFlows.every((flow, i) => 
          i === 0 || flow <= operatingCashFlows[i - 1]
        ) ? 'declining' : 'stable';
        
        // Assess liquidity risk
        const latestStatement = statements[0];
        const cashRatio = latestStatement.endingCashBalance / 100000; // Assuming current liabilities
        const operatingCashFlowRatio = latestStatement.netCashFromOperating / 100000;
        
        let liquidityRisk: 'low' | 'medium' | 'high';
        if (cashRatio > 1 && operatingCashFlowRatio > 0.5) {
          liquidityRisk = 'low';
        } else if (cashRatio > 0.5 || operatingCashFlowRatio > 0.25) {
          liquidityRisk = 'medium';
        } else {
          liquidityRisk = 'high';
        }
        
        // Evaluate cash generation quality
        const cashFlowToIncomeRatios = recentStatements.map(s => 
          s.operatingActivities.indirectMethod.netIncome !== 0 
            ? s.netCashFromOperating / s.operatingActivities.indirectMethod.netIncome 
            : 0
        );
        const avgQualityRatio = cashFlowToIncomeRatios.reduce((a, b) => a + b, 0) / cashFlowToIncomeRatios.length;
        
        let cashGenerationQuality: 'excellent' | 'good' | 'fair' | 'poor';
        if (avgQualityRatio >= 1.2) {
          cashGenerationQuality = 'excellent';
        } else if (avgQualityRatio >= 1.0) {
          cashGenerationQuality = 'good';
        } else if (avgQualityRatio >= 0.8) {
          cashGenerationQuality = 'fair';
        } else {
          cashGenerationQuality = 'poor';
        }
        
        // Generate recommendations
        const recommendations: string[] = [];
        
        if (operatingTrend === 'declining') {
          recommendations.push('Focus on improving operational efficiency to reverse declining cash flow trend');
        }
        
        if (liquidityRisk === 'high') {
          recommendations.push('Consider improving cash position through working capital optimization or additional financing');
        }
        
        if (cashGenerationQuality === 'poor') {
          recommendations.push('Review revenue recognition and collection processes to improve cash conversion');
        }
        
        if (latestStatement.netCashFromInvesting < -50000) {
          recommendations.push('Monitor capital expenditure levels to ensure they support growth without straining cash flow');
        }
        
        if (latestStatement.netCashFromFinancing < -30000) {
          recommendations.push('Review debt service and dividend policies to optimize capital structure');
        }
        
        if (recommendations.length === 0) {
          recommendations.push('Cash flow performance is healthy - continue monitoring key metrics');
        }
        
        return {
          operatingTrend,
          liquidityRisk,
          cashGenerationQuality,
          recommendations,
        };
      },
    })),
    {
      name: 'cash-flow-statement-store',
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

function generateCSVContent(statement: CashFlowStatement): string {
  const lines = [];
  lines.push('Cash Flow Statement');
  lines.push(`Period: ${statement.periodStart} to ${statement.periodEnd}`);
  lines.push(`Method: ${statement.method.toUpperCase()}`);
  lines.push(`Status: ${statement.status}`);
  lines.push('');
  
  lines.push('OPERATING ACTIVITIES');
  lines.push(`Net Income,${statement.operatingActivities.indirectMethod.netIncome.toLocaleString()}`);
  lines.push(`Depreciation & Amortization,${(statement.operatingActivities.indirectMethod.depreciation + statement.operatingActivities.indirectMethod.amortization).toLocaleString()}`);
  lines.push(`Stock Compensation,${statement.operatingActivities.indirectMethod.stockCompensation.toLocaleString()}`);
  lines.push(`Working Capital Changes,${statement.operatingActivities.indirectMethod.totalWorkingCapitalChanges.toLocaleString()}`);
  lines.push(`Net Cash from Operating,${statement.netCashFromOperating.toLocaleString()}`);
  lines.push('');
  
  lines.push('INVESTING ACTIVITIES');
  lines.push(`Purchase of PPE,${statement.investingActivities.purchaseOfPPE.toLocaleString()}`);
  lines.push(`Proceeds from Sale of PPE,${statement.investingActivities.proceedsFromSaleOfPPE.toLocaleString()}`);
  lines.push(`Purchase of Investments,${statement.investingActivities.purchaseOfInvestments.toLocaleString()}`);
  lines.push(`Proceeds from Investments,${statement.investingActivities.proceedsFromSaleOfInvestments.toLocaleString()}`);
  lines.push(`Net Cash from Investing,${statement.netCashFromInvesting.toLocaleString()}`);
  lines.push('');
  
  lines.push('FINANCING ACTIVITIES');
  lines.push(`Proceeds from Stock Issuance,${statement.financingActivities.proceedsFromStockIssuance.toLocaleString()}`);
  lines.push(`Dividends Paid,${statement.financingActivities.dividendsPaid.toLocaleString()}`);
  lines.push(`Proceeds from Debt,${statement.financingActivities.proceedsFromDebtIssuance.toLocaleString()}`);
  lines.push(`Debt Repayment,${statement.financingActivities.repaymentOfDebt.toLocaleString()}`);
  lines.push(`Net Cash from Financing,${statement.netCashFromFinancing.toLocaleString()}`);
  lines.push('');
  
  lines.push('CASH SUMMARY');
  lines.push(`Net Change in Cash,${statement.netChangeInCash.toLocaleString()}`);
  lines.push(`Beginning Cash Balance,${statement.beginningCashBalance.toLocaleString()}`);
  lines.push(`Ending Cash Balance,${statement.endingCashBalance.toLocaleString()}`);
  lines.push('');
  
  lines.push('SUPPLEMENTAL DISCLOSURES');
  lines.push(`Interest Paid,${statement.supplementalDisclosures.interestPaidDuringPeriod.toLocaleString()}`);
  lines.push(`Income Taxes Paid,${statement.supplementalDisclosures.incomeTaxesPaidDuringPeriod.toLocaleString()}`);
  
  return lines.join('\n');
}

function generateExcelContent(statement: CashFlowStatement): string {
  // For mock purposes, return CSV-like content
  // In a real implementation, you'd use a library like xlsx
  return generateCSVContent(statement);
}

function generatePDFContent(statement: CashFlowStatement): string {
  // For mock purposes, return formatted text
  // In a real implementation, you'd use a library like jsPDF
  return `
CASH FLOW STATEMENT

Period: ${statement.periodStart} to ${statement.periodEnd}
Method: ${statement.method.toUpperCase()}
Status: ${statement.status.toUpperCase()}
Currency: ${statement.currency}

OPERATING ACTIVITIES
Net Income: $${statement.operatingActivities.indirectMethod.netIncome.toLocaleString()}

Adjustments to reconcile net income:
  Depreciation: $${statement.operatingActivities.indirectMethod.depreciation.toLocaleString()}
  Amortization: $${statement.operatingActivities.indirectMethod.amortization.toLocaleString()}
  Stock Compensation: $${statement.operatingActivities.indirectMethod.stockCompensation.toLocaleString()}
  Bad Debt Expense: $${statement.operatingActivities.indirectMethod.badDebtExpense.toLocaleString()}
  Deferred Taxes: $${statement.operatingActivities.indirectMethod.deferredTaxes.toLocaleString()}

Changes in operating assets and liabilities:
  Accounts Receivable: $${statement.operatingActivities.indirectMethod.accountsReceivableChange.toLocaleString()}
  Inventory: $${statement.operatingActivities.indirectMethod.inventoryChange.toLocaleString()}
  Prepaid Expenses: $${statement.operatingActivities.indirectMethod.prepaidExpensesChange.toLocaleString()}
  Accounts Payable: $${statement.operatingActivities.indirectMethod.accountsPayableChange.toLocaleString()}
  Accrued Expenses: $${statement.operatingActivities.indirectMethod.accruedExpensesChange.toLocaleString()}
  Deferred Revenue: $${statement.operatingActivities.indirectMethod.deferredRevenueChange.toLocaleString()}

NET CASH FROM OPERATING ACTIVITIES: $${statement.netCashFromOperating.toLocaleString()}

INVESTING ACTIVITIES
Purchase of Property, Plant & Equipment: $${statement.investingActivities.purchaseOfPPE.toLocaleString()}
Proceeds from Sale of PPE: $${statement.investingActivities.proceedsFromSaleOfPPE.toLocaleString()}
Purchase of Investments: $${statement.investingActivities.purchaseOfInvestments.toLocaleString()}
Proceeds from Sale of Investments: $${statement.investingActivities.proceedsFromSaleOfInvestments.toLocaleString()}
Maturity of Investments: $${statement.investingActivities.maturityOfInvestments.toLocaleString()}

NET CASH FROM INVESTING ACTIVITIES: $${statement.netCashFromInvesting.toLocaleString()}

FINANCING ACTIVITIES
Proceeds from Stock Issuance: $${statement.financingActivities.proceedsFromStockIssuance.toLocaleString()}
Treasury Stock Purchases: $${statement.financingActivities.treasuryStockPurchases.toLocaleString()}
Dividends Paid: $${statement.financingActivities.dividendsPaid.toLocaleString()}
Proceeds from Debt Issuance: $${statement.financingActivities.proceedsFromDebtIssuance.toLocaleString()}
Repayment of Debt: $${statement.financingActivities.repaymentOfDebt.toLocaleString()}
Principal Payments on Leases: $${statement.financingActivities.principalPaymentsOnLeases.toLocaleString()}

NET CASH FROM FINANCING ACTIVITIES: $${statement.netCashFromFinancing.toLocaleString()}

NET CHANGE IN CASH AND CASH EQUIVALENTS: $${statement.netChangeInCash.toLocaleString()}
BEGINNING CASH AND CASH EQUIVALENTS: $${statement.beginningCashBalance.toLocaleString()}
ENDING CASH AND CASH EQUIVALENTS: $${statement.endingCashBalance.toLocaleString()}

SUPPLEMENTAL DISCLOSURES
Interest Paid During Period: $${statement.supplementalDisclosures.interestPaidDuringPeriod.toLocaleString()}
Income Taxes Paid During Period: $${statement.supplementalDisclosures.incomeTaxesPaidDuringPeriod.toLocaleString()}

Generated: ${new Date(statement.generatedAt).toLocaleString()}
${statement.approvedBy ? `Approved by: ${statement.approvedBy}` : ''}
${statement.notes ? `Notes: ${statement.notes}` : ''}
`;
}