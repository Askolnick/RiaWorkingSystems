'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMessagingStore } from '@ria/client';
import {
  ThreadView,
  Composer,
  MessageAttachments,
  UserSearchPicker,
  Card,
  Button,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Badge
} from '@ria/web-ui';
import {
  ArrowLeft,
  Clock,
  User,
  Users,
  Tag,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MoreHorizontal,
  Reply,
  Forward,
  ExternalLink
} from 'lucide-react';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;

  const {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversation,
    fetchMessages,
    sendMessage,
    updateConversationStatus,
    assignConversation,
    addTagToConversation,
    removeTagFromConversation,
    clearError
  } = useMessagingStore();

  const [composerOpen, setComposerOpen] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    await sendMessage(conversationId, {
      content,
      attachments,
      source: 'app'
    });
    setComposerOpen(false);
  };

  const handleStatusChange = async (status: 'open' | 'snoozed' | 'closed') => {
    await updateConversationStatus(conversationId, status);
  };

  const handleAssign = async (userId: string) => {
    await assignConversation(conversationId, userId);
    setAssigneePickerOpen(false);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      await addTagToConversation(conversationId, tagInput.trim());
      setTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    await removeTagFromConversation(conversationId, tag);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case 'snoozed':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading && !currentConversation) {
    return <LoadingCard />;
  }

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentConversation) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
        <p className="text-gray-600 mb-4">This conversation may have been deleted or archived</p>
        <Button onClick={() => router.push('/messaging/inbox')}>
          Back to Inbox
        </Button>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/messaging/inbox')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Inbox
                </Button>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentConversation.status)}
                  <span className="text-sm text-gray-500 capitalize">
                    {currentConversation.status}
                  </span>
                </div>

                <Badge className={getPriorityColor(currentConversation.priority)}>
                  {currentConversation.priority || 'normal'} priority
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('open')}
                  disabled={currentConversation.status === 'open'}
                >
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('snoozed')}
                  disabled={currentConversation.status === 'snoozed'}
                >
                  Snooze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('closed')}
                  disabled={currentConversation.status === 'closed'}
                >
                  Close
                </Button>
                
                <div className="h-6 w-px bg-gray-200" />
                
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Title */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold mb-2">
                {currentConversation.subject || 'No subject'}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{currentConversation.participantName || 'Unknown'}</span>
                  {currentConversation.participantEmail && (
                    <span className="text-gray-400">({currentConversation.participantEmail})</span>
                  )}
                </div>
                
                {currentConversation.source && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <span className="capitalize">{currentConversation.source}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Started {new Date(currentConversation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags and Assignment */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tags:</span>
                {currentConversation.tags?.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag..."
                      className="px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                    <Button type="submit" size="sm">Add</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowTagInput(false);
                        setTagInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTagInput(true)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Assigned to:</span>
                {currentConversation.assignedTo ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {currentConversation.assignedTo}
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssigneePickerOpen(true)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <ThreadView
            messages={messages}
            onReply={() => setComposerOpen(true)}
            currentUserId="current-user"
            showActions={true}
          />
          
          {messages.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No messages in this conversation yet</p>
            </Card>
          )}
        </div>

        {/* Composer */}
        <div className="border-t bg-white p-4">
          {composerOpen ? (
            <Composer
              onSend={handleSendMessage}
              onCancel={() => setComposerOpen(false)}
              placeholder="Type your reply..."
              allowAttachments={true}
              showTemplates={true}
            />
          ) : (
            <Button
              onClick={() => setComposerOpen(true)}
              className="w-full justify-start"
              variant="outline"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply to this conversation
            </Button>
          )}
        </div>

        {/* User Picker Modal */}
        {assigneePickerOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 p-4">
              <h3 className="text-lg font-semibold mb-4">Assign Conversation</h3>
              <UserSearchPicker
                onSelect={handleAssign}
                onCancel={() => setAssigneePickerOpen(false)}
              />
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}