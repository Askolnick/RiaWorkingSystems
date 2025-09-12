'use client';

import { Card, Button } from '@ria/web-ui';

export default function RecurringPage() : void {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <p className="text-gray-600">Manage recurring invoices and bills</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Recurring Transactions Module</h2>
          <p className="text-gray-600 mb-6">
            This will handle recurring invoices, bills, and automated transaction scheduling.
          </p>
          <Button>Create Recurring Transaction</Button>
        </div>
      </Card>
    </div>
  );
}