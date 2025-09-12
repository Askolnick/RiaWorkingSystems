import { BaseRepository, MockRepository } from './base.repository';
import type { 
  Conversation, 
  Message, 
  Inbox, 
  ConversationStatus,
  MessagingApi 
} from '@ria/messaging-client';

export class MessagingRepository extends BaseRepository<Conversation> {
  protected endpoint = '/messaging/conversations';

  async listInboxes(): Promise<Inbox[]> {
    return this.request('GET', '/messaging/inboxes');
  }

  async listConversations(filter?: { 
    inbox?: string; 
    q?: string; 
    status?: ConversationStatus; 
    tag?: string; 
  }): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (filter?.inbox) params.append('inbox', filter.inbox);
    if (filter?.q) params.append('q', filter.q);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.tag) params.append('tag', filter.tag);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request('GET', `${this.endpoint}${query}`);
  }

  async getConversation(id: string): Promise<{ convo: Conversation; messages: Message[] }> {
    return this.request('GET', `${this.endpoint}/${id}`);
  }

  async postMessage(conversationId: string, data: { 
    bodyText: string; 
    as?: 'email' | 'chat'; 
  }): Promise<Message> {
    return this.request('POST', `${this.endpoint}/${conversationId}/messages`, data);
  }

  async setStatus(conversationId: string, status: ConversationStatus): Promise<void> {
    await this.request('PATCH', `${this.endpoint}/${conversationId}`, { status });
  }

  async setAssignee(conversationId: string, userId?: string): Promise<void> {
    await this.request('PATCH', `${this.endpoint}/${conversationId}`, { assigneeId: userId });
  }

  // Direct Message methods
  async createDirectMessage(recipientIds: string[], subject?: string): Promise<Conversation> {
    return this.request('POST', '/messaging/direct-messages', {
      recipientIds,
      subject: subject || 'Direct Message'
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.request('GET', `/messaging/users/${userId}/conversations`);
  }

  async searchUsers(query: string): Promise<any[]> {
    return this.request('GET', `/users/search?q=${encodeURIComponent(query)}`);
  }

  async addParticipants(threadId: string, userIds: string[]): Promise<void> {
    await this.request('POST', `/messaging/threads/${threadId}/participants`, { userIds });
  }

  async removeParticipant(threadId: string, userId: string): Promise<void> {
    await this.request('DELETE', `/messaging/threads/${threadId}/participants/${userId}`);
  }

  async markAsRead(threadId: string): Promise<void> {
    await this.request('POST', `/messaging/threads/${threadId}/read`);
  }

  async addTag(conversationId: string, tag: string): Promise<void> {
    await this.request('POST', `${this.endpoint}/${conversationId}/tags`, { tag });
  }
}

// Mock implementation for development
export class MockMessagingRepository extends MockRepository<Conversation> implements MessagingApi {
  protected storageKey = 'ria_messaging_conversations';
  protected endpoint = '/messaging/conversations';

  private mockInboxes: Inbox[] = [
    { id: '1', name: 'Support', slug: 'support', tenantId: 'demo-tenant' },
    { id: '2', name: 'Sales', slug: 'sales', tenantId: 'demo-tenant' },
    { id: '3', name: 'Social', slug: 'social', tenantId: 'demo-tenant' },
  ];

  private mockConversations: Conversation[] = [
    {
      id: '1',
      kind: 'email',
      subject: 'Invoice question',
      status: 'open',
      priority: 'normal',
      tags: ['billing'],
      lastAt: new Date().toISOString(),
      tenantId: 'demo-tenant'
    },
    {
      id: '2',
      kind: 'internal',
      subject: 'Sprint Retro',
      status: 'open',
      priority: 'normal',
      tags: ['team'],
      lastAt: new Date().toISOString(),
      tenantId: 'demo-tenant'
    }
  ];

  private mockMessages: Message[] = [
    {
      id: '1',
      conversationId: '1',
      source: 'email',
      direction: 'in',
      authorAddr: 'client@example.com',
      bodyText: 'Can you resend invoice #123?',
      sentAt: new Date().toISOString(),
      tenantId: 'demo-tenant'
    }
  ];

  async listInboxes(): Promise<Inbox[]> {
    await this.delay();
    return [...this.mockInboxes];
  }

  async listConversations(filter?: { 
    inbox?: string; 
    q?: string; 
    status?: ConversationStatus; 
    tag?: string; 
  }): Promise<Conversation[]> {
    await this.delay();
    let list = [...this.mockConversations];
    
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter(c => 
        (c.subject || '').toLowerCase().includes(q) || 
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    if (filter?.status) {
      list = list.filter(c => c.status === filter.status);
    }
    
    if (filter?.tag) {
      list = list.filter(c => c.tags.includes(filter.tag!));
    }
    
    return list.sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));
  }

  async getConversation(id: string): Promise<{ convo: Conversation; messages: Message[] }> {
    await this.delay();
    const convo = this.mockConversations.find(c => c.id === id);
    if (!convo) throw new Error('Conversation not found');
    
    const messages = this.mockMessages
      .filter(m => m.conversationId === id)
      .sort((a, b) => (a.sentAt || '').localeCompare(b.sentAt || ''));
    
    return { convo, messages };
  }

  async postMessage(conversationId: string, data: { 
    bodyText: string; 
    as?: 'email' | 'chat'; 
  }): Promise<Message> {
    await this.delay();
    const message: Message = {
      id: Date.now().toString(),
      conversationId,
      source: data.as === 'email' ? 'email' : 'internal',
      direction: 'out',
      author: 'you',
      bodyText: data.bodyText,
      sentAt: new Date().toISOString(),
      tenantId: 'demo-tenant'
    };
    
    this.mockMessages.push(message);
    
    // Update conversation lastAt
    const convoIndex = this.mockConversations.findIndex(c => c.id === conversationId);
    if (convoIndex >= 0) {
      this.mockConversations[convoIndex] = {
        ...this.mockConversations[convoIndex],
        lastAt: new Date().toISOString()
      };
    }
    
    return message;
  }

  async setStatus(conversationId: string, status: ConversationStatus): Promise<void> {
    await this.delay();
    const index = this.mockConversations.findIndex(c => c.id === conversationId);
    if (index >= 0) {
      this.mockConversations[index] = {
        ...this.mockConversations[index],
        status
      };
    }
  }

  async setAssignee(conversationId: string, userId?: string): Promise<void> {
    await this.delay();
    const index = this.mockConversations.findIndex(c => c.id === conversationId);
    if (index >= 0) {
      this.mockConversations[index] = {
        ...this.mockConversations[index],
        assigneeId: userId
      };
    }
  }

  async addTag(conversationId: string, tag: string): Promise<void> {
    await this.delay();
    const index = this.mockConversations.findIndex(c => c.id === conversationId);
    if (index >= 0 && !this.mockConversations[index].tags.includes(tag)) {
      this.mockConversations[index] = {
        ...this.mockConversations[index],
        tags: [...this.mockConversations[index].tags, tag]
      };
    }
  }

  // Direct Message mock methods
  async createDirectMessage(recipientIds: string[], subject?: string): Promise<Conversation> {
    await this.delay();
    const newConversation: Conversation = {
      id: Date.now().toString(),
      kind: 'internal',
      subject: subject || `Chat with ${recipientIds.length} user(s)`,
      status: 'open',
      priority: 'normal',
      tags: ['dm'],
      lastAt: new Date().toISOString(),
      tenantId: 'demo-tenant',
      isDirect: true,
      participantIds: recipientIds
    };
    
    this.mockConversations.push(newConversation);
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    await this.delay();
    // Return conversations where user is a participant
    return this.mockConversations.filter(c => 
      c.participantIds?.includes(userId) || c.assigneeId === userId
    );
  }

  async searchUsers(query: string): Promise<any[]> {
    await this.delay();
    // Mock user search
    const mockUsers = [
      { id: '1', displayName: 'John Doe', email: 'john@example.com', avatarUrl: null },
      { id: '2', displayName: 'Jane Smith', email: 'jane@example.com', avatarUrl: null },
      { id: '3', displayName: 'Bob Wilson', email: 'bob@example.com', avatarUrl: null },
      { id: '4', displayName: 'Alice Brown', email: 'alice@example.com', avatarUrl: null }
    ];
    
    const q = query.toLowerCase();
    return mockUsers.filter(u => 
      u.displayName.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    );
  }

  async addParticipants(threadId: string, userIds: string[]): Promise<void> {
    await this.delay();
    const index = this.mockConversations.findIndex(c => c.id === threadId);
    if (index >= 0) {
      const conv = this.mockConversations[index];
      const currentParticipants = conv.participantIds || [];
      const newParticipants = [...new Set([...currentParticipants, ...userIds])];
      
      this.mockConversations[index] = {
        ...conv,
        participantIds: newParticipants
      };
    }
  }

  async removeParticipant(threadId: string, userId: string): Promise<void> {
    await this.delay();
    const index = this.mockConversations.findIndex(c => c.id === threadId);
    if (index >= 0) {
      const conv = this.mockConversations[index];
      const participantIds = (conv.participantIds || []).filter(id => id !== userId);
      
      this.mockConversations[index] = {
        ...conv,
        participantIds
      };
    }
  }

  async markAsRead(threadId: string): Promise<void> {
    await this.delay();
    // In a real implementation, this would update the lastRead timestamp
    console.log(`Marked thread ${threadId} as read`);
  }

  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export repository instances
export const messagingRepository = new MockMessagingRepository();
