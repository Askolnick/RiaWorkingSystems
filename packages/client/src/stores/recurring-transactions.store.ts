import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  RecurringTransaction,
  ProcessedTransaction,
  RecurringTransactionTemplate,
  RecurrenceRule,
  CreateRecurringTransactionData,
  UpdateRecurringTransactionData,
  RecurringTransactionFilters,
  RecurringTransactionStats,
  SchedulePreview,
  RecurringTransactionStatus,
  RecurrenceFrequency,
  ProcessedTransactionStatus,
  ApprovalStatus
} from '../../recurring-transactions-server/src/types';
import { recurringTransactionsRepository } from '../repositories/recurring-transactions.repository';

interface RecurringTransactionsState {
  // Recurring Transactions
  recurringTransactions: RecurringTransaction[];
  currentTransaction: RecurringTransaction | null;
  
  // Processed Transactions
  processedTransactions: ProcessedTransaction[];
  
  // Templates and Rules
  templates: RecurringTransactionTemplate[];
  rules: RecurrenceRule[];
  
  // Statistics and Analytics
  stats: RecurringTransactionStats | null;
  schedulePreview: SchedulePreview | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: RecurringTransactionFilters;
  
  // Processing State
  isProcessing: boolean;
  processingSummary: {
    processed: number;
    failed: number;
    total: number;
  } | null;
}

interface RecurringTransactionsActions {
  // Recurring Transactions CRUD
  fetchRecurringTransactions: (filters?: RecurringTransactionFilters) => Promise<void>;
  createRecurringTransaction: (data: CreateRecurringTransactionData) => Promise<RecurringTransaction>;
  updateRecurringTransaction: (id: string, data: UpdateRecurringTransactionData) => Promise<RecurringTransaction>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  setCurrentTransaction: (transaction: RecurringTransaction | null) => void;
  
  // Status Management
  activateTransaction: (id: string) => Promise<void>;
  pauseTransaction: (id: string) => Promise<void>;
  completeTransaction: (id: string) => Promise<void>;
  cancelTransaction: (id: string) => Promise<void>;
  
  // Processing
  processScheduledTransactions: (date?: string) => Promise<void>;
  processTransaction: (id: string, forceProcess?: boolean) => Promise<void>;
  retryFailedTransaction: (processedTransactionId: string) => Promise<void>;
  
