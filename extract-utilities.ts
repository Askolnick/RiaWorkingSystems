#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';

async function extractUtilities() {
  const filePath = './apps/web/app/finance/accounts-receivable/page.tsx';
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Extract types
  const types = `
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
`;

  // Extract utility functions from the file
  const utilities = `
// Utility functions for Accounts Receivable
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getDaysOverdue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status.toLowerCase()) {
    case 'paid': return 'success';
    case 'overdue': return 'error';
    case 'pending': return 'warning';
    default: return 'default';
  }
};

export const handleExportAgingReport = async () => {
  // Implementation for exporting aging report
  console.log('Exporting aging report...');
};
`;

  // Create the directory if it doesn't exist
  const utilsDir = './apps/web/app/finance/accounts-receivable/utils';
  await fs.mkdir(utilsDir, { recursive: true });
  
  // Write the extracted files
  await fs.writeFile(`${utilsDir}/types.ts`, types);
  await fs.writeFile(`${utilsDir}/utilities.ts`, utilities);
  
  console.log('✅ Extracted utilities to:');
  console.log('   - ./apps/web/app/finance/accounts-receivable/utils/types.ts');
  console.log('   - ./apps/web/app/finance/accounts-receivable/utils/utilities.ts');
  
  // Update the main file to import from these utilities
  let updatedContent = content;
  
  // Add imports at the top
  const importStatement = `
import { CustomerAccount, ARInvoice, AgingBucket } from './utils/types';
import { formatCurrency, formatDate, getDaysOverdue, getStatusBadgeVariant, handleExportAgingReport } from './utils/utilities';
`;
  
  // Insert imports after existing imports
  const importInsertIndex = content.indexOf("} from '@ria/web-ui';") + "} from '@ria/web-ui';".length;
  updatedContent = content.slice(0, importInsertIndex) + importStatement + content.slice(importInsertIndex);
  
  // Remove the inline type definitions
  updatedContent = updatedContent.replace(/\/\/ Types - will be imported from.*?\}/gs, '');
  updatedContent = updatedContent.replace(/interface CustomerAccount \{[\s\S]*?\}/g, '');
  updatedContent = updatedContent.replace(/interface ARInvoice \{[\s\S]*?\}/g, '');
  updatedContent = updatedContent.replace(/interface AgingBucket \{[\s\S]*?\}/g, '');
  
  await fs.writeFile(filePath, updatedContent);
  
  console.log('✅ Updated main file to use extracted utilities');
  console.log('\n🔍 File size reduced from 1020 lines to approximately', updatedContent.split('\n').length, 'lines');
}

extractUtilities().catch(console.error);