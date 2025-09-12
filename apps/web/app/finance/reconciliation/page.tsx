'use client';

import { Card, Button } from '@ria/web-ui';

export default function ReconciliationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
        <p className="text-gray-600">Reconcile bank statements with your records</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Bank Reconciliation Module</h2>
          <p className="text-gray-600 mb-6">
            This will handle bank statement imports, transaction matching, and reconciliation workflows.
          </p>
          <Button>Start Reconciliation</Button>
        </div>
      </Card>
    </div>
  );
}