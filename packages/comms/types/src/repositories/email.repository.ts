import { BaseRepository } from './base.repository';

export interface EmailAccount {
  id: string;
  email: string;
  name: string;
  provider: 'gmail' | 'outlook' | 'custom';
  settings?: Record<string, any>;
  isDefault?: boolean;
}

export interface EmailMessage {
  id: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: Array<{ name?: string; email: string }>;
  to: Array<{ name?: string; email: string }>;
  cc?: Array<{ name?: string; email: string }>;
  bcc?: Array<{ name?: string; email: string }>;
  date: string;
  html?: string;
  text?: string;
  preview?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    contentType: string;
  }>;
  flags?: {
    seen?: boolean;
    flagged?: boolean;
    encrypted?: boolean;
    signed?: boolean;
  };
  priority?: 'low' | 'normal' | 'high';
  labels?: string[];
}

export interface EmailThread {
  id: string;
  subject: string;
  messages: EmailMessage[];
  participants: Array<{ name?: string; email: string }>;
  unreadCount: number;
  lastMessageDate: string;
}

export interface EmailDraft {
  to: Array<{ name?: string; email: string }>;
  cc?: Array<{ name?: string; email: string }>;
  bcc?: Array<{ name?: string; email: string }>;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    content: string;
  }>;
  encrypt?: boolean;
  sign?: boolean;
  priority?: 'low' | 'normal' | 'high';
  scheduleAt?: string;
  replyTo?: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  unreadCount: number;
  totalCount: number;
  icon?: string;
}

export class EmailRepository extends BaseRepository<EmailMessage> {
  protected endpoint = '/email/messages';

  async getAccounts(): Promise<EmailAccount[]> {
    return this.request<EmailAccount[]>('GET', '/email/accounts');
  }

  async addAccount(account: Omit<EmailAccount, 'id'>): Promise<EmailAccount> {
    return this.request<EmailAccount>('POST', '/email/accounts', account);
  }

  async updateAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    return this.request<EmailAccount>('PUT', `/email/accounts/${id}`, updates);
  }

  async deleteAccount(id: string): Promise<void> {
    return this.request<void>('DELETE', `/email/accounts/${id}`);
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    return this.request<EmailFolder[]>('GET', `/email/accounts/${accountId}/folders`);
  }

  async getThreads(accountId: string, folderId: string = 'inbox'): Promise<EmailThread[]> {
    return this.request<EmailThread[]>('GET', `/email/accounts/${accountId}/folders/${folderId}/threads`);
  }

  async getThread(threadId: string): Promise<EmailThread> {
    return this.request<EmailThread>('GET', `/email/threads/${threadId}`);
  }

  async getMessage(messageId: string): Promise<EmailMessage> {
    return this.request<EmailMessage>('GET', `/email/messages/${messageId}`);
  }

  async sendEmail(accountId: string, draft: EmailDraft): Promise<{ messageId: string; threadId: string }> {
    return this.request<{ messageId: string; threadId: string }>('POST', `/email/accounts/${accountId}/send`, draft);
  }

  async saveDraft(accountId: string, draft: EmailDraft): Promise<EmailMessage> {
    return this.request<EmailMessage>('POST', `/email/accounts/${accountId}/drafts`, draft);
  }

  async updateDraft(draftId: string, draft: EmailDraft): Promise<EmailMessage> {
    return this.request<EmailMessage>('PUT', `/email/drafts/${draftId}`, draft);
  }

  async deleteDraft(draftId: string): Promise<void> {
    return this.request<void>('DELETE', `/email/drafts/${draftId}`);
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    return this.request<void>('POST', '/email/messages/mark-read', { messageIds });
  }

  async markAsUnread(messageIds: string[]): Promise<void> {
    return this.request<void>('POST', '/email/messages/mark-unread', { messageIds });
  }

  async flagMessages(messageIds: string[], flagged: boolean): Promise<void> {
    return this.request<void>('POST', '/email/messages/flag', { messageIds, flagged });
  }

  async moveToFolder(messageIds: string[], folderId: string): Promise<void> {
    return this.request<void>('POST', '/email/messages/move', { messageIds, folderId });
  }

  async archiveMessages(messageIds: string[]): Promise<void> {
    return this.request<void>('POST', '/email/messages/archive', { messageIds });
  }

  async deleteMessages(messageIds: string[]): Promise<void> {
    return this.request<void>('POST', '/email/messages/delete', { messageIds });
  }

  async searchMessages(accountId: string, query: string): Promise<EmailMessage[]> {
    return this.request<EmailMessage[]>('GET', `/email/accounts/${accountId}/search?q=${encodeURIComponent(query)}`);
  }

  async syncAccount(accountId: string): Promise<{ synced: number; errors: string[] }> {
    return this.request<{ synced: number; errors: string[] }>('POST', `/email/accounts/${accountId}/sync`);
  }
}

export const emailRepository = new EmailRepository();