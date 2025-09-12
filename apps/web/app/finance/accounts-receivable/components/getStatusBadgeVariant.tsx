  const {
    // State
    customerAccounts,
    invoices,
    payments,
    collectionCases,
    agingReport,
    metrics,
    // Loading states
    customerAccountsLoading,
    invoicesLoading,
    paymentsLoading,
    agingReportLoading,
    metricsLoading,
    // Error states
    customerAccountsError,
    invoicesError,
    paymentsError,
    agingReportError,
    metricsError,
    // Actions
    fetchCustomerAccounts,
    fetchInvoices,
    fetchPayments,
    fetchCollectionCases,
    fetchAgingReport,
    fetchMetrics,
    createCustomerAccount,
    recordInvoicePayment,
    clearErrors
  } = useAccountsReceivableStore();

  useEffect(() => {
    fetchCustomerAccounts();
    fetchInvoices();
    fetchPayments();
    fetchCollectionCases();
    fetchAgingReport();
    fetchMetrics();
  }, []);

  // Update aging report when date changes
  useEffect(() => {
    if (agingAsOfDate) {
      fetchAgingReport({ asOfDate: agingAsOfDate });
    }
  }, [agingAsOfDate, fetchAgingReport]);

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
  }