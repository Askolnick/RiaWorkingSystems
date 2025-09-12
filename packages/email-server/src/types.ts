import { z } from 'zod';

// Core email types based on RFC 5322 and JMAP standards
export const MailAddressSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
});

export const MailMessageSchema = z.object({
  id: z.string(), // JMAP id
  messageId: z.string(), // RFC 5322 Message-ID
  threadId: z.string(),
  subject: z.string(),
  from: z.array(MailAddressSchema),
  to: z.array(MailAddressSchema),
  cc: z.array(MailAddressSchema).optional(),
  bcc: z.array(MailAddressSchema).optional(),
  date: z.string(), // ISO 8601 date string
  preview: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    mime: z.string(),
    url: z.string().optional(),
  })).optional(),
  flags: z.object({
    seen: z.boolean().optional(),
    flagged: z.boolean().optional(),
    encrypted: z.boolean().optional(),
    signed: z.boolean().optional(),
    answered: z.boolean().optional(),
    draft: z.boolean().optional(),
  }).optional(),
  labels: z.array(z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MailThreadSchema = z.object({
  id: z.string(),
  subject: z.string(),
  participants: z.array(MailAddressSchema),
  messageCount: z.number(),
  unreadCount: z.number(),
  lastMessageDate: z.string(),
  labels: z.array(z.string()).optional(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MailFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['inbox', 'sent', 'drafts', 'trash', 'archive', 'spam', 'custom']).optional(),
  parentId: z.string().optional(),
  messageCount: z.number(),
  unreadCount: z.number(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Email links to other entities in RIA system
export const MailLinkSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  entityType: z.enum(['task', 'project', 'contact', 'invoice', 'document', 'campaign']),
  entityId: z.string(),
  linkType: z.enum(['created_from', 'references', 'attachment', 'mention']),
  quote: z.string().optional(), // Quoted text from email
  metadata: z.record(z.any()).optional(),
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
});

export const ComposeDraftSchema = z.object({
  id: z.string().optional(),
  to: z.array(MailAddressSchema),
  cc: z.array(MailAddressSchema).optional(),
  bcc: z.array(MailAddressSchema).optional(),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    mime: z.string(),
    content: z.instanceof(Buffer).optional(),
  })).optional(),
  inReplyTo: z.string().optional(), // Message-ID of original message
  references: z.array(z.string()).optional(), // Message-IDs for thread tracking
  encrypt: z.boolean().optional(),
  sign: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  scheduleAt: z.string().optional(), // ISO 8601 date for scheduled sending
  template: z.object({
    id: z.string(),
    variables: z.record(z.any()),
  }).optional(),
});

export const EmailAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  provider: z.enum(['imap', 'jmap', 'exchange', 'gmail', 'outlook']),
  settings: z.object({
    incoming: z.object({
      host: z.string(),
      port: z.number(),
      ssl: z.boolean(),
      username: z.string(),
      password: z.string().optional(), // Encrypted
    }),
    outgoing: z.object({
      host: z.string(),
      port: z.number(),
      ssl: z.boolean(),
      username: z.string(),
      password: z.string().optional(), // Encrypted
    }),
    jmap: z.object({
      sessionUrl: z.string(),
      accountId: z.string(),
      accessToken: z.string().optional(), // Encrypted
    }).optional(),
  }),
  pgpKeys: z.object({
    publicKey: z.string().optional(),
    privateKey: z.string().optional(), // Encrypted
  }).optional(),
  syncSettings: z.object({
    enabled: z.boolean(),
    syncInterval: z.number(), // minutes
    maxMessages: z.number(),
    syncAttachments: z.boolean(),
  }),
  tenantId: z.string(),
  userId: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  lastSyncAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EmailFilterSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(z.object({
    field: z.enum(['from', 'to', 'cc', 'subject', 'body', 'attachment']),
    operator: z.enum(['contains', 'equals', 'starts_with', 'ends_with', 'regex']),
    value: z.string(),
    caseSensitive: z.boolean().optional(),
  })),
  actions: z.array(z.object({
    type: z.enum(['move_to_folder', 'add_label', 'mark_as_read', 'mark_as_important', 'delete', 'forward', 'create_task']),
    value: z.string().optional(),
  })),
  isActive: z.boolean(),
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Type exports
export type MailAddress = z.infer<typeof MailAddressSchema>;
export type MailMessage = z.infer<typeof MailMessageSchema>;
export type MailThread = z.infer<typeof MailThreadSchema>;
export type MailFolder = z.infer<typeof MailFolderSchema>;
export type MailLink = z.infer<typeof MailLinkSchema>;
export type ComposeDraft = z.infer<typeof ComposeDraftSchema>;
export type EmailAccount = z.infer<typeof EmailAccountSchema>;
export type EmailFilter = z.infer<typeof EmailFilterSchema>;

// Search and filtering
export interface EmailSearchOptions {
  query?: string;
  folderId?: string;
  threadId?: string;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isFlagged?: boolean;
  labels?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'subject' | 'from';
  sortOrder?: 'asc' | 'desc';
}

