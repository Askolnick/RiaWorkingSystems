    const paymentData = {
      amount: parseFloat(formData.get('amount') as string),
      paymentMethod: formData.get('paymentMethod') as string,
      reference: formData.get('reference') as string,
      notes: formData.get('notes') as string
    };
    
    try {
      await recordInvoicePayment(selectedInvoiceId, paymentData);
      setShowPaymentModal(false);
      setSelectedInvoiceId('');
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const handleExportAgingReport = (format: 'pdf' | 'excel' | 'csv') => {
    // TODO: Implement export functionality
    
  }