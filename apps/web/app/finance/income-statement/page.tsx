'use client';

import { Card, Button } from '@ria/web-ui';

export default function IncomeStatementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Income Statement</h1>
        <p className="text-gray-600">Generate and view profit & loss statements</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Income Statement Module</h2>
          <p className="text-gray-600 mb-6">
            This will show profit & loss statements with revenue, expenses, and net income.
          </p>
          <Button>Generate Statement</Button>
        </div>
      </Card>
    </div>
  );
}