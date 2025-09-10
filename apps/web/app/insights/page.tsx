"use client";
import { useEffect } from 'react';
import { useInsightsStore } from '@ria/client';
import { Card, Button, LoadingSpinner } from '@ria/web-ui';

export default function InsightsCenter() {
  const { 
    metrics, 
    reports,
    metricsLoading, 
    reportsLoading,
    fetchMetrics, 
    fetchReports,
    refreshData
  } = useInsightsStore();

  useEffect(() => {
    fetchMetrics();
    fetchReports();
  }, [fetchMetrics, fetchReports]);

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      default: return '➡️';
    }
  };

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-2">Insights</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Analytics and business intelligence dashboard with comprehensive reporting.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>Refresh</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Key Performance Metrics</h2>
        {metricsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(metric => (
              <Card key={metric.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {getChangeIcon(metric.changeType)} {Math.abs(metric.change)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Reports</h2>
            <Button size="sm">New Report</Button>
          </div>
          
          {reportsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">{report.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        report.type === 'financial' ? 'bg-green-100 text-green-800' :
                        report.type === 'client' ? 'bg-blue-100 text-blue-800' :
                        report.type === 'performance' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.type}
                      </span>
                      {report.schedule && (
                        <span className="text-xs text-gray-400">• {report.schedule}</span>
                      )}
                      {report.isPublic && (
                        <span className="text-xs text-blue-600">• Public</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Charts Placeholder */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm text-gray-600">Revenue Trend Chart</div>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm text-gray-600">Client Growth Chart</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-blue-800">Client Satisfaction</div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">$1.2M</div>
            <div className="text-sm text-green-800">Monthly Revenue</div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">94%</div>
            <div className="text-sm text-purple-800">Goal Achievement</div>
          </div>
        </Card>
      </div>
    </div>
  );
}