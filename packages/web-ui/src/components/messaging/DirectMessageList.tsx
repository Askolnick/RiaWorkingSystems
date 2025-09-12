'use client';

import { useState } from 'react';
import { MessageSquare, Users, Circle, Search, Plus } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../../Avatar/Avatar';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  subject?: string;
  lastAt: string;
  isDirect?: boolean;
  isGroup?: boolean;
  participantIds?: string[];
  participants?: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  }>;
  lastMessage?: {
    bodyText: string;
    author?: string;
  };
  unreadCount?: number;
}

interface DirectMessageListProps {
  conversations: Conversation[];
  currentUserId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  onNewMessage: () => void;
  selectedConversationId?: string;
  loading?: boolean;
}

export function DirectMessageList({
  conversations,
  currentUserId,
  onConversationSelect,
  onNewMessage,
  selectedConversationId,
  loading = false
}: DirectMessageListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const subject = conv.subject?.toLowerCase() || '';
    const participants = conv.participants?.map(p => p.displayName.toLowerCase()).join(' ') || '';
    
    return subject.includes(query) || participants.includes(query);
  });

  // Group conversations into DMs and Group Chats
  const directMessages = filteredConversations.filter(c => c.isDirect && !c.isGroup);
  const groupChats = filteredConversations.filter(c => c.isGroup);

  const getConversationTitle = (conv: Conversation) => {
    if (conv.subject) return conv.subject;
    
    if (conv.participants) {
      // For DMs, show the other person's name
      if (conv.isDirect && !conv.isGroup) {
        const otherUser = conv.participants.find(p => p.id !== currentUserId);
        return otherUser?.displayName || 'Unknown User';
      }
      
      // For groups, show participant names
      return conv.participants.map(p => p.displayName).join(', ');
    }
    
    return 'Conversation';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.isDirect && !conv.isGroup && conv.participants) {
      const otherUser = conv.participants.find(p => p.id !== currentUserId);
      return {
        src: otherUser?.avatarUrl,
        fallback: otherUser?.displayName?.[0] || '?'
      };
    }
    return {
      src: null,
      fallback: conv.isGroup ? 'G' : 'C'
    };
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const isSelected = selectedConversationId === conversation.id;
    const avatar = getConversationAvatar(conversation);
    const title = getConversationTitle(conversation);
    const hasUnread = (conversation.unreadCount || 0) > 0;
    
    return (
      <button
        onClick={() => onConversationSelect(conversation)}
        className={cn(
          'w-full p-3 flex items-start gap-3 hover:bg-accent transition-colors text-left',
          isSelected && 'bg-accent',
          hasUnread && 'font-semibold'
        )}
      >
        <div className="relative">
          <Avatar
            src={avatar.src}
            alt={title}
            size="md"
            fallback={avatar.fallback}
          />
          {hasUnread && (
            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-primary text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className={cn('truncate', hasUnread && 'text-foreground')}>
              {title}
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(conversation.lastAt), { addSuffix: true })}
            </div>
          </div>
          
          {conversation.lastMessage && (
            <div className={cn(
              'text-sm truncate',
              hasUnread ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {conversation.lastMessage.author && (
                <span>{conversation.lastMessage.author}: </span>
              )}
              {conversation.lastMessage.bodyText}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            {conversation.isGroup && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {conversation.participants?.length || 0} members
              </Badge>
            )}
            {hasUnread && (
              <Badge variant="default" className="text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Direct Messages
          </h2>
          <Button
            onClick={onNewMessage}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No conversations yet</p>
            <p className="text-sm">Start a new conversation to get started</p>
          </div>
        ) : (
          <div>
            {/* Direct Messages Section */}
            {directMessages.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  DIRECT MESSAGES ({directMessages.length})
                </div>
                {directMessages.map(conv => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </div>
            )}
            
            {/* Group Chats Section */}
            {groupChats.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  GROUP CHATS ({groupChats.length})
                </div>
                {groupChats.map(conv => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}