'use client';

import { useEffect, useState } from 'react';
import { useReportsStore } from '@ria/client';
import { 
  Card, 
  LoadingCard, 
  Alert, 
  ErrorBoundary, 
  Button, 
  Badge,
  Table,
  Tabs,
  Select
} from '@ria/web-ui';
import { formatCurrency, formatDate } from '@ria/reports-server';

export default function AgingReportsPage() {
  const {
    agingReceivables,
    agingPayables,
    loading,
    error,
    fetchAgingReport,
    clearError
  } = useReportsStore();

  const [activeTab, setActiveTab] = useState('receivables');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAgingReport('receivables', asOfDate);
    fetchAgingReport('payables', asOfDate);
  }, [asOfDate]);

  const handleDateChange = (newDate: string) => {
    setAsOfDate(newDate);
  };

  const handleRefresh = () => {
    fetchAgingReport(activeTab as 'receivables' | 'payables', asOfDate);
  };

  if (loading && !agingReceivables && !agingPayables) {
    return <LoadingCard message="Loading aging reports..." />;
  }

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  const renderAgingSummary = (report: any) => {
    if (!report) return null;

    const summaryData = [
      { bucket: 'Current', amount: report.summary.current, percentage: (report.summary.current / report.summary.total) * 100 },
      { bucket: '1-30 Days', amount: report.summary.thirtyDays, percentage: (report.summary.thirtyDays / report.summary.total) * 100 },
      { bucket: '31-60 Days', amount: report.summary.sixtyDays, percentage: (report.summary.sixtyDays / report.summary.total) * 100 },
      { bucket: '61-90 Days', amount: report.summary.ninetyDays, percentage: (report.summary.ninetyDays / report.summary.total) * 100 },
      { bucket: '90+ Days', amount: report.summary.overNinetyDays, percentage: (report.summary.overNinetyDays / report.summary.total) * 100 }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <Card key={item.bucket} className="p-4">
            <div className="text-sm text-gray-600 font-medium mb-1">{item.bucket}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(item.amount)}
            </div>
            <div className="text-sm text-gray-500">
              {item.percentage.toFixed(1)}% of total
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-green-500' :
                    index === 1 ? 'bg-yellow-500' :
                    index === 2 ? 'bg-orange-500' :
                    index === 3 ? 'bg-red-500' : 'bg-red-700'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderAgingDetails = (report: any) => {
    if (!report?.details) return null;

    const columns = [
      { key: 'name', title: 'Name', width: '20%' },
      { key: 'type', title: 'Type', width: '10%' },
      { key: 'invoiceNumber', title: activeTab === 'receivables' ? 'Invoice #' : 'Bill #', width: '15%' },
      { key: 'date', title: 'Date', width: '10%', format: 'date' },
      { key: 'dueDate', title: 'Due Date', width: '10%', format: 'date' },
      { key: 'amount', title: 'Amount', width: '15%', format: 'currency' },
      { key: 'daysOverdue', title: 'Days Overdue', width: '10%' },
      { key: 'agingBucket', title: 'Aging Bucket', width: '10%' }
    ];

    const data = report.details.map((item: any) => ({
      ...item,
      invoiceNumber: item.invoiceNumber || item.billNumber || '-',
      agingBucket: (
        <Badge 
          variant={
            item.agingBucket === 'current' ? 'success' :
            item.agingBucket === '1-30' ? 'warning' :
            item.agingBucket === '31-60' ? 'warning' :
            item.agingBucket === '61-90' ? 'error' : 'error'
          }
        >
          {item.agingBucket}
        </Badge>
      )
    }));

    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Detailed {activeTab === 'receivables' ? 'Receivables' : 'Payables'} Aging
          </h3>
          <div className="text-sm text-gray-600">
            Total Items: {report.details.length}
          </div>
        </div>
        <Table
          columns={columns}
          data={data}
          pagination={true}
          pageSize={20}
          sortable={true}
        />
      </Card>
    );
  };

  const renderCustomerSummary = (report: any) => {
    if (!report?.byCustomer) return null;

    const columns = [
      { key: 'customerName', title: 'Customer/Vendor', width: '25%' },
      { key: 'total', title: 'Total', width: '15%', format: 'currency' },
      { key: 'current', title: 'Current', width: '12%', format: 'currency' },
      { key: 'thirtyDays', title: '1-30 Days', width: '12%', format: 'currency' },
      { key: 'sixtyDays', title: '31-60 Days', width: '12%', format: 'currency' },
      { key: 'ninetyDays', title: '61-90 Days', width: '12%', format: 'currency' },
      { key: 'overNinetyDays', title: '90+ Days', width: '12%', format: 'currency' }
    ];

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Summary by {activeTab === 'receivables' ? 'Customer' : 'Vendor'}
        </h3>
        <Table
          columns={columns}
          data={report.byCustomer}
          pagination={true}
          pageSize={15}
          sortable={true}
        />
      </Card>
    );
  };

  const tabConfig = [
    { id: 'receivables', label: 'Accounts Receivable', icon: '' },
    { id: 'payables', label: 'Accounts Payable', icon: '' }
  ];

  const currentReport = activeTab === 'receivables' ? agingReceivables : agingPayables;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aging Reports</h1>
            <p className="text-gray-600">Track overdue receivables and payables</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">As of Date:</label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Report Info */}
        {currentReport && (
          <Card className="p-4 bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-blue-600 font-medium">Report Date:</span>
                <span className="ml-2 text-blue-900 font-semibold">
                  {formatDate(currentReport.asOfDate)}
                </span>
              </div>
              <div>
                <span className="text-sm text-blue-600 font-medium">Total Outstanding:</span>
                <span className="ml-2 text-blue-900 font-semibold">
                  {formatCurrency(currentReport.summary.total)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Tabs
          tabs={tabConfig}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Content */}
        {currentReport ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            {renderAgingSummary(currentReport)}

            {/* Customer/Vendor Summary */}
            {renderCustomerSummary(currentReport)}

            {/* Detailed Aging */}
            {renderAgingDetails(currentReport)}

            {/* Key Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-1">
                    Items Over 30 Days
                  </div>
                  <div className="text-xl font-bold text-yellow-900">
                    {currentReport.details.filter((item: any) => item.daysOverdue > 30).length}
                  </div>
                  <div className="text-sm text-yellow-700">
                    Worth {formatCurrency(
                      currentReport.details
                        .filter((item: any) => item.daysOverdue > 30)
                        .reduce((sum: number, item: any) => sum + item.amount, 0)
                    )}
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-1">
                    Items Over 90 Days
                  </div>
                  <div className="text-xl font-bold text-red-900">
                    {currentReport.details.filter((item: any) => item.daysOverdue > 90).length}
                  </div>
                  <div className="text-sm text-red-700">
                    Worth {formatCurrency(
                      currentReport.details
                        .filter((item: any) => item.daysOverdue > 90)
                        .reduce((sum: number, item: any) => sum + item.amount, 0)
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    Current Items
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {currentReport.details.filter((item: any) => item.daysOverdue <= 0).length}
                  </div>
                  <div className="text-sm text-green-700">
                    {((currentReport.summary.current / currentReport.summary.total) * 100).toFixed(1)}% of total
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">
                    Average Days Outstanding
                  </div>
                  <div className="text-xl font-bold text-purple-900">
                    {Math.round(
                      currentReport.details.reduce((sum: number, item: any) => sum + item.daysOverdue, 0) / 
                      currentReport.details.length
                    )}
                  </div>
                  <div className="text-sm text-purple-700">
                    Across all items
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <LoadingCard message={`Loading ${activeTab} aging report...`} />
        )}
      </div>
    </ErrorBoundary>
  );
}