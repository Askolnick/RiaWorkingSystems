import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  BalanceSheet,
  GeneralLedgerEntry,
  AccountMapping,
  FinancialRatios,
  ComparativeBalanceSheet,
  GenerateBalanceSheetData,
  UpdateBalanceSheetData,
  BalanceSheetFilters,
  TrendAnalysis,
  FinancialInsight,
  PeriodType,
  BalanceSheetStatus
} from '../../balance-sheet-server/src/types';
import { balanceSheetRepository } from '../repositories/balance-sheet.repository';

interface BalanceSheetState {
  // Balance Sheets
  balanceSheets: BalanceSheet[];
  currentBalanceSheet: BalanceSheet | null;
  comparativeBalanceSheet: ComparativeBalanceSheet | null;
  
  // General Ledger
  generalLedgerEntries: GeneralLedgerEntry[];
  accountMappings: AccountMapping[];
  
  // Analytics
  financialRatios: FinancialRatios | null;
  trends: TrendAnalysis[];
  insights: FinancialInsight[];
  
  // UI State
  loading: boolean;
  generating: boolean;
  exporting: boolean;
  error: string | null;
  filters: BalanceSheetFilters;
  
  // Export State
  exportFormat: 'pdf' | 'excel' | 'csv' | 'json';
  lastExportUrl: string | null;
}

interface BalanceSheetActions {
  // Balance Sheet Management
  fetchBalanceSheets: (filters?: BalanceSheetFilters) => Promise<void>;
  generateBalanceSheet: (data: GenerateBalanceSheetData) => Promise<BalanceSheet>;
  updateBalanceSheet: (id: string, data: UpdateBalanceSheetData) => Promise<BalanceSheet>;
  approveBalanceSheet: (id: string) => Promise<void>;
  setCurrentBalanceSheet: (balanceSheet: BalanceSheet | null) => void;
  
  // Comparative Analysis
  generateComparativeReport: (currentId: string, previousId?: string) => Promise<void>;
  calculateFinancialRatios: (balanceSheetId: string) => Promise<void>;
  
