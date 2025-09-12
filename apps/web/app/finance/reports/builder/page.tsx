'use client';

import { Card, Button } from '@ria/web-ui';

export default function ReportsBuilderPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Report Builder</h1>
        <p className="text-gray-600">Create custom financial reports</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Report Builder Module</h2>
          <p className="text-gray-600 mb-6">
            This will provide a drag-and-drop report builder for creating custom financial reports.
          </p>
          <Button>Create Report</Button>
        </div>
      </Card>
    </div>
  );
}