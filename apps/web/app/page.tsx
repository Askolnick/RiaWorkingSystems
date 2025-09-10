import Link from 'next/link';
import { Button } from '@ria/web-ui';
import { ROUTES } from '@ria/utils';

// Public landing page for Ria Living Systems. This page is visible to
// unauthenticated visitors and provides a brief introduction to the product.
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Welcome to <span className="text-blue-600">Ria Living Systems</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The next-generation management platform for RIA firms. Streamline your operations, 
              enhance client relationships, and grow your business with our comprehensive suite of tools.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Client Management</h3>
                <p className="text-gray-600 text-sm">Comprehensive client portal with messaging, documents, and relationship tracking.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Financial Operations</h3>
                <p className="text-gray-600 text-sm">Invoice management, expense tracking, and integrated accounting workflows.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Business Intelligence</h3>
                <p className="text-gray-600 text-sm">Real-time insights, reporting, and analytics to drive informed decisions.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link href={ROUTES.SIGN_IN}>
                <Button className="px-8 py-3 text-lg">
                  Sign In to Portal
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                New to Ria? <Link href={ROUTES.SIGN_UP} className="text-blue-600 hover:underline">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}