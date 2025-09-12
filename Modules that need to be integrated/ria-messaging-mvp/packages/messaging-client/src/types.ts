export type ConversationKind = 'internal'|'external'|'email'|'social';
export type ConversationStatus = 'open'|'snoozed'|'closed';
export type Priority = 'low'|'normal'|'high'|'urgent';
export type MessageSource = 'internal'|'email'|'slack'|'social'|'sms';
export type MessageDirection = 'in'|'out';

export interface Conversation {
  id: string; kind: ConversationKind; subject?: string; status: ConversationStatus; priority: Priority;
  assigneeId?: string; tags: string[]; lastAt: string;
}

export interface Message {
  id: string; conversationId: string; source: MessageSource; direction: MessageDirection;
  author?: string; authorAddr?: string; bodyText: string; bodyHtml?: string; sentAt: string;
}

export interface Inbox { id: string; name: string; slug: string; }

export interface MessagingApi {
  listInboxes(): Promise<Inbox[]>;
  listConversations(filter?: { inbox?: string; q?: string; status?: ConversationStatus; tag?: string; }): Promise<Conversation[]>;
  getConversation(id: string): Promise<{ convo: Conversation; messages: Message[] }>;
  postMessage(conversationId: string, data: { bodyText: string; as?: 'email'|'chat'; }): Promise<Message>;
  setStatus(conversationId: string, status: ConversationStatus): Promise<void>;
  setAssignee(conversationId: string, userId?: string): Promise<void>;
  addTag(conversationId: string, tag: string): Promise<void>;
}
