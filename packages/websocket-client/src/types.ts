export interface WebSocketMessage {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  bodyText: string;
  createdAt: string;
  updatedAt: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  readBy?: ReadReceipt[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  userName: string;
  readAt: string;
}

export interface TypingIndicator {
  threadId: string;
  userId: string;
  userName: string;
  startedAt: string;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

export interface FileUploadProgress {
  threadId: string;
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface WebSocketConfig {
  serverUrl: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  typingTimeout: number;
}

export interface ThreadMember {
  userId: string;
  userName: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastRead?: string;
}

export interface NotificationPayload {
  type: 'message' | 'mention' | 'reaction' | 'file';
  title: string;
  body: string;
  threadId: string;
  messageId?: string;
  userId: string;
  userName: string;
  timestamp: string;
  action?: {
    type: 'open_thread' | 'mark_read' | 'reply';
    data: Record<string, any>;
  };
}