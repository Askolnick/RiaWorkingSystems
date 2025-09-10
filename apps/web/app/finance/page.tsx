'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@ria/utils';
import { useFinanceStore, useUIStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  Alert,
  ErrorBoundary,
} from '@ria/web-ui';

export default function FinancePage() {
  const router = useRouter();
  
  // Store hooks
  const {
    stats,
    statsLoading,
    statsError,
    fetchStats,
    invoices,
    invoicesLoading,
    fetchInvoices,
    transactions,
    transactionsLoading,
    fetchTransactions,
  } = useFinanceStore();
  
  const { showNotification } = useUIStore();

  // Fetch data on mount
  useEffect(() => {
    fetchStats();
    fetchInvoices();
    fetchTransactions();
  }, [fetchStats, fetchInvoices, fetchTransactions]);

  const quickActions = [
    { 
      name: 'Create Invoice', 
      href: `${ROUTES.FINANCE_INVOICES}/new`, 
      icon: '📄', 
      description: 'Generate new client invoice' 
    },
    { 
      name: 'Record Expense', 
      href: `${ROUTES.FINANCE_EXPENSES}/new`, 
      icon: '💳', 
      description: 'Log business expense' 
    },
    { 
      name: 'Pay Bills', 
      href: ROUTES.FINANCE_BILLS, 
      icon: '💸', 
      description: 'Manage outstanding bills' 
    },
    { 
      name: 'View Reports', 
      href: ROUTES.FINANCE_BALANCE_SHEET, 
      icon: '📊', 
      description: 'Financial statements' 
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (statsError) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 p-8">
          <Alert type="error">
            {statsError}
          </Alert>
          <Button
            onClick={() => {
              fetchStats();
              fetchInvoices();
              fetchTransactions();
            }}
            variant="primary"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
                <p className="text-sm text-gray-500">Manage your financial operations</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => showNotification({
                    type: 'info',
                    title: 'Export',
                    message: 'Export functionality coming soon',
                  })}
                >
                  Export Data
                </Button>
                <Button 
                  size="sm"
                  onClick={() => router.push(`${ROUTES.FINANCE_INVOICES}/new`)}
                >
                  New Invoice
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              [1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                    <Skeleton variant="text" width="80%" height={32} />
                  </CardContent>
                </Card>
              ))
            ) : stats ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        {calculateChange(stats.totalRevenue, stats.totalRevenue * 0.85)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats.totalExpenses)}
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        {calculateChange(stats.totalExpenses, stats.totalExpenses * 0.95)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Net Profit</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats.netProfit)}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        +{stats.profitMargin.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats.pendingInvoices}
                        </p>
                      </div>
                      {stats.overdueInvoices > 0 && (
                        <Badge variant="error" size="sm">
                          {stats.overdueInvoices} overdue
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{action.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{action.name}</h3>
                            <p className="text-sm text-gray-500">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <Link href={ROUTES.FINANCE_INVOICES} className="text-blue-600 hover:underline text-sm">
                  View all
                </Link>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  {transactionsLoading ? (
                    <div className="p-6">
                      <Skeleton variant="rectangular" height={200} />
                    </div>
                  ) : transactions.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.slice(0, 5).map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={transaction.type === 'income' ? 'success' : 'secondary'} 
                                size="sm"
                              >
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'expense' ? '-' : '+'}
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Finance Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href={ROUTES.FINANCE_INVOICES}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📄</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Invoices</h3>
                      <p className="text-sm text-gray-600">Create and manage client invoices</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href={ROUTES.FINANCE_BILLS}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Bills</h3>
                      <p className="text-sm text-gray-600">Track and pay vendor bills</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href={ROUTES.FINANCE_EXPENSES}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">💳</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Expenses</h3>
                      <p className="text-sm text-gray-600">Record business expenses</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href={ROUTES.FINANCE_BALANCE_SHEET}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
                      <p className="text-sm text-gray-600">Financial statements and analytics</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}