import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { receiptsRepository } from '../repositories/receipts.repository';
import type {
  Receipt,
  ReceiptFilters,
  ReceiptStatistics,
  CreateReceiptData,
  ApprovalRequest
} from '@ria/receipt-manager-server';

/**
 * Receipt Store State
 */
export interface ReceiptsState {
  // Data
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  statistics: ReceiptStatistics | null;
  approvalRequests: ApprovalRequest[];

  // UI State
  loading: boolean;
  uploading: boolean;
  error: string | null;
  filters: ReceiptFilters;
  selectedIds: string[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Receipt Store Actions
 */
export interface ReceiptsActions {
  // Data fetching
  fetchReceipts: (filters?: ReceiptFilters) => Promise<void>;
  fetchReceiptById: (id: string) => Promise<void>;
  fetchStatistics: (filters?: ReceiptFilters) => Promise<void>;
  
  // Receipt management
  uploadReceipt: (file: File, metadata?: Partial<CreateReceiptData>) => Promise<Receipt>;
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>;
  categorizeReceipt: (id: string, categoryId: string, subcategory?: string) => Promise<void>;
  approveReceipt: (id: string, notes?: string) => Promise<void>;
  rejectReceipt: (id: string, notes?: string) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  
  // Transaction matching
  matchWithTransaction: (receiptId: string, transactionId: string) => Promise<void>;
  
  // Bulk operations
  bulkApprove: (receiptIds: string[], notes?: string) => Promise<void>;
  bulkCategorize: (receiptIds: string[], categoryId: string) => Promise<void>;
  bulkDelete: (receiptIds: string[]) => Promise<void>;
  
  // Export
  exportReceipts: (format: 'pdf' | 'csv' | 'excel', filters?: ReceiptFilters) => Promise<{ url: string; filename: string }>;
  
  // UI actions
  setFilters: (filters: Partial<ReceiptFilters>) => void;
  clearFilters: () => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setCurrentReceipt: (receipt: Receipt | null) => void;
  clearError: () => void;
}

/**
 * Combined store interface
 */
export type ReceiptsStore = ReceiptsState & ReceiptsActions;

/**
 * Initial state
 */
const initialState: ReceiptsState = {
  receipts: [],
  currentReceipt: null,
  statistics: null,
  approvalRequests: [],
  
  loading: false,
  uploading: false,
  error: null,
  filters: {},
  selectedIds: [],
  
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
};

/**
 * Receipts Store
 */
export const useReceiptsStore = create<ReceiptsStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Data fetching
      fetchReceipts: async (filters?: ReceiptFilters) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });

        try {
          const currentFilters = filters || get().filters;
          const response = await receiptsRepository.instance.findAll(currentFilters);
          
          set(state => {
            state.receipts = response.data;
            state.currentPage = response.page;
            state.totalPages = Math.ceil(response.total / response.limit);
            state.hasMore = response.hasMore;
            state.filters = currentFilters;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch receipts';
            state.loading = false;
          });
        }
      },

      fetchReceiptById: async (id: string) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });

        try {
          const receipt = await receiptsRepository.instance.findById(id);
          set(state => {
            state.currentReceipt = receipt;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch receipt';
            state.loading = false;
          });
        }
      },

      fetchStatistics: async (filters?: ReceiptFilters) => {
        try {
          const currentFilters = filters || get().filters;
          const statistics = await receiptsRepository.instance.getStatistics(currentFilters);
          set(state => {
            state.statistics = statistics;
          });
        } catch (error) {
          console.error('Failed to fetch statistics:', error);
        }
      },

      // Receipt management
      uploadReceipt: async (file: File, metadata?: Partial<CreateReceiptData>) => {
        set(state => { 
          state.uploading = true; 
          state.error = null;
        });

        try {
          const formData = new FormData();
          formData.append('file', file);
          
          if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
          }

          const receipt = await receiptsRepository.instance.uploadReceipt(formData);
          
          set(state => {
            state.receipts.unshift(receipt);
            state.uploading = false;
          });

          // Refresh statistics
          get().fetchStatistics();
          
          return receipt;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to upload receipt';
            state.uploading = false;
          });
          throw error;
        }
      },

      updateReceipt: async (id: string, updates: Partial<Receipt>) => {
        try {
          const updated = await receiptsRepository.instance.update(id, updates);
          set(state => {
            const index = state.receipts.findIndex(r => r.id === id);
            if (index !== -1) {
              state.receipts[index] = updated;
            }
            if (state.currentReceipt?.id === id) {
              state.currentReceipt = updated;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update receipt';
          });
          throw error;
        }
      },

      categorizeReceipt: async (id: string, categoryId: string, subcategory?: string) => {
        try {
          const updated = await receiptsRepository.instance.categorizeReceipt(id, categoryId, subcategory);
          set(state => {
            const index = state.receipts.findIndex(r => r.id === id);
            if (index !== -1) {
              state.receipts[index] = updated;
            }
            if (state.currentReceipt?.id === id) {
              state.currentReceipt = updated;
            }
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to categorize receipt';
          });
          throw error;
        }
      },

      approveReceipt: async (id: string, notes?: string) => {
        try {
          await receiptsRepository.instance.updateReceiptStatus(id, 'verified', notes);
          set(state => {
            const receipt = state.receipts.find(r => r.id === id);
            if (receipt) {
              receipt.status = 'verified';
              receipt.verificationStatus = 'manually_verified';
              receipt.notes = notes || receipt.notes;
              receipt.updatedAt = new Date().toISOString();
            }
            if (state.currentReceipt?.id === id) {
              state.currentReceipt.status = 'verified';
              state.currentReceipt.verificationStatus = 'manually_verified';
              state.currentReceipt.notes = notes || state.currentReceipt.notes;
              state.currentReceipt.updatedAt = new Date().toISOString();
            }
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to approve receipt';
          });
          throw error;
        }
      },

      rejectReceipt: async (id: string, notes?: string) => {
        try {
          await receiptsRepository.instance.updateReceiptStatus(id, 'deleted', notes);
          set(state => {
            const receipt = state.receipts.find(r => r.id === id);
            if (receipt) {
              receipt.status = 'deleted';
              receipt.notes = notes || receipt.notes;
              receipt.updatedAt = new Date().toISOString();
            }
            if (state.currentReceipt?.id === id) {
              state.currentReceipt.status = 'deleted';
              state.currentReceipt.notes = notes || state.currentReceipt.notes;
              state.currentReceipt.updatedAt = new Date().toISOString();
            }
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to reject receipt';
          });
          throw error;
        }
      },

      deleteReceipt: async (id: string) => {
        try {
          await receiptsRepository.instance.delete(id);
          set(state => {
            state.receipts = state.receipts.filter(r => r.id !== id);
            if (state.currentReceipt?.id === id) {
              state.currentReceipt = null;
            }
            state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete receipt';
          });
          throw error;
        }
      },

      // Transaction matching
      matchWithTransaction: async (receiptId: string, transactionId: string) => {
        try {
          const updated = await receiptsRepository.instance.matchWithTransaction(receiptId, transactionId);
          set(state => {
            const index = state.receipts.findIndex(r => r.id === receiptId);
            if (index !== -1) {
              state.receipts[index] = updated;
            }
            if (state.currentReceipt?.id === receiptId) {
              state.currentReceipt = updated;
            }
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to match receipt with transaction';
          });
          throw error;
        }
      },

      // Bulk operations
      bulkApprove: async (receiptIds: string[], notes?: string) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });

        try {
          const result = await receiptsRepository.instance.bulkApprove(receiptIds, notes);
          
          set(state => {
            result.successful.forEach(id => {
              const receipt = state.receipts.find(r => r.id === id);
              if (receipt) {
                receipt.status = 'verified';
                receipt.verificationStatus = 'manually_verified';
                receipt.notes = notes || receipt.notes;
                receipt.updatedAt = new Date().toISOString();
              }
            });
            state.selectedIds = [];
            state.loading = false;
          });
          
          // Show feedback for failed operations
          if (result.failed.length > 0) {
            set(state => {
              state.error = `${result.failed.length} receipts failed to approve`;
            });
          }
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to bulk approve receipts';
            state.loading = false;
          });
        }
      },

      bulkCategorize: async (receiptIds: string[], categoryId: string) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });

        try {
          const result = await receiptsRepository.instance.bulkCategorize(receiptIds, categoryId);
          
          set(state => {
            result.successful.forEach(id => {
              const receipt = state.receipts.find(r => r.id === id);
              if (receipt) {
                receipt.category = categoryId;
                receipt.updatedAt = new Date().toISOString();
              }
            });
            state.selectedIds = [];
            state.loading = false;
          });
          
          // Show feedback for failed operations
          if (result.failed.length > 0) {
            set(state => {
              state.error = `${result.failed.length} receipts failed to categorize`;
            });
          }
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to bulk categorize receipts';
            state.loading = false;
          });
        }
      },

      bulkDelete: async (receiptIds: string[]) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });

        try {
          for (const id of receiptIds) {
            await receiptsRepository.instance.delete(id);
          }
          
          set(state => {
            state.receipts = state.receipts.filter(r => !receiptIds.includes(r.id));
            state.selectedIds = [];
            state.loading = false;
          });
          
          // Refresh statistics
          get().fetchStatistics();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to bulk delete receipts';
            state.loading = false;
          });
        }
      },

      // Export
      exportReceipts: async (format: 'pdf' | 'csv' | 'excel', filters?: ReceiptFilters) => {
        try {
          const currentFilters = filters || get().filters;
          const result = await receiptsRepository.instance.exportReceipts(format, currentFilters);
          return result;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to export receipts';
          });
          throw error;
        }
      },

      // UI actions
      setFilters: (filters: Partial<ReceiptFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
        });
        
        // Auto-refresh with new filters
        get().fetchReceipts();
      },

      clearFilters: () => {
        set(state => {
          state.filters = {};
        });
        
        // Refresh with no filters
        get().fetchReceipts();
      },

      setSelectedIds: (ids: string[]) => {
        set(state => {
          state.selectedIds = ids;
        });
      },

      toggleSelection: (id: string) => {
        set(state => {
          if (state.selectedIds.includes(id)) {
            state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
          } else {
            state.selectedIds.push(id);
          }
        });
      },

      selectAll: () => {
        set(state => {
          state.selectedIds = state.receipts.map(r => r.id);
        });
      },

      clearSelection: () => {
        set(state => {
          state.selectedIds = [];
        });
      },

      setCurrentReceipt: (receipt: Receipt | null) => {
        set(state => {
          state.currentReceipt = receipt;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
    }))
  )
);