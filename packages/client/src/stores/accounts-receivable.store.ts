import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { accountsReceivableRepository } from '../repositories/accounts-receivable.repository';
import type {
  CustomerAccount,
  ARInvoice,
  ARPayment,
  AgingReport,
  CustomerStatement,
  CollectionCase,
  PaymentApplication,
  CreditMemo,
  CustomerStatementParams,
  PaymentApplicationParams,
  AgingReportFilter,
  CollectionCaseFilter,
  PaymentFilter,
  ARMetrics
} from '@ria/accounts-receivable-server';

interface AccountsReceivableState {
  // Customer Accounts
  customerAccounts: CustomerAccount[];
  currentCustomerAccount: CustomerAccount | null;
  customerAccountsLoading: boolean;
  customerAccountsError: string | null;

  // Invoices
  invoices: ARInvoice[];
  currentInvoice: ARInvoice | null;
  invoicesLoading: boolean;
  invoicesError: string | null;

  // Payments
  payments: ARPayment[];
  currentPayment: ARPayment | null;
  paymentsLoading: boolean;
  paymentsError: string | null;

  // Aging Report
  agingReport: AgingReport | null;
  agingReportLoading: boolean;
  agingReportError: string | null;

  // Customer Statement
  customerStatement: CustomerStatement | null;
  customerStatementLoading: boolean;
  customerStatementError: string | null;

  // Collection Cases
  collectionCases: CollectionCase[];
  currentCollectionCase: CollectionCase | null;
  collectionCasesLoading: boolean;
  collectionCasesError: string | null;

  // Credit Memos
  creditMemos: CreditMemo[];
  currentCreditMemo: CreditMemo | null;
  creditMemosLoading: boolean;
  creditMemosError: string | null;

  // Metrics
  metrics: ARMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;
}

interface AccountsReceivableActions {
  // Customer Accounts
  fetchCustomerAccounts: () => Promise<void>;
  fetchCustomerAccount: (id: string) => Promise<void>;
  createCustomerAccount: (data: Partial<CustomerAccount>) => Promise<void>;
  updateCustomerAccount: (id: string, data: Partial<CustomerAccount>) => Promise<void>;
  deleteCustomerAccount: (id: string) => Promise<void>;
  updateCreditLimit: (customerId: string, newLimit: number) => Promise<void>;

  // Invoices
  fetchInvoices: (customerId?: string) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (data: Partial<ARInvoice>) => Promise<void>;
  updateInvoice: (id: string, data: Partial<ARInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  sendInvoice: (id: string) => Promise<void>;
  recordInvoicePayment: (invoiceId: string, paymentData: Partial<ARPayment>) => Promise<void>;

  // Payments
  fetchPayments: (filter?: PaymentFilter) => Promise<void>;
  fetchPayment: (id: string) => Promise<void>;
  createPayment: (data: Partial<ARPayment>) => Promise<void>;
  applyPayment: (params: PaymentApplicationParams) => Promise<void>;
  reversePayment: (id: string) => Promise<void>;

  // Aging Report
  fetchAgingReport: (filter?: AgingReportFilter) => Promise<void>;
  exportAgingReport: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;

  // Customer Statement
  fetchCustomerStatement: (params: CustomerStatementParams) => Promise<void>;
  sendCustomerStatement: (customerId: string) => Promise<void>;

  // Collection Cases
  fetchCollectionCases: (filter?: CollectionCaseFilter) => Promise<void>;
  fetchCollectionCase: (id: string) => Promise<void>;
  createCollectionCase: (data: Partial<CollectionCase>) => Promise<void>;
  updateCollectionCase: (id: string, data: Partial<CollectionCase>) => Promise<void>;
  closeCollectionCase: (id: string) => Promise<void>;

  // Credit Memos
  fetchCreditMemos: (customerId?: string) => Promise<void>;
  fetchCreditMemo: (id: string) => Promise<void>;
  createCreditMemo: (data: Partial<CreditMemo>) => Promise<void>;
  applyCreditMemo: (creditMemoId: string, invoiceId: string) => Promise<void>;

  // Metrics
  fetchMetrics: () => Promise<void>;
  
  // Clear functions
  clearErrors: () => void;
}

export const useAccountsReceivableStore = create<AccountsReceivableState & AccountsReceivableActions>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      customerAccounts: [],
      currentCustomerAccount: null,
      customerAccountsLoading: false,
      customerAccountsError: null,

