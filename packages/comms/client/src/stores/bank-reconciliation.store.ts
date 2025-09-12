import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { bankReconciliationRepository } from '../repositories/bank-reconciliation.repository';
import type {
  BankAccount,
  BankTransaction,
  ReconciliationSession,
  ReconciliationMatch,
  BankReconciliationAdjustment,
  OutstandingItem,
  ReconciliationRule,
  BankStatementImport
} from '@ria/bank-reconciliation-server';

interface BankReconciliationState {
  // Bank Accounts
  bankAccounts: BankAccount[];
  currentAccount: BankAccount | null;
  
  // Transactions
  bankTransactions: BankTransaction[];
  bookTransactions: any[]; // From accounting system
  filteredTransactions: BankTransaction[];
  
  // Reconciliation
  reconciliationSessions: ReconciliationSession[];
  currentSession: ReconciliationSession | null;
  matches: ReconciliationMatch[];
  suggestions: ReconciliationMatch[];
  
  // Adjustments and Outstanding Items
  adjustments: BankReconciliationAdjustment[];
  outstandingItems: OutstandingItem[];
  
  // Rules
  reconciliationRules: ReconciliationRule[];
  
  // Import
  lastImport: BankStatementImport | null;
  
  // Filters and UI State
  transactionFilters: {
    status: string;
    dateRange: { from: string; to: string };
    amountRange: { min?: number; max?: number };
    searchTerm: string;
  };
  
  selectedTransactions: string[];
  
  // Loading states
  loading: boolean;
  accountsLoading: boolean;
  transactionsLoading: boolean;
  matchingLoading: boolean;
  importLoading: boolean;
  
  // Errors
  error: string | null;
  importError: string | null;
}

interface BankReconciliationActions {
  // Bank Accounts
  fetchBankAccounts: () => Promise<void>;
  createBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  setCurrentAccount: (account: BankAccount | null) => void;
  
  // Transactions
  fetchBankTransactions: (accountId: string, params?: any) => Promise<void>;
  importBankStatement: (accountId: string, file: File, format: any) => Promise<void>;
  
  // Matching
  matchTransaction: (bankTransactionId: string, bookTransactionId: string) => Promise<void>;
  unmatchTransaction: (matchId: string) => Promise<void>;
  runAutoMatching: (accountId: string, sessionId?: string) => Promise<void>;
  acceptSuggestion: (suggestion: ReconciliationMatch) => Promise<void>;
  rejectSuggestion: (suggestionId: string) => void;
  
