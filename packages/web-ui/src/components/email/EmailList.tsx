'use client';

import React from 'react';
import { 
  Mail, 
  MailOpen, 
  Star, 
  Paperclip, 
  Shield, 
  ShieldCheck,
  Calendar,
  User,
  Reply,
  Forward,
  Archive,
  Trash2,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';

export interface EmailMessage {
  id: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: Array<{ name?: string; email: string }>;
  to: Array<{ name?: string; email: string }>;
  date: string;
  preview?: string;
  flags?: {
    seen?: boolean;
    flagged?: boolean;
    encrypted?: boolean;
    signed?: boolean;
  };
  attachments?: Array<{ id: string; name: string; size: number }>;
  priority?: 'low' | 'normal' | 'high';
  labels?: string[];
}

export interface EmailListProps {
  messages: EmailMessage[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onMessageClick: (message: EmailMessage) => void;
  onMessageAction: (action: string, messageIds: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function EmailList({
  messages,
  selectedIds,
  onSelectionChange,
  onMessageClick,
  onMessageAction,
  loading = false,
  emptyMessage = 'No emails found',
  showActions = true,
  compact = false,
  className = '',
}: EmailListProps) {
  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(messages.map(m => m.id));
    }
  };

  const handleSelectMessage = (messageId: string) => {
    const newSelection = selectedIds.includes(messageId)
      ? selectedIds.filter(id => id !== messageId)
      : [...selectedIds, messageId];
    onSelectionChange(newSelection);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatSender = (from: EmailMessage['from']): string => {
    if (!from.length) return 'Unknown';
    const sender = from[0];
    return sender.name || sender.email;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'low': return 'border-l-blue-500';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-gray-500 ${className}`}>
        <Mail className="h-12 w-12 mb-4 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Bulk actions */}
      {showActions && selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border-b">
          <span className="text-sm text-blue-700">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('mark_read', selectedIds)}
              className="text-gray-600"
            >
              <MailOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('mark_unread', selectedIds)}
              className="text-gray-600"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('flag', selectedIds)}
              className="text-gray-600"
            >
              <Flag className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('archive', selectedIds)}
              className="text-gray-600"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('delete', selectedIds)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      {showActions && (
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50 text-sm font-medium text-gray-600">
          <Checkbox
            checked={selectedIds.length === messages.length && messages.length > 0}
            indeterminate={selectedIds.length > 0 && selectedIds.length < messages.length}
            onChange={handleSelectAll}
          />
          <div className="flex-1 grid grid-cols-12 gap-2">
            <div className="col-span-4">From</div>
            <div className="col-span-5">Subject</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1"></div>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-auto">
        {messages.map((message) => {
          const isSelected = selectedIds.includes(message.id);
          const isUnread = !message.flags?.seen;
          const isEncrypted = message.flags?.encrypted;
          const isSigned = message.flags?.signed;
          const isFlagged = message.flags?.flagged;
          const hasAttachments = message.attachments && message.attachments.length > 0;

          return (
            <div
              key={message.id}
              className={`
                flex items-center gap-2 p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-50' : ''}
                ${isUnread ? 'bg-white font-medium' : 'bg-gray-50/50 text-gray-600'}
                ${getPriorityColor(message.priority)} border-l-4
              `}
              onClick={() => onMessageClick(message)}
            >
              {showActions && (
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleSelectMessage(message.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <div className="flex-1 grid grid-cols-12 gap-2 min-w-0">
                {/* From */}
                <div className="col-span-4 flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm">
                      {formatSender(message.from)}
                    </div>
                    {!compact && (
                      <div className="truncate text-xs text-gray-500">
                        {message.from[0]?.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject and preview */}
                <div className="col-span-5 min-w-0">
                  <div className="truncate text-sm">
                    {message.subject || '(no subject)'}
                  </div>
                  {!compact && message.preview && (
                    <div className="truncate text-xs text-gray-500 mt-1">
                      {message.preview}
                    </div>
                  )}
                  {message.labels && message.labels.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {message.labels.slice(0, 3).map((label) => (
                        <span
                          key={label}
                          className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-2 flex items-center justify-end text-sm text-gray-500">
                  {formatDate(message.date)}
                </div>

                {/* Indicators */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {hasAttachments && (
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  )}
                  {isEncrypted && (
                    <Shield className="h-4 w-4 text-green-500" />
                  )}
                  {isSigned && (
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  )}
                  {isFlagged && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  {isUnread && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageAction('reply', [message.id]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Reply className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageAction('forward', [message.id]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Forward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageAction('more', [message.id]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}