import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Receipt,
  BankAccount,
  BankTransaction,
  TransactionMatch,
  AuditReport,
  CreateReceiptData,
  ConnectBankAccountData,
  GenerateAuditReportData,
  ReceiptFilters,
  TransactionFilters,
  ReceiptStatistics,
  MatchingStatistics,
  MatchStatus,
  ExportFormat
} from '../../receipt-manager-server/src/types';
import { receiptManagerRepository } from '../repositories/receipt-manager.repository';

interface ReceiptManagerState {
  // Receipts
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  
  // Bank Accounts and Transactions
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  currentTransaction: BankTransaction | null;
  
  // Matching
  transactionMatches: TransactionMatch[];
  suggestedMatches: TransactionMatch[];
  currentMatch: TransactionMatch | null;
  
  // Audit Reports
  auditReports: AuditReport[];
  currentReport: AuditReport | null;
  
  // Statistics
  receiptStats: ReceiptStatistics | null;
  matchingStats: MatchingStatistics | null;
  
  // UI State
  loading: boolean;
  syncing: boolean;
  error: string | null;
  receiptFilters: ReceiptFilters;
  transactionFilters: TransactionFilters;
  
  // Processing State
  uploadProgress: number;
  ocrProcessing: boolean;
  matchingInProgress: boolean;
}

interface ReceiptManagerActions {
  // Receipt Management
  fetchReceipts: (filters?: ReceiptFilters) => Promise<void>;
  createReceipt: (data: CreateReceiptData) => Promise<Receipt>;
  updateReceipt: (id: string, data: Partial<Receipt>) => Promise<Receipt>;
  deleteReceipt: (id: string) => Promise<void>;
  setCurrentReceipt: (receipt: Receipt | null) => void;
  
  // Receipt Upload and OCR
  uploadReceiptImage: (receiptId: string, file: File) => Promise<void>;
  processOCR: (receiptId: string) => Promise<void>;
  verifyReceipt: (receiptId: string) => Promise<void>;
  
  // Bank Account Management
  connectBankAccount: (data: ConnectBankAccountData) => Promise<BankAccount>;
  fetchBankAccounts: () => Promise<void>;
  disconnectBankAccount: (accountId: string) => Promise<void>;
  updateBankAccountSettings: (accountId: string, settings: Partial<BankAccount>) => Promise<void>;
  
  // Transaction Management
  fetchBankTransactions: (filters?: TransactionFilters) => Promise<void>;
  syncBankTransactions: (accountId?: string) => Promise<void>;
  setCurrentTransaction: (transaction: BankTransaction | null) => void;
  
  // Transaction-Receipt Matching
  autoMatchAll: () => Promise<void>;
  suggestMatch: (transactionId: string, receiptId: string) => Promise<void>;
  confirmMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string, reason?: string) => Promise<void>;
  manualMatch: (transactionId: string, receiptId: string) => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  
  // Audit and Reporting
  generateAuditReport: (data: GenerateAuditReportData) => Promise<AuditReport>;
  fetchAuditReports: () => Promise<void>;
  exportAuditReport: (reportId: string, format: ExportFormat) => Promise<string>;
  setCurrentReport: (report: AuditReport | null) => void;
  
  // Statistics
  fetchReceiptStatistics: () => Promise<void>;
  fetchMatchingStatistics: () => Promise<void>;
  
  // Filters
  setReceiptFilters: (filters: Partial<ReceiptFilters>) => void;
  setTransactionFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  
  // Utility
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

type ReceiptManagerStore = ReceiptManagerState & ReceiptManagerActions;

