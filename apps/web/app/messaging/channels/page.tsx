'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagingStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingCard,
  Alert,
  ErrorBoundary,
  EmptyState,
  Badge,
  Modal
} from '@ria/web-ui';
import {
  Hash,
  Lock,
  Plus,
  Search,
  Users,
  MessageSquare,
  Settings,
  Bell,
  BellOff,
  Star,
  MoreVertical,
  ChevronRight,
  Globe,
  Shield,
  UserPlus
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    author: string;
    timestamp: string;
  };
  isStarred?: boolean;
  isMuted?: boolean;
  createdAt: string;
}

export default function ChannelsPage() {
  const router = useRouter();
  const { loading, error, clearError } = useMessagingStore();
  
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      name: 'general',
      description: 'General discussion for the whole team',
      type: 'public',
      memberCount: 45,
      unreadCount: 3,
      lastMessage: {
        content: 'Welcome to the general channel!',
        author: 'System',
        timestamp: new Date().toISOString()
      },
      isStarred: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'announcements',
      description: 'Important company announcements',
      type: 'public',
      memberCount: 45,
      unreadCount: 1,
      lastMessage: {
        content: 'Q4 goals have been updated',
        author: 'Admin',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'engineering',
      description: 'Engineering team discussions',
      type: 'private',
      memberCount: 12,
      unreadCount: 0,
      lastMessage: {
        content: 'PR #234 has been merged',
        author: 'DevOps Bot',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private'
  });

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChannel = () => {
    const channel: Channel = {
      id: Date.now().toString(),
      name: newChannel.name,
      description: newChannel.description,
      type: newChannel.type,
      memberCount: 1,
      unreadCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setChannels([...channels, channel]);
    setNewChannel({ name: '', description: '', type: 'public' });
    setShowCreateModal(false);
  };

  const handleToggleStar = (channelId: string) => {
    setChannels(channels.map(ch =>
      ch.id === channelId ? { ...ch, isStarred: !ch.isStarred } : ch
    ));
  };

  const handleToggleMute = (channelId: string) => {
    setChannels(channels.map(ch =>
      ch.id === channelId ? { ...ch, isMuted: !ch.isMuted } : ch
    ));
  };

  const handleJoinChannel = (channelId: string) => {
    router.push(`/messaging/channels/${channelId}`);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'direct':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const starredChannels = filteredChannels.filter(ch => ch.isStarred);
  const regularChannels = filteredChannels.filter(ch => !ch.isStarred);

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Channels</h1>
            <p className="text-gray-600">Join channels to collaborate with your team</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Channel Categories */}
        <div className="space-y-6">
          {/* Starred Channels */}
          {starredChannels.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                <Star className="h-4 w-4 inline mr-2" />
                Starred Channels
              </h2>
              <div className="grid gap-3">
                {starredChannels.map(channel => (
                  <Card
                    key={channel.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleJoinChannel(channel.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getChannelIcon(channel.type)}
                            <h3 className="font-semibold">{channel.name}</h3>
                            {channel.unreadCount > 0 && (
                              <Badge variant="primary" className="ml-2">
                                {channel.unreadCount} new
                              </Badge>
                            )}
                            {channel.isMuted && (
                              <BellOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          
                          {channel.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {channel.description}
                            </p>
                          )}
                          
                          {channel.lastMessage && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">{channel.lastMessage.author}:</span>{' '}
                              {channel.lastMessage.content}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {channel.memberCount} members
                            </span>
                            <span>
                              {new Date(channel.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(channel.id);
                            }}
                          >
                            <Star className={`h-4 w-4 ${channel.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMute(channel.id);
                            }}
                          >
                            {channel.isMuted ? (
                              <BellOff className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Channels */}
          {regularChannels.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                <MessageSquare className="h-4 w-4 inline mr-2" />
                All Channels
              </h2>
              <div className="grid gap-3">
                {regularChannels.map(channel => (
                  <Card
                    key={channel.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleJoinChannel(channel.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getChannelIcon(channel.type)}
                            <h3 className="font-semibold">{channel.name}</h3>
                            {channel.unreadCount > 0 && (
                              <Badge variant="primary" className="ml-2">
                                {channel.unreadCount} new
                              </Badge>
                            )}
                            {channel.isMuted && (
                              <BellOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          
                          {channel.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {channel.description}
                            </p>
                          )}
                          
                          {channel.lastMessage && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">{channel.lastMessage.author}:</span>{' '}
                              {channel.lastMessage.content}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {channel.memberCount} members
                            </span>
                            <span>
                              {new Date(channel.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(channel.id);
                            }}
                          >
                            <Star className={`h-4 w-4 ${channel.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMute(channel.id);
                            }}
                          >
                            {channel.isMuted ? (
                              <BellOff className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredChannels.length === 0 && (
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No channels found"
              description={searchQuery ? "Try adjusting your search" : "Create your first channel to get started"}
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Channel
                </Button>
              }
            />
          )}
        </div>

        {/* Create Channel Modal */}
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Channel"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Channel Name</label>
              <Input
                type="text"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="e.g., marketing-team"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                placeholder="What's this channel about?"
                className="w-full px-3 py-2 border rounded-md resize-none h-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Channel Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="public"
                    checked={newChannel.type === 'public'}
                    onChange={(e) => setNewChannel({ ...newChannel, type: 'public' })}
                  />
                  <Globe className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-sm text-gray-600">Anyone can join this channel</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="private"
                    checked={newChannel.type === 'private'}
                    onChange={(e) => setNewChannel({ ...newChannel, type: 'private' })}
                  />
                  <Shield className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-sm text-gray-600">Only invited members can join</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                disabled={!newChannel.name.trim()}
              >
                Create Channel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}