'use client';

import React, { useEffect, useState } from 'react';
import { useEmailStore } from '@ria/client';
import { 
  EmailList, 
  EmailThread, 
  EmailComposer,
  Button,
  Card,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Input
} from '@ria/web-ui';
import { 
  Mail, 
  Plus, 
  RefreshCw, 
  Search,
  Settings,
  Inbox,
  Send,
  FileText,
  Trash2,
  Archive,
  Star
} from 'lucide-react';

export default function EmailPage() {
  const {
    accounts,
    currentAccountId,
    folders,
    currentFolderId,
    threads,
    currentThread,
    selectedMessageIds,
    loading,
    syncing,
    error,
    searchQuery,
    composerOpen,
    currentDraft,
    fetchAccounts,
    fetchFolders,
    fetchThreads,
    fetchThread,
    setCurrentAccount,
    setCurrentFolder,
    setCurrentThread,
    sendEmail,
    markAsRead,
    markAsUnread,
    flagMessages,
    archiveMessages,
    deleteMessages,
    setSelectedMessages,
    searchMessages,
    setSearchQuery,
    openComposer,
    closeComposer,
    syncAccount,
    clearError
  } = useEmailStore();

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Initialize email data
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (currentAccountId) {
      fetchFolders(currentAccountId);
      fetchThreads(currentAccountId);
    }
  }, [currentAccountId]);

  const handleMessageClick = (message: any) => {
    // Find the thread containing this message
    const thread = threads.find(t => 
      t.messages.some(m => m.id === message.id)
    );
    if (thread) {
      setCurrentThread(thread);
      // Mark as read
      if (!message.flags?.seen) {
        markAsRead([message.id]);
      }
    }
  };

  const handleReply = (message: any) => {
    openComposer({
      to: message.from,
      subject: message.subject?.startsWith('Re:') 
        ? message.subject 
        : `Re: ${message.subject}`,
      replyTo: message.id
    });
  };

  const handleReplyAll = (message: any) => {
    const recipients = [
      ...message.from,
      ...message.to.filter((t: any) => t.email !== currentAccountId),
      ...(message.cc || [])
    ];
    openComposer({
      to: recipients,
      subject: message.subject?.startsWith('Re:') 
        ? message.subject 
        : `Re: ${message.subject}`,
      replyTo: message.id
    });
  };

  const handleForward = (message: any) => {
    openComposer({
      subject: `Fwd: ${message.subject}`,
      text: `\n\n--- Forwarded message ---\nFrom: ${message.from[0]?.email}\nDate: ${message.date}\nSubject: ${message.subject}\n\n${message.text || ''}`
    });
  };

  const handleMessageAction = async (action: string, messageOrIds: any) => {
    const ids = Array.isArray(messageOrIds) ? messageOrIds : [messageOrIds.id];
    
    switch (action) {
      case 'flag':
        await flagMessages(ids, true);
        break;
      case 'unflag':
        await flagMessages(ids, false);
        break;
      case 'archive':
      case 'archive_thread':
        await archiveMessages(ids);
        break;
      case 'delete':
      case 'delete_thread':
        await deleteMessages(ids);
        break;
      case 'mark_read':
        await markAsRead(ids);
        break;
      case 'mark_unread':
        await markAsUnread(ids);
        break;
      case 'reply':
        handleReply(messageOrIds);
        break;
      case 'reply_all':
        handleReplyAll(messageOrIds);
        break;
      case 'forward':
        handleForward(messageOrIds);
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchMessages(searchInput);
    }
  };

  const handleSync = () => {
    if (currentAccountId) {
      syncAccount(currentAccountId);
    }
  };

  // Get messages for the list view
  const messages = threads.flatMap(thread => 
    thread.messages.map(msg => ({
      ...msg,
      threadId: thread.id
    }))
  );

  if (loading && accounts.length === 0) {
    return <LoadingCard />;
  }

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No Email Accounts</h2>
        <p className="text-gray-600 mb-4">Add an email account to get started</p>
        <Button onClick={() => window.location.href = '/email/accounts'}>
          Add Email Account
        </Button>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Email</h1>
            {currentAccountId && (
              <select
                value={currentAccountId}
                onChange={(e) => setCurrentAccount(e.target.value)}
                className="px-3 py-1.5 border rounded-md"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.email})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search emails..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              onClick={() => openComposer({})}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Compose
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/email/settings'}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Folders */}
          <div className="w-64 border-r p-4 overflow-y-auto">
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 ${
                    currentFolderId === folder.id ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {folder.type === 'inbox' && <Inbox className="h-4 w-4" />}
                    {folder.type === 'sent' && <Send className="h-4 w-4" />}
                    {folder.type === 'drafts' && <FileText className="h-4 w-4" />}
                    {folder.type === 'trash' && <Trash2 className="h-4 w-4" />}
                    {folder.type === 'spam' && <Archive className="h-4 w-4" />}
                    {folder.type === 'custom' && <Star className="h-4 w-4" />}
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  {folder.unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {folder.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email list or thread view */}
          <div className="flex-1 flex overflow-hidden">
            {currentThread ? (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentThread(null)}
                  >
                    ← Back to list
                  </Button>
                </div>
                <EmailThread
                  thread={currentThread}
                  onReply={handleReply}
                  onReplyAll={handleReplyAll}
                  onForward={handleForward}
                  onMessageAction={handleMessageAction}
                  currentUserId={currentAccountId || undefined}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <EmailList
                  messages={messages}
                  selectedIds={selectedMessageIds}
                  onSelectionChange={setSelectedMessages}
                  onMessageClick={handleMessageClick}
                  onMessageAction={handleMessageAction}
                  loading={loading}
                  emptyMessage={searchQuery ? 'No emails found' : 'No emails in this folder'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Email Composer */}
        <EmailComposer
          isOpen={composerOpen}
          onClose={closeComposer}
          onSend={sendEmail}
          defaultTo={currentDraft?.to || []}
          defaultSubject={currentDraft?.subject || ''}
          enableEncryption={true}
          enableScheduling={true}
        />
      </div>
    </ErrorBoundary>
  );
}