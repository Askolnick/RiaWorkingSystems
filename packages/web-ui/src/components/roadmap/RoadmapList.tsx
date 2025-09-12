import React from 'react';
import { Card } from '../atoms/Card';
import Badge from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface RoadmapListProps {
  roadmaps?: any[];
  onView?: (roadmap: any) => void;
  onCreate?: () => void;
}

export default function RoadmapList({ 
  roadmaps = [],
  onView,
  onCreate
}: RoadmapListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'planned': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Roadmaps</h2>
        <Button onClick={onCreate} variant="primary">
          Create Roadmap
        </Button>
      </div>

      <div className="grid gap-4">
        {roadmaps.map((roadmap) => (
          <Card key={roadmap.id}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{roadmap.title}</h3>
                  <p className="text-gray-600 mt-1">{roadmap.description}</p>
                </div>
                <Badge variant={getStatusColor(roadmap.status)}>
                  {roadmap.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{roadmap.features?.length || 0} features</span>
                  <span>Updated {new Date(roadmap.updatedAt).toLocaleDateString()}</span>
                </div>
                
                <Button 
                  onClick={() => onView?.(roadmap)}
                  variant="outline"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {roadmaps.length === 0 && (
          <Card>
            <div className="p-12 text-center text-gray-500">
              <div className="mb-4">📋</div>
              <p>No roadmaps created yet.</p>
              <Button 
                onClick={onCreate}
                variant="primary"
                className="mt-4"
              >
                Create Your First Roadmap
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}