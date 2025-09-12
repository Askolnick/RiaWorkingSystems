// REFACTOR SUGGESTION: Consider extracting the following utilities:
// - getStatusBadgeVariant (utility, 59 lines)
// - formatCurrency (utility, 18 lines)
// - formatDate (utility, 10 lines)
// - getDaysOverdue (utility, 11 lines)
// - handleExportAgingReport (utility, 20 lines)
// - types (type, 41 lines)

// Original file preserved to prevent breaking changes

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccountsReceivableStore } from '@ria/client';
import { 
  Card, 
  Button, 
  Table, 
  Badge, 
  Alert, 
  LoadingCard, 
  ErrorBoundary, 
  Modal, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Input, 
  Select 
} from '@ria/web-ui';
import { ROUTES } from '@ria/utils';
// Types - will be imported from @ria/accounts-receivable-server when available
interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  creditLimit: number;
  currentBalance: number;
  overdueBalance: number;
}

interface ARInvoice {
  id: string;
  customerId: string;
  number: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface ARPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: string;
}

interface CollectionCase {
  id: string;
  customerId: string;
  status: string;
  priority: string;
  totalAmount: number;
}

interface AgingReport {
  asOfDate: string;
  buckets: AgingBucket[];
  totalOutstanding: number;
}

interface AgingBucket {
  label: string;
  amount: number;
  count: number;
  percentage: number;
}

