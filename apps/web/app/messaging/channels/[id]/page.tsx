'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMessagingStore } from '@ria/client';
import {
  Composer,
  UserSearchPicker,
  MessageAttachments,
  Card,
  Button,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Badge,
  Avatar
} from '@ria/web-ui';
import {
  ArrowLeft,
  Hash,
  Lock,
  Users,
  Settings,
  Bell,
  BellOff,
  Star,
  Info,
  UserPlus,
  Pin,
  Edit2,
  Trash2,
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  AtSign,
  Reply
} from 'lucide-react';

interface ChannelMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  attachments?: any[];
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  threadCount?: number;
  isEdited?: boolean;
  isPinned?: boolean;
}

interface ChannelInfo {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'offline';
  }>;
  createdAt: string;
  createdBy: string;
  isStarred?: boolean;
  isMuted?: boolean;
}

export default function ChannelViewPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { loading, error, clearError } = useMessagingStore();

  const [channelInfo, setChannelInfo] = useState<ChannelInfo>({
    id: channelId,
    name: 'general',
    description: 'General discussion for the whole team',
    type: 'public',
    memberCount: 45,
    members: [
      { id: '1', name: 'John Doe', status: 'online', role: 'Admin' },
      { id: '2', name: 'Jane Smith', status: 'away', role: 'Member' },
      { id: '3', name: 'Bob Johnson', status: 'offline', role: 'Member' }
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'Admin',
    isStarred: true
  });

  const [messages, setMessages] = useState<ChannelMessage[]>([
    {
      id: '1',
      content: 'Welcome to the #general channel!',
      author: { id: 'system', name: 'System' },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isPinned: true
    },
    {
      id: '2',
      content: 'Hey team, how is everyone doing today?',
      author: { id: '1', name: 'John Doe' },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      reactions: [
        { emoji: '👍', users: ['2', '3'] },
        { emoji: '❤️', users: ['2'] }
      ]
    },
    {
      id: '3',
      content: 'Great! Just finished the quarterly report.',
      author: { id: '2', name: 'Jane Smith' },
      timestamp: new Date(Date.now() - 900000).toISOString(),
      attachments: [
        { id: '1', name: 'Q4_Report.pdf', size: 2456789, type: 'application/pdf' }
      ],
      threadCount: 3
    }
  ]);

  const [composerValue, setComposerValue] = useState('');
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    const newMessage: ChannelMessage = {
      id: Date.now().toString(),
      content,
      author: { id: 'current', name: 'You' },
      timestamp: new Date().toISOString(),
      attachments
    };
    
    setMessages([...messages, newMessage]);
    setComposerValue('');
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditingContent(message.content);
    }
  };

  const handleSaveEdit = () => {
    setMessages(messages.map(msg =>
      msg.id === editingMessageId
        ? { ...msg, content: editingContent, isEdited: true }
        : msg
    ));
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const handlePinMessage = (messageId: string) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes('current')) {
            existingReaction.users = existingReaction.users.filter(u => u !== 'current');
          } else {
            existingReaction.users.push('current');
          }
        } else {
          reactions.push({ emoji, users: ['current'] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="border-b bg-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/messaging/channels')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  {channelInfo.type === 'private' ? (
                    <Lock className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Hash className="h-4 w-4 text-gray-500" />
                  )}
                  <h1 className="text-lg font-semibold">{channelInfo.name}</h1>
                  {channelInfo.isStarred && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                
                <span className="text-sm text-gray-500">
                  {channelInfo.memberCount} members
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMembersSidebar(!showMembersSidebar)}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChannelInfo({ ...channelInfo, isMuted: !channelInfo.isMuted })}
                >
                  {channelInfo.isMuted ? (
                    <BellOff className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChannelInfo(!showChannelInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {channelInfo.description && (
              <p className="text-sm text-gray-600 mt-1 ml-9">
                {channelInfo.description}
              </p>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Pinned Messages */}
            {messages.filter(m => m.isPinned).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-yellow-800">
                  <Pin className="h-4 w-4" />
                  Pinned Messages
                </div>
                {messages.filter(m => m.isPinned).map(msg => (
                  <div key={msg.id} className="text-sm text-yellow-700 mb-1">
                    <strong>{msg.author.name}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            )}

            {/* Regular Messages */}
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].author.id !== message.author.id;
              
              return (
                <div key={message.id} className="group flex gap-3">
                  {showAvatar ? (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {message.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="w-8" />
                  )}
                  
                  <div className="flex-1">
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{message.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                        {message.isEdited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                    )}
                    
                    {editingMessageId === message.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            <MessageAttachments attachments={message.attachments} />
                          </div>
                        )}
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                className={`px-2 py-1 rounded-full text-xs border ${
                                  reaction.users.includes('current')
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-gray-50 border-gray-200'
                                } hover:bg-gray-100`}
                              >
                                {reaction.emoji} {reaction.users.length}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {message.threadCount && (
                          <button className="text-xs text-blue-600 hover:underline mt-1">
                            {message.threadCount} replies
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-1">
                      <button
                        onClick={() => handleAddReaction(message.id, '👍')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Smile className="h-3 w-3 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Reply className="h-3 w-3 text-gray-500" />
                      </button>
                      {message.author.id === 'current' && (
                        <>
                          <button
                            onClick={() => handleEditMessage(message.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="h-3 w-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePinMessage(message.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Pin className={`h-3 w-3 ${message.isPinned ? 'text-yellow-500' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <div className="border-t bg-white p-4">
            <Composer
              value={composerValue}
              onChange={setComposerValue}
              onSend={handleSendMessage}
              placeholder={`Message #${channelInfo.name}`}
              allowAttachments={true}
              showTemplates={false}
            />
          </div>
        </div>

        {/* Members Sidebar */}
        {showMembersSidebar && (
          <div className="w-64 border-l bg-white p-4">
            <h3 className="font-semibold mb-4">Members ({channelInfo.memberCount})</h3>
            <div className="space-y-2">
              {channelInfo.members.map(member => (
                <div key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    {member.role && (
                      <p className="text-xs text-gray-500">{member.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}