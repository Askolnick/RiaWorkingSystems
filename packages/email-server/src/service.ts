import type {
  EmailAccount,
  MailMessage,
  MailThread,
  MailFolder,
  ComposeDraft,
  EmailSearchOptions,
  EmailStats,
  JMAPClient,
  EmailEncryption,
  EmailIntegration,
} from './types';
import { createJMAPClient } from './jmap-client';
import { createEncryption } from './encryption';
import { createEmailIntegration, createEmailAIProcessor } from './integrations';

export interface EmailServiceConfig {
  repository: any; // EmailRepository implementation
  clients: {
    tasks: any;
    contacts: any;
    campaigns: any;
    documents: any;
    ai?: any;
  };
  encryption: {
    enabled: boolean;
    defaultKeySize: number;
  };
  sync: {
    enabled: boolean;
    interval: number;
    maxMessages: number;
  };
}

export class EmailService {
  private jmapClient: JMAPClient;
  private encryption: EmailEncryption;
  private integration: EmailIntegration;
  private aiProcessor: any;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private config: EmailServiceConfig,
    private repository: any
  ) {
    this.jmapClient = createJMAPClient();
    this.encryption = createEncryption();
    this.integration = createEmailIntegration(config.clients);
    
    if (config.clients.ai) {
      this.aiProcessor = createEmailAIProcessor(config.clients.ai);
    }
  }

  // Account management
  async addAccount(account: Omit<EmailAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailAccount> {
    const savedAccount = await this.repository.saveAccount(account);
    
    if (account.syncSettings.enabled) {
      await this.startAccountSync(savedAccount);
    }
    
    return savedAccount;
  }

  async updateAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    const account = await this.repository.updateAccount(id, updates);
    
    // Restart sync if settings changed
    if (updates.syncSettings) {
      await this.stopAccountSync(id);
      if (account.syncSettings.enabled) {
        await this.startAccountSync(account);
      }
    }
    
    return account;
  }

  async getAccounts(tenantId: string, userId?: string): Promise<EmailAccount[]> {
    return this.repository.findAccounts(tenantId, userId);
  }

  async deleteAccount(id: string): Promise<void> {
    await this.stopAccountSync(id);
    // Note: Repository deletion would be implemented by the consuming application
  }

  // Message operations
  async getMessages(tenantId: string, options: EmailSearchOptions): Promise<MailMessage[]> {
    return this.repository.findMessages(tenantId, options);
  }

  async getMessage(id: string): Promise<MailMessage | null> {
    const message = await this.repository.findMessageById(id);
    
    if (message && message.flags?.encrypted && this.config.encryption.enabled) {
      // Attempt to decrypt if we have the private key
      // This would require access to the user's private key
      // Implementation depends on key storage strategy
    }
    
    return message;
  }

  async sendMessage(accountId: string, draft: ComposeDraft): Promise<{ messageId: string; threadId: string }> {
    const account = await this.repository.findAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Authenticate with JMAP
    await this.jmapClient.authenticate(account);

    // Handle encryption if requested
    if (draft.encrypt && this.config.encryption.enabled && account.pgpKeys?.privateKey) {
      // Get recipient public keys
      const recipientKeys = await this.getRecipientPublicKeys(draft.to.map(a => a.email));
      
      if (recipientKeys.length > 0) {
        const encryptedContent = await this.encryption.encryptEmail(
          { text: draft.text, html: draft.html },
          recipientKeys
        );
        draft.text = encryptedContent.text;
        draft.html = encryptedContent.html;
      }
    }

    // Handle signing if requested
    if (draft.sign && this.config.encryption.enabled && account.pgpKeys?.privateKey) {
      const signedContent = await this.encryption.signEmail(
        { text: draft.text, html: draft.html },
        account.pgpKeys.privateKey
        // Note: Would need passphrase handling
      );
      draft.text = signedContent.text;
      draft.html = signedContent.html;
    }

    // Send via JMAP
    const result = await this.jmapClient.sendMessage(account.settings.jmap!.accountId, draft);
    
    // Save sent message to repository
    const sentMessage: Omit<MailMessage, 'createdAt' | 'updatedAt'> = {
      id: result.messageId,
      messageId: result.messageId,
      threadId: result.threadId,
      subject: draft.subject,
      from: [{ email: account.email, name: account.name }],
      to: draft.to,
      cc: draft.cc,
      date: new Date().toISOString(),
      html: draft.html,
      text: draft.text,
      flags: {
        seen: true,
        draft: false,
      },
      tenantId: account.tenantId,
    };

    await this.repository.saveMessage(sentMessage);
    
    return result;
  }

  async replyToMessage(messageId: string, draft: Omit<ComposeDraft, 'inReplyTo' | 'references'>): Promise<{ messageId: string; threadId: string }> {
    const originalMessage = await this.getMessage(messageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }

    // Build reply draft
    const replyDraft: ComposeDraft = {
      ...draft,
      subject: originalMessage.subject.startsWith('Re:') 
        ? originalMessage.subject 
        : `Re: ${originalMessage.subject}`,
      inReplyTo: originalMessage.messageId,
      references: [originalMessage.messageId],
    };

    // Find account for the original message's recipient
    const accounts = await this.repository.findAccounts(originalMessage.tenantId);
    const account = accounts.find(acc => 
      originalMessage.to.some(addr => addr.email === acc.email)
    );

    if (!account) {
      throw new Error('No account found to send reply');
    }

    return this.sendMessage(account.id, replyDraft);
  }

  // Thread operations
  async getThreads(tenantId: string, options: EmailSearchOptions): Promise<MailThread[]> {
    return this.repository.findThreads(tenantId, options);
  }

  async getThread(threadId: string): Promise<{ thread: MailThread; messages: MailMessage[] } | null> {
    const thread = await this.repository.findThreadById(threadId);
    if (!thread) return null;

    const messages = await this.repository.findMessages(thread.tenantId, { threadId });
    return { thread, messages };
  }

  // Sync operations
  async syncAccount(accountId: string): Promise<{ synced: number; errors: string[] }> {
    const account = await this.repository.findAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    await this.jmapClient.authenticate(account);
    const result = await this.jmapClient.syncAccount(account);

    // Update last sync time
    await this.repository.updateAccount(accountId, {
      lastSyncAt: new Date().toISOString(),
    });

    return result;
  }

  async startAccountSync(account: EmailAccount): Promise<void> {
    if (this.syncIntervals.has(account.id)) {
      return; // Already syncing
    }

    const interval = setInterval(async () => {
      try {
        await this.syncAccount(account.id);
      } catch (error) {
        console.error(`Sync failed for account ${account.id}:`, error);
      }
    }, account.syncSettings.syncInterval * 60 * 1000);

    this.syncIntervals.set(account.id, interval);
  }

  async stopAccountSync(accountId: string): Promise<void> {
    const interval = this.syncIntervals.get(accountId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(accountId);
    }
  }

  // Integration operations
  async createTaskFromEmail(
    messageId: string, 
    options?: {
      assigneeId?: string;
      projectId?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
      extractedText?: string;
    }
  ): Promise<{ taskId: string }> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const result = await this.integration.createTaskFromEmail(message, options);
    
    // Save the link
    await this.repository.saveLink(result.link);
    
    return { taskId: result.taskId };
  }

  async extractContactsFromMessage(messageId: string): Promise<Array<{
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    confidence: number;
  }>> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    return this.integration.extractContactInfo(message);
  }

  // AI-powered operations
  async categorizeMessage(messageId: string): Promise<{
    category: string;
    confidence: number;
    suggestedActions: string[];
  }> {
    if (!this.aiProcessor) {
      throw new Error('AI processing not enabled');
    }

    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    return this.aiProcessor.categorizeEmail(message);
  }

  async generateReply(
    messageId: string,
    replyType: 'acknowledge' | 'decline' | 'request_info' | 'custom',
    customPrompt?: string
  ): Promise<{ subject: string; body: string }> {
    if (!this.aiProcessor) {
      throw new Error('AI processing not enabled');
    }

    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    return this.aiProcessor.generateReplyDraft(message, replyType, customPrompt);
  }

  // Encryption operations
  async generateKeyPair(name: string, email: string, passphrase?: string): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    return this.encryption.generateKeyPair(name, email, passphrase);
  }

  async getStats(tenantId: string): Promise<EmailStats> {
    return this.repository.getStats(tenantId);
  }

  // Search operations with full-text search
  async searchMessages(tenantId: string, options: EmailSearchOptions): Promise<MailMessage[]> {
    if (options.query) {
      // Full-text search implementation would depend on the database
      // For now, delegate to repository
    }
    
    return this.repository.findMessages(tenantId, options);
  }

  // Cleanup and shutdown
  async shutdown(): Promise<void> {
    // Stop all sync intervals
    for (const [accountId] of this.syncIntervals) {
      await this.stopAccountSync(accountId);
    }
  }

  // Private helper methods
  private async getRecipientPublicKeys(emails: string[]): Promise<string[]> {
    // This would query the key storage system for public keys
    // Implementation depends on how public keys are stored
    // Could integrate with key servers, contacts database, etc.
    return [];
  }
}

// Factory function
export function createEmailService(config: EmailServiceConfig): EmailService {
  return new EmailService(config, config.repository);
}