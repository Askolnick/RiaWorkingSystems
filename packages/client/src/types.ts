// src/types.ts
// Basic TypeScript types for the Finance API. These interfaces mirror the
// finance models defined in Prisma but omit fields that are managed
// internally (like tenantId and createdAt). Use these types on the client
// to build forms and display data. When you implement your real API,
// consider generating types from your Prisma schema instead of maintaining
// parallel definitions.

// User type - basic user information
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  productId?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  number?: string;
  totalCents: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  issuedAt?: string;
  dueAt?: string;
  lines?: InvoiceLine[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountCents: number;
  currency: string;
  paidAt: string;
  method?: string;
  reference?: string;
}

export interface BillLine {
  id: string;
  billId: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Bill {
  id: string;
  vendorId?: string;
  number?: string;
  totalCents: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  issuedAt?: string;
  dueAt?: string;
  lines?: BillLine[];
}

export interface TaxRate {
  id: string;
  country: string;
  region?: string;
  name: string;
  percentage: number;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface JournalLine {
  id: string;
  entryId: string;
  accountId: string;
  debitCents?: number;
  creditCents?: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  memo?: string;
  lines?: JournalLine[];
}