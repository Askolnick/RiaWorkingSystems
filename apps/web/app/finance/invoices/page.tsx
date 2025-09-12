'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useInvoicesStore } from '@ria/client';
import { Card, Button, Badge, Input, Select, LoadingCard, Alert, ErrorBoundary } from '@ria/web-ui';
import { ROUTES } from '@ria/utils';
import type { InvoiceStatus } from '@ria/invoices-server';

export default function FinanceInvoicesPage() {
  const {
    invoices,
    loading,
    error,
    stats,
    filters,
    sort,
    currentPage,
    totalPages,
    selectedInvoices,
    fetchInvoices,
    fetchStats,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    selectInvoice,
    deselectInvoice,
    selectAllInvoices,
    clearSelection,
    clearError,
    sendInvoice,
    markAsPaid,
    deleteInvoice
  } = useInvoicesStore();

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices, fetchStats]);

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': 
      case 'viewed': return 'secondary';
      case 'partial': return 'warning';
      case 'overdue': return 'error';
      case 'draft': return 'secondary';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: value as InvoiceStatus });
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value || undefined });
  };

  const handleInvoiceAction = async (action: string, invoiceId: string) => {
    try {
      switch (action) {
        case 'send':
          await sendInvoice(invoiceId);
          break;
        case 'mark_paid':
          await markAsPaid(invoiceId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this invoice?')) {
            await deleteInvoice(invoiceId);
          }
          break;
      }
    } catch (error) {
      console.error('Invoice action failed:', error);
    }
  };

  if (loading.invoices && invoices.length === 0) return <LoadingCard />;
  if (error) return <Alert type="error" onClose={clearError}>{error}</Alert>;

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
                <span className="text-gray-900">Invoices</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm">
                New Invoice
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalInvoices}
                  </p>
                </div>
                <div className="text-2xl">📄</div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    ${stats.totalOutstanding.toLocaleString()}
                  </p>
                </div>
                <div className="text-2xl">⏳</div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ${stats.totalOverdueAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices by client, number, or description..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={filters.status || 'all'} 
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {loading.invoices ? 'Loading invoices...' : 'No invoices found.'}
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/finance/invoices/${invoice.id}`} className="text-blue-600 hover:underline font-medium">
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {invoice.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.total.toLocaleString()} {invoice.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(invoice.status)} size="sm">
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleInvoiceAction('send', invoice.id)}
                            disabled={loading.sending}
                          >
                            {invoice.status === 'draft' ? 'Send' : 'Resend'}
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleInvoiceAction('mark_paid', invoice.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {invoices.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} 
              ({invoices.length} invoices)
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
}