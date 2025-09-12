import { v4 as uuidv4 } from 'uuid';
import type {
  JMAPClient,
  EmailAccount,
  MailFolder,
  MailMessage,
  MailThread,
  ComposeDraft,
  EmailSearchOptions,
} from './types';

interface JMAPSession {
  username: string;
  apiUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  eventSourceUrl: string;
  state: string;
  accounts: Record<string, JMAPAccount>;
}

interface JMAPAccount {
  name: string;
  isPersonal: boolean;
  isReadOnly: boolean;
  accountCapabilities: Record<string, any>;
}

interface JMAPRequest {
  using: string[];
  methodCalls: Array<[string, any, string]>;
}

interface JMAPResponse {
  methodResponses: Array<[string, any, string]>;
  sessionState: string;
}

export class JMAPClientImpl implements JMAPClient {
  private session: JMAPSession | null = null;
  private authHeaders: Record<string, string> = {};

  async authenticate(account: EmailAccount): Promise<void> {
    if (!account.settings.jmap?.sessionUrl) {
      throw new Error('JMAP session URL not configured');
    }

    // Set auth headers
    if (account.settings.jmap.accessToken) {
      this.authHeaders = {
        'Authorization': `Bearer ${account.settings.jmap.accessToken}`,
      };
    }

    // Get JMAP session
    const response = await fetch(account.settings.jmap.sessionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(`JMAP authentication failed: ${response.status} ${response.statusText}`);
    }

    this.session = await response.json();
  }

