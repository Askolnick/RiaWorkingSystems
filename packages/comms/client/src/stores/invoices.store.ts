import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { invoicesRepository } from '../repositories';
import type {
  Invoice,
  InvoiceWithItems,
  InvoiceWithRelations,
  InvoiceItem,
  InvoicePayment,
  InvoiceActivity,
  InvoiceReminder,
  InvoiceStats,
  InvoiceAnalytics,
  InvoiceTemplate,
  InvoiceSettings,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateInvoicePaymentData,
  UpdateInvoicePaymentData,
  CreateInvoiceReminderData,
  InvoiceFilters,
  PaymentFilters,
  InvoiceSort,
  BulkInvoiceAction,
  InvoiceExportOptions,
} from '@ria/invoices-server';

interface InvoicesState {
  // Invoices
  invoices: Invoice[];
  currentInvoice: InvoiceWithRelations | null;
  selectedInvoices: string[];
  
  // Related data
  payments: InvoicePayment[];
  templates: InvoiceTemplate[];
  settings: InvoiceSettings | null;
  
  // Statistics
  stats: InvoiceStats | null;
  analytics: InvoiceAnalytics | null;
  
  // Filters and pagination
  filters: InvoiceFilters;
  sort: InvoiceSort;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  
  // UI State
  loading: {
    invoices: boolean;
    currentInvoice: boolean;
    payments: boolean;
    stats: boolean;
    analytics: boolean;
    templates: boolean;
    settings: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    sending: boolean;
  };
  
  error: string | null;
}

interface InvoicesActions {
  // Invoice actions
  fetchInvoices: (page?: number, limit?: number) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (data: CreateInvoiceData) => Promise<string>;
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<string>;
  
  // Invoice status actions
  sendInvoice: (id: string, email?: string) => Promise<void>;
  markAsPaid: (id: string, paymentData?: CreateInvoicePaymentData) => Promise<void>;
  cancelInvoice: (id: string, reason?: string) => Promise<void>;
  
  // Invoice items actions
  addInvoiceItem: (invoiceId: string, item: Omit<InvoiceItem, 'id' | 'tenantId' | 'invoiceId'>) => Promise<void>;
  updateInvoiceItem: (invoiceId: string, itemId: string, item: Partial<InvoiceItem>) => Promise<void>;
  deleteInvoiceItem: (invoiceId: string, itemId: string) => Promise<void>;
  
  // Payment actions
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  createPayment: (data: CreateInvoicePaymentData) => Promise<void>;
  updatePayment: (paymentId: string, data: UpdateInvoicePaymentData) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  
  // Reminder actions
  createReminder: (data: CreateInvoiceReminderData) => Promise<void>;
  sendReminder: (reminderId: string) => Promise<void>;
  
  // Analytics actions
  fetchStats: () => Promise<void>;
  fetchAnalytics: (dateRange?: { from: string; to: string }) => Promise<void>;
  
  // Template actions
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<InvoiceTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (templateId: string, template: Partial<InvoiceTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Settings actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<InvoiceSettings>) => Promise<void>;
  
  // Bulk actions
  performBulkAction: (action: BulkInvoiceAction) => Promise<void>;
  
  // Selection actions
  selectInvoice: (id: string) => void;
  deselectInvoice: (id: string) => void;
  selectAllInvoices: () => void;
  clearSelection: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<InvoiceFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: InvoiceSort) => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  
  // Utility actions
  clearError: () => void;
  setCurrentInvoice: (invoice: InvoiceWithRelations | null) => void;
  
  // Export actions
  exportInvoices: (options: InvoiceExportOptions) => Promise<void>;
  generatePDF: (invoiceId: string) => Promise<Blob>;
}

type InvoicesStore = InvoicesState & InvoicesActions;

