'use client';

import { Card, Button } from '@ria/web-ui';

export default function ReceiptsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Receipt Manager</h1>
        <p className="text-gray-600">Digitize and manage receipts and expenses</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Receipt Manager Module</h2>
          <p className="text-gray-600 mb-6">
            This will handle receipt scanning, OCR, expense categorization, and approval workflows.
          </p>
          <Button>Upload Receipt</Button>
        </div>
      </Card>
    </div>
  );
}