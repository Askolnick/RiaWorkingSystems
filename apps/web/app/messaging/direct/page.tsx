'use client';

import { useState, useEffect } from 'react';
import { useMessagingStore } from '@ria/client';
import { 
  DirectMessageList, 
  UserSearchPicker, 
  ThreadView, 
  Composer,
  Card,
  Button,
  Modal,
  ErrorBoundary,
  LoadingCard
} from '@ria/web-ui';
import { Plus, X } from 'lucide-react';

export default function DirectMessagesPage() {
  const {
    conversations,
    directMessages,
    currentConversation,
    messages,
    loading,
    conversationsLoading,
    searchedUsers,
    userSearchLoading,
    fetchDirectMessages,
    fetchConversation,
    setCurrentConversation,
    sendMessage,
    searchUsers,
    createDirectMessage,
    markConversationAsRead
  } = useMessagingStore();

  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch direct messages on mount
  useEffect(() => {
    fetchDirectMessages();
  }, []);

  // Handle conversation selection
  const handleConversationSelect = async (conversation: any) => {
    setSelectedConversationId(conversation.id);
    setCurrentConversation(conversation);
    await fetchConversation(conversation.id);
    await markConversationAsRead(conversation.id);
  };

  // Handle creating new DM
  const handleUsersSelected = async (users: any[]) => {
    try {
      const userIds = users.map(u => u.id);
      const subject = users.length === 1 
        ? `Chat with ${users[0].displayName}`
        : `Group chat with ${users.map(u => u.displayName).join(', ')}`;
      
      const conversation = await createDirectMessage(userIds, subject);
      setShowNewMessage(false);
      handleConversationSelect(conversation);
    } catch (error) {
      console.error('Failed to create DM:', error);
    }
  };

  // Handle sending message
  const handleSendMessage = async (text: string) => {
    if (!currentConversation) return;
    await sendMessage(currentConversation.id, { 
      bodyText: text, 
      as: 'chat' 
    });
  };

  // Mock current user (in real app, get from auth)
  const currentUserId = 'current-user-id';

  // Add mock participant data to conversations for display
  const enrichedConversations = directMessages.map(conv => ({
    ...conv,
    participants: conv.participantIds?.map(id => ({
      id,
      displayName: `User ${id.slice(0, 4)}`,
      avatarUrl: null
    }))
  }));

  return (
    <ErrorBoundary>
      <div className="h-[calc(100vh-4rem)] flex gap-4">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0">
          <DirectMessageList
            conversations={enrichedConversations}
            currentUserId={currentUserId}
            onConversationSelect={handleConversationSelect}
            onNewMessage={() => setShowNewMessage(true)}
            selectedConversationId={selectedConversationId || undefined}
            loading={conversationsLoading}
          />
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col">
          {currentConversation && messages[currentConversation.id] ? (
            <>
              {/* Header */}
              <Card className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {currentConversation.subject || 'Direct Message'}
                    </h2>
                    {currentConversation.participantIds && (
                      <p className="text-sm text-muted-foreground">
                        {currentConversation.participantIds.length} participant(s)
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentConversation(null);
                      setSelectedConversationId(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Messages */}
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <ThreadView
                    messages={messages[currentConversation.id] || []}
                    currentUserId={currentUserId}
                  />
                </div>
                
                {/* Composer */}
                <div className="border-t p-4">
                  <Composer
                    onSend={handleSendMessage}
                    placeholder="Type your message..."
                  />
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a conversation or start a new one
                </p>
                <Button onClick={() => setShowNewMessage(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <Modal 
        open={showNewMessage} 
        onClose={() => setShowNewMessage(false)}
        title="New Direct Message"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Search for users to start a conversation
          </p>
          <UserSearchPicker
            searchUsers={searchUsers}
            onUsersSelected={handleUsersSelected}
            multiSelect={true}
            placeholder="Search for users..."
          />
        </div>
      </Modal>
    </ErrorBoundary>
  );
}