export interface EmailStats {
  totalMessages: number;
  unreadMessages: number;
  flaggedMessages: number;
  totalThreads: number;
  storageUsed: number; // bytes
  accountsActive: number;
  lastSyncAt?: string;
}

// JMAP client interface
export interface JMAPClient {
  // Authentication
  authenticate(account: EmailAccount): Promise<void>;
  
  // Mailboxes
  listMailboxes(accountId: string): Promise<MailFolder[]>;
  createMailbox(accountId: string, name: string, parentId?: string): Promise<MailFolder>;
  deleteMailbox(accountId: string, mailboxId: string): Promise<void>;
  
  // Messages
  listMessages(opts: EmailSearchOptions & { accountId: string }): Promise<MailMessage[]>;
  getMessage(accountId: string, messageId: string): Promise<MailMessage | null>;
  searchMessages(accountId: string, opts: EmailSearchOptions): Promise<MailMessage[]>;
  
  // Threads
  listThreads(accountId: string, opts: EmailSearchOptions): Promise<MailThread[]>;
  getThread(accountId: string, threadId: string): Promise<{ thread: MailThread; messages: MailMessage[] } | null>;
  
  // Sending
  sendMessage(accountId: string, draft: ComposeDraft): Promise<{ messageId: string; threadId: string }>;
  saveDraft(accountId: string, draft: ComposeDraft): Promise<{ draftId: string }>;
  
  // Operations
  markAsRead(accountId: string, messageIds: string[]): Promise<void>;
  markAsUnread(accountId: string, messageIds: string[]): Promise<void>;
  flagMessages(accountId: string, messageIds: string[]): Promise<void>;
  unflagMessages(accountId: string, messageIds: string[]): Promise<void>;
  moveMessages(accountId: string, messageIds: string[], folderId: string): Promise<void>;
  deleteMessages(accountId: string, messageIds: string[]): Promise<void>;
  
  // Sync
  syncAccount(account: EmailAccount): Promise<{ synced: number; errors: string[] }>;
}

// Encryption interface
export interface EmailEncryption {
  generateKeyPair(name: string, email: string, passphrase?: string): Promise<{ publicKey: string; privateKey: string }>;
  encrypt(message: string, publicKeys: string[]): Promise<string>;
  decrypt(encryptedMessage: string, privateKey: string, passphrase?: string): Promise<string>;
  sign(message: string, privateKey: string, passphrase?: string): Promise<string>;
  verify(signedMessage: string, publicKey: string): Promise<{ valid: boolean; message: string }>;
}

// Integration adapters
export interface EmailIntegration {
  // Task creation
  createTaskFromEmail(message: MailMessage, options?: {
    assigneeId?: string;
    projectId?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    extractedText?: string;
  }): Promise<{ taskId: string; link: MailLink }>;
  
  // Contact management
  extractContactInfo(message: MailMessage): Promise<{
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    confidence: number;
  }[]>;
  
  // Campaign integration
  createCampaignFromTemplate(options: {
    name: string;
    templateHtml: string;
    audienceIds: string[];
    scheduleAt?: string;
    trackingParams?: Record<string, string>;
  }): Promise<{ campaignId: string }>;
  
  // Document extraction
  extractDocuments(message: MailMessage): Promise<{
    attachmentId: string;
    documentType: 'invoice' | 'contract' | 'receipt' | 'other';
    extractedData?: Record<string, any>;
    confidence: number;
  }[]>;
}

// Repository interfaces
export interface EmailRepository {
  // Messages
  saveMessage(message: Omit<MailMessage, 'createdAt' | 'updatedAt'>): Promise<MailMessage>;
  updateMessage(id: string, updates: Partial<MailMessage>): Promise<MailMessage>;
  deleteMessage(id: string): Promise<void>;
  findMessages(tenantId: string, opts: EmailSearchOptions): Promise<MailMessage[]>;
  findMessageById(id: string): Promise<MailMessage | null>;
  
  // Threads
  saveThread(thread: Omit<MailThread, 'createdAt' | 'updatedAt'>): Promise<MailThread>;
  updateThread(id: string, updates: Partial<MailThread>): Promise<MailThread>;
  findThreads(tenantId: string, opts: EmailSearchOptions): Promise<MailThread[]>;
  findThreadById(id: string): Promise<MailThread | null>;
  
  // Folders
  saveFolders(folders: MailFolder[]): Promise<MailFolder[]>;
  findFolders(tenantId: string, accountId: string): Promise<MailFolder[]>;
  
  // Links
  saveLink(link: Omit<MailLink, 'createdAt'>): Promise<MailLink>;
  findLinksByMessage(messageId: string): Promise<MailLink[]>;
  findLinksByEntity(entityType: string, entityId: string): Promise<MailLink[]>;
  
  // Accounts
  saveAccount(account: Omit<EmailAccount, 'createdAt' | 'updatedAt'>): Promise<EmailAccount>;
  updateAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount>;
  findAccounts(tenantId: string, userId?: string): Promise<EmailAccount[]>;
  findAccountById(id: string): Promise<EmailAccount | null>;
  
  // Stats
  getStats(tenantId: string): Promise<EmailStats>;
}