  // General Ledger
  fetchGeneralLedgerEntries: (filters?: any) => Promise<void>;
  postJournalEntry: (entry: Omit<GeneralLedgerEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Export Functions
  exportBalanceSheet: (id: string, format: 'pdf' | 'excel' | 'csv' | 'json') => Promise<string>;
  exportComparativeReport: (format: 'pdf' | 'excel') => Promise<string>;
  exportGeneralLedger: (format: 'csv' | 'excel') => Promise<string>;
  
  // Utility
  setFilters: (filters: Partial<BalanceSheetFilters>) => void;
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

type BalanceSheetStore = BalanceSheetState & BalanceSheetActions;

export const useBalanceSheetStore = create<BalanceSheetStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      balanceSheets: [],
      currentBalanceSheet: null,
      comparativeBalanceSheet: null,
      generalLedgerEntries: [],
      accountMappings: [],
      financialRatios: null,
      trends: [],
      insights: [],
      loading: false,
      generating: false,
      exporting: false,
      error: null,
      filters: {},
      exportFormat: 'pdf',
      lastExportUrl: null,
      
      // Balance Sheet Management
      fetchBalanceSheets: async (filters) => {
        set(state => {
          state.loading = true;
          state.error = null;
          if (filters) state.filters = filters;
        });
        
        try {
          const response = await balanceSheetRepository.findAll({
            filters: get().filters,
            page: 1,
            limit: 100
          });
          
          set(state => {
            state.balanceSheets = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      generateBalanceSheet: async (data) => {
        set(state => {
          state.generating = true;
          state.error = null;
        });
        
        try {
          const response = await balanceSheetRepository.generateBalanceSheet(data);
          
          set(state => {
            state.balanceSheets.push(response.data);
            state.currentBalanceSheet = response.data;
            state.generating = false;
          });
          
          // Auto-calculate ratios
          await get().calculateFinancialRatios(response.data.id);
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.generating = false;
          });
          throw error;
        }
      },
      
      updateBalanceSheet: async (id, data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await balanceSheetRepository.updateBalanceSheet(id, data);
          
          set(state => {
            const index = state.balanceSheets.findIndex(bs => bs.id === id);
            if (index !== -1) {
              state.balanceSheets[index] = response.data;
            }
            if (state.currentBalanceSheet?.id === id) {
              state.currentBalanceSheet = response.data;
            }
            state.loading = false;
          });
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
          throw error;
        }
      },
      
      approveBalanceSheet: async (id) => {
        await get().updateBalanceSheet(id, { status: 'approved' });
      },
      
      setCurrentBalanceSheet: (balanceSheet) => {
        set(state => {
          state.currentBalanceSheet = balanceSheet;
        });
        
        if (balanceSheet) {
          get().calculateFinancialRatios(balanceSheet.id);
        }
      },
      
      // Comparative Analysis
      generateComparativeReport: async (currentId, previousId) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await balanceSheetRepository.getComparativeBalanceSheet(currentId, previousId);
          
          set(state => {
            state.comparativeBalanceSheet = response.data;
            state.trends = response.data.trends;
            state.insights = response.data.insights;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      calculateFinancialRatios: async (balanceSheetId) => {
        try {
          const response = await balanceSheetRepository.getFinancialRatios(balanceSheetId);
          
          set(state => {
            state.financialRatios = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // General Ledger
      fetchGeneralLedgerEntries: async (filters) => {
        try {
          const response = await balanceSheetRepository.getGeneralLedgerEntries(filters);
          
          set(state => {
            state.generalLedgerEntries = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      postJournalEntry: async (entry) => {
        try {
          await balanceSheetRepository.postJournalEntry(entry);
          await get().fetchGeneralLedgerEntries();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Export Functions
      exportBalanceSheet: async (id, format) => {
        set(state => {
          state.exporting = true;
          state.exportFormat = format;
        });
        
        try {
          const balanceSheet = get().balanceSheets.find(bs => bs.id === id);
          if (!balanceSheet) throw new Error('Balance sheet not found');
          
          let exportUrl = '';
          
          switch (format) {
            case 'pdf':
              exportUrl = await generatePDFExport(balanceSheet);
              break;
            case 'excel':
              exportUrl = await generateExcelExport(balanceSheet);
              break;
            case 'csv':
              exportUrl = await generateCSVExport(balanceSheet);
              break;
            case 'json':
              exportUrl = await generateJSONExport(balanceSheet);
              break;
          }
          
          set(state => {
            state.lastExportUrl = exportUrl;
            state.exporting = false;
          });
          
          return exportUrl;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.exporting = false;
          });
          throw error;
        }
      },
      
      exportComparativeReport: async (format) => {
        set(state => {
          state.exporting = true;
        });
        
        try {
          const comparative = get().comparativeBalanceSheet;
          if (!comparative) throw new Error('No comparative report available');
          
          const exportUrl = format === 'pdf' ? 
            await generateComparativePDFExport(comparative) :
            await generateComparativeExcelExport(comparative);
          
          set(state => {
            state.lastExportUrl = exportUrl;
            state.exporting = false;
          });
          
          return exportUrl;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.exporting = false;
          });
          throw error;
        }
      },
      
      exportGeneralLedger: async (format) => {
        set(state => {
          state.exporting = true;
        });
        
        try {
          const entries = get().generalLedgerEntries;
          const exportUrl = format === 'csv' ?
            await generateLedgerCSVExport(entries) :
            await generateLedgerExcelExport(entries);
          
          set(state => {
            state.lastExportUrl = exportUrl;
            state.exporting = false;
          });
          
          return exportUrl;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.exporting = false;
          });
          throw error;
        }
      },
      
      // Utility
      setFilters: (filters) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
        });
        
        get().fetchBalanceSheets();
      },
      
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      refreshAll: async () => {
        await Promise.all([
          get().fetchBalanceSheets(),
          get().fetchGeneralLedgerEntries()
        ]);
      }
    })),
    {
      name: 'balance-sheet-store'
    }
  )
);

// Export helper functions (mock implementations)
async function generatePDFExport(balanceSheet: BalanceSheet): Promise<string> {
  // Create a blob URL for the PDF
  const content = `
    BALANCE SHEET
    Period Ending: ${balanceSheet.periodEnd}
    
    ASSETS
    Current Assets: $${balanceSheet.assets.totalCurrentAssets.toLocaleString()}
    Non-Current Assets: $${balanceSheet.assets.totalNonCurrentAssets.toLocaleString()}
    TOTAL ASSETS: $${balanceSheet.totalAssets.toLocaleString()}
    
    LIABILITIES
    Current Liabilities: $${balanceSheet.liabilities.totalCurrentLiabilities.toLocaleString()}
    Non-Current Liabilities: $${balanceSheet.liabilities.totalNonCurrentLiabilities.toLocaleString()}
    TOTAL LIABILITIES: $${balanceSheet.totalLiabilities.toLocaleString()}
    
    EQUITY
    TOTAL EQUITY: $${balanceSheet.totalEquity.toLocaleString()}
    
    TOTAL LIABILITIES & EQUITY: $${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}
    
    Balance Check: ${balanceSheet.isBalanced ? 'BALANCED ✓' : 'NOT BALANCED ✗'}
  `;
  
  const blob = new Blob([content], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

async function generateExcelExport(balanceSheet: BalanceSheet): Promise<string> {
  // Create CSV content that Excel can open
  const csvContent = [
    ['Balance Sheet', balanceSheet.periodEnd],
    [],
    ['ASSETS'],
    ['Current Assets', balanceSheet.assets.totalCurrentAssets],
    ['  Cash & Cash Equivalents', balanceSheet.assets.currentAssets.totalCashAndEquivalents],
    ['  Accounts Receivable', balanceSheet.assets.currentAssets.netAccountsReceivable],
    ['  Inventory', balanceSheet.assets.currentAssets.totalInventory],
    ['  Short-term Investments', balanceSheet.assets.currentAssets.totalShortTermInvestments],
    ['Non-Current Assets', balanceSheet.assets.totalNonCurrentAssets],
    ['  Property, Plant & Equipment', balanceSheet.assets.nonCurrentAssets.netPPE],
    ['  Intangible Assets', balanceSheet.assets.nonCurrentAssets.netIntangibles],
    ['TOTAL ASSETS', balanceSheet.totalAssets],
    [],
    ['LIABILITIES'],
    ['Current Liabilities', balanceSheet.liabilities.totalCurrentLiabilities],
    ['  Accounts Payable', balanceSheet.liabilities.currentLiabilities.accountsPayable],
    ['  Short-term Debt', balanceSheet.liabilities.currentLiabilities.totalShortTermDebt],
    ['Non-Current Liabilities', balanceSheet.liabilities.totalNonCurrentLiabilities],
    ['  Long-term Debt', balanceSheet.liabilities.nonCurrentLiabilities.totalLongTermDebt],
    ['TOTAL LIABILITIES', balanceSheet.totalLiabilities],
    [],
    ['EQUITY'],
    ['  Common Stock', balanceSheet.equity.commonStock],
    ['  Retained Earnings', balanceSheet.equity.retainedEarnings],
    ['TOTAL EQUITY', balanceSheet.totalEquity],
    [],
    ['TOTAL LIABILITIES & EQUITY', balanceSheet.totalLiabilities + balanceSheet.totalEquity]
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

async function generateCSVExport(balanceSheet: BalanceSheet): Promise<string> {
  const csvContent = `Account,Amount
Cash,${balanceSheet.assets.currentAssets.cash}
Accounts Receivable,${balanceSheet.assets.currentAssets.accountsReceivable}
Inventory,${balanceSheet.assets.currentAssets.totalInventory}
Total Current Assets,${balanceSheet.assets.totalCurrentAssets}
PPE (Net),${balanceSheet.assets.nonCurrentAssets.netPPE}
Total Non-Current Assets,${balanceSheet.assets.totalNonCurrentAssets}
Total Assets,${balanceSheet.totalAssets}
Accounts Payable,${balanceSheet.liabilities.currentLiabilities.accountsPayable}
Total Current Liabilities,${balanceSheet.liabilities.totalCurrentLiabilities}
Long-term Debt,${balanceSheet.liabilities.nonCurrentLiabilities.totalLongTermDebt}
Total Non-Current Liabilities,${balanceSheet.liabilities.totalNonCurrentLiabilities}
Total Liabilities,${balanceSheet.totalLiabilities}
Total Equity,${balanceSheet.totalEquity}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

async function generateJSONExport(balanceSheet: BalanceSheet): Promise<string> {
  const json = JSON.stringify(balanceSheet, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

async function generateComparativePDFExport(comparative: ComparativeBalanceSheet): Promise<string> {
  const content = `
    COMPARATIVE BALANCE SHEET
    Current Period: ${comparative.currentPeriod.periodEnd}
    Previous Period: ${comparative.previousPeriod?.periodEnd || 'N/A'}
    
    CHANGES:
    Total Assets: ${comparative.changes.assets.totalAssets > 0 ? '+' : ''}$${comparative.changes.assets.totalAssets.toLocaleString()} 
    (${comparative.percentageChanges.assets.totalAssets.toFixed(1)}%)
    
    Total Liabilities: ${comparative.changes.liabilities.totalLiabilities > 0 ? '+' : ''}$${comparative.changes.liabilities.totalLiabilities.toLocaleString()}
    (${comparative.percentageChanges.liabilities.totalLiabilities.toFixed(1)}%)
    
    Total Equity: ${comparative.changes.equity.totalEquity > 0 ? '+' : ''}$${comparative.changes.equity.totalEquity.toLocaleString()}
    (${comparative.percentageChanges.equity.totalEquity.toFixed(1)}%)
    
    INSIGHTS:
    ${comparative.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}
  `;
  
  const blob = new Blob([content], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

async function generateComparativeExcelExport(comparative: ComparativeBalanceSheet): Promise<string> {
  const csvContent = [
    ['Comparative Balance Sheet'],
    ['Account', 'Current Period', 'Previous Period', 'Change', '% Change'],
    ['Total Assets', 
     comparative.currentPeriod.totalAssets,
     comparative.previousPeriod?.totalAssets || 0,
     comparative.changes.assets.totalAssets,
     `${comparative.percentageChanges.assets.totalAssets.toFixed(1)}%`],
    ['Total Liabilities',
     comparative.currentPeriod.totalLiabilities,
     comparative.previousPeriod?.totalLiabilities || 0,
     comparative.changes.liabilities.totalLiabilities,
     `${comparative.percentageChanges.liabilities.totalLiabilities.toFixed(1)}%`],
    ['Total Equity',
     comparative.currentPeriod.totalEquity,
     comparative.previousPeriod?.totalEquity || 0,
     comparative.changes.equity.totalEquity,
     `${comparative.percentageChanges.equity.totalEquity.toFixed(1)}%`]
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

async function generateLedgerCSVExport(entries: GeneralLedgerEntry[]): Promise<string> {
  const csvContent = [
    ['Date', 'Account', 'Description', 'Debit', 'Credit', 'Balance'],
    ...entries.map(e => [
      e.transactionDate,
      e.accountName,
      e.description,
      e.debit,
      e.credit,
      e.balance
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

async function generateLedgerExcelExport(entries: GeneralLedgerEntry[]): Promise<string> {
  return generateLedgerCSVExport(entries); // Same format for Excel
}