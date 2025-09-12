// Re-export all types
export * from './types';

// Export utility functions and constants
export const RECONCILIATION_STATUSES = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REVIEW: 'review',
  APPROVED: 'approved'
} as const;

export const BANK_TRANSACTION_STATUSES = {
  UNRECONCILED: 'unreconciled',
  MATCHED: 'matched',
  RECONCILED: 'reconciled',
  IGNORED: 'ignored'
} as const;

export const ADJUSTMENT_TYPES = {
  BANK_ERROR: 'bank_error',
  BOOK_ERROR: 'book_error',
  OUTSTANDING_CHECK: 'outstanding_check',
  DEPOSIT_IN_TRANSIT: 'deposit_in_transit',
  BANK_FEE: 'bank_fee',
  INTEREST: 'interest',
  OTHER: 'other'
} as const;

// Helper functions for bank reconciliation
export function calculateReconciliationDifference(
  bookBalance: number,
  bankBalance: number,
  outstandingChecks: number,
  depositsInTransit: number,
  adjustments: number
): number {
  const adjustedBankBalance = bankBalance - outstandingChecks + depositsInTransit + adjustments;
  return bookBalance - adjustedBankBalance;
}

export function calculateMatchConfidence(
  bankTransaction: any,
  bookTransaction: any
): number {
  let confidence = 0;
  
  // Amount match (40% weight)
  if (Math.abs(bankTransaction.amount - bookTransaction.amount) < 0.01) {
    confidence += 40;
  } else if (Math.abs(bankTransaction.amount - bookTransaction.amount) < 1.00) {
    confidence += 30;
  } else if (Math.abs(bankTransaction.amount - bookTransaction.amount) < 10.00) {
    confidence += 20;
  }
  
  // Date match (30% weight)
  const bankDate = new Date(bankTransaction.date);
  const bookDate = new Date(bookTransaction.date);
  const daysDiff = Math.abs((bankDate.getTime() - bookDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    confidence += 30;
  } else if (daysDiff <= 1) {
    confidence += 25;
  } else if (daysDiff <= 3) {
    confidence += 20;
  } else if (daysDiff <= 7) {
    confidence += 15;
  }
  
  // Description similarity (30% weight)
  const similarity = calculateStringSimilarity(
    bankTransaction.description.toLowerCase(),
    bookTransaction.description.toLowerCase()
  );
  confidence += Math.round(similarity * 30);
  
  return Math.min(confidence, 100);
}

export function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function formatBankAccountNumber(accountNumber: string): string {
  // Mask account number for security (show last 4 digits)
  if (accountNumber.length <= 4) return accountNumber;
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

export function validateBankStatementData(data: any[]): Array<{ row: number; errors: string[] }> {
  const errors: Array<{ row: number; errors: string[] }> = [];
  
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    
    // Check required fields
    if (!row.date) rowErrors.push('Date is required');
    if (!row.description) rowErrors.push('Description is required');
    if (row.amount === undefined || row.amount === null) rowErrors.push('Amount is required');
    
    // Validate date format
    if (row.date && isNaN(Date.parse(row.date))) {
      rowErrors.push('Invalid date format');
    }
    
    // Validate amount
    if (row.amount !== undefined && isNaN(parseFloat(row.amount))) {
      rowErrors.push('Invalid amount format');
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 1, errors: rowErrors });
    }
  });
  
  return errors;
}

