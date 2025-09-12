"use client";

import { useState } from 'react';

export default function ProductRoadmapsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  const roadmapItems = [
    {
      id: 1,
      title: 'ESG Analytics Dashboard',
      description: 'Advanced environmental, social, and governance tracking tools',
      status: 'in-development',
      priority: 'high',
      timeline: 'Q1 2025',
      team: 'Product Team',
      progress: 65,
      tags: ['ESG', 'Analytics', 'Dashboard']
    },
    {
      id: 2,
      title: 'AI-Powered Risk Assessment',
      description: 'Machine learning algorithms for enhanced portfolio risk analysis',
      status: 'planning',
      priority: 'high',
      timeline: 'Q2 2025',
      team: 'AI/ML Team',
      progress: 20,
      tags: ['AI', 'Risk Management', 'Machine Learning']
    },
    {
      id: 3,
      title: 'Mobile App 2.0',
      description: 'Complete redesign of the mobile application with enhanced user experience',
      status: 'research',
      priority: 'medium',
      timeline: 'Q3 2025',
      team: 'Mobile Team',
      progress: 10,
      tags: ['Mobile', 'UX', 'Client Portal']
    },
    {
      id: 4,
      title: 'Alternative Investments Module',
      description: 'Support for private equity, hedge funds, and other alternative assets',
      status: 'backlog',
      priority: 'medium',
      timeline: 'Q4 2025',
      team: 'Investment Team',
      progress: 0,
      tags: ['Alternatives', 'Private Equity', 'Hedge Funds']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-development': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'planning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'research': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'backlog': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-elev-1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Product Roadmap
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Track development progress and upcoming features for RIA platform products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Timeframe</h3>
              <div className="space-y-2">
                {[
                  { value: '3months', label: 'Next 3 Months' },
                  { value: '6months', label: 'Next 6 Months' },
                  { value: '1year', label: 'Next Year' },
                  { value: 'all', label: 'All Items' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTimeframe(option.value)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selectedTimeframe === option.value ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    style={{ color: selectedTimeframe === option.value ? undefined : 'var(--text)' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Development Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>In Development</span>
                  <span className="font-semibold text-blue-600">
                    {roadmapItems.filter(item => item.status === 'in-development').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>Planning Phase</span>
                  <span className="font-semibold text-yellow-600">
                    {roadmapItems.filter(item => item.status === 'planning').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>High Priority</span>
                  <span className="font-semibold text-red-600">
                    {roadmapItems.filter(item => item.priority === 'high').length}
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
                    Roadmap Items
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                      Timeline View
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {roadmapItems.map(item => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                            {item.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                          {item.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Timeline</span>
                            <div className="font-semibold" style={{ color: 'var(--text)' }}>
                              {item.timeline}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Team</span>
                            <div className="font-semibold" style={{ color: 'var(--text)' }}>
                              {item.team}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Progress</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                {item.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                          View Details
                        </button>
                        <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                          Edit
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
            <strong>Coming Soon:</strong> This is preview functionality for product roadmap management. 
            Full project tracking, stakeholder feedback, resource allocation, and release planning features will be available in the complete system.
          </p>
        </div>
      </div>
    </div>
  );
}