  private async makeRequest(methodCalls: Array<[string, any, string]>): Promise<JMAPResponse> {
    if (!this.session) {
      throw new Error('JMAP client not authenticated');
    }

    const request: JMAPRequest = {
      using: ['urn:ietf:params:jmap:core:1', 'urn:ietf:params:jmap:mail:1'],
      methodCalls,
    };

    const response = await fetch(this.session.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`JMAP request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async listMailboxes(accountId: string): Promise<MailFolder[]> {
    const response = await this.makeRequest([
      ['Mailbox/get', { accountId, ids: null }, 'a'],
    ]);

    const [method, result] = response.methodResponses[0];
    if (method === 'Mailbox/get') {
      return result.list.map((mailbox: any): MailFolder => ({
        id: mailbox.id,
        name: mailbox.name,
        role: this.mapMailboxRole(mailbox.role),
        parentId: mailbox.parentId || undefined,
        messageCount: mailbox.totalEmails || 0,
        unreadCount: mailbox.unreadEmails || 0,
        tenantId: '', // Will be set by calling code
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    throw new Error('Failed to list mailboxes');
  }

  async createMailbox(accountId: string, name: string, parentId?: string): Promise<MailFolder> {
    const create = {
      [uuidv4()]: {
        name,
        parentId: parentId || null,
      },
    };

    const response = await this.makeRequest([
      ['Mailbox/set', { accountId, create }, 'a'],
    ]);

    const [method, result] = response.methodResponses[0];
    if (method === 'Mailbox/set' && result.created) {
      const createdId = Object.keys(result.created)[0];
      const mailbox = result.created[createdId];
      
      return {
        id: createdId,
        name: mailbox.name,
        role: 'custom',
        parentId: mailbox.parentId || undefined,
        messageCount: 0,
        unreadCount: 0,
        tenantId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    throw new Error('Failed to create mailbox');
  }

  async deleteMailbox(accountId: string, mailboxId: string): Promise<void> {
    const response = await this.makeRequest([
      ['Mailbox/set', { accountId, destroy: [mailboxId] }, 'a'],
    ]);

    const [method, result] = response.methodResponses[0];
    if (method === 'Mailbox/set' && result.destroyed?.includes(mailboxId)) {
      return;
    }

    throw new Error('Failed to delete mailbox');
  }

  async listMessages(opts: EmailSearchOptions & { accountId: string }): Promise<MailMessage[]> {
    const filter: any = {};
    
    if (opts.folderId) {
      filter.inMailbox = opts.folderId;
    }
    if (opts.isUnread !== undefined) {
      filter.hasKeyword = opts.isUnread ? undefined : '$seen';
      filter.notKeyword = opts.isUnread ? '$seen' : undefined;
    }
    if (opts.from) {
      filter.from = opts.from;
    }
    if (opts.subject) {
      filter.subject = opts.subject;
    }
    if (opts.dateFrom || opts.dateTo) {
      filter.after = opts.dateFrom;
      filter.before = opts.dateTo;
    }

    const queryResponse = await this.makeRequest([
      ['Email/query', {
        accountId: opts.accountId,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sort: [{ property: 'receivedAt', isAscending: false }],
        position: opts.offset || 0,
        limit: opts.limit || 50,
      }, 'a'],
    ]);

    const [queryMethod, queryResult] = queryResponse.methodResponses[0];
    if (queryMethod !== 'Email/query') {
      throw new Error('Failed to query messages');
    }

    const messageIds = queryResult.ids;
    if (messageIds.length === 0) {
      return [];
    }

    const getResponse = await this.makeRequest([
      ['Email/get', {
        accountId: opts.accountId,
        ids: messageIds,
        properties: [
          'id', 'messageId', 'threadId', 'subject', 'from', 'to', 'cc', 'bcc',
          'receivedAt', 'preview', 'bodyValues', 'attachments', 'keywords'
        ],
      }, 'b'],
    ]);

    const [getMethod, getResult] = getResponse.methodResponses[0];
    if (getMethod === 'Email/get') {
      return getResult.list.map((email: any): MailMessage => ({
        id: email.id,
        messageId: email.messageId[0] || email.id,
        threadId: email.threadId,
        subject: email.subject || '',
        from: this.parseAddresses(email.from),
        to: this.parseAddresses(email.to),
        cc: email.cc ? this.parseAddresses(email.cc) : undefined,
        date: email.receivedAt,
        preview: email.preview,
        html: this.extractBodyValue(email, 'text/html'),
        text: this.extractBodyValue(email, 'text/plain'),
        attachments: email.attachments?.map((att: any) => ({
          id: att.blobId,
          name: att.name || 'attachment',
          size: att.size || 0,
          mime: att.type || 'application/octet-stream',
        })),
        flags: {
          seen: email.keywords?.$seen || false,
          flagged: email.keywords?.$flagged || false,
          answered: email.keywords?.$answered || false,
          draft: email.keywords?.$draft || false,
        },
        tenantId: '',
        createdAt: email.receivedAt,
        updatedAt: email.receivedAt,
      }));
    }

    throw new Error('Failed to get messages');
  }

  async getMessage(accountId: string, messageId: string): Promise<MailMessage | null> {
    const messages = await this.listMessages({ accountId, limit: 1 });
    return messages.find(m => m.id === messageId || m.messageId === messageId) || null;
  }

  async searchMessages(accountId: string, opts: EmailSearchOptions): Promise<MailMessage[]> {
    return this.listMessages({ ...opts, accountId });
  }

  async listThreads(accountId: string, opts: EmailSearchOptions): Promise<MailThread[]> {
    const response = await this.makeRequest([
      ['Thread/get', {
        accountId,
        ids: null,
        properties: ['id', 'emailIds'],
      }, 'a'],
    ]);

    const [method, result] = response.methodResponses[0];
    if (method === 'Thread/get') {
      // For each thread, get the subject from the first message
      const threads: MailThread[] = [];
      
      for (const thread of result.list.slice(0, opts.limit || 50)) {
        if (thread.emailIds.length === 0) continue;
        
        // Get first message for subject and participants
        const messages = await this.listMessages({
          accountId,
          threadId: thread.id,
          limit: 1,
        });
        
        if (messages.length > 0) {
          const firstMessage = messages[0];
          const participants = [
            ...firstMessage.from,
            ...firstMessage.to,
            ...(firstMessage.cc || []),
          ];
          
          threads.push({
            id: thread.id,
            subject: firstMessage.subject,
            participants,
            messageCount: thread.emailIds.length,
            unreadCount: 0, // Would need additional query to count unread
            lastMessageDate: firstMessage.date,
            tenantId: '',
            createdAt: firstMessage.createdAt,
            updatedAt: firstMessage.updatedAt,
          });
        }
      }
      
      return threads;
    }

    throw new Error('Failed to list threads');
  }

  async getThread(accountId: string, threadId: string): Promise<{ thread: MailThread; messages: MailMessage[] } | null> {
    const messages = await this.listMessages({ accountId, threadId });
    
    if (messages.length === 0) {
      return null;
    }

    // Build thread from messages
    const firstMessage = messages[0];
    const participants = messages.reduce((acc, msg) => {
      const addrs = [...msg.from, ...msg.to, ...(msg.cc || [])];
      for (const addr of addrs) {
        if (!acc.some(p => p.email === addr.email)) {
          acc.push(addr);
        }
      }
      return acc;
    }, [] as any[]);

    const thread: MailThread = {
      id: threadId,
      subject: firstMessage.subject,
      participants,
      messageCount: messages.length,
      unreadCount: messages.filter(m => !m.flags?.seen).length,
      lastMessageDate: messages[messages.length - 1].date,
      tenantId: '',
      createdAt: firstMessage.createdAt,
      updatedAt: messages[messages.length - 1].updatedAt,
    };

    return { thread, messages };
  }

  async sendMessage(accountId: string, draft: ComposeDraft): Promise<{ messageId: string; threadId: string }> {
    // Create email object
    const emailObject: any = {
      from: [{ email: 'user@example.com' }], // This should come from account
      to: draft.to,
      subject: draft.subject,
      bodyValues: {},
    };

    if (draft.cc) emailObject.cc = draft.cc;
    if (draft.bcc) emailObject.bcc = draft.bcc;

    // Add body content
    if (draft.text) {
      emailObject.bodyValues['text'] = {
        value: draft.text,
        charset: 'utf-8',
      };
      emailObject.textBody = [{ partId: 'text', type: 'text/plain' }];
    }

    if (draft.html) {
      emailObject.bodyValues['html'] = {
        value: draft.html,
        charset: 'utf-8',
      };
      emailObject.htmlBody = [{ partId: 'html', type: 'text/html' }];
    }

    // Handle reply threading
    if (draft.inReplyTo) {
      emailObject.inReplyTo = [draft.inReplyTo];
    }
    if (draft.references) {
      emailObject.references = draft.references;
    }

    const create = {
      [uuidv4()]: emailObject,
    };

    const response = await this.makeRequest([
      ['Email/set', { accountId, create }, 'a'],
      ['EmailSubmission/set', {
        accountId,
        create: {
          [uuidv4()]: {
            emailId: '#a/' + Object.keys(create)[0],
            envelope: {
              mailFrom: { email: 'user@example.com' },
              rcptTo: [...draft.to, ...(draft.cc || []), ...(draft.bcc || [])],
            },
          },
        },
      }, 'b'],
    ]);

    const [emailMethod, emailResult] = response.methodResponses[0];
    const [submissionMethod, submissionResult] = response.methodResponses[1];

    if (emailMethod === 'Email/set' && submissionMethod === 'EmailSubmission/set') {
      const createdEmailId = Object.keys(emailResult.created || {})[0];
      if (createdEmailId && submissionResult.created) {
        return {
          messageId: createdEmailId,
          threadId: emailResult.created[createdEmailId].threadId || createdEmailId,
        };
      }
    }

    throw new Error('Failed to send message');
  }

  async saveDraft(accountId: string, draft: ComposeDraft): Promise<{ draftId: string }> {
    const emailObject: any = {
      from: [{ email: 'user@example.com' }],
      to: draft.to,
      subject: draft.subject,
      keywords: { $draft: true },
      bodyValues: {},
    };

    if (draft.text) {
      emailObject.bodyValues['text'] = { value: draft.text, charset: 'utf-8' };
      emailObject.textBody = [{ partId: 'text', type: 'text/plain' }];
    }

    if (draft.html) {
      emailObject.bodyValues['html'] = { value: draft.html, charset: 'utf-8' };
      emailObject.htmlBody = [{ partId: 'html', type: 'text/html' }];
    }

    const create = {
      [draft.id || uuidv4()]: emailObject,
    };

    const response = await this.makeRequest([
      ['Email/set', { accountId, create }, 'a'],
    ]);

    const [method, result] = response.methodResponses[0];
    if (method === 'Email/set' && result.created) {
      const draftId = Object.keys(result.created)[0];
      return { draftId };
    }

    throw new Error('Failed to save draft');
  }

  async markAsRead(accountId: string, messageIds: string[]): Promise<void> {
    const update: any = {};
    for (const id of messageIds) {
      update[id] = {
        keywords: { $seen: true },
      };
    }

    await this.makeRequest([
      ['Email/set', { accountId, update }, 'a'],
    ]);
  }

  async markAsUnread(accountId: string, messageIds: string[]): Promise<void> {
    const update: any = {};
    for (const id of messageIds) {
      update[id] = {
        keywords: { $seen: null },
      };
    }

    await this.makeRequest([
      ['Email/set', { accountId, update }, 'a'],
    ]);
  }

  async flagMessages(accountId: string, messageIds: string[]): Promise<void> {
    const update: any = {};
    for (const id of messageIds) {
      update[id] = {
        keywords: { $flagged: true },
      };
    }

    await this.makeRequest([
      ['Email/set', { accountId, update }, 'a'],
    ]);
  }

  async unflagMessages(accountId: string, messageIds: string[]): Promise<void> {
    const update: any = {};
    for (const id of messageIds) {
      update[id] = {
        keywords: { $flagged: null },
      };
    }

    await this.makeRequest([
      ['Email/set', { accountId, update }, 'a'],
    ]);
  }

  async moveMessages(accountId: string, messageIds: string[], folderId: string): Promise<void> {
    const update: any = {};
    for (const id of messageIds) {
      update[id] = {
        mailboxIds: { [folderId]: true },
      };
    }

    await this.makeRequest([
      ['Email/set', { accountId, update }, 'a'],
    ]);
  }

  async deleteMessages(accountId: string, messageIds: string[]): Promise<void> {
    await this.makeRequest([
      ['Email/set', { accountId, destroy: messageIds }, 'a'],
    ]);
  }

  async syncAccount(account: EmailAccount): Promise<{ synced: number; errors: string[] }> {
    try {
      await this.authenticate(account);
      
      // Sync mailboxes
      const folders = await this.listMailboxes(account.settings.jmap!.accountId);
      
      // Sync messages from each folder
      let totalSynced = 0;
      const errors: string[] = [];
      
      for (const folder of folders) {
        try {
          const messages = await this.listMessages({
            accountId: account.settings.jmap!.accountId,
            folderId: folder.id,
            limit: account.syncSettings.maxMessages,
          });
          totalSynced += messages.length;
        } catch (error) {
          errors.push(`Failed to sync folder ${folder.name}: ${error}`);
        }
      }
      
      return { synced: totalSynced, errors };
    } catch (error) {
      return { synced: 0, errors: [`Sync failed: ${error}`] };
    }
  }

  // Helper methods
  private mapMailboxRole(role: string): MailFolder['role'] {
    const roleMap: Record<string, MailFolder['role']> = {
      'inbox': 'inbox',
      'sent': 'sent',
      'drafts': 'drafts',
      'trash': 'trash',
      'archive': 'archive',
      'spam': 'spam',
      'junk': 'spam',
    };
    return roleMap[role?.toLowerCase()] || 'custom';
  }

  private parseAddresses(addresses: any[]): Array<{ name?: string; email: string }> {
    if (!addresses) return [];
    return addresses.map(addr => ({
      name: addr.name || undefined,
      email: addr.email,
    }));
  }

  private extractBodyValue(email: any, mimeType: string): string | undefined {
    if (!email.bodyValues) return undefined;
    
    // Find the body part with the matching MIME type
    const bodyParts = mimeType === 'text/html' ? email.htmlBody : email.textBody;
    if (!bodyParts || bodyParts.length === 0) return undefined;
    
    const partId = bodyParts[0].partId;
    return email.bodyValues[partId]?.value;
  }
}

// Factory function
export function createJMAPClient(): JMAPClient {
  return new JMAPClientImpl();
}