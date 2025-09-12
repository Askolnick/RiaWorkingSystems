'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { LoadingCard } from '../components/atoms/Loading';
import { Alert } from '../components/molecules/Alert';
import type { RoadmapItem, RoadmapStatus } from '@ria/roadmap-server';

interface RoadmapListProps {
  items: RoadmapItem[];
  loading?: boolean;
  error?: string | null;
  onItemClick?: (item: RoadmapItem) => void;
  onStatusFilter?: (status: RoadmapStatus | null) => void;
  selectedStatus?: RoadmapStatus | null;
  showPublicOnly?: boolean;
  onCreateNew?: () => void;
}

const statusColors: Record<RoadmapStatus, string> = {
  'open': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<RoadmapStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

export function RoadmapList({
  items,
  loading = false,
  error = null,
  onItemClick,
  onStatusFilter,
  selectedStatus = null,
  showPublicOnly = false,
  onCreateNew,
}: RoadmapListProps) {
  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  const statuses: (RoadmapStatus | null)[] = [null, 'open', 'in-progress', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-semibold">
            {showPublicOnly ? 'Public Roadmap' : 'Roadmap'}
          </h2>
          {!showPublicOnly && onCreateNew && (
            <Button onClick={onCreateNew} size="sm">
              New Item
            </Button>
          )}
        </div>
        
        {onStatusFilter && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter by status:</span>
            {statuses.map((status) => (
              <Button
                key={status || 'all'}
                variant={selectedStatus === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onStatusFilter(status)}
              >
                {status ? statusLabels[status] : 'All'}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {selectedStatus 
                ? `No ${statusLabels[selectedStatus].toLowerCase()} items found`
                : 'No roadmap items found'
              }
            </p>
            {!showPublicOnly && onCreateNew && (
              <Button onClick={onCreateNew}>Create First Item</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={onItemClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
              onClick={() => onItemClick?.(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    {item.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Badge 
                      variant="neutral"
                      className={statusColors[item.status]}
                    >
                      {statusLabels[item.status]}
                    </Badge>
                    {item.public && (
                      <Badge variant="info" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>/{item.slug}</span>
                    {item._count?.comments !== undefined && (
                      <span>{item._count.comments} comments</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}