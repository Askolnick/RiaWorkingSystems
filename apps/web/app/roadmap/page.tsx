'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmapStore } from '@ria/client';
import { RoadmapList } from '@ria/web-ui';
import type { RoadmapStatus, RoadmapItem } from '@ria/roadmap-server';

export default function RoadmapPage() {
  const router = useRouter();
  const { 
    items, 
    loading, 
    error, 
    fetchPublicItems, 
    fetchItemsByStatus,
    clearError 
  } = useRoadmapStore();
  
  const [selectedStatus, setSelectedStatus] = useState<RoadmapStatus | null>(null);

  useEffect(() => {
    if (selectedStatus) {
      fetchItemsByStatus(selectedStatus);
    } else {
      fetchPublicItems();
    }
  }, [selectedStatus, fetchPublicItems, fetchItemsByStatus]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleItemClick = (item: RoadmapItem) => {
    router.push(`/roadmap/${item.slug}`);
  };

  const handleStatusFilter = (status: RoadmapStatus | null) => {
    setSelectedStatus(status);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <RoadmapList
        items={items}
        loading={loading}
        error={error}
        onItemClick={handleItemClick}
        onStatusFilter={handleStatusFilter}
        selectedStatus={selectedStatus}
        showPublicOnly={true}
      />
    </div>
  );
}