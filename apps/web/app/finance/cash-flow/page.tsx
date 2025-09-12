'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCashFlowStatementStore } from '@ria/client';
import type { CashFlowStatement, GenerateCashFlowStatementData } from '@ria/client';
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

export default function CashFlowPage() {
  const {
    statements,
    loading,
    error,
    filterBy,
    page,
    totalPages,
    hasNextPage,
    fetchStatements,
    generateStatement,
    setFilter,
    clearFilter,
    setPage,
    clearError
  } = useCashFlowStatementStore();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState<GenerateCashFlowStatementData>({
    periodStart: '',
    periodEnd: '',
    periodType: 'monthly',
    method: 'indirect',
    currency: 'USD'
  });

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  const getStatusVariant = (status: CashFlowStatement['status']) => {
    switch (status) {
      case 'published': return 'success';
      case 'approved': return 'primary';
      case 'pending_review': return 'warning';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleFilterChange = (field: keyof typeof filterBy, value: string) => {
    if (value === 'all' || value === '') {
      setFilter({ [field]: undefined });
    } else {
      setFilter({ [field]: value });
    }
  };

  const handleGenerate = async () => {
    try {
      await generateStatement(generateData);
      setShowGenerateModal(false);
      setGenerateData({
        periodStart: '',
        periodEnd: '',
        periodType: 'monthly',
        method: 'indirect',
        currency: 'USD'
      });
    } catch (error) {
      console.error('Failed to generate cash flow statement:', error);
    }
  };

  if (loading && statements.length === 0) return <LoadingCard />;
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
                  <span className="text-gray-900">Cash Flow Statements</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">Cash Flow Statements</h1>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button size="sm" onClick={() => setShowGenerateModal(true)}>
                  Generate Statement
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Type
                </label>
                <Select
                  value={filterBy.periodType || 'all'}
                  onChange={(e) => handleFilterChange('periodType', e.target.value)}
                >
                  <option value="all">All Periods</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method
                </label>
                <Select
                  value={filterBy.method || 'all'}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="direct">Direct</option>
                  <option value="indirect">Indirect</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year
                </label>
                <Select
                  value={filterBy.fiscalYear?.toString() || 'all'}
                  onChange={(e) => handleFilterChange('fiscalYear', e.target.value)}
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filterBy.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                </Select>
              </div>
            </div>
            {(filterBy.periodType || filterBy.method || filterBy.fiscalYear || filterBy.status) && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={clearFilter}>
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>

          {/* Cash Flow Statements Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operating Cash Flow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Free Cash Flow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ending Balance
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
                  {statements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        {loading ? 'Loading statements...' : 'No cash flow statements found.'}
                      </td>
                    </tr>
                  ) : (
                    statements.map((statement) => {
                      const freeCashFlow = statement.netCashFromOperating - 
                        Math.abs(statement.investingActivities.purchaseOfPPE + 
                        statement.investingActivities.purchaseOfIntangibleAssets);

                      return (
                        <tr key={statement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/finance/cash-flow/${statement.id}`} 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {new Date(statement.periodStart).toLocaleDateString()} - {' '}
                              {new Date(statement.periodEnd).toLocaleDateString()}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {statement.periodType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {statement.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={statement.netCashFromOperating >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(statement.netCashFromOperating)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={freeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(freeCashFlow)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(statement.endingCashBalance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusVariant(statement.status)} size="sm">
                              {statement.status.charAt(0).toUpperCase() + statement.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              {statement.status === 'draft' && (
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {statements.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!hasNextPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Generate Statement Modal */}
      <Modal 
        isOpen={showGenerateModal} 
        onClose={() => setShowGenerateModal(false)}
        title="Generate Cash Flow Statement"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Start
              </label>
              <Input
                type="date"
                value={generateData.periodStart}
                onChange={(e) => setGenerateData({ ...generateData, periodStart: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period End
              </label>
              <Input
                type="date"
                value={generateData.periodEnd}
                onChange={(e) => setGenerateData({ ...generateData, periodEnd: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Type
              </label>
              <Select
                value={generateData.periodType}
                onChange={(e) => setGenerateData({ 
                  ...generateData, 
                  periodType: e.target.value as 'monthly' | 'quarterly' | 'annual' 
                })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Method
              </label>
              <Select
                value={generateData.method}
                onChange={(e) => setGenerateData({ 
                  ...generateData, 
                  method: e.target.value as 'direct' | 'indirect' 
                })}
              >
                <option value="indirect">Indirect Method</option>
                <option value="direct">Direct Method</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <Select
              value={generateData.currency}
              onChange={(e) => setGenerateData({ ...generateData, currency: e.target.value })}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={!generateData.periodStart || !generateData.periodEnd || loading}
            >
              {loading ? 'Generating...' : 'Generate Statement'}
            </Button>
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
}