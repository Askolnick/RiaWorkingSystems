"use client";

import { useState } from 'react';

export default function FeedbackPage() {
  const [selectedTab, setSelectedTab] = useState('collect');
  const [feedbackType, setFeedbackType] = useState('general');

  const feedbackItems = [
    {
      id: 1,
      type: 'feature-request',
      title: 'Add dark mode support',
      description: 'Would love to have a dark theme option for the portal',
      submitter: 'John Smith',
      email: 'john@example.com',
      date: '2024-09-08',
      status: 'under-review',
      votes: 12,
      priority: 'medium'
    },
    {
      id: 2,
      type: 'bug-report',
      title: 'Portfolio chart not loading',
      description: 'The portfolio performance chart fails to load on mobile devices',
      submitter: 'Sarah Johnson',
      email: 'sarah@example.com',
      date: '2024-09-10',
      status: 'in-progress',
      votes: 8,
      priority: 'high'
    },
    {
      id: 3,
      type: 'general',
      title: 'Great customer service',
      description: 'The support team was incredibly helpful with my account setup',
      submitter: 'Mike Chen',
      email: 'mike@example.com',
      date: '2024-09-05',
      status: 'completed',
      votes: 5,
      priority: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under-review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature-request': return '💡';
      case 'bug-report': return '🐛';
      case 'general': return '💬';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-elev-1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Feedback Management
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Collect and manage client feedback to improve your services
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'collect', label: 'Collect Feedback' },
                { id: 'manage', label: 'Manage Feedback' },
                { id: 'analytics', label: 'Analytics' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ 
                    color: selectedTab === tab.id ? undefined : 'var(--text-muted)',
                    borderColor: selectedTab === tab.id ? undefined : 'transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'collect' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Submit New Feedback
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Feedback Type
                  </label>
                  <select 
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full p-2 border rounded" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                  >
                    <option value="general">General Feedback</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="bug-report">Bug Report</option>
                    <option value="complaint">Complaint</option>
                    <option value="compliment">Compliment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Title
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                    placeholder="Brief description of your feedback"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Description
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full p-2 border rounded" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                    placeholder="Please provide detailed feedback..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full p-2 border rounded" 
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Priority Level
                  </label>
                  <select 
                    className="w-full p-2 border rounded" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elev-1)' }}
                  >
                    <option value="low">Low - General suggestion</option>
                    <option value="medium">Medium - Nice to have</option>
                    <option value="high">High - Important issue</option>
                    <option value="urgent">Urgent - Critical problem</option>
                  </select>
                </div>
                
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Submit Feedback
                </button>
              </form>
            </div>

            {/* Feedback Guidelines */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  Feedback Guidelines
                </h3>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Be specific and detailed in your descriptions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Include steps to reproduce issues if reporting bugs</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Provide context about your role and use case</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Be respectful and constructive in your feedback</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  Response Times
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>General Feedback</span>
                    <span style={{ color: 'var(--text)' }}>3-5 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Feature Requests</span>
                    <span style={{ color: 'var(--text)' }}>1-2 weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Bug Reports</span>
                    <span style={{ color: 'var(--text)' }}>1-3 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Urgent Issues</span>
                    <span style={{ color: 'var(--text)' }}>Same day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'manage' && (
          <div className="bg-white rounded-lg shadow-sm" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Feedback Items ({feedbackItems.length})
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                    Filter
                  </button>
                  <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {feedbackItems.map(item => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                            {item.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                          {item.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span>By {item.submitter}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <span>👍</span>
                            <span>{item.votes}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Reply
                      </button>
                      <button className="px-3 py-1 text-sm border rounded" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary Cards */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Feedback</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Resolved</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Feedback by Type</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Feature Requests</span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Bug Reports</span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>General Feedback</span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6" style={{ borderColor: 'var(--border)', border: '1px solid' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Feedback Trends</h3>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <span style={{ color: 'var(--text-muted)' }}>Chart visualization would appear here</span>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-12 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elev-1)', borderColor: 'var(--border)', border: '1px solid' }}>
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <strong>Coming Soon:</strong> This is preview functionality for feedback collection and management. 
            Full survey tools, sentiment analysis, automated routing, and integration with support tickets will be available in the complete system.
          </p>
        </div>
      </div>
    </div>
  );
}