      invoices: [],
      currentInvoice: null,
      invoicesLoading: false,
      invoicesError: null,

      payments: [],
      currentPayment: null,
      paymentsLoading: false,
      paymentsError: null,

      agingReport: null,
      agingReportLoading: false,
      agingReportError: null,

      customerStatement: null,
      customerStatementLoading: false,
      customerStatementError: null,

      collectionCases: [],
      currentCollectionCase: null,
      collectionCasesLoading: false,
      collectionCasesError: null,

      creditMemos: [],
      currentCreditMemo: null,
      creditMemosLoading: false,
      creditMemosError: null,

      metrics: null,
      metricsLoading: false,
      metricsError: null,

      // Customer Account Actions
      fetchCustomerAccounts: async () => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          const response = await accountsReceivableRepository.getCustomerAccounts();
          set(state => {
            state.customerAccounts = response.data;
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to fetch customer accounts';
            state.customerAccountsLoading = false;
          });
        }
      },

      fetchCustomerAccount: async (id: string) => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          const account = await accountsReceivableRepository.getCustomerAccount(id);
          set(state => {
            state.currentCustomerAccount = account;
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to fetch customer account';
            state.customerAccountsLoading = false;
          });
        }
      },

      createCustomerAccount: async (data: Partial<CustomerAccount>) => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          const account = await accountsReceivableRepository.createCustomerAccount(data);
          set(state => {
            state.customerAccounts.push(account);
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to create customer account';
            state.customerAccountsLoading = false;
          });
        }
      },

      updateCustomerAccount: async (id: string, data: Partial<CustomerAccount>) => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          const account = await accountsReceivableRepository.updateCustomerAccount(id, data);
          set(state => {
            const index = state.customerAccounts.findIndex(a => a.id === id);
            if (index !== -1) {
              state.customerAccounts[index] = account;
            }
            if (state.currentCustomerAccount?.id === id) {
              state.currentCustomerAccount = account;
            }
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to update customer account';
            state.customerAccountsLoading = false;
          });
        }
      },

      deleteCustomerAccount: async (id: string) => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          await accountsReceivableRepository.deleteCustomerAccount(id);
          set(state => {
            state.customerAccounts = state.customerAccounts.filter(a => a.id !== id);
            if (state.currentCustomerAccount?.id === id) {
              state.currentCustomerAccount = null;
            }
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to delete customer account';
            state.customerAccountsLoading = false;
          });
        }
      },

      updateCreditLimit: async (customerId: string, newLimit: number) => {
        set(state => {
          state.customerAccountsLoading = true;
          state.customerAccountsError = null;
        });
        try {
          await accountsReceivableRepository.updateCreditLimit(customerId, newLimit);
          set(state => {
            const account = state.customerAccounts.find(a => a.customerId === customerId);
            if (account) {
              account.creditLimit = newLimit;
              account.availableCredit = newLimit - account.currentBalance;
            }
            state.customerAccountsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerAccountsError = error instanceof Error ? error.message : 'Failed to update credit limit';
            state.customerAccountsLoading = false;
          });
        }
      },

      // Invoice Actions
      fetchInvoices: async (customerId?: string) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        try {
          const response = await accountsReceivableRepository.getInvoices(customerId);
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
          const invoice = await accountsReceivableRepository.getInvoice(id);
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

      createInvoice: async (data: Partial<ARInvoice>) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        try {
          const invoice = await accountsReceivableRepository.createInvoice(data);
          set(state => {
            state.invoices.push(invoice);
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to create invoice';
            state.invoicesLoading = false;
          });
        }
      },

      updateInvoice: async (id: string, data: Partial<ARInvoice>) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        try {
          const invoice = await accountsReceivableRepository.updateInvoice(id, data);
          set(state => {
            const index = state.invoices.findIndex(i => i.id === id);
            if (index !== -1) {
              state.invoices[index] = invoice;
            }
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = invoice;
            }
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to update invoice';
            state.invoicesLoading = false;
          });
        }
      },

      deleteInvoice: async (id: string) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        try {
          await accountsReceivableRepository.deleteInvoice(id);
          set(state => {
            state.invoices = state.invoices.filter(i => i.id !== id);
            if (state.currentInvoice?.id === id) {
              state.currentInvoice = null;
            }
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to delete invoice';
            state.invoicesLoading = false;
          });
        }
      },

      sendInvoice: async (id: string) => {
        set(state => {
          state.invoicesLoading = true;
          state.invoicesError = null;
        });
        try {
          await accountsReceivableRepository.sendInvoice(id);
          set(state => {
            const invoice = state.invoices.find(i => i.id === id);
            if (invoice) {
              invoice.sentDate = new Date().toISOString();
              invoice.status = 'sent';
            }
            state.invoicesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.invoicesError = error instanceof Error ? error.message : 'Failed to send invoice';
            state.invoicesLoading = false;
          });
        }
      },

      recordInvoicePayment: async (invoiceId: string, paymentData: Partial<ARPayment>) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          const payment = await accountsReceivableRepository.recordPayment({ ...paymentData, invoiceId });
          set(state => {
            state.payments.push(payment);
            const invoice = state.invoices.find(i => i.id === invoiceId);
            if (invoice && payment.amount) {
              invoice.paidAmount = (invoice.paidAmount || 0) + payment.amount;
              invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
              if (invoice.balanceDue <= 0) {
                invoice.status = 'paid';
                invoice.paidDate = new Date().toISOString();
              } else {
                invoice.status = 'partial';
              }
            }
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to record payment';
            state.paymentsLoading = false;
          });
        }
      },

      // Payment Actions
      fetchPayments: async (filter?: PaymentFilter) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          const response = await accountsReceivableRepository.getPayments(filter);
          set(state => {
            state.payments = response.data;
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to fetch payments';
            state.paymentsLoading = false;
          });
        }
      },

      fetchPayment: async (id: string) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          const payment = await accountsReceivableRepository.getPayment(id);
          set(state => {
            state.currentPayment = payment;
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to fetch payment';
            state.paymentsLoading = false;
          });
        }
      },

      createPayment: async (data: Partial<ARPayment>) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          const payment = await accountsReceivableRepository.recordPayment(data);
          set(state => {
            state.payments.push(payment);
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to create payment';
            state.paymentsLoading = false;
          });
        }
      },

      applyPayment: async (params: PaymentApplicationParams) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          const application = await accountsReceivableRepository.applyPayment(params);
          set(state => {
            // Update invoice balances based on application
            params.invoiceIds.forEach((invoiceId, index) => {
              const invoice = state.invoices.find(i => i.id === invoiceId);
              if (invoice && params.amounts[index]) {
                invoice.paidAmount = (invoice.paidAmount || 0) + params.amounts[index];
                invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
                if (invoice.balanceDue <= 0) {
                  invoice.status = 'paid';
                } else {
                  invoice.status = 'partial';
                }
              }
            });
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to apply payment';
            state.paymentsLoading = false;
          });
        }
      },

      reversePayment: async (id: string) => {
        set(state => {
          state.paymentsLoading = true;
          state.paymentsError = null;
        });
        try {
          await accountsReceivableRepository.reversePayment(id);
          set(state => {
            const payment = state.payments.find(p => p.id === id);
            if (payment) {
              payment.status = 'reversed';
              // Update related invoice
              const invoice = state.invoices.find(i => i.id === payment.invoiceId);
              if (invoice && payment.amount) {
                invoice.paidAmount = (invoice.paidAmount || 0) - payment.amount;
                invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
                invoice.status = invoice.paidAmount > 0 ? 'partial' : 'open';
              }
            }
            state.paymentsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.paymentsError = error instanceof Error ? error.message : 'Failed to reverse payment';
            state.paymentsLoading = false;
          });
        }
      },

      // Aging Report Actions
      fetchAgingReport: async (filter?: AgingReportFilter) => {
        set(state => {
          state.agingReportLoading = true;
          state.agingReportError = null;
        });
        try {
          const report = await accountsReceivableRepository.getAgingReport(filter?.asOfDate);
          set(state => {
            state.agingReport = report;
            state.agingReportLoading = false;
          });
        } catch (error) {
          set(state => {
            state.agingReportError = error instanceof Error ? error.message : 'Failed to fetch aging report';
            state.agingReportLoading = false;
          });
        }
      },

      exportAgingReport: async (format: 'pdf' | 'excel' | 'csv') => {
        set(state => {
          state.agingReportLoading = true;
          state.agingReportError = null;
        });
        try {
          // TODO: Implement export functionality
          console.log(`Exporting aging report as ${format}`);
          set(state => {
            state.agingReportLoading = false;
          });
        } catch (error) {
          set(state => {
            state.agingReportError = error instanceof Error ? error.message : 'Failed to export aging report';
            state.agingReportLoading = false;
          });
        }
      },

      // Customer Statement Actions
      fetchCustomerStatement: async (params: CustomerStatementParams) => {
        set(state => {
          state.customerStatementLoading = true;
          state.customerStatementError = null;
        });
        try {
          const statement = await accountsReceivableRepository.getCustomerStatement(params);
          set(state => {
            state.customerStatement = statement;
            state.customerStatementLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerStatementError = error instanceof Error ? error.message : 'Failed to fetch customer statement';
            state.customerStatementLoading = false;
          });
        }
      },

      sendCustomerStatement: async (customerId: string) => {
        set(state => {
          state.customerStatementLoading = true;
          state.customerStatementError = null;
        });
        try {
          await accountsReceivableRepository.sendStatement(customerId);
          set(state => {
            state.customerStatementLoading = false;
          });
        } catch (error) {
          set(state => {
            state.customerStatementError = error instanceof Error ? error.message : 'Failed to send customer statement';
            state.customerStatementLoading = false;
          });
        }
      },

      // Collection Case Actions
      fetchCollectionCases: async (filter?: CollectionCaseFilter) => {
        set(state => {
          state.collectionCasesLoading = true;
          state.collectionCasesError = null;
        });
        try {
          const response = await accountsReceivableRepository.getCollectionCases(filter);
          set(state => {
            state.collectionCases = response.data;
            state.collectionCasesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.collectionCasesError = error instanceof Error ? error.message : 'Failed to fetch collection cases';
            state.collectionCasesLoading = false;
          });
        }
      },

      fetchCollectionCase: async (id: string) => {
        set(state => {
          state.collectionCasesLoading = true;
          state.collectionCasesError = null;
        });
        try {
          const collectionCase = await accountsReceivableRepository.getCollectionCase(id);
          set(state => {
            state.currentCollectionCase = collectionCase;
            state.collectionCasesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.collectionCasesError = error instanceof Error ? error.message : 'Failed to fetch collection case';
            state.collectionCasesLoading = false;
          });
        }
      },

      createCollectionCase: async (data: Partial<CollectionCase>) => {
        set(state => {
          state.collectionCasesLoading = true;
          state.collectionCasesError = null;
        });
        try {
          const collectionCase = await accountsReceivableRepository.createCollectionCase(data);
          set(state => {
            state.collectionCases.push(collectionCase);
            state.collectionCasesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.collectionCasesError = error instanceof Error ? error.message : 'Failed to create collection case';
            state.collectionCasesLoading = false;
          });
        }
      },

      updateCollectionCase: async (id: string, data: Partial<CollectionCase>) => {
        set(state => {
          state.collectionCasesLoading = true;
          state.collectionCasesError = null;
        });
        try {
          const collectionCase = await accountsReceivableRepository.updateCollectionCase(id, data);
          set(state => {
            const index = state.collectionCases.findIndex(c => c.id === id);
            if (index !== -1) {
              state.collectionCases[index] = collectionCase;
            }
            if (state.currentCollectionCase?.id === id) {
              state.currentCollectionCase = collectionCase;
            }
            state.collectionCasesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.collectionCasesError = error instanceof Error ? error.message : 'Failed to update collection case';
            state.collectionCasesLoading = false;
          });
        }
      },

      closeCollectionCase: async (id: string) => {
        set(state => {
          state.collectionCasesLoading = true;
          state.collectionCasesError = null;
        });
        try {
          await accountsReceivableRepository.closeCollectionCase(id);
          set(state => {
            const collectionCase = state.collectionCases.find(c => c.id === id);
            if (collectionCase) {
              collectionCase.status = 'closed';
              collectionCase.closedDate = new Date().toISOString();
            }
            state.collectionCasesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.collectionCasesError = error instanceof Error ? error.message : 'Failed to close collection case';
            state.collectionCasesLoading = false;
          });
        }
      },

      // Credit Memo Actions
      fetchCreditMemos: async (customerId?: string) => {
        set(state => {
          state.creditMemosLoading = true;
          state.creditMemosError = null;
        });
        try {
          const response = await accountsReceivableRepository.getCreditMemos(customerId);
          set(state => {
            state.creditMemos = response.data;
            state.creditMemosLoading = false;
          });
        } catch (error) {
          set(state => {
            state.creditMemosError = error instanceof Error ? error.message : 'Failed to fetch credit memos';
            state.creditMemosLoading = false;
          });
        }
      },

      fetchCreditMemo: async (id: string) => {
        set(state => {
          state.creditMemosLoading = true;
          state.creditMemosError = null;
        });
        try {
          const creditMemo = await accountsReceivableRepository.getCreditMemo(id);
          set(state => {
            state.currentCreditMemo = creditMemo;
            state.creditMemosLoading = false;
          });
        } catch (error) {
          set(state => {
            state.creditMemosError = error instanceof Error ? error.message : 'Failed to fetch credit memo';
            state.creditMemosLoading = false;
          });
        }
      },

      createCreditMemo: async (data: Partial<CreditMemo>) => {
        set(state => {
          state.creditMemosLoading = true;
          state.creditMemosError = null;
        });
        try {
          const creditMemo = await accountsReceivableRepository.createCreditMemo(data);
          set(state => {
            state.creditMemos.push(creditMemo);
            state.creditMemosLoading = false;
          });
        } catch (error) {
          set(state => {
            state.creditMemosError = error instanceof Error ? error.message : 'Failed to create credit memo';
            state.creditMemosLoading = false;
          });
        }
      },

      applyCreditMemo: async (creditMemoId: string, invoiceId: string) => {
        set(state => {
          state.creditMemosLoading = true;
          state.creditMemosError = null;
        });
        try {
          await accountsReceivableRepository.applyCreditMemo(creditMemoId, invoiceId);
          set(state => {
            const creditMemo = state.creditMemos.find(c => c.id === creditMemoId);
            const invoice = state.invoices.find(i => i.id === invoiceId);
            if (creditMemo && invoice) {
              creditMemo.appliedAmount = (creditMemo.appliedAmount || 0) + creditMemo.amount;
              creditMemo.remainingAmount = creditMemo.amount - creditMemo.appliedAmount;
              creditMemo.status = creditMemo.remainingAmount <= 0 ? 'applied' : 'partial';
              
              invoice.paidAmount = (invoice.paidAmount || 0) + creditMemo.amount;
              invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
              invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partial';
            }
            state.creditMemosLoading = false;
          });
        } catch (error) {
          set(state => {
            state.creditMemosError = error instanceof Error ? error.message : 'Failed to apply credit memo';
            state.creditMemosLoading = false;
          });
        }
      },

      // Metrics Actions
      fetchMetrics: async () => {
        set(state => {
          state.metricsLoading = true;
          state.metricsError = null;
        });
        try {
          const metrics = await accountsReceivableRepository.getMetrics();
          set(state => {
            state.metrics = metrics;
            state.metricsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.metricsError = error instanceof Error ? error.message : 'Failed to fetch metrics';
            state.metricsLoading = false;
          });
        }
      },

      // Clear Errors
      clearErrors: () => {
        set(state => {
          state.customerAccountsError = null;
          state.invoicesError = null;
          state.paymentsError = null;
          state.agingReportError = null;
          state.customerStatementError = null;
          state.collectionCasesError = null;
          state.creditMemosError = null;
          state.metricsError = null;
        });
      },
    })),
    {
      name: 'accounts-receivable-store'
    }
  )
);