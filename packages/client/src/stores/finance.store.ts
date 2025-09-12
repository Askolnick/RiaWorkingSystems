import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  invoiceRepository, 
  transactionRepository, 
  financeStatsRepository 
} from '../repositories/finance.repository';
import type { 
  Invoice,
  Transaction,
  FinancialStats,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO
} from '../types';

interface FinanceStore {
  // Invoices
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  invoicesLoading: boolean;
  invoicesError: string | null;
  
  // Transactions
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  transactionsLoading: boolean;
  transactionsError: string | null;
  
  // Statistics
  stats: FinancialStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Filters
  filters: {
    status?: string;
    category?: string;
    dateRange?: { start: string; end: string };
    search: string;
  };
  
  // Invoice actions
  fetchInvoices: () => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (invoice: CreateInvoiceDTO) => Promise<Invoice>;
  updateInvoice: (id: string, updates: UpdateInvoiceDTO) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
  sendInvoice: (id: string) => Promise<void>;
  
  // Transaction actions
  fetchTransactions: () => Promise<void>;
  fetchTransaction: (id: string) => Promise<void>;
  createTransaction: (transaction: CreateTransactionDTO) => Promise<Transaction>;
  updateTransaction: (id: string, updates: UpdateTransactionDTO) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  reconcileTransaction: (id: string) => Promise<void>;
  
  // Statistics actions
  fetchStats: () => Promise<void>;
  
  // Filter actions
  setFilter: (key: keyof FinanceStore['filters'], value: any) => void;
  clearFilters: () => void;
}

export const useFinanceStore = create<FinanceStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      invoices: [],
      currentInvoice: null,
      invoicesLoading: false,
      invoicesError: null,
      
      transactions: [],
      currentTransaction: null,
      transactionsLoading: false,
      transactionsError: null,
      
      stats: null,
      statsLoading: false,
      statsError: null,
      
      filters: {
        search: '',
      },
      
      // Invoice actions
      fetchInvoices: async () => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        
        try {
          const response = await invoiceRepository.instance.findAll(get().filters);
          set(state => {
            state.invoices = response.data;
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to fetch invoices';
            state.invoicesLoading = false;
          });
        }
      },
      
      fetchInvoice: async (id: string) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        
        try {
          const invoice = await invoiceRepository.instance.findById(id);
          set(state => {
            state.currentInvoice = invoice;
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to fetch invoice';
            state.invoicesLoading = false;
          });
        }
      },
      
      createInvoice: async (invoice: CreateInvoiceDTO) => {
        try {
          const newInvoice = await invoiceRepository.instance.create(invoice);
          set(state => {
            state.invoices.push(newInvoice);
          });
          return newInvoice;
        } catch (error) {
          throw error;
        }
      },
      
      updateInvoice: async (id: string, updates: UpdateInvoiceDTO) => {
        try {
          const updatedInvoice = await invoiceRepository.instance.update(id, updates);
          set(state => {
            const index = state.invoices.findIndex(i => i.id === id);
            if (index !== -1) {
              state.invoices[index] = updatedInvoice;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = updatedInvoice;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteInvoice: async (id: string) => {
        try {
          await invoiceRepository.instance.delete(id);
          set(state => {
            state.invoices = state.invoices.filter(i => i.id !== id);
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      markInvoiceAsPaid: async (id: string) => {
        try {
          const updatedInvoice = await invoiceRepository.instance.markAsPaid(id);
          set(state => {
            const index = state.invoices.findIndex(i => i.id === id);
            if (index !== -1) {
              state.invoices[index] = updatedInvoice;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = updatedInvoice;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      sendInvoice: async (id: string) => {
        try {
          await invoiceRepository.instance.sendToClient(id);
          await get().updateInvoice(id, { status: 'sent' });
        } catch (error) {
          throw error;
        }
      },
      
      // Transaction actions
      fetchTransactions: async () => {
        set(state => {
          state.transactionsLoading = true;
          state.transactionsError = null;
        });
        
        try {
          const response = await transactionRepository.instance.findAll(get().filters);
          set(state => {
            state.transactions = response.data;
            state.transactionsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.transactionsError = error instanceof Error ? error.message : 'Failed to fetch transactions';
            state.transactionsLoading = false;
          });
        }
      },
      
      fetchTransaction: async (id: string) => {
        set(state => {
          state.transactionsLoading = true;
          state.transactionsError = null;
        });
        
        try {
          const transaction = await transactionRepository.instance.findById(id);
          set(state => {
            state.currentTransaction = transaction;
            state.transactionsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.transactionsError = error instanceof Error ? error.message : 'Failed to fetch transaction';
            state.transactionsLoading = false;
          });
        }
      },
      
      createTransaction: async (transaction: CreateTransactionDTO) => {
        try {
          const newTransaction = await transactionRepository.instance.create(transaction);
          set(state => {
            state.transactions.push(newTransaction);
          });
          return newTransaction;
        } catch (error) {
          throw error;
        }
      },
      
      updateTransaction: async (id: string, updates: UpdateTransactionDTO) => {
        try {
          const updatedTransaction = await transactionRepository.instance.update(id, updates);
          set(state => {
            const index = state.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
              state.transactions[index] = updatedTransaction;
            }
            if (state.currentTransaction?.id === id) {
              state.currentTransaction = updatedTransaction;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteTransaction: async (id: string) => {
        try {
          await transactionRepository.instance.delete(id);
          set(state => {
            state.transactions = state.transactions.filter(t => t.id !== id);
            if (state.currentTransaction?.id === id) {
              state.currentTransaction = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      reconcileTransaction: async (id: string) => {
        try {
          const updatedTransaction = await transactionRepository.instance.reconcile(id);
          set(state => {
            const index = state.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
              state.transactions[index] = updatedTransaction;
            }
            if (state.currentTransaction?.id === id) {
              state.currentTransaction = updatedTransaction;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      // Statistics actions
      fetchStats: async () => {
        set(state => {
          state.statsLoading = true;
          state.statsError = null;
        });
        
        try {
          const stats = await financeStatsRepository.instance.getOverview();
          set(state => {
            state.stats = stats;
            state.statsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.statsError = error instanceof Error ? error.message : 'Failed to fetch statistics';
            state.statsLoading = false;
          });
        }
      },
      
      // Filter actions
      setFilter: (key, value) => {
        set(state => {
          state.filters[key] = value;
        });
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = { search: '' };
        });
      },
    }))
  )
);