import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { billsRepository } from '../repositories/bills.repository';
import type {
  Bill,
  BillWithItems,
  BillWithRelations,
  BillStats,
  BillFilters,
  BillSort,
  CreateBillData,
  UpdateBillData,
  CreateBillPaymentData,
  CreateBillApprovalData,
} from '@ria/bills-server';

interface LoadingStates {
  bills: boolean;
  stats: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  approving: boolean;
  paying: boolean;
  submitting: boolean;
}

interface BillsState {
  // Data
  bills: Bill[];
  currentBill: BillWithRelations | null;
  stats: BillStats | null;
  vendors: Array<{ id: string; name: string; email?: string }>;
  
  // UI State
  loading: LoadingStates;
  error: string | null;
  
  // Filters and sorting
  filters: BillFilters;
  sort: BillSort;
  currentPage: number;
  totalPages: number;
  
  // Selection
  selectedBills: string[];
}

interface BillsActions {
  // Bill operations
  fetchBills: (page?: number) => Promise<void>;
  fetchBill: (id: string) => Promise<void>;
  createBill: (data: CreateBillData) => Promise<Bill>;
  updateBill: (id: string, data: UpdateBillData) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  duplicateBill: (id: string) => Promise<void>;
  
  // Status operations
  submitForApproval: (id: string) => Promise<void>;
  approveBill: (id: string, comments?: string) => Promise<void>;
  rejectBill: (id: string, reason: string) => Promise<void>;
  markAsPaid: (id: string, paymentData?: CreateBillPaymentData) => Promise<void>;
  cancelBill: (id: string, reason?: string) => Promise<void>;
  
  // Statistics
  fetchStats: () => Promise<void>;
  
  // Vendors
  fetchVendors: (search?: string) => Promise<void>;
  createVendor: (vendor: { name: string; email?: string }) => Promise<void>;
  
  // Filters and sorting
  setFilters: (filters: Partial<BillFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: BillSort) => void;
  setPage: (page: number) => void;
  
  // Selection
  selectBill: (id: string) => void;
  deselectBill: (id: string) => void;
  selectAllBills: () => void;
  clearSelection: () => void;
  
  // Error handling
  clearError: () => void;
}

type BillsStore = BillsState & BillsActions;

const initialLoadingState: LoadingStates = {
  bills: false,
  stats: false,
  creating: false,
  updating: false,
  deleting: false,
  approving: false,
  paying: false,
  submitting: false,
};

