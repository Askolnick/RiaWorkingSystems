import { Button } from '@ria/web-ui';
import Link from 'next/link';
interface PageHeaderProps {
  ROUTES: any;
}

export const PageHeader = (props: PageHeaderProps) => {
  return (
        <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div>
                    <nav className="flex items-center space-x-2 text-sm text-gray-500">
                      <Link href={ROUTES.FINANCE} className="hover:text-gray-700">Finance</Link>
                      <span>/</span>
                      <span className="text-gray-900">Accounts Receivable</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable</h1>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      Export Report
                    </Button>
                    <Button size="sm" onClick={() => setShowNewCustomerModal(true)}>
                      New Customer
                    </Button>
                  </div>
                </div>
              </div>
            </header>
  );
};