export const useInvoicesStore = create<InvoicesStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      invoices: [],
      currentInvoice: null,
      selectedInvoices: [],
      payments: [],
      templates: [],
      settings: null,
      stats: null,
      analytics: null,
      filters: {},
      sort: { field: 'createdAt', direction: 'desc' },
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      loading: {
        invoices: false,
        currentInvoice: false,
        payments: false,
        stats: false,
        analytics: false,
        templates: false,
        settings: false,
        creating: false,
        updating: false,
        deleting: false,
        sending: false,
      },
      error: null,
      
      // Invoice Actions
      fetchInvoices: async (page = 1, limit = 25) => {
        set(state => { 
          state.loading.invoices = true;
          state.error = null;
          state.currentPage = page;
        });
        try {
          const { filters, sort } = get();
          const response = await invoicesRepository.instance.getInvoices(filters, sort, page, limit);
          set(state => { 
            state.invoices = response.data;
            state.currentPage = response.pagination?.page || page;
            state.totalPages = response.pagination?.totalPages || 1;
            state.totalItems = response.pagination?.total || response.data.length;
            state.loading.invoices = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch invoices';
            state.loading.invoices = false;
          });
        }
      },
      
      fetchInvoice: async (id: string) => {
        set(state => { 
          state.loading.currentInvoice = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getInvoiceWithRelations(id);
          set(state => { 
            state.currentInvoice = response.data;
            state.loading.currentInvoice = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch invoice';
            state.loading.currentInvoice = false;
          });
        }
      },
      
      createInvoice: async (data: CreateInvoiceData) => {
        set(state => { 
          state.loading.creating = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.createInvoice(data);
          set(state => { 
            state.invoices.unshift(response.data);
            state.loading.creating = false;
          });
          return response.data.id;
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create invoice';
            state.loading.creating = false;
          });
          throw error;
        }
      },
      
      updateInvoice: async (id: string, data: UpdateInvoiceData) => {
        set(state => { 
          state.loading.updating = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.updateInvoice(id, data);
          set(state => { 
            const index = state.invoices.findIndex(inv => inv.id === id);
            if (index !== -1) {
              state.invoices[index] = response.data;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = { ...state.currentInvoice, ...response.data };
            }
            state.loading.updating = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update invoice';
            state.loading.updating = false;
          });
          throw error;
        }
      },
      
      deleteInvoice: async (id: string) => {
        set(state => { 
          state.loading.deleting = true;
          state.error = null;
        });
        try {
          await invoicesRepository.instance.deleteInvoice(id);
          set(state => { 
            state.invoices = state.invoices.filter(inv => inv.id !== id);
            state.selectedInvoices = state.selectedInvoices.filter(invId => invId !== id);
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = null;
            }
            state.loading.deleting = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete invoice';
            state.loading.deleting = false;
          });
          throw error;
        }
      },
      
      duplicateInvoice: async (id: string) => {
        try {
          const response = await invoicesRepository.instance.duplicateInvoice(id);
          set(state => { 
            state.invoices.unshift(response.data);
          });
          return response.data.id;
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to duplicate invoice';
          });
          throw error;
        }
      },
      
      // Invoice Status Actions
      sendInvoice: async (id: string, email?: string) => {
        set(state => { 
          state.loading.sending = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.sendInvoice(id, email);
          set(state => { 
            const index = state.invoices.findIndex(inv => inv.id === id);
            if (index !== -1) {
              state.invoices[index] = response.data;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = { ...state.currentInvoice, ...response.data };
            }
            state.loading.sending = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to send invoice';
            state.loading.sending = false;
          });
          throw error;
        }
      },
      
      markAsPaid: async (id: string, paymentData?: CreateInvoicePaymentData) => {
        try {
          const response = await invoicesRepository.instance.markAsPaid(id, paymentData);
          set(state => { 
            const index = state.invoices.findIndex(inv => inv.id === id);
            if (index !== -1) {
              state.invoices[index] = response.data;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = { ...state.currentInvoice, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to mark invoice as paid';
          });
          throw error;
        }
      },
      
      cancelInvoice: async (id: string, reason?: string) => {
        try {
          const response = await invoicesRepository.instance.cancelInvoice(id, reason);
          set(state => { 
            const index = state.invoices.findIndex(inv => inv.id === id);
            if (index !== -1) {
              state.invoices[index] = response.data;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = { ...state.currentInvoice, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to cancel invoice';
          });
          throw error;
        }
      },
      
      // Invoice Items Actions
      addInvoiceItem: async (invoiceId: string, item: Omit<InvoiceItem, 'id' | 'tenantId' | 'invoiceId'>) => {
        try {
          const response = await invoicesRepository.instance.addInvoiceItem(invoiceId, item);
          set(state => {
            if (state.currentInvoice?.id === invoiceId) {
              state.currentInvoice.items.push(response.data);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to add invoice item';
          });
          throw error;
        }
      },
      
      updateInvoiceItem: async (invoiceId: string, itemId: string, item: Partial<InvoiceItem>) => {
        try {
          const response = await invoicesRepository.instance.updateInvoiceItem(invoiceId, itemId, item);
          set(state => {
            if (state.currentInvoice?.id === invoiceId) {
              const itemIndex = state.currentInvoice.items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                state.currentInvoice.items[itemIndex] = response.data;
              }
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update invoice item';
          });
          throw error;
        }
      },
      
      deleteInvoiceItem: async (invoiceId: string, itemId: string) => {
        try {
          await invoicesRepository.instance.deleteInvoiceItem(invoiceId, itemId);
          set(state => {
            if (state.currentInvoice?.id === invoiceId) {
              state.currentInvoice.items = state.currentInvoice.items.filter(i => i.id !== itemId);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete invoice item';
          });
          throw error;
        }
      },
      
      // Payment Actions
      fetchPayments: async (filters?: PaymentFilters) => {
        set(state => { 
          state.loading.payments = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getPayments(filters);
          set(state => { 
            state.payments = response.data;
            state.loading.payments = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch payments';
            state.loading.payments = false;
          });
        }
      },
      
      createPayment: async (data: CreateInvoicePaymentData) => {
        try {
          const response = await invoicesRepository.instance.createPayment(data);
          set(state => { 
            state.payments.unshift(response.data);
            if (state.currentInvoice?.id === data.invoiceId) {
              state.currentInvoice.payments.unshift(response.data);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create payment';
          });
          throw error;
        }
      },
      
      updatePayment: async (paymentId: string, data: UpdateInvoicePaymentData) => {
        try {
          const response = await invoicesRepository.instance.updatePayment(paymentId, data);
          set(state => { 
            const index = state.payments.findIndex(p => p.id === paymentId);
            if (index !== -1) {
              state.payments[index] = response.data;
            }
            if (state.currentInvoice) {
              const currentIndex = state.currentInvoice.payments.findIndex(p => p.id === paymentId);
              if (currentIndex !== -1) {
                state.currentInvoice.payments[currentIndex] = response.data;
              }
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update payment';
          });
          throw error;
        }
      },
      
      deletePayment: async (paymentId: string) => {
        try {
          await invoicesRepository.instance.deletePayment(paymentId);
          set(state => { 
            state.payments = state.payments.filter(p => p.id !== paymentId);
            if (state.currentInvoice) {
              state.currentInvoice.payments = state.currentInvoice.payments.filter(p => p.id !== paymentId);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete payment';
          });
          throw error;
        }
      },
      
      // Reminder Actions
      createReminder: async (data: CreateInvoiceReminderData) => {
        try {
          const response = await invoicesRepository.instance.createReminder(data);
          set(state => {
            if (state.currentInvoice?.id === data.invoiceId) {
              state.currentInvoice.reminders.push(response.data);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create reminder';
          });
          throw error;
        }
      },
      
      sendReminder: async (reminderId: string) => {
        try {
          await invoicesRepository.instance.sendReminder(reminderId);
          set(state => {
            if (state.currentInvoice) {
              const reminderIndex = state.currentInvoice.reminders.findIndex(r => r.id === reminderId);
              if (reminderIndex !== -1) {
                state.currentInvoice.reminders[reminderIndex].sent = true;
                state.currentInvoice.reminders[reminderIndex].sentAt = new Date().toISOString();
              }
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to send reminder';
          });
          throw error;
        }
      },
      
      // Analytics Actions
      fetchStats: async () => {
        set(state => { 
          state.loading.stats = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getStats();
          set(state => { 
            state.stats = response.data;
            state.loading.stats = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch stats';
            state.loading.stats = false;
          });
        }
      },
      
      fetchAnalytics: async (dateRange?: { from: string; to: string }) => {
        set(state => { 
          state.loading.analytics = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getAnalytics(dateRange);
          set(state => { 
            state.analytics = response.data;
            state.loading.analytics = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch analytics';
            state.loading.analytics = false;
          });
        }
      },
      
      // Template Actions
      fetchTemplates: async () => {
        set(state => { 
          state.loading.templates = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getTemplates();
          set(state => { 
            state.templates = response.data;
            state.loading.templates = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch templates';
            state.loading.templates = false;
          });
        }
      },
      
      createTemplate: async (template: Omit<InvoiceTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
        try {
          const response = await invoicesRepository.instance.createTemplate(template);
          set(state => { 
            state.templates.push(response.data);
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create template';
          });
          throw error;
        }
      },
      
      updateTemplate: async (templateId: string, template: Partial<InvoiceTemplate>) => {
        try {
          const response = await invoicesRepository.instance.updateTemplate(templateId, template);
          set(state => { 
            const index = state.templates.findIndex(t => t.id === templateId);
            if (index !== -1) {
              state.templates[index] = response.data;
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update template';
          });
          throw error;
        }
      },
      
      deleteTemplate: async (templateId: string) => {
        try {
          await invoicesRepository.instance.deleteTemplate(templateId);
          set(state => { 
            state.templates = state.templates.filter(t => t.id !== templateId);
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete template';
          });
          throw error;
        }
      },
      
      // Settings Actions
      fetchSettings: async () => {
        set(state => { 
          state.loading.settings = true;
          state.error = null;
        });
        try {
          const response = await invoicesRepository.instance.getSettings();
          set(state => { 
            state.settings = response.data;
            state.loading.settings = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch settings';
            state.loading.settings = false;
          });
        }
      },
      
      updateSettings: async (settings: Partial<InvoiceSettings>) => {
        try {
          const response = await invoicesRepository.instance.updateSettings(settings);
          set(state => { 
            state.settings = response.data;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update settings';
          });
          throw error;
        }
      },
      
      // Bulk Actions
      performBulkAction: async (action: BulkInvoiceAction) => {
        try {
          await invoicesRepository.instance.bulkAction(action);
          // Refresh invoices after bulk action
          await get().fetchInvoices(get().currentPage);
          set(state => {
            state.selectedInvoices = [];
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to perform bulk action';
          });
          throw error;
        }
      },
      
      // Selection Actions
      selectInvoice: (id: string) => {
        set(state => {
          if (!state.selectedInvoices.includes(id)) {
            state.selectedInvoices.push(id);
          }
        });
      },
      
      deselectInvoice: (id: string) => {
        set(state => {
          state.selectedInvoices = state.selectedInvoices.filter(invId => invId !== id);
        });
      },
      
      selectAllInvoices: () => {
        set(state => {
          state.selectedInvoices = state.invoices.map(inv => inv.id);
        });
      },
      
      clearSelection: () => {
        set(state => {
          state.selectedInvoices = [];
        });
      },
      
      // Filter Actions
      setFilters: (filters: Partial<InvoiceFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
          state.currentPage = 1;
        });
        // Auto-refresh when filters change
        get().fetchInvoices(1);
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = {};
          state.currentPage = 1;
        });
        // Auto-refresh when filters are cleared
        get().fetchInvoices(1);
      },
      
      setSort: (sort: InvoiceSort) => {
        set(state => {
          state.sort = sort;
          state.currentPage = 1;
        });
        // Auto-refresh when sort changes
        get().fetchInvoices(1);
      },
      
      // Pagination Actions
      setPage: (page: number) => {
        get().fetchInvoices(page);
      },
      
      // Utility Actions
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      setCurrentInvoice: (invoice: InvoiceWithRelations | null) => {
        set(state => {
          state.currentInvoice = invoice;
        });
      },
      
      // Export Actions
      exportInvoices: async (options: InvoiceExportOptions) => {
        try {
          await invoicesRepository.instance.exportInvoices(options);
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to export invoices';
          });
          throw error;
        }
      },
      
      generatePDF: async (invoiceId: string) => {
        try {
          return await invoicesRepository.instance.generatePDF(invoiceId);
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to generate PDF';
          });
          throw error;
        }
      },
    })),
    { name: 'invoices-store' }
  )
);