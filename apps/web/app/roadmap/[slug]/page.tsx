'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRoadmapStore, useAuthStore } from '@ria/client';
import { RoadmapDetail } from '@ria/web-ui';
import { LoadingCard, Alert } from '@ria/web-ui';
import type { CreateRoadmapCommentData } from '@ria/roadmap-server';

export default function RoadmapDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const { user } = useAuthStore();
  const { 
    currentItem, 
    itemLoading, 
    itemError,
    commentsLoading,
    commentsError,
    fetchItemBySlug,
    createComment,
    deleteComment,
    clearCurrentItem,
    clearError
  } = useRoadmapStore();

  useEffect(() => {
    if (slug) {
      fetchItemBySlug(slug);
    }
    
    return () => {
      clearCurrentItem();
    };
  }, [slug, fetchItemBySlug, clearCurrentItem]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleCommentCreate = async (data: CreateRoadmapCommentData) => {
    await createComment(data);
  };

  const handleCommentDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleBack = () => {
    router.push('/roadmap');
  };

  if (itemLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingCard />
      </div>
    );
  }

  if (itemError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">{itemError}</Alert>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">Roadmap item not found</Alert>
      </div>
    );
  }

  // Only allow comments for public roadmap items
  const canComment = currentItem.public && !!user;
  const canManage = false; // For public roadmap, users can't manage

  return (
    <div className="container mx-auto px-4 py-8">
      <RoadmapDetail
        item={currentItem}
        loading={itemLoading}
        error={itemError}
        commentsLoading={commentsLoading[currentItem.id] || false}
        commentsError={commentsError[currentItem.id]}
        onCommentCreate={canComment ? handleCommentCreate : undefined}
        onCommentDelete={canManage ? handleCommentDelete : undefined}
        onBack={handleBack}
        canComment={canComment}
        canManage={canManage}
      />
    </div>
  );
}