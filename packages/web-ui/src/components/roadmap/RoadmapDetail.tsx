import React from 'react';
import { Card } from '../atoms/Card';
import Badge from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface RoadmapDetailProps {
  roadmap?: any;
  onEdit?: () => void;
  onBack?: () => void;
}

export default function RoadmapDetail({ 
  roadmap,
  onEdit,
  onBack
}: RoadmapDetailProps) {
  if (!roadmap) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          Roadmap not found
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'planned': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost">
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{roadmap.title}</h1>
            <p className="text-gray-600 mt-1">{roadmap.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(roadmap.status)}>
            {roadmap.status}
          </Badge>
          <Button onClick={onEdit} variant="primary">
            Edit Roadmap
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Features</div>
              <div className="text-2xl font-bold">{roadmap.features?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {roadmap.features?.filter((f: any) => f.status === 'completed').length || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {roadmap.features?.filter((f: any) => f.status === 'in-progress').length || 0}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Features</h3>
          
          {roadmap.features && roadmap.features.length > 0 ? (
            <div className="space-y-4">
              {roadmap.features.map((feature: any, index: number) => (
                <div key={feature.id || index} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{feature.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(feature.status)}>
                        {feature.status}
                      </Badge>
                      <Badge variant={getPriorityColor(feature.priority)}>
                        {feature.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Quarter: {feature.quarter || 'TBD'}</span>
                    {feature.estimatedHours && (
                      <span>{feature.estimatedHours}h estimated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No features defined yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}