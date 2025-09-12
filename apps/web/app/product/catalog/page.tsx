"use client";

import { useState } from 'react';

export default function ProductCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Conservative Growth Portfolio',
      category: 'managed-portfolios',
      type: 'portfolio',
      minimumInvestment: 25000,
      managementFee: 0.85,
      description: 'A balanced approach focusing on capital preservation with modest growth potential.',
      riskLevel: 'Conservative',
      assetClasses: ['Bonds', 'Large Cap Stocks', 'REITs'],
      performance: { ytd: 4.2, oneYear: 6.8, threeYear: 8.1 },
      aum: 12500000
    },
    {
      id: 2,
      name: 'Aggressive Growth Strategy',
      category: 'managed-portfolios',
      type: 'portfolio',
      minimumInvestment: 50000,
      managementFee: 1.25,
      description: 'High-growth potential strategy targeting significant capital appreciation.',
      riskLevel: 'Aggressive',
      assetClasses: ['Growth Stocks', 'International Equity', 'Small Cap'],
      performance: { ytd: 12.4, oneYear: 18.6, threeYear: 15.2 },
      aum: 8900000
    },
    {
      id: 3,
      name: 'ESG Impact Fund',
      category: 'mutual-funds',
      type: 'fund',
      minimumInvestment: 10000,
      managementFee: 1.15,
      description: 'Sustainable investing focused on environmental, social, and governance criteria.',
      riskLevel: 'Moderate',
      assetClasses: ['ESG Stocks', 'Green Bonds', 'Impact Investments'],
      performance: { ytd: 8.7, oneYear: 11.3, threeYear: 9.8 },
      aum: 5600000
    },
    {
      id: 4,
      name: 'Tax-Efficient Income Strategy',
      category: 'tax-strategies',
      type: 'strategy',
      minimumInvestment: 100000,
      managementFee: 0.95,
      description: 'Optimized for after-tax income generation through municipal bonds and tax-efficient securities.',
      riskLevel: 'Conservative',
      assetClasses: ['Municipal Bonds', 'Dividend Stocks', 'REITs'],
      performance: { ytd: 3.8, oneYear: 5.2, threeYear: 6.4 },
      aum: 15200000
    }
  ];

  const categories = [
    { value: 'all', label: 'All Products', count: products.length },
    { value: 'managed-portfolios', label: 'Managed Portfolios', count: products.filter(p => p.category === 'managed-portfolios').length },
    { value: 'mutual-funds', label: 'Mutual Funds', count: products.filter(p => p.category === 'mutual-funds').length },
    { value: 'tax-strategies', label: 'Tax Strategies', count: products.filter(p => p.category === 'tax-strategies').length }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'conservative': return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'aggressive': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio': return '📈';
      case 'fund': return '🏦';
      case 'strategy': return '🎯';
      default: return '💼';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-elev-1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Investment Product Catalog
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Browse and manage your firm's investment products and strategies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Product Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selectedCategory === category.value ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    style={{ color: selectedCategory === category.value ? undefined : 'var(--text)' }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{category.label}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Portfolio Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>Total Products</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>Total AUM</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {formatCurrency(products.reduce((sum, p) => sum + p.aum, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>Avg. Performance</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage(products.reduce((sum, p) => sum + p.performance.ytd, 0) / products.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Products ({filteredProducts.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                      Sort by Performance
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Add Product
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <span className="text-3xl">{getTypeIcon(product.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                              {product.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded border ${getRiskColor(product.riskLevel)}`}>
                              {product.riskLevel}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                            {product.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Minimum Investment</span>
                              <div className="font-semibold" style={{ color: 'var(--text)' }}>
                                {formatCurrency(product.minimumInvestment)}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Management Fee</span>
                              <div className="font-semibold" style={{ color: 'var(--text)' }}>
                                {formatPercentage(product.managementFee)}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Assets Under Management</span>
                              <div className="font-semibold" style={{ color: 'var(--text)' }}>
                                {formatCurrency(product.aum)}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>YTD Performance</span>
                              <div className={`font-semibold ${product.performance.ytd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(product.performance.ytd)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {product.assetClasses.map(asset => (
                              <span key={asset} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {asset}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                          View Details
                        </button>
                        <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded">
                          Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elev-1)', borderColor: 'var(--border)', border: '1px solid' }}>
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <strong>Coming Soon:</strong> This is preview functionality for the investment product catalog. 
            Full product management, performance tracking, compliance monitoring, and client allocation features will be available in the complete system.
          </p>
        </div>
      </div>
    </div>
  );
}