  // Reconciliation Sessions
  fetchReconciliationSessions: (accountId: string) => Promise<void>;
  createReconciliationSession: (session: Omit<ReconciliationSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReconciliationSession: (id: string, updates: Partial<ReconciliationSession>) => Promise<void>;
  completeReconciliation: (id: string) => Promise<void>;
  setCurrentSession: (session: ReconciliationSession | null) => void;
  
  // Adjustments
  createAdjustment: (adjustment: Omit<BankReconciliationAdjustment, 'id' | 'requestedAt'>) => Promise<void>;
  fetchAdjustments: (reconciliationId: string) => Promise<void>;
  approveAdjustment: (id: string, notes?: string) => Promise<void>;
  
  // Outstanding Items
  fetchOutstandingItems: (accountId: string) => Promise<void>;
  createOutstandingItem: (item: any) => Promise<void>;
  clearOutstandingItem: (id: string, clearedDate: string, clearedAmount?: number) => Promise<void>;
  
  // Rules
  fetchReconciliationRules: () => Promise<void>;
  createRule: (rule: any) => Promise<void>;
  updateRule: (id: string, updates: Partial<ReconciliationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  
  // Filters and Selection
  setTransactionFilters: (filters: Partial<BankReconciliationState['transactionFilters']>) => void;
  setSelectedTransactions: (transactionIds: string[]) => void;
  toggleTransactionSelection: (transactionId: string) => void;
  selectAllTransactions: () => void;
  clearSelection: () => void;
  
  // Utilities
  clearError: () => void;
  clearImportError: () => void;
  refreshData: (accountId?: string) => Promise<void>;
}

type BankReconciliationStore = BankReconciliationState & BankReconciliationActions;

export const useBankReconciliationStore = create<BankReconciliationStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      bankAccounts: [],
      currentAccount: null,
      bankTransactions: [],
      bookTransactions: [],
      filteredTransactions: [],
      reconciliationSessions: [],
      currentSession: null,
      matches: [],
      suggestions: [],
      adjustments: [],
      outstandingItems: [],
      reconciliationRules: [],
      lastImport: null,
      transactionFilters: {
        status: 'all',
        dateRange: {
          from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        },
        searchTerm: ''
      },
      selectedTransactions: [],
      loading: false,
      accountsLoading: false,
      transactionsLoading: false,
      matchingLoading: false,
      importLoading: false,
      error: null,
      importError: null,

      // Bank Accounts
      fetchBankAccounts: async () => {
        set(state => { state.accountsLoading = true; state.error = null; });
        try {
          const accounts = await bankReconciliationRepository.getBankAccounts();
          set(state => {
            state.bankAccounts = accounts;
            state.accountsLoading = false;
            if (!state.currentAccount && accounts.length > 0) {
              state.currentAccount = accounts[0];
            }
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.accountsLoading = false;
          });
        }
      },

      createBankAccount: async (accountData) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const account = await bankReconciliationRepository.createBankAccount(accountData);
          set(state => {
            state.bankAccounts.push(account);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateBankAccount: async (id, updates) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const updatedAccount = await bankReconciliationRepository.updateBankAccount(id, updates);
          set(state => {
            const index = state.bankAccounts.findIndex(a => a.id === id);
            if (index !== -1) {
              state.bankAccounts[index] = updatedAccount;
            }
            if (state.currentAccount?.id === id) {
              state.currentAccount = updatedAccount;
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

      deleteBankAccount: async (id) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          await bankReconciliationRepository.deleteBankAccount(id);
          set(state => {
            state.bankAccounts = state.bankAccounts.filter(a => a.id !== id);
            if (state.currentAccount?.id === id) {
              state.currentAccount = state.bankAccounts[0] || null;
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

      setCurrentAccount: (account) => {
        set(state => {
          state.currentAccount = account;
          state.bankTransactions = [];
          state.filteredTransactions = [];
          state.selectedTransactions = [];
        });
        
        if (account) {
          get().fetchBankTransactions(account.id);
          get().fetchReconciliationSessions(account.id);
          get().fetchOutstandingItems(account.id);
        }
      },

      // Transactions
      fetchBankTransactions: async (accountId, params) => {
        set(state => { state.transactionsLoading = true; state.error = null; });
        try {
          const transactions = await bankReconciliationRepository.getBankTransactions(accountId, params);
          set(state => {
            state.bankTransactions = transactions;
            state.filteredTransactions = transactions;
            state.transactionsLoading = false;
          });
          
          // Apply current filters
          get().applyFilters();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.transactionsLoading = false;
          });
        }
      },

      importBankStatement: async (accountId, file, format) => {
        set(state => { state.importLoading = true; state.importError = null; });
        try {
          const importResult = await bankReconciliationRepository.importBankStatement(accountId, file, format);
          set(state => {
            state.lastImport = importResult;
            state.importLoading = false;
          });
          
          // Refresh transactions after import
          await get().fetchBankTransactions(accountId);
        } catch (error: any) {
          set(state => {
            state.importError = error.message;
            state.importLoading = false;
          });
        }
      },

      // Matching
      matchTransaction: async (bankTransactionId, bookTransactionId) => {
        set(state => { state.matchingLoading = true; state.error = null; });
        try {
          const match = await bankReconciliationRepository.matchTransactions(bankTransactionId, bookTransactionId);
          set(state => {
            state.matches.push(match);
            // Update transaction status
            const transaction = state.bankTransactions.find(t => t.id === bankTransactionId);
            if (transaction) {
              transaction.status = 'matched';
              transaction.matchedTransactionId = bookTransactionId;
            }
            state.matchingLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.matchingLoading = false;
          });
        }
      },

      unmatchTransaction: async (matchId) => {
        set(state => { state.matchingLoading = true; state.error = null; });
        try {
          await bankReconciliationRepository.unmatchTransaction(matchId);
          set(state => {
            const matchIndex = state.matches.findIndex(m => m.id === matchId);
            if (matchIndex !== -1) {
              const match = state.matches[matchIndex];
              // Update transaction status
              const transaction = state.bankTransactions.find(t => t.id === match.bankTransactionId);
              if (transaction) {
                transaction.status = 'unreconciled';
                transaction.matchedTransactionId = undefined;
              }
              state.matches.splice(matchIndex, 1);
            }
            state.matchingLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.matchingLoading = false;
          });
        }
      },

      runAutoMatching: async (accountId, sessionId) => {
        set(state => { state.matchingLoading = true; state.error = null; });
        try {
          const result = await bankReconciliationRepository.runAutoMatching(accountId, sessionId);
          set(state => {
            state.suggestions = result.suggestions;
            state.matchingLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.matchingLoading = false;
          });
        }
      },

      acceptSuggestion: async (suggestion) => {
        await get().matchTransaction(suggestion.bankTransactionId, suggestion.bookTransactionId || '');
        set(state => {
          state.suggestions = state.suggestions.filter(s => s.id !== suggestion.id);
        });
      },

      rejectSuggestion: (suggestionId) => {
        set(state => {
          state.suggestions = state.suggestions.filter(s => s.id !== suggestionId);
        });
      },

      // Reconciliation Sessions
      fetchReconciliationSessions: async (accountId) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const sessions = await bankReconciliationRepository.getReconciliationSessions(accountId);
          set(state => {
            state.reconciliationSessions = sessions;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      createReconciliationSession: async (sessionData) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const session = await bankReconciliationRepository.createReconciliationSession(sessionData);
          set(state => {
            state.reconciliationSessions.unshift(session);
            state.currentSession = session;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateReconciliationSession: async (id, updates) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const updatedSession = await bankReconciliationRepository.updateReconciliationSession(id, updates);
          set(state => {
            const index = state.reconciliationSessions.findIndex(s => s.id === id);
            if (index !== -1) {
              state.reconciliationSessions[index] = updatedSession;
            }
            if (state.currentSession?.id === id) {
              state.currentSession = updatedSession;
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

      completeReconciliation: async (id) => {
        await get().updateReconciliationSession(id, { status: 'completed' });
      },

      setCurrentSession: (session) => {
        set(state => {
          state.currentSession = session;
        });
        
        if (session) {
          get().fetchAdjustments(session.id);
        }
      },

      // Outstanding Items
      fetchOutstandingItems: async (accountId) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const items = await bankReconciliationRepository.getOutstandingItems(accountId);
          set(state => {
            state.outstandingItems = items;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      createOutstandingItem: async (itemData) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const item = await bankReconciliationRepository.createOutstandingItem(itemData);
          set(state => {
            state.outstandingItems.push(item);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      clearOutstandingItem: async (id, clearedDate, clearedAmount) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const updatedItem = await bankReconciliationRepository.clearOutstandingItem(id, clearedDate, clearedAmount);
          set(state => {
            const index = state.outstandingItems.findIndex(item => item.id === id);
            if (index !== -1) {
              state.outstandingItems[index] = updatedItem;
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

      // Adjustments
      createAdjustment: async (adjustmentData) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const adjustment = await bankReconciliationRepository.createAdjustment(adjustmentData);
          set(state => {
            state.adjustments.push(adjustment);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchAdjustments: async (reconciliationId) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const adjustments = await bankReconciliationRepository.getAdjustments(reconciliationId);
          set(state => {
            state.adjustments = adjustments;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      approveAdjustment: async (id, notes) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const approvedAdjustment = await bankReconciliationRepository.approveAdjustment(id, notes);
          set(state => {
            const index = state.adjustments.findIndex(adj => adj.id === id);
            if (index !== -1) {
              state.adjustments[index] = approvedAdjustment;
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

      // Rules
      fetchReconciliationRules: async () => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const rules = await bankReconciliationRepository.getReconciliationRules();
          set(state => {
            state.reconciliationRules = rules;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      createRule: async (ruleData) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const rule = await bankReconciliationRepository.createRule(ruleData);
          set(state => {
            state.reconciliationRules.push(rule);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateRule: async (id, updates) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          const updatedRule = await bankReconciliationRepository.updateRule(id, updates);
          set(state => {
            const index = state.reconciliationRules.findIndex(r => r.id === id);
            if (index !== -1) {
              state.reconciliationRules[index] = updatedRule;
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

      deleteRule: async (id) => {
        set(state => { state.loading = true; state.error = null; });
        try {
          await bankReconciliationRepository.deleteRule(id);
          set(state => {
            state.reconciliationRules = state.reconciliationRules.filter(r => r.id !== id);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      // Filters and Selection
      setTransactionFilters: (filters) => {
        set(state => {
          state.transactionFilters = { ...state.transactionFilters, ...filters };
        });
        get().applyFilters();
      },

      applyFilters: () => {
        set(state => {
          const { status, dateRange, amountRange, searchTerm } = state.transactionFilters;
          let filtered = [...state.bankTransactions];

          // Status filter
          if (status !== 'all') {
            filtered = filtered.filter(t => t.status === status);
          }

          // Date range filter
          if (dateRange.from) {
            filtered = filtered.filter(t => t.date >= dateRange.from);
          }
          if (dateRange.to) {
            filtered = filtered.filter(t => t.date <= dateRange.to);
          }

          // Amount range filter
          if (amountRange?.min !== undefined) {
            filtered = filtered.filter(t => Math.abs(t.amount) >= amountRange.min!);
          }
          if (amountRange?.max !== undefined) {
            filtered = filtered.filter(t => Math.abs(t.amount) <= amountRange.max!);
          }

          // Search filter
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
              t.description.toLowerCase().includes(term) ||
              t.referenceNumber?.toLowerCase().includes(term) ||
              t.checkNumber?.toLowerCase().includes(term)
            );
          }

          state.filteredTransactions = filtered;
        });
      },

      setSelectedTransactions: (transactionIds) => {
        set(state => {
          state.selectedTransactions = transactionIds;
        });
      },

      toggleTransactionSelection: (transactionId) => {
        set(state => {
          const index = state.selectedTransactions.indexOf(transactionId);
          if (index === -1) {
            state.selectedTransactions.push(transactionId);
          } else {
            state.selectedTransactions.splice(index, 1);
          }
        });
      },

      selectAllTransactions: () => {
        set(state => {
          state.selectedTransactions = state.filteredTransactions.map(t => t.id);
        });
      },

      clearSelection: () => {
        set(state => {
          state.selectedTransactions = [];
        });
      },

      // Utilities
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      clearImportError: () => {
        set(state => {
          state.importError = null;
        });
      },

      refreshData: async (accountId) => {
        const { currentAccount } = get();
        const id = accountId || currentAccount?.id;
        
        if (id) {
          await Promise.all([
            get().fetchBankTransactions(id),
            get().fetchReconciliationSessions(id),
            get().fetchOutstandingItems(id)
          ]);
        }
        
        await get().fetchReconciliationRules();
      }
    })),
    { name: 'bank-reconciliation-store' }
  )
);