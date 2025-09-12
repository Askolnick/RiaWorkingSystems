
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