export const useReceiptManagerStore = create<ReceiptManagerStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      receipts: [],
      currentReceipt: null,
      bankAccounts: [],
      bankTransactions: [],
      currentTransaction: null,
      transactionMatches: [],
      suggestedMatches: [],
      currentMatch: null,
      auditReports: [],
      currentReport: null,
      receiptStats: null,
      matchingStats: null,
      loading: false,
      syncing: false,
      error: null,
      receiptFilters: {},
      transactionFilters: {},
      uploadProgress: 0,
      ocrProcessing: false,
      matchingInProgress: false,
      
      // Receipt Management
      fetchReceipts: async (filters) => {
        set(state => {
          state.loading = true;
          state.error = null;
          if (filters) state.receiptFilters = filters;
        });
        
        try {
          const response = await receiptManagerRepository.findAll({
            filters: get().receiptFilters,
            page: 1,
            limit: 100
          });
          
          set(state => {
            state.receipts = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      createReceipt: async (data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.createReceipt(data);
          
          set(state => {
            state.receipts.push(response.data);
            state.currentReceipt = response.data;
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
      
      updateReceipt: async (id, data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.update(id, data);
          
          set(state => {
            const index = state.receipts.findIndex(r => r.id === id);
            if (index !== -1) {
              state.receipts[index] = response.data;
            }
            if (state.currentReceipt?.id === id) {
              state.currentReceipt = response.data;
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
      
      deleteReceipt: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          await receiptManagerRepository.delete(id);
          
          set(state => {
            state.receipts = state.receipts.filter(r => r.id !== id);
            if (state.currentReceipt?.id === id) {
              state.currentReceipt = null;
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
      
      setCurrentReceipt: (receipt) => {
        set(state => {
          state.currentReceipt = receipt;
        });
      },
      
      // Receipt Upload and OCR
      uploadReceiptImage: async (receiptId, file) => {
        set(state => {
          state.uploadProgress = 0;
          state.error = null;
        });
        
        try {
          // Mock file upload with progress
          for (let i = 0; i <= 100; i += 20) {
            set(state => {
              state.uploadProgress = i;
            });
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const imageUrl = URL.createObjectURL(file);
          const response = await receiptManagerRepository.uploadReceiptImage(receiptId, imageUrl);
          
          set(state => {
            const index = state.receipts.findIndex(r => r.id === receiptId);
            if (index !== -1) {
              state.receipts[index] = response.data;
            }
            if (state.currentReceipt?.id === receiptId) {
              state.currentReceipt = response.data;
            }
            state.uploadProgress = 0;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.uploadProgress = 0;
          });
        }
      },
      
      processOCR: async (receiptId) => {
        set(state => {
          state.ocrProcessing = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.processOCR(receiptId);
          
          set(state => {
            const index = state.receipts.findIndex(r => r.id === receiptId);
            if (index !== -1) {
              state.receipts[index] = response.data;
            }
            if (state.currentReceipt?.id === receiptId) {
              state.currentReceipt = response.data;
            }
            state.ocrProcessing = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.ocrProcessing = false;
          });
        }
      },
      
      verifyReceipt: async (receiptId) => {
        try {
          const receipt = get().receipts.find(r => r.id === receiptId);
          if (!receipt) throw new Error('Receipt not found');
          
          await get().updateReceipt(receiptId, {
            status: 'verified',
            verificationStatus: 'manually_verified'
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Bank Account Management
      connectBankAccount: async (data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.connectBankAccount(data);
          
          set(state => {
            state.bankAccounts.push(response.data);
            state.loading = false;
          });
          
          // Auto sync transactions after connecting
          await get().syncBankTransactions(response.data.id);
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
          throw error;
        }
      },
      
      fetchBankAccounts: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.getBankAccounts();
          
          set(state => {
            state.bankAccounts = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      disconnectBankAccount: async (accountId) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Remove bank account
          set(state => {
            state.bankAccounts = state.bankAccounts.filter(a => a.id !== accountId);
            state.bankTransactions = state.bankTransactions.filter(t => t.bankAccountId !== accountId);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      updateBankAccountSettings: async (accountId, settings) => {
        try {
          set(state => {
            const index = state.bankAccounts.findIndex(a => a.id === accountId);
            if (index !== -1) {
              Object.assign(state.bankAccounts[index], settings);
            }
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Transaction Management
      fetchBankTransactions: async (filters) => {
        set(state => {
          state.loading = true;
          state.error = null;
          if (filters) state.transactionFilters = filters;
        });
        
        try {
          const response = await receiptManagerRepository.getBankTransactions(get().transactionFilters);
          
          set(state => {
            state.bankTransactions = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      syncBankTransactions: async (accountId) => {
        set(state => {
          state.syncing = true;
          state.error = null;
        });
        
        try {
          const accountsToSync = accountId 
            ? [accountId] 
            : get().bankAccounts.map(a => a.id);
          
          for (const accId of accountsToSync) {
            const response = await receiptManagerRepository.syncBankTransactions(accId);
            
            set(state => {
              state.bankTransactions.push(...response.data);
            });
          }
          
          set(state => {
            state.syncing = false;
          });
          
          // Auto-match new transactions
          await get().autoMatchAll();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.syncing = false;
          });
        }
      },
      
      setCurrentTransaction: (transaction) => {
        set(state => {
          state.currentTransaction = transaction;
        });
      },
      
      // Transaction-Receipt Matching
      autoMatchAll: async () => {
        set(state => {
          state.matchingInProgress = true;
          state.error = null;
        });
        
        try {
          // Auto-match unmatched receipts
          const unmatchedReceipts = get().receipts.filter(
            r => r.matchStatus === 'unmatched'
          );
          
          for (const receipt of unmatchedReceipts) {
            await receiptManagerRepository.autoMatchReceipt(receipt);
          }
          
          // Refresh matches
          const response = await receiptManagerRepository.getMatches();
          
          set(state => {
            state.transactionMatches = response.data;
            state.suggestedMatches = response.data.filter(m => m.status === 'pending');
            state.matchingInProgress = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.matchingInProgress = false;
          });
        }
      },
      
      suggestMatch: async (transactionId, receiptId) => {
        try {
          const transaction = get().bankTransactions.find(t => t.id === transactionId);
          const receipt = get().receipts.find(r => r.id === receiptId);
          
          if (!transaction || !receipt) {
            throw new Error('Transaction or receipt not found');
          }
          
          // Calculate confidence and suggest match
          const response = await receiptManagerRepository.suggestMatch(
            transactionId,
            receiptId,
            85 // Mock confidence
          );
          
          set(state => {
            state.transactionMatches.push(response.data);
            state.suggestedMatches.push(response.data);
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      confirmMatch: async (matchId) => {
        try {
          const response = await receiptManagerRepository.confirmMatch(matchId);
          
          set(state => {
            const index = state.transactionMatches.findIndex(m => m.id === matchId);
            if (index !== -1) {
              state.transactionMatches[index] = response.data;
            }
            state.suggestedMatches = state.suggestedMatches.filter(m => m.id !== matchId);
          });
          
          // Refresh receipts and transactions
          await get().fetchReceipts();
          await get().fetchBankTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      rejectMatch: async (matchId, reason) => {
        try {
          const response = await receiptManagerRepository.rejectMatch(matchId, reason);
          
          set(state => {
            const index = state.transactionMatches.findIndex(m => m.id === matchId);
            if (index !== -1) {
              state.transactionMatches[index] = response.data;
            }
            state.suggestedMatches = state.suggestedMatches.filter(m => m.id !== matchId);
          });
          
          // Refresh receipts and transactions
          await get().fetchReceipts();
          await get().fetchBankTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      manualMatch: async (transactionId, receiptId) => {
        try {
          await get().suggestMatch(transactionId, receiptId);
          
          // Find the created match
          const match = get().transactionMatches.find(
            m => m.transactionId === transactionId && m.receiptId === receiptId
          );
          
          if (match) {
            await get().confirmMatch(match.id);
          }
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      unmatch: async (matchId) => {
        try {
          await get().rejectMatch(matchId, 'Manual unmatch');
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Audit and Reporting
      generateAuditReport: async (data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.generateAuditReport(data);
          
          set(state => {
            state.auditReports.push(response.data);
            state.currentReport = response.data;
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
      
      fetchAuditReports: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.getAuditReports();
          
          set(state => {
            state.auditReports = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      exportAuditReport: async (reportId, format) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await receiptManagerRepository.exportAuditReport(reportId, format);
          
          set(state => {
            const index = state.auditReports.findIndex(r => r.id === reportId);
            if (index !== -1) {
              state.auditReports[index].exportUrl = response.data;
              state.auditReports[index].exportFormat = format;
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
      
      setCurrentReport: (report) => {
        set(state => {
          state.currentReport = report;
        });
      },
      
      // Statistics
      fetchReceiptStatistics: async () => {
        try {
          const response = await receiptManagerRepository.getReceiptStatistics();
          
          set(state => {
            state.receiptStats = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      fetchMatchingStatistics: async () => {
        try {
          const response = await receiptManagerRepository.getMatchingStatistics();
          
          set(state => {
            state.matchingStats = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Filters
      setReceiptFilters: (filters) => {
        set(state => {
          state.receiptFilters = { ...state.receiptFilters, ...filters };
        });
        
        get().fetchReceipts();
      },
      
      setTransactionFilters: (filters) => {
        set(state => {
          state.transactionFilters = { ...state.transactionFilters, ...filters };
        });
        
        get().fetchBankTransactions();
      },
      
      clearFilters: () => {
        set(state => {
          state.receiptFilters = {};
          state.transactionFilters = {};
        });
        
        get().fetchReceipts();
        get().fetchBankTransactions();
      },
      
      // Utility
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      refreshAll: async () => {
        await Promise.all([
          get().fetchReceipts(),
          get().fetchBankAccounts(),
          get().fetchBankTransactions(),
          get().fetchAuditReports(),
          get().fetchReceiptStatistics(),
          get().fetchMatchingStatistics()
        ]);
        
        const matches = await receiptManagerRepository.getMatches();
        set(state => {
          state.transactionMatches = matches.data;
          state.suggestedMatches = matches.data.filter(m => m.status === 'pending');
        });
      }
    })),
    {
      name: 'receipt-manager-store'
    }
  )
);