import { Button, Modal, Input } from '@ria/web-ui';
interface PaymentModalProps {
  showPaymentModal: any;
  handleRecordPayment: any;
}

export const PaymentModal = (props: PaymentModalProps) => {
  return (
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
  );
};