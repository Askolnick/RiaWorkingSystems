
// Types for Accounts Receivable
export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  creditLimit: number;
  currentBalance: number;
  overdueBalance: number;
}

export interface ARInvoice {
  id: string;
  customerId: string;
  number: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
  percentage: number;
}
