'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Reply,
  ReplyAll,
  Forward,
  Star,
  Shield,
  ShieldCheck,
  Paperclip,
  ExternalLink,
  Download,
  Trash2,
  Archive,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { MessageAttachments, MessageAttachment } from '../messaging/MessageAttachments';

export interface EmailMessage {
  id: string;
  messageId: string;
  subject: string;
  from: Array<{ name?: string; email: string }>;
  to: Array<{ name?: string; email: string }>;
  cc?: Array<{ name?: string; email: string }>;
  date: string;
  html?: string;
  text?: string;
  attachments?: MessageAttachment[];
  flags?: {
    seen?: boolean;
    flagged?: boolean;
    encrypted?: boolean;
    signed?: boolean;
  };
  priority?: 'low' | 'normal' | 'high';
}

export interface EmailThread {
  id: string;
  subject: string;
  messages: EmailMessage[];
  participants: Array<{ name?: string; email: string }>;
  unreadCount: number;
}

export interface EmailThreadProps {
  thread: EmailThread;
  onReply: (message: EmailMessage) => void;
  onReplyAll: (message: EmailMessage) => void;
  onForward: (message: EmailMessage) => void;
  onMessageAction: (action: string, message: EmailMessage) => void;
  onAttachmentDownload?: (attachment: MessageAttachment) => void;
  onAttachmentPreview?: (attachment: MessageAttachment) => void;
  currentUserId?: string;
  className?: string;
}

export function EmailThread({
  thread,
  onReply,
  onReplyAll,
  onForward,
  onMessageAction,
  onAttachmentDownload,
  onAttachmentPreview,
  currentUserId,
  className = '',
}: EmailThreadProps) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set([thread.messages[thread.messages.length - 1]?.id]) // Expand last message by default
  );

  const toggleMessage = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatSender = (from: EmailMessage['from']): string => {
    if (!from.length) return 'Unknown';
    const sender = from[0];
    return sender.name || sender.email;
  };

  const formatRecipients = (recipients: Array<{ name?: string; email: string }>): string => {
    return recipients
      .map(r => r.name || r.email)
      .join(', ');
  };

  const sanitizeHTML = (html: string): string => {
    // Basic sanitization - in production, use DOMPurify
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '');
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <span className="text-red-500 text-xs font-medium">HIGH PRIORITY</span>;
      case 'low':
        return <span className="text-blue-500 text-xs font-medium">LOW PRIORITY</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Thread header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold mb-2">{thread.subject}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}</span>
          <span>{thread.participants.length} participant{thread.participants.length !== 1 ? 's' : ''}</span>
          {thread.unreadCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {thread.unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {thread.messages.map((message, index) => {
          const isExpanded = expandedMessages.has(message.id);
          const isUnread = !message.flags?.seen;
          const isLast = index === thread.messages.length - 1;

          return (
            <Card key={message.id} className={`${isUnread ? 'ring-2 ring-blue-500' : ''}`}>
              {/* Message header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleMessage(message.id)}
              >
                <button className="text-gray-400 hover:text-gray-600">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {formatSender(message.from).charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isUnread ? 'font-semibold' : ''}`}>
                      {formatSender(message.from)}
                    </span>
                    {message.flags?.encrypted && (
                      <Shield className="h-4 w-4 text-green-500" title="Encrypted" />
                    )}
                    {message.flags?.signed && (
                      <ShieldCheck className="h-4 w-4 text-blue-500" title="Signed" />
                    )}
                    {message.flags?.flagged && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" title="Flagged" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    to {formatRecipients(message.to)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {getPriorityIndicator(message.priority)}
                  <span>{formatDate(message.date)}</span>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-xs">{message.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded message content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  {/* Detailed headers */}
                  <div className="mb-4 text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>From:</strong> {message.from.map(f => f.name ? `${f.name} <${f.email}>` : f.email).join(', ')}
                    </div>
                    <div>
                      <strong>To:</strong> {message.to.map(t => t.name ? `${t.name} <${t.email}>` : t.email).join(', ')}
                    </div>
                    {message.cc && message.cc.length > 0 && (
                      <div>
                        <strong>CC:</strong> {message.cc.map(c => c.name ? `${c.name} <${c.email}>` : c.email).join(', ')}
                      </div>
                    )}
                    <div>
                      <strong>Date:</strong> {formatDate(message.date)}
                    </div>
                  </div>

                  {/* Message content */}
                  <div className="mb-4">
                    {message.html ? (
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHTML(message.html),
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {message.text}
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-4">
                      <MessageAttachments
                        attachments={message.attachments}
                        onDownload={onAttachmentDownload}
                        onPreview={onAttachmentPreview}
                      />
                    </div>
                  )}

                  {/* Message actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReply(message)}
                        className="flex items-center gap-1"
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>
                      
                      {message.to.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReplyAll(message)}
                          className="flex items-center gap-1"
                        >
                          <ReplyAll className="h-4 w-4" />
                          Reply All
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onForward(message)}
                        className="flex items-center gap-1"
                      >
                        <Forward className="h-4 w-4" />
                        Forward
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessageAction('flag', message)}
                        className={`${message.flags?.flagged ? 'text-yellow-500' : 'text-gray-500'}`}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessageAction('archive', message)}
                        className="text-gray-500"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessageAction('delete', message)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessageAction('more', message)}
                        className="text-gray-500"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Thread actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onReply(thread.messages[thread.messages.length - 1])}
              className="flex items-center gap-2"
            >
              <Reply className="h-4 w-4" />
              Reply to Thread
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => onReplyAll(thread.messages[thread.messages.length - 1])}
              className="flex items-center gap-2"
            >
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('archive_thread', thread.messages[0])}
              className="text-gray-600"
            >
              <Archive className="h-4 w-4" />
              Archive Thread
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction('delete_thread', thread.messages[0])}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete Thread
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}