export default function AccountsReceivablePage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [agingAsOfDate, setAgingAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getAgingBuckets = (report: AgingReport): AgingBucket[] => {
    if (!report || !report.summary) return [];
    
    const summary = report.summary;
    const total = summary.totalAmount || 0;
    
    return [
      {
        label: 'Current',
        amount: summary.current || 0,
        count: summary.currentCount || 0,
        percentage: total > 0 ? ((summary.current || 0) / total) * 100 : 0
      },
      {
        label: '1-30 Days',
        amount: summary.days1to30 || 0,
        count: summary.days1to30Count || 0,
        percentage: total > 0 ? ((summary.days1to30 || 0) / total) * 100 : 0
      },
      {
        label: '31-60 Days',
        amount: summary.days31to60 || 0,
        count: summary.days31to60Count || 0,
        percentage: total > 0 ? ((summary.days31to60 || 0) / total) * 100 : 0
      },
      {
        label: '61-90 Days',
        amount: summary.days61to90 || 0,
        count: summary.days61to90Count || 0,
        percentage: total > 0 ? ((summary.days61to90 || 0) / total) * 100 : 0
      },
      {
        label: '90+ Days',
        amount: summary.over90 || 0,
        count: summary.over90Count || 0,
        percentage: total > 0 ? ((summary.over90 || 0) / total) * 100 : 0
      }
    ];
  };

  const handleCreateCustomer = async (formData: FormData) => {
    const customerData = {
      customerId: formData.get('customerId') as string,
      customerName: formData.get('customerName') as string,
      creditLimit: parseFloat(formData.get('creditLimit') as string) || 0,
      paymentTerms: formData.get('paymentTerms') as string
    };
    
    try {
      await createCustomerAccount(customerData);
      setShowNewCustomerModal(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleRecordPayment = async (formData: FormData) => {
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
    
  };

  if (customerAccountsLoading && customerAccounts.length === 0) return <LoadingCard />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                  <Link href={ROUTES.FINANCE} className="hover:text-gray-700">Finance</Link>
                  <span>/</span>
                  <span className="text-gray-900">Accounts Receivable</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable</h1>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
                <Button size="sm" onClick={() => setShowNewCustomerModal(true)}>
                  New Customer
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Messages */}
          {(customerAccountsError || invoicesError || paymentsError || agingReportError || metricsError) && (
            <Alert type="error" onClose={clearErrors} className="mb-6">
              {customerAccountsError || invoicesError || paymentsError || agingReportError || metricsError}
            </Alert>
          )}

          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(metrics.totalOutstanding)}
                    </p>
                  </div>
                  <div className="text-2xl"></div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(metrics.overdueAmount)}
                    </p>
                  </div>
                  <div className="text-2xl">️</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Days to Pay</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {Math.round(metrics.averageDaysToPay)} days
                    </p>
                  </div>
                  <div className="text-2xl"></div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {customerAccounts.length}
                    </p>
                  </div>
                  <div className="text-2xl"></div>
                </div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aging Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Summary</h3>
                  {agingReportLoading ? (
                    <LoadingCard />
                  ) : agingReport ? (
                    <div className="space-y-4">
                      {getAgingBuckets(agingReport).map((bucket, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{bucket.label}</p>
                            <p className="text-sm text-gray-500">{bucket.count} invoices</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(bucket.amount)}</p>
                            <p className="text-sm text-gray-500">{bucket.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No aging data available</p>
                  )}
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Payment Received</p>
                          <p className="text-sm text-gray-500">
                            {payment.customerName} - {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                        <Badge variant="success" size="sm">
                          {formatCurrency(payment.amount)}
                        </Badge>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-gray-500">No recent activity</p>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              <Card className="overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Accounts</h3>
                    <Button size="sm" onClick={() => setShowNewCustomerModal(true)}>
                      Add Customer
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit Limit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available Credit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Terms
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerAccountsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Loading customers...
                          </td>
                        </tr>
                      ) : customerAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No customers found.
                          </td>
                        </tr>
                      ) : (
                        customerAccounts.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {customer.customerId}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(customer.creditLimit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(customer.currentBalance)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(customer.availableCredit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.paymentTerms}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card className="overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Outstanding Invoices</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search invoices..."
                        className="w-full"
                      />
                    </div>
                    <div className="w-48">
                      <select 
                        value={selectedCustomerId} 
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Customers</option>
                        {customerAccounts.map((customer) => (
                          <option key={customer.id} value={customer.customerId}>
                            {customer.customerName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Overdue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoicesLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            Loading invoices...
                          </td>
                        </tr>
                      ) : invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            No invoices found.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => {
                          const daysOverdue = getDaysOverdue(invoice.dueDate);
                          return (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {invoice.invoiceNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {invoice.customerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(invoice.balanceDue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(invoice.dueDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {daysOverdue > 0 ? `${daysOverdue} days` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={getStatusBadgeVariant(invoice.status)} size="sm">
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoiceId(invoice.id);
                                    setShowPaymentModal(true);
                                  }}
                                >
                                  Record Payment
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card className="overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Loading payments...
                          </td>
                        </tr>
                      ) : payments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No payments found.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.paymentDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                              {payment.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.reference || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections">
              <Card className="overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Collection Cases</h3>
                    <Button size="sm">
                      New Collection Case
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Case #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collectionCases.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No collection cases found.
                          </td>
                        </tr>
                      ) : (
                        collectionCases.map((collectionCase) => (
                          <tr key={collectionCase.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {collectionCase.caseNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {collectionCase.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(collectionCase.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStatusBadgeVariant(collectionCase.status)} size="sm">
                                {collectionCase.status.charAt(0).toUpperCase() + collectionCase.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(collectionCase.createdDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="space-y-6">
                {/* Aging Report Controls */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Aging Report</h3>
                    <div className="flex gap-3">
                      <div>
                        <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">
                          As of Date
                        </label>
                        <input
                          type="date"
                          id="asOfDate"
                          value={agingAsOfDate}
                          onChange={(e) => setAgingAsOfDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExportAgingReport('pdf')}>
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportAgingReport('excel')}>
                          Export Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportAgingReport('csv')}>
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {agingReportLoading ? (
                    <LoadingCard />
                  ) : agingReport ? (
                    <div className="space-y-6">
                      {/* Aging Summary Chart */}
                      <div className="grid grid-cols-5 gap-4">
                        {getAgingBuckets(agingReport).map((bucket, index) => (
                          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">{bucket.label}</h4>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                              {formatCurrency(bucket.amount)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {bucket.count} invoices ({bucket.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Report */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Current
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                1-30 Days
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                31-60 Days
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                61-90 Days
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                90+ Days
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {agingReport.details?.map((detail) => (
                              <tr key={detail.customerId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {detail.customerName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {formatCurrency(detail.current)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {formatCurrency(detail.days1to30)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {formatCurrency(detail.days31to60)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {formatCurrency(detail.days61to90)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {formatCurrency(detail.over90)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                  {formatCurrency(detail.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No aging report data available</p>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* New Customer Modal */}
      <Modal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title="Add New Customer"
      >
        <form action={handleCreateCustomer} className="space-y-4">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Customer ID
            </label>
            <Input
              type="text"
              id="customerId"
              name="customerId"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <Input
              type="text"
              id="customerName"
              name="customerName"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">
              Credit Limit
            </label>
            <Input
              type="number"
              id="creditLimit"
              name="creditLimit"
              step="0.01"
              min="0"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
              Payment Terms
            </label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Net 30">Net 30</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 60">Net 60</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowNewCustomerModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoiceId('');
        }}
        title="Record Payment"
      >
        <form action={handleRecordPayment} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Payment Amount
            </label>
            <Input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              min="0"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Check">Check</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="ACH">ACH</option>
            </select>
          </div>
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Reference Number
            </label>
            <Input
              type="text"
              id="reference"
              name="reference"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedInvoiceId('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </ErrorBoundary>
  );
}