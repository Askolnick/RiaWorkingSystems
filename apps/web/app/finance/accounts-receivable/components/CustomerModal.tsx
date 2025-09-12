import { Button, Modal, Input } from '@ria/web-ui';
interface CustomerModalProps {
  showNewCustomerModal: any;
  handleCreateCustomer: any;
}

export const CustomerModal = (props: CustomerModalProps) => {
  return (
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
  );
};