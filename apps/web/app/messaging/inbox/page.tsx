'use client'
import { useEffect } from 'react'
import { useMessagingStore } from '@ria/client'
import { ConversationList, MessageSidebar, LoadingCard, ErrorAlert } from '@ria/web-ui'

export default function MessagingInbox() {
  const {
    conversations,
    inboxes,
    conversationsLoading,
    loading,
    error,
    activeFilter,
    fetchInboxes,
    fetchConversations,
    setActiveFilter,
    clearError
  } = useMessagingStore()

  useEffect(() => {
    fetchInboxes()
    fetchConversations()
  }, [fetchInboxes, fetchConversations])

  useEffect(() => {
    if (Object.keys(activeFilter).length > 0) {
      fetchConversations(activeFilter)
    }
  }, [activeFilter, fetchConversations])

  const handleFilter = (filter: typeof activeFilter) => {
    setActiveFilter(filter)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <ErrorAlert onClose={clearError}>
        {error}
      </ErrorAlert>
    )
  }

  return (
    <div className="flex h-full gap-6">
      <aside className="w-80 flex-shrink-0">
        <MessageSidebar 
          inboxes={inboxes} 
          onFilter={handleFilter}
        />
      </aside>
      
      <main className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Unified Inbox</h1>
          <p className="text-muted-foreground">
            {conversationsLoading ? 'Loading...' : 
             `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        {conversationsLoading ? (
          <LoadingCard />
        ) : (
          <ConversationList 
            items={conversations} 
            baseUrl="/messaging/inbox"
            onConversationClick={(conversation) => {
              // Navigation will be handled by the parent app
              window.location.href = `/messaging/inbox/${conversation.id}`
            }}
          />
        )}
      </main>
    </div>
  )
}