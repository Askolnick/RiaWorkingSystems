import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'eventemitter3';

export interface WebSocketEvents {
  'message:new': (data: { threadId: string; message: any }) => void;
  'message:updated': (data: { threadId: string; messageId: string; message: any }) => void;
  'typing:start': (data: { threadId: string; userId: string; userName: string }) => void;
  'typing:stop': (data: { threadId: string; userId: string }) => void;
  'message:read': (data: { threadId: string; messageId: string; userId: string }) => void;
  'user:online': (data: { userId: string; status: 'online' | 'away' | 'offline' }) => void;
  'reaction:added': (data: { messageId: string; userId: string; emoji: string }) => void;
  'reaction:removed': (data: { messageId: string; userId: string; emoji: string }) => void;
  'connection:established': () => void;
  'connection:lost': () => void;
  'connection:error': (error: Error) => void;
}

export class WebSocketClient extends EventEmitter<WebSocketEvents> {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(private serverUrl: string = 'http://localhost:3001') {
    super();
  }

  connect(authToken?: string): void {
    if (this.socket?.connected) {
      return;
    }

    const socketOptions = {
      transports: ['websocket', 'polling'],
      auth: authToken ? { token: authToken } : undefined,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    };

    this.socket = io(this.serverUrl, socketOptions);

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.emit('connection:established');
    });

    this.socket.on('disconnect', () => {
      this.emit('connection:lost');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.emit('connection:error', error);
    });

    // Message events
    this.socket.on('message:new', (data) => {
      this.emit('message:new', data);
    });

    this.socket.on('message:updated', (data) => {
      this.emit('message:updated', data);
    });

    // Typing indicators
    this.socket.on('typing:start', (data) => {
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data) => {
      this.emit('typing:stop', data);
    });

    // Read receipts
    this.socket.on('message:read', (data) => {
      this.emit('message:read', data);
    });

    // User presence
    this.socket.on('user:online', (data) => {
      this.emit('user:online', data);
    });

    // Message reactions
    this.socket.on('reaction:added', (data) => {
      this.emit('reaction:added', data);
    });

    this.socket.on('reaction:removed', (data) => {
      this.emit('reaction:removed', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.clearTypingTimeouts();
  }

  // Join a thread/conversation
  joinThread(threadId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('thread:join', { threadId });
    }
  }

  // Leave a thread/conversation
  leaveThread(threadId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('thread:leave', { threadId });
    }
  }

  // Send typing indicator
  sendTyping(threadId: string, isTyping: boolean = true): void {
    if (!this.socket?.connected) return;

    const timeoutKey = `${threadId}`;
    
    if (isTyping) {
      this.socket.emit('typing:start', { threadId });
      
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout to stop typing after 3 seconds
      const timeout = setTimeout(() => {
        this.sendTyping(threadId, false);
        this.typingTimeouts.delete(timeoutKey);
      }, 3000);
      
      this.typingTimeouts.set(timeoutKey, timeout);
    } else {
      this.socket.emit('typing:stop', { threadId });
      
      // Clear timeout
      const existingTimeout = this.typingTimeouts.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.typingTimeouts.delete(timeoutKey);
      }
    }
  }

  // Mark message as read
  markMessageAsRead(threadId: string, messageId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message:read', { threadId, messageId });
    }
  }

  // Add reaction to message
  addReaction(messageId: string, emoji: string): void {
    if (this.socket?.connected) {
      this.socket.emit('reaction:add', { messageId, emoji });
    }
  }

  // Remove reaction from message
  removeReaction(messageId: string, emoji: string): void {
    if (this.socket?.connected) {
      this.socket.emit('reaction:remove', { messageId, emoji });
    }
  }

  // Update user presence
  updatePresence(status: 'online' | 'away' | 'offline'): void {
    if (this.socket?.connected) {
      this.socket.emit('user:presence', { status });
    }
  }

  // Send file upload notification
  notifyFileUpload(threadId: string, fileName: string, fileSize: number): void {
    if (this.socket?.connected) {
      this.socket.emit('file:uploading', { threadId, fileName, fileSize });
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  private clearTypingTimeouts(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(serverUrl?: string): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(serverUrl);
  }
  return wsClient;
}

export function createWebSocketClient(serverUrl?: string): WebSocketClient {
  return new WebSocketClient(serverUrl);
}

// React hook for WebSocket integration
export function useWebSocket(serverUrl?: string) {
  const client = getWebSocketClient(serverUrl);
  
  return {
    client,
    connect: (authToken?: string) => client.connect(authToken),
    disconnect: () => client.disconnect(),
    isConnected: () => client.isConnected(),
    joinThread: (threadId: string) => client.joinThread(threadId),
    leaveThread: (threadId: string) => client.leaveThread(threadId),
    sendTyping: (threadId: string, isTyping?: boolean) => client.sendTyping(threadId, isTyping),
    markAsRead: (threadId: string, messageId: string) => client.markMessageAsRead(threadId, messageId),
    addReaction: (messageId: string, emoji: string) => client.addReaction(messageId, emoji),
    removeReaction: (messageId: string, emoji: string) => client.removeReaction(messageId, emoji),
    updatePresence: (status: 'online' | 'away' | 'offline') => client.updatePresence(status),
  };
}

export * from './types';
export * from './hooks';