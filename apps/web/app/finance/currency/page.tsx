'use client';

import { Card, Button } from '@ria/web-ui';

export default function CurrencyPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Multi-Currency</h1>
        <p className="text-gray-600">Manage multiple currencies and exchange rates</p>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Multi-Currency Module</h2>
          <p className="text-gray-600 mb-6">
            This will handle multiple currencies, exchange rates, and currency conversions.
          </p>
          <Button>Manage Currencies</Button>
        </div>
      </Card>
    </div>
  );
}