  // Processed Transactions
  fetchProcessedTransactions: (recurringTransactionId?: string, filters?: any) => Promise<void>;
  approveTransaction: (processedTransactionId: string) => Promise<void>;
  rejectTransaction: (processedTransactionId: string, reason?: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<RecurringTransactionTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RecurringTransactionTemplate>;
  useTemplate: (templateId: string) => Promise<CreateRecurringTransactionData>;
  
  // Rules
  fetchRules: () => Promise<void>;
  createRule: (rule: Omit<RecurrenceRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RecurrenceRule>;
  updateRule: (id: string, rule: Partial<RecurrenceRule>) => Promise<RecurrenceRule>;
  deleteRule: (id: string) => Promise<void>;
  
  // Analytics
  fetchStats: (dateRange?: { from: string; to: string }) => Promise<void>;
  generateSchedulePreview: (
    schedule: any,
    amount: number,
    currency: string,
    startDate: string,
    endDate?: string
  ) => Promise<void>;
  
  // Filters and Search
  setFilters: (filters: Partial<RecurringTransactionFilters>) => void;
  clearFilters: () => void;
  searchTransactions: (query: string) => Promise<void>;
  
  // Utility Actions
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

type RecurringTransactionsStore = RecurringTransactionsState & RecurringTransactionsActions;

export const useRecurringTransactionsStore = create<RecurringTransactionsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      recurringTransactions: [],
      currentTransaction: null,
      processedTransactions: [],
      templates: [],
      rules: [],
      stats: null,
      schedulePreview: null,
      loading: false,
      error: null,
      filters: {},
      isProcessing: false,
      processingSummary: null,
      
      // Recurring Transactions CRUD
      fetchRecurringTransactions: async (filters) => {
        set(state => {
          state.loading = true;
          state.error = null;
          if (filters) state.filters = { ...state.filters, ...filters };
        });
        
        try {
          const response = await recurringTransactionsRepository.findAll({
            filters: get().filters,
            page: 1,
            limit: 100
          });
          
          set(state => {
            state.recurringTransactions = response.data;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      createRecurringTransaction: async (data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await recurringTransactionsRepository.create(data);
          
          set(state => {
            state.recurringTransactions.push(response.data);
            state.currentTransaction = response.data;
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
      
      updateRecurringTransaction: async (id, data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await recurringTransactionsRepository.update(id, data);
          
          set(state => {
            const index = state.recurringTransactions.findIndex(t => t.id === id);
            if (index !== -1) {
              state.recurringTransactions[index] = response.data;
            }
            if (state.currentTransaction?.id === id) {
              state.currentTransaction = response.data;
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
      
      deleteRecurringTransaction: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          await recurringTransactionsRepository.delete(id);
          
          set(state => {
            state.recurringTransactions = state.recurringTransactions.filter(t => t.id !== id);
            if (state.currentTransaction?.id === id) {
              state.currentTransaction = null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
          throw error;
        }
      },
      
      setCurrentTransaction: (transaction) => {
        set(state => {
          state.currentTransaction = transaction;
        });
      },
      
      // Status Management
      activateTransaction: async (id) => {
        try {
          await get().updateRecurringTransaction(id, { 
            status: 'active',
            isActive: true 
          });
        } catch (error) {
          throw error;
        }
      },
      
      pauseTransaction: async (id) => {
        try {
          await get().updateRecurringTransaction(id, { 
            status: 'paused',
            isActive: false 
          });
        } catch (error) {
          throw error;
        }
      },
      
      completeTransaction: async (id) => {
        try {
          await get().updateRecurringTransaction(id, { 
            status: 'completed',
            isActive: false 
          });
        } catch (error) {
          throw error;
        }
      },
      
      cancelTransaction: async (id) => {
        try {
          await get().updateRecurringTransaction(id, { 
            status: 'cancelled',
            isActive: false 
          });
        } catch (error) {
          throw error;
        }
      },
      
      // Processing
      processScheduledTransactions: async (date) => {
        set(state => {
          state.isProcessing = true;
          state.error = null;
          state.processingSummary = null;
        });
        
        try {
          const response = await recurringTransactionsRepository.processScheduled(date);
          
          set(state => {
            state.processingSummary = {
              processed: response.data.processed,
              failed: response.data.failed,
              total: response.data.total
            };
            state.isProcessing = false;
          });
          
          // Refresh processed transactions
          await get().fetchProcessedTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.isProcessing = false;
          });
        }
      },
      
      processTransaction: async (id, forceProcess = false) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          await recurringTransactionsRepository.processTransaction(id, forceProcess);
          
          set(state => {
            state.loading = false;
          });
          
          // Refresh data
          await get().fetchProcessedTransactions();
          await get().fetchRecurringTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      retryFailedTransaction: async (processedTransactionId) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          await recurringTransactionsRepository.retryProcessedTransaction(processedTransactionId);
          
          set(state => {
            state.loading = false;
          });
          
          await get().fetchProcessedTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },
      
      // Processed Transactions
      fetchProcessedTransactions: async (recurringTransactionId, filters) => {
        try {
          const response = await recurringTransactionsRepository.getProcessedTransactions(
            recurringTransactionId,
            filters
          );
          
          set(state => {
            state.processedTransactions = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      approveTransaction: async (processedTransactionId) => {
        try {
          await recurringTransactionsRepository.approveTransaction(processedTransactionId);
          await get().fetchProcessedTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      rejectTransaction: async (processedTransactionId, reason) => {
        try {
          await recurringTransactionsRepository.rejectTransaction(processedTransactionId, reason);
          await get().fetchProcessedTransactions();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Templates
      fetchTemplates: async () => {
        try {
          const response = await recurringTransactionsRepository.getTemplates();
          
          set(state => {
            state.templates = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      createTemplate: async (template) => {
        try {
          const response = await recurringTransactionsRepository.createTemplate(template);
          
          set(state => {
            state.templates.push(response.data);
          });
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
          throw error;
        }
      },
      
      useTemplate: async (templateId) => {
        try {
          const response = await recurringTransactionsRepository.useTemplate(templateId);
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
          throw error;
        }
      },
      
      // Rules
      fetchRules: async () => {
        try {
          const response = await recurringTransactionsRepository.getRules();
          
          set(state => {
            state.rules = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      createRule: async (rule) => {
        try {
          const response = await recurringTransactionsRepository.createRule(rule);
          
          set(state => {
            state.rules.push(response.data);
          });
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
          throw error;
        }
      },
      
      updateRule: async (id, rule) => {
        try {
          const response = await recurringTransactionsRepository.updateRule(id, rule);
          
          set(state => {
            const index = state.rules.findIndex(r => r.id === id);
            if (index !== -1) {
              state.rules[index] = response.data;
            }
          });
          
          return response.data;
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
          throw error;
        }
      },
      
      deleteRule: async (id) => {
        try {
          await recurringTransactionsRepository.deleteRule(id);
          
          set(state => {
            state.rules = state.rules.filter(r => r.id !== id);
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Analytics
      fetchStats: async (dateRange) => {
        try {
          const response = await recurringTransactionsRepository.getStats(dateRange);
          
          set(state => {
            state.stats = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      generateSchedulePreview: async (schedule, amount, currency, startDate, endDate) => {
        try {
          const response = await recurringTransactionsRepository.previewSchedule(
            schedule,
            amount,
            currency,
            startDate,
            endDate
          );
          
          set(state => {
            state.schedulePreview = response.data;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
          });
        }
      },
      
      // Filters and Search
      setFilters: (filters) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
        });
        
        // Auto-refetch with new filters
        get().fetchRecurringTransactions();
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = {};
        });
        
        get().fetchRecurringTransactions();
      },
      
      searchTransactions: async (query) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await recurringTransactionsRepository.search(query);
          
          set(state => {
            state.recurringTransactions = response.data;
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
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      refreshAll: async () => {
        await Promise.all([
          get().fetchRecurringTransactions(),
          get().fetchProcessedTransactions(),
          get().fetchTemplates(),
          get().fetchRules(),
          get().fetchStats()
        ]);
      }
    })),
    {
      name: 'recurring-transactions-store'
    }
  )
);