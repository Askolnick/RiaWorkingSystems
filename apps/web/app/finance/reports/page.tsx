'use client';

import { Card, Button } from '@ria/web-ui';

export default function ReportsPage() : void {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-gray-600">Generate standard financial reports</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Balance Sheet</h3>
          <p className="text-gray-600 mb-4">Assets, liabilities, and equity</p>
          <Button>Generate</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Income Statement</h3>
          <p className="text-gray-600 mb-4">Revenue and expenses</p>
          <Button>Generate</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Cash Flow</h3>
          <p className="text-gray-600 mb-4">Operating, investing, financing</p>
          <Button>Generate</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Trial Balance</h3>
          <p className="text-gray-600 mb-4">All account balances</p>
          <Button>Generate</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Aging Reports</h3>
          <p className="text-gray-600 mb-4">AR and AP aging analysis</p>
          <Button>Generate</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
          <p className="text-gray-600 mb-4">Build your own reports</p>
          <Button>Build</Button>
        </Card>
      </div>
    </div>
  );
}