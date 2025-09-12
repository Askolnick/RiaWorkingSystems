'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { LoadingCard } from '../components/atoms/Loading';
import { Alert } from '../components/molecules/Alert';
import type { 
  RoadmapItemWithComments, 
  RoadmapComment, 
  CreateRoadmapCommentData,
  RoadmapStatus 
} from '@ria/roadmap-server';

interface RoadmapDetailProps {
  item: RoadmapItemWithComments;
  loading?: boolean;
  error?: string | null;
  commentsLoading?: boolean;
  commentsError?: string | null;
  onCommentCreate?: (data: CreateRoadmapCommentData) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onBack?: () => void;
  canComment?: boolean;
  canManage?: boolean;
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

export function RoadmapDetail({
  item,
  loading = false,
  error = null,
  commentsLoading = false,
  commentsError = null,
  onCommentCreate,
  onCommentDelete,
  onBack,
  canComment = false,
  canManage = false,
}: RoadmapDetailProps) {
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentBody.trim() || !onCommentCreate) return;

    setSubmittingComment(true);
    try {
      await onCommentCreate({
        roadmapItemId: item.id,
        body: commentBody.trim(),
      });
      setCommentBody('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!onCommentDelete) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await onCommentDelete(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            ← Back to Roadmap
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <Badge 
            variant="neutral"
            className={statusColors[item.status]}
          >
            {statusLabels[item.status]}
          </Badge>
          {item.public && (
            <Badge variant="info">
              Public
            </Badge>
          )}
        </div>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{item.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>/{item.slug}</span>
            <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
            <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        
        {item.description && (
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comments section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Comments ({item.comments?.length || 0})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Comment form */}
          {canComment && onCommentCreate && (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                disabled={submittingComment}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!commentBody.trim() || submittingComment}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : commentsError ? (
            <Alert type="error">{commentsError}</Alert>
          ) : item.comments && item.comments.length > 0 ? (
            <div className="space-y-4">
              {item.comments.map((comment: RoadmapComment) => (
                <div 
                  key={comment.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {comment.author?.displayName && (
                          <span className="font-medium text-sm">
                            {comment.author.displayName}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                    
                    {(canManage || comment.authorId === 'current-user') && onCommentDelete && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCommentDelete(comment.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No comments yet. {canComment ? 'Be the first to comment!' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}