// src/api.ts
// This file defines the shape of the Finance API consumed by the web
// application. It declares a handful of methods for interacting with
// invoices, bills, payments and bookkeeping entities. When integrating
// your real backend, implement these methods to call your HTTP endpoints
// or GraphQL resolvers. All methods return promises to support async
// operations.

import type {
  Invoice,
  InvoiceLine,
  Payment,
  Bill,
  BillLine,
  TaxRate,
  Account,
  JournalEntry,
  JournalLine,
} from './types';

export interface FinanceApi {
  // Invoices
  listInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'status'> & { lines: Omit<InvoiceLine, 'id'>[] }): Promise<Invoice>;
  recordPayment(invoiceId: string, payment: Omit<Payment, 'id'>): Promise<Payment>;

  // Bills
  listBills(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: Omit<Bill, 'id' | 'status'> & { lines: Omit<BillLine, 'id'>[] }): Promise<Bill>;

  // Expenses (future extension)
  listExpenses(): Promise<any[]>;

  // Tax rates
  listTaxRates(): Promise<TaxRate[]>;
  createTaxRate(rate: Omit<TaxRate, 'id'>): Promise<TaxRate>;

  // Accounts & journals
  listAccounts(): Promise<Account[]>;
  listJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: Omit<JournalEntry, 'id'> & { lines: Omit<JournalLine, 'id'>[] }): Promise<JournalEntry>;
}

// Optionally define a top‑level RiaApi to aggregate multiple modules. For now
// we only expose the finance API, but you can extend this interface with
// messaging, tasks, wiki, etc.
export interface RiaApi {
  finance: FinanceApi;
}