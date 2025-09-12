export type ConversationKind = 'internal'|'external'|'email'|'social';
export type ConversationStatus = 'open'|'snoozed'|'closed';
export type Priority = 'low'|'normal'|'high'|'urgent';
export type MessageSource = 'internal'|'email'|'slack'|'social'|'sms';
export type MessageDirection = 'in'|'out';

export interface Conversation {
  id: string; 
  kind: ConversationKind; 
  subject?: string; 
  status: ConversationStatus; 
  priority: Priority;
  assigneeId?: string; 
  tags: string[]; 
  lastAt: string;
  tenantId: string;
  // Direct message fields
  isDirect?: boolean;
  isGroup?: boolean;
  participantIds?: string[];
}

export interface Message {
  id: string; 
  conversationId: string; 
  source: MessageSource; 
  direction: MessageDirection;
  author?: string; 
  authorAddr?: string; 
  bodyText: string; 
  bodyHtml?: string; 
  sentAt: string;
  tenantId: string;
}

export interface Inbox { 
  id: string; 
  name: string; 
  slug: string;
  tenantId: string;
}

export interface MessagingApi {
  listInboxes(): Promise<Inbox[]>;
  listConversations(filter?: { 
    inbox?: string; 
    q?: string; 
    status?: ConversationStatus; 
    tag?: string; 
  }): Promise<Conversation[]>;
  getConversation(id: string): Promise<{ convo: Conversation; messages: Message[] }>;
  postMessage(conversationId: string, data: { 
    bodyText: string; 
    as?: 'email'|'chat'; 
  }): Promise<Message>;
  setStatus(conversationId: string, status: ConversationStatus): Promise<void>;
  setAssignee(conversationId: string, userId?: string): Promise<void>;
  addTag(conversationId: string, tag: string): Promise<void>;
}

// Integration types
export type EmailMessage = {
  id: string; 
  threadId?: string; 
  subject?: string; 
  from: string; 
  to: string[]; 
  cc?: string[]; 
  date: string; 
  text: string; 
  html?: string;
};

export type SocialMessage = { 
  id: string; 
  platform: 'x'|'instagram'|'facebook'|'linkedin'; 
  handle: string; 
  date: string; 
  text: string; 
  inReplyToId?: string; 
};

export type SlackMessage = { 
  id: string; 
  channel: string; 
  user: string; 
  date: string; 
  text: string; 
  threadTs?: string; 
};

export interface Connector<T> {
  name: string;
  listSince(sinceISO: string): Promise<T[]>;
}

export interface Connectors {
  email: Connector<EmailMessage>;
  slack: Connector<SlackMessage>;
  social: Connector<SocialMessage>;
}