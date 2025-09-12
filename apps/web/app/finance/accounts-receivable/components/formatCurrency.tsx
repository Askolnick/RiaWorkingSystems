  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'overdue': return 'error';
      case 'open': return 'info';
      case 'sent': return 'secondary';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }