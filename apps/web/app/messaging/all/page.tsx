'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagingStore } from '@ria/client';
import {
  Card,
  CardContent,
  Button,
  Input,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@ria/web-ui';
import {
  Search,
  Filter,
  SortAsc,
  MessageSquare,
  Mail,
  Users,
  Hash,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Archive,
  Calendar,
  ChevronRight,
  Inbox as InboxIcon,
  Send,
  FileText
} from 'lucide-react';

interface UnifiedMessage {
  id: string;
  type: 'email' | 'direct' | 'channel' | 'inbox';
  subject?: string;
  content: string;
  from: {
    name: string;
    email?: string;
    avatar?: string;
  };
  to?: string;
  channel?: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  hasAttachments?: boolean;
  isStarred?: boolean;
  tags?: string[];
}

export default function AllMessagesPage() {
  const router = useRouter();
  const { loading, error, clearError } = useMessagingStore();
  
  const [messages, setMessages] = useState<UnifiedMessage[]>([
    // Email messages
    {
      id: 'email-1',
      type: 'email',
      subject: 'Project Update Required',
      content: 'Please provide an update on the Q4 project status...',
      from: { name: 'John Doe', email: 'john@example.com' },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'unread',
      priority: 'high',
      hasAttachments: true,
      tags: ['project', 'urgent']
    },
    // Direct messages
    {
      id: 'dm-1',
      type: 'direct',
      content: 'Hey, can we discuss the new feature implementation?',
      from: { name: 'Jane Smith' },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'read',
      priority: 'normal'
    },
    // Channel messages
    {
      id: 'channel-1',
      type: 'channel',
      content: 'New deployment scheduled for tonight at 10 PM',
      from: { name: 'DevOps Bot' },
      channel: 'engineering',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'read',
      priority: 'normal',
      tags: ['deployment']
    },
    // Inbox conversations
    {
      id: 'inbox-1',
      type: 'inbox',
      subject: 'Customer Support Request',
      content: 'I need help with my account settings...',
      from: { name: 'Customer', email: 'customer@example.com' },
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      status: 'unread',
      priority: 'high',
      tags: ['support']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'email' | 'direct' | 'channel' | 'inbox'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Filter messages based on criteria
  const filteredMessages = messages.filter(msg => {
    // Type filter
    if (selectedType !== 'all' && msg.type !== selectedType) return false;
    
    // Status filter
    if (selectedStatus === 'unread' && msg.status !== 'unread') return false;
    if (selectedStatus === 'starred' && !msg.isStarred) return false;
    if (selectedStatus === 'archived' && msg.status !== 'archived') return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = msg.content.toLowerCase().includes(query);
      const matchesSubject = msg.subject?.toLowerCase().includes(query);
      const matchesSender = msg.from.name.toLowerCase().includes(query);
      const matchesTags = msg.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return matchesContent || matchesSubject || matchesSender || matchesTags;
    }
    
    return true;
  });

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']);
      case 'sender':
        return a.from.name.localeCompare(b.from.name);
      default: // date
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleMessageClick = (message: UnifiedMessage) => {
    switch (message.type) {
      case 'email':
        router.push('/email');
        break;
      case 'direct':
        router.push('/messaging/direct');
        break;
      case 'channel':
        router.push(`/messaging/channels/${message.channel}`);
        break;
      case 'inbox':
        router.push(`/messaging/inbox/${message.id}`);
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'direct':
        return <Users className="h-4 w-4" />;
      case 'channel':
        return <Hash className="h-4 w-4" />;
      case 'inbox':
        return <InboxIcon className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const messageStats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    starred: messages.filter(m => m.isStarred).length,
    highPriority: messages.filter(m => m.priority === 'high' || m.priority === 'urgent').length
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
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">All Messages</h1>
          <p className="text-gray-600">Unified view of all your communications</p>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{messageStats.total}</p>
                    <p className="text-sm text-gray-500">Total Messages</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{messageStats.unread}</p>
                    <p className="text-sm text-gray-500">Unread</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{messageStats.starred}</p>
                    <p className="text-sm text-gray-500">Starred</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{messageStats.highPriority}</p>
                    <p className="text-sm text-gray-500">High Priority</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search all messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="sender">Sort by Sender</option>
            </select>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as any)}
                      className="px-3 py-1.5 border rounded-md text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="email">Email</option>
                      <option value="direct">Direct Messages</option>
                      <option value="channel">Channels</option>
                      <option value="inbox">Inbox</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="px-3 py-1.5 border rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread Only</option>
                      <option value="starred">Starred</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {sortedMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No messages found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search or filters
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            sortedMessages.map(message => (
              <Card
                key={message.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Type Icon */}
                      <div className="mt-1">
                        {getTypeIcon(message.type)}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${
                            message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {message.from.name}
                          </span>
                          
                          {message.channel && (
                            <>
                              <span className="text-gray-400">in</span>
                              <span className="text-sm text-gray-600">#{message.channel}</span>
                            </>
                          )}
                          
                          {message.priority && (
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                          )}
                          
                          {message.isStarred && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        
                        {message.subject && (
                          <p className={`text-sm mb-1 ${
                            message.status === 'unread' ? 'font-medium' : ''
                          }`}>
                            {message.subject}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 truncate">
                          {message.content}
                        </p>
                        
                        {message.tags && message.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {message.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      
                      {getStatusIcon(message.status)}
                      
                      {message.hasAttachments && (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}