export const useBillsStore = create<BillsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      bills: [],
      currentBill: null,
      stats: null,
      vendors: [],
      
      loading: { ...initialLoadingState },
      error: null,
      
      filters: {},
      sort: { field: 'billDate', direction: 'desc' },
      currentPage: 1,
      totalPages: 1,
      
      selectedBills: [],
      
      // Bill operations
      fetchBills: async (page = 1) => {
        set(state => {
          state.loading.bills = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.getBills(
            get().filters,
            get().sort,
            page,
            25
          );
          
          set(state => {
            state.bills = response.data;
            state.currentPage = response.pagination.page;
            state.totalPages = response.pagination.totalPages;
            state.loading.bills = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch bills';
            state.loading.bills = false;
          });
        }
      },
      
      fetchBill: async (id: string) => {
        set(state => {
          state.loading.bills = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.getBillWithRelations(id);
          set(state => {
            state.currentBill = response.data;
            state.loading.bills = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch bill';
            state.loading.bills = false;
          });
        }
      },
      
      createBill: async (data: CreateBillData) => {
        set(state => {
          state.loading.creating = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.createBill(data);
          set(state => {
            state.bills.unshift(response.data);
            state.loading.creating = false;
          });
          return response.data;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create bill';
            state.loading.creating = false;
          });
          throw error;
        }
      },
      
      updateBill: async (id: string, data: UpdateBillData) => {
        set(state => {
          state.loading.updating = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.updateBill(id, data);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.updating = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update bill';
            state.loading.updating = false;
          });
          throw error;
        }
      },
      
      deleteBill: async (id: string) => {
        set(state => {
          state.loading.deleting = true;
          state.error = null;
        });
        
        try {
          await billsRepository.instance.deleteBill(id);
          set(state => {
            state.bills = state.bills.filter(b => b.id !== id);
            if (state.currentBill?.id === id) {
              state.currentBill = null;
            }
            state.selectedBills = state.selectedBills.filter(selectedId => selectedId !== id);
            state.loading.deleting = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete bill';
            state.loading.deleting = false;
          });
          throw error;
        }
      },
      
      duplicateBill: async (id: string) => {
        set(state => {
          state.loading.creating = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.duplicateBill(id);
          set(state => {
            state.bills.unshift(response.data);
            state.loading.creating = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to duplicate bill';
            state.loading.creating = false;
          });
          throw error;
        }
      },
      
      // Status operations
      submitForApproval: async (id: string) => {
        set(state => {
          state.loading.submitting = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.submitForApproval(id);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.submitting = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to submit bill for approval';
            state.loading.submitting = false;
          });
          throw error;
        }
      },
      
      approveBill: async (id: string, comments?: string) => {
        set(state => {
          state.loading.approving = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.approveBill(id, comments);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.approving = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to approve bill';
            state.loading.approving = false;
          });
          throw error;
        }
      },
      
      rejectBill: async (id: string, reason: string) => {
        set(state => {
          state.loading.approving = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.rejectBill(id, reason);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.approving = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to reject bill';
            state.loading.approving = false;
          });
          throw error;
        }
      },
      
      markAsPaid: async (id: string, paymentData?: CreateBillPaymentData) => {
        set(state => {
          state.loading.paying = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.markAsPaid(id, paymentData);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.paying = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to mark bill as paid';
            state.loading.paying = false;
          });
          throw error;
        }
      },
      
      cancelBill: async (id: string, reason?: string) => {
        set(state => {
          state.loading.updating = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.cancelBill(id, reason);
          set(state => {
            const index = state.bills.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bills[index] = response.data;
            }
            if (state.currentBill?.id === id) {
              Object.assign(state.currentBill, response.data);
            }
            state.loading.updating = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to cancel bill';
            state.loading.updating = false;
          });
          throw error;
        }
      },
      
      // Statistics
      fetchStats: async () => {
        set(state => {
          state.loading.stats = true;
          state.error = null;
        });
        
        try {
          const response = await billsRepository.instance.getStats();
          set(state => {
            state.stats = response.data;
            state.loading.stats = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch statistics';
            state.loading.stats = false;
          });
        }
      },
      
      // Vendors
      fetchVendors: async (search?: string) => {
        try {
          const response = await billsRepository.instance.getVendors(search);
          set(state => {
            state.vendors = response.data;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch vendors';
          });
        }
      },
      
      createVendor: async (vendor: { name: string; email?: string }) => {
        try {
          const response = await billsRepository.instance.createVendor(vendor);
          set(state => {
            state.vendors.push(response.data);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create vendor';
          });
          throw error;
        }
      },
      
      // Filters and sorting
      setFilters: (newFilters: Partial<BillFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...newFilters };
          state.currentPage = 1; // Reset to first page when filtering
        });
        // Automatically refetch with new filters
        get().fetchBills(1);
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = {};
          state.currentPage = 1;
        });
        get().fetchBills(1);
      },
      
      setSort: (sort: BillSort) => {
        set(state => {
          state.sort = sort;
          state.currentPage = 1;
        });
        get().fetchBills(1);
      },
      
      setPage: (page: number) => {
        set(state => {
          state.currentPage = page;
        });
        get().fetchBills(page);
      },
      
      // Selection
      selectBill: (id: string) => {
        set(state => {
          if (!state.selectedBills.includes(id)) {
            state.selectedBills.push(id);
          }
        });
      },
      
      deselectBill: (id: string) => {
        set(state => {
          state.selectedBills = state.selectedBills.filter(selectedId => selectedId !== id);
        });
      },
      
      selectAllBills: () => {
        set(state => {
          state.selectedBills = state.bills.map(bill => bill.id);
        });
      },
      
      clearSelection: () => {
        set(state => {
          state.selectedBills = [];
        });
      },
      
      // Error handling
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
    })),
    { name: 'bills-store' }
  )
);