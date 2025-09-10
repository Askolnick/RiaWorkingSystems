"use client";
import { useEffect } from 'react';
import { useCampaignsStore } from '@ria/client';
import { Card, Button, LoadingSpinner, Badge } from '@ria/web-ui';

export default function CampaignsCenter() {
  const { 
    campaigns, 
    analytics,
    campaignsLoading, 
    fetchCampaigns, 
    fetchAnalytics 
  } = useCampaignsStore();

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, [fetchCampaigns, fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'social': return '📱';
      case 'print': return '📰';
      default: return '📢';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-2">Campaigns</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Design and send marketing campaigns with audience segmentation and performance tracking.
          </p>
        </div>
        <Button>Create Campaign</Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalCampaigns}</div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.activeCampaigns}</div>
            <div className="text-sm text-gray-600">Active Campaigns</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.averageCTR}%</div>
            <div className="text-sm text-gray-600">Average CTR</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{analytics.totalConversions}</div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Campaigns</h2>
          
          {campaignsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">{campaign.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>Target: {campaign.targetAudience}</span>
                          <span>Budget: ${campaign.budget.toLocaleString()}</span>
                          <span>Spent: ${campaign.spent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <div className="mt-2 text-sm">
                        <div>👁 {campaign.impressions.toLocaleString()}</div>
                        <div>🖱 {campaign.clicks.toLocaleString()}</div>
                        <div>✅ {campaign.conversions}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}