"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Input, Select } from '@ria/web-ui';
import { ROUTES } from '@ria/utils';

export default function FinanceInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock invoice data - in real app this would come from API
  const invoices = [
    { 
      id: 'INV-2025-001', 
      client: 'ABC Corporation', 
      amount: '$5,200.00', 
      status: 'Paid', 
      dueDate: '2025-01-30',
      issueDate: '2025-01-15',
      description: 'Web Development Services'
    },
    { 
      id: 'INV-2025-002', 
      client: 'XYZ Limited', 
      amount: '$3,750.00', 
      status: 'Pending', 
      dueDate: '2025-02-15',
      issueDate: '2025-01-16',
      description: 'Consulting Services'
    },
    { 
      id: 'INV-2025-003', 
      client: 'Tech Startup Inc', 
      amount: '$8,900.00', 
      status: 'Overdue', 
      dueDate: '2025-01-10',
      issueDate: '2025-12-26',
      description: 'Software Development'
    },
    { 
      id: 'INV-2025-004', 
      client: 'Design Studio LLC', 
      amount: '$2,100.00', 
      status: 'Draft', 
      dueDate: '2025-02-28',
      issueDate: '2025-01-18',
      description: 'UI/UX Design Services'
    },
    { 
      id: 'INV-2025-005', 
      client: 'Marketing Agency', 
      amount: '$4,500.00', 
      status: 'Sent', 
      dueDate: '2025-02-20',
      issueDate: '2025-01-20',
      description: 'Digital Marketing Campaign'
    },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'sent': return 'secondary';
      case 'overdue': return 'error';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => {
    return sum + parseFloat(invoice.amount.replace('$', '').replace(',', ''));
  }, 0);

  const paidAmount = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, invoice) => {
      return sum + parseFloat(invoice.amount.replace('$', '').replace(',', ''));
    }, 0);

  const outstandingAmount = totalAmount - paidAmount;

  return (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-blue-500">📄</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${paidAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-green-500">✅</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  ${outstandingAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-orange-500">⏳</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices by client, number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No invoices match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`${ROUTES.FINANCE_INVOICES}/${invoice.id}` as any} className="text-blue-600 hover:underline font-medium">
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.client}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(invoice.status)} size="sm">
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Send
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredInvoices.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}