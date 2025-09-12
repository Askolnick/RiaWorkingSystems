'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBillsStore } from '@ria/client';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Modal,
  Input,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@ria/web-ui';
import { ROUTES } from '@ria/utils';
import type { CreateBillPaymentData, PaymentMethod } from '@ria/bills-server';
import { BILL_STATUSES, BILL_PRIORITIES, PAYMENT_METHODS, getBillStatusVariant, getPriorityVariant } from '@ria/bills-server';

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;
  
  const {
    currentBill,
    loading,
    error,
    fetchBill,
    markAsPaid,
    submitForApproval,
    approveBill,
    rejectBill,
    cancelBill,
    clearError
  } = useBillsStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<Partial<CreateBillPaymentData>>({
    amount: 0,
    method: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (billId) {
      fetchBill(billId);
    }
  }, [billId, fetchBill]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async () => {
    try {
      await markAsPaid(billId, {
        billId,
        amount: paymentData.amount || currentBill?.balanceDue || 0,
        method: paymentData.method as PaymentMethod,
        paymentDate: paymentData.paymentDate!,
        notes: paymentData.notes,
        reference: paymentData.reference
      });
      setShowPaymentModal(false);
      setPaymentData({
        amount: 0,
        method: 'bank_transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleBillAction = async (action: string) => {
    try {
      switch (action) {
        case 'submit':
          await submitForApproval(billId);
          break;
        case 'approve':
          const comments = prompt('Approval comments (optional):');
          await approveBill(billId, comments || undefined);
          break;
        case 'reject':
          const reason = prompt('Please provide a rejection reason:');
          if (reason) {
            await rejectBill(billId, reason);
          }
          break;
        case 'cancel':
          const cancelReason = prompt('Please provide a cancellation reason:');
          if (cancelReason) {
            await cancelBill(billId, cancelReason);
          }
          break;
      }
    } catch (error) {
      console.error('Bill action failed:', error);
    }
  };

  if (loading.bills) return <LoadingCard />;
  if (error) return <Alert type="error" onClose={clearError}>{error}</Alert>;
  if (!currentBill) return <Alert type="error">Bill not found</Alert>;


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
                  <Link href={ROUTES.FINANCE_BILLS} className="hover:text-gray-700">Bills</Link>
                  <span>/</span>
                  <span className="text-gray-900">{currentBill.number}</span>
                </nav>
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">{currentBill.number}</h1>
                  <Badge variant={getBillStatusVariant(currentBill.status)}>
                    {BILL_STATUSES[currentBill.status]}
                  </Badge>
                  <Badge variant={getPriorityVariant(currentBill.priority)}>
                    {BILL_PRIORITIES[currentBill.priority]}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-3">
                {currentBill.status === 'draft' && (
                  <Button onClick={() => handleBillAction('submit')} disabled={loading.submitting}>
                    Submit for Approval
                  </Button>
                )}
                {currentBill.status === 'pending' && (
                  <>
                    <Button onClick={() => handleBillAction('approve')} disabled={loading.approving}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleBillAction('reject')} disabled={loading.approving}>
                      Reject
                    </Button>
                  </>
                )}
                {(currentBill.status === 'approved' || currentBill.status === 'overdue') && (
                  <Button onClick={() => setShowPaymentModal(true)} disabled={loading.paying}>
                    Record Payment
                  </Button>
                )}
                {currentBill.status !== 'paid' && currentBill.status !== 'cancelled' && (
                  <Button variant="outline" onClick={() => handleBillAction('cancel')} disabled={loading.updating}>
                    Cancel Bill
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bill Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Vendor</h3>
                      <div className="text-lg font-medium text-gray-900">{currentBill.vendorName}</div>
                      {currentBill.vendorEmail && (
                        <div className="text-sm text-gray-500">{currentBill.vendorEmail}</div>
                      )}
                      {currentBill.vendorAddress && (
                        <div className="text-sm text-gray-500 mt-2">
                          <div>{currentBill.vendorAddress.line1}</div>
                          {currentBill.vendorAddress.line2 && <div>{currentBill.vendorAddress.line2}</div>}
                          <div>{currentBill.vendorAddress.city}, {currentBill.vendorAddress.state} {currentBill.vendorAddress.postalCode}</div>
                          <div>{currentBill.vendorAddress.country}</div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Bill Date</h3>
                        <div className="text-sm text-gray-900">{formatDate(currentBill.billDate)}</div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Due Date</h3>
                        <div className="text-sm text-gray-900">
                          {formatDate(currentBill.dueDate)}
                          {currentBill.isOverdue && (
                            <span className="ml-2 text-red-600 font-medium">
                              ({currentBill.daysPastDue} days overdue)
                            </span>
                          )}
                        </div>
                      </div>
                      {currentBill.poNumber && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">PO Number</h3>
                          <div className="text-sm text-gray-900">{currentBill.poNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {currentBill.description && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                      <div className="text-sm text-gray-900">{currentBill.description}</div>
                    </div>
                  )}
                  {currentBill.notes && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                      <div className="text-sm text-gray-900">{currentBill.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium text-gray-500">Item</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500">Qty</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500">Rate</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-500">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBill.items?.map((item, index) => (
                          <tr key={item.id} className={index !== currentBill.items!.length - 1 ? 'border-b' : ''}>
                            <td className="py-3">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500">{item.description}</div>
                              )}
                              {item.category && (
                                <div className="text-xs text-blue-600 mt-1">{item.category}</div>
                              )}
                            </td>
                            <td className="text-right py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="text-right py-3 text-sm text-gray-900">{formatCurrency(item.rate)}</td>
                            <td className="text-right py-3 text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(currentBill.subtotal)}</span>
                    </div>
                    {currentBill.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax ({currentBill.taxRate}%)</span>
                        <span className="text-gray-900">{formatCurrency(currentBill.taxAmount)}</span>
                      </div>
                    )}
                    {currentBill.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-green-600">-{formatCurrency(currentBill.discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">{formatCurrency(currentBill.total)}</span>
                      </div>
                    </div>
                    {currentBill.paidAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Paid</span>
                        <span className="text-green-600">{formatCurrency(currentBill.paidAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg">
                      <span className="text-gray-900">Balance Due</span>
                      <span className={currentBill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(currentBill.balanceDue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              {currentBill.payments && currentBill.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentBill.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {PAYMENT_METHODS[payment.method]} • {formatDate(payment.paymentDate)}
                            </div>
                            {payment.reference && (
                              <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                            )}
                          </div>
                          <Badge variant={payment.status === 'completed' ? 'success' : 'secondary'} size="sm">
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              {currentBill.activities && currentBill.activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentBill.activities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                            <div className="text-xs text-gray-500">{formatDate(activity.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <Modal onClose={() => setShowPaymentModal(false)}>
          <div className="p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentData.amount || currentBill.balanceDue}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Balance due: {formatCurrency(currentBill.balanceDue)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <Select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as PaymentMethod })}
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number (optional)
                </label>
                <Input
                  value={paymentData.reference || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  placeholder="Transaction ID, check number, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Payment notes..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment}
                  disabled={loading.paying || !paymentData.amount || paymentData.amount <= 0}
                >
                  {loading.paying ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </ErrorBoundary>
  );
}