export function parseCSVBankStatement(
  csvContent: string,
  fieldMapping: any,
  hasHeader: boolean = true
): { data: any[]; errors: any[] } {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const data: any[] = [];
  const errors: any[] = [];
  
  const startIndex = hasHeader ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    try {
      const fields = parseCSVLine(lines[i]);
      const transaction: any = {};
      
      // Map fields according to configuration
      Object.entries(fieldMapping).forEach(([key, csvColumn]) => {
        if (typeof csvColumn === 'string') {
          const columnIndex = hasHeader 
            ? lines[0].split(',').indexOf(csvColumn)
            : parseInt(csvColumn);
          
          if (columnIndex >= 0 && columnIndex < fields.length) {
            transaction[key] = fields[columnIndex];
          }
        }
      });
      
      // Clean and format data
      if (transaction.amount) {
        transaction.amount = parseFloat(transaction.amount.replace(/[^-0-9.]/g, ''));
      }
      
      if (transaction.date) {
        transaction.date = new Date(transaction.date).toISOString().split('T')[0];
      }
      
      data.push(transaction);
    } catch (error) {
      errors.push({
        row: i + 1,
        message: `Error parsing line: ${error.message}`
      });
    }
  }
  
  return { data, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function generateReconciliationReport(session: any): {
  summary: any;
  details: any;
  adjustments: any[];
  outstandingItems: any[];
} {
  const summary = {
    sessionName: session.sessionName,
    period: `${session.startDate} to ${session.endDate}`,
    startingBookBalance: session.startingBookBalance,
    endingBookBalance: session.endingBookBalance,
    startingBankBalance: session.startingBankBalance,
    endingBankBalance: session.endingBankBalance,
    totalAdjustments: session.adjustmentAmount,
    finalDifference: calculateReconciliationDifference(
      session.endingBookBalance,
      session.endingBankBalance,
      0, // outstanding checks
      0, // deposits in transit
      session.adjustmentAmount
    ),
    reconciliationDate: session.updatedAt,
    reconciledBy: session.createdBy
  };
  
  return {
    summary,
    details: {
      totalTransactions: session.totalTransactions,
      matchedTransactions: session.matchedTransactions,
      unmatchedBankTransactions: session.unmatchedBankTransactions,
      unmatchedBookTransactions: session.unmatchedBookTransactions,
      matchRate: session.totalTransactions > 0 
        ? (session.matchedTransactions / session.totalTransactions) * 100 
        : 0
    },
    adjustments: [], // Would be populated from actual data
    outstandingItems: [] // Would be populated from actual data
  };
}

export function calculateOutstandingItemAging(item: any): {
  daysOutstanding: number;
  ageCategory: '0-30' | '31-60' | '61-90' | '90+';
} {
  const today = new Date();
  const itemDate = new Date(item.date);
  const daysOutstanding = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let ageCategory: '0-30' | '31-60' | '61-90' | '90+';
  if (daysOutstanding <= 30) {
    ageCategory = '0-30';
  } else if (daysOutstanding <= 60) {
    ageCategory = '31-60';
  } else if (daysOutstanding <= 90) {
    ageCategory = '61-90';
  } else {
    ageCategory = '90+';
  }
  
  return { daysOutstanding, ageCategory };
}

// Mock data generators for development
export function generateMockBankAccount(): any {
  return {
    id: `bank_${Date.now()}`,
    tenantId: 'demo-tenant',
    accountNumber: '1234567890',
    accountName: 'Main Checking Account',
    bankName: 'Demo Bank',
    routingNumber: '123456789',
    accountType: 'checking',
    currency: 'USD',
    isActive: true,
    bookBalance: 125750.00,
    bankBalance: 124890.50,
    reconciledBalance: 124890.50,
    lastReconciliationDate: '2024-01-15',
    bankConnection: {
      institutionId: 'demo_bank',
      institutionName: 'Demo Bank',
      connectionType: 'plaid',
      isConnected: true,
      lastSyncDate: '2024-01-16T10:30:00Z'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
    createdBy: 'system'
  };
}

export function generateMockBankTransactions(count: number = 20): any[] {
  const transactions = [];
  const baseDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const isDebit = Math.random() > 0.6;
    const amount = isDebit 
      ? -(Math.random() * 2000 + 10)
      : (Math.random() * 5000 + 100);
    
    transactions.push({
      id: `bank_txn_${Date.now()}_${i}`,
      tenantId: 'demo-tenant',
      bankAccountId: 'bank_123',
      date: date.toISOString().split('T')[0],
      description: isDebit 
        ? ['Office Supplies', 'Utilities Payment', 'Software License', 'Travel Expense'][Math.floor(Math.random() * 4)]
        : ['Client Payment', 'Interest Income', 'Refund', 'Transfer In'][Math.floor(Math.random() * 4)],
      amount: Math.round(amount * 100) / 100,
      transactionType: isDebit ? 'debit' : 'credit',
      checkNumber: isDebit && Math.random() > 0.7 ? `${1000 + Math.floor(Math.random() * 9000)}` : undefined,
      referenceNumber: `REF${Date.now()}${i}`,
      bankTransactionId: `bank_${Date.now()}_${i}`,
      status: ['unreconciled', 'matched', 'reconciled'][Math.floor(Math.random() * 3)],
      matchConfidence: Math.floor(Math.random() * 40) + 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return transactions;
}

export function generateMockReconciliationSession(): any {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    id: `recon_${Date.now()}`,
    tenantId: 'demo-tenant',
    bankAccountId: 'bank_123',
    sessionName: `Reconciliation - ${endDate.toLocaleDateString()}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: 'completed',
    startingBookBalance: 128500.00,
    endingBookBalance: 125750.00,
    startingBankBalance: 128200.00,
    endingBankBalance: 124890.50,
    adjustmentAmount: -859.50,
    totalTransactions: 45,
    matchedTransactions: 42,
    unmatchedBankTransactions: 2,
    unmatchedBookTransactions: 1,
    createdBy: 'john.doe@example.com',
    createdAt: endDate.toISOString(),
    updatedAt: endDate.toISOString()
  };
}