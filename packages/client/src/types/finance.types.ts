/**
 * Invoice types
 */
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoiceDTO {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id'>[];
  notes?: string;
}

export interface UpdateInvoiceDTO {
  clientName?: string;
  clientEmail?: string;
  dueDate?: string;
  items?: InvoiceItem[];
  status?: Invoice['status'];
  notes?: string;
  paidAt?: string;
}

/**
 * Transaction types
 */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  accountId?: string;
  accountName?: string;
  reference?: string;
  reconciled: boolean;
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  accountId?: string;
  reference?: string;
  tags?: string[];
}

export interface UpdateTransactionDTO {
  date?: string;
  description?: string;
  category?: string;
  type?: 'income' | 'expense';
  amount?: number;
  accountId?: string;
  reference?: string;
  reconciled?: boolean;
  tags?: string[];
}

/**
 * Financial statistics types
 */
export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueByCategory: CategoryRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategoryRevenue {
  category: string;
  amount: number;
}

export interface CashFlowData {
  period: 'weekly' | 'monthly' | 'yearly';
  data: CashFlowEntry[];
}

export interface CashFlowEntry {
  date: string;
  inflow: number;
  outflow: number;
}

export interface ReceivableAging {
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  overNinetyDays: number;
}