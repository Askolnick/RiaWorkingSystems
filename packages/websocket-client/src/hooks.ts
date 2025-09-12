'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketClient } from './index';
import type {
  WebSocketMessage,
  TypingIndicator,
  UserPresence,
  MessageReaction,
  ReadReceipt,
  FileUploadProgress,
  NotificationPayload,
} from './types';

export function useWebSocketConnection(authToken?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const client = getWebSocketClient();

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      setConnectionError(error);
    };

    client.on('connection:established', handleConnect);
    client.on('connection:lost', handleDisconnect);
    client.on('connection:error', handleError);

    // Connect if not already connected
    if (!client.isConnected()) {
      client.connect(authToken);
    }

    return () => {
      client.off('connection:established', handleConnect);
      client.off('connection:lost', handleDisconnect);
      client.off('connection:error', handleError);
    };
  }, [authToken]);

  const reconnect = useCallback(() => {
    client.connect(authToken);
  }, [authToken]);

  return {
    isConnected,
    connectionError,
    reconnect,
  };
}

export function useRealTimeMessages(threadId?: string) {
  const [newMessages, setNewMessages] = useState<WebSocketMessage[]>([]);
  const [updatedMessages, setUpdatedMessages] = useState<WebSocketMessage[]>([]);
  const client = getWebSocketClient();

  useEffect(() => {
    const handleNewMessage = (data: { threadId: string; message: WebSocketMessage }) => {
      if (!threadId || data.threadId === threadId) {
        setNewMessages(prev => [...prev, data.message]);
      }
    };

    const handleUpdatedMessage = (data: { threadId: string; messageId: string; message: WebSocketMessage }) => {
      if (!threadId || data.threadId === threadId) {
        setUpdatedMessages(prev => [...prev, data.message]);
      }
    };

    client.on('message:new', handleNewMessage);
    client.on('message:updated', handleUpdatedMessage);

    // Join thread if specified
    if (threadId) {
      client.joinThread(threadId);
    }

    return () => {
      client.off('message:new', handleNewMessage);
      client.off('message:updated', handleUpdatedMessage);
      
      // Leave thread if specified
      if (threadId) {
        client.leaveThread(threadId);
      }
    };
  }, [threadId]);

  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  const clearUpdatedMessages = useCallback(() => {
    setUpdatedMessages([]);
  }, []);

  return {
    newMessages,
    updatedMessages,
    clearNewMessages,
    clearUpdatedMessages,
  };
}

export function useTypingIndicators(threadId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const client = getWebSocketClient();
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const handleTypingStart = (data: { threadId: string; userId: string; userName: string }) => {
      if (data.threadId === threadId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          return [...filtered, {
            threadId: data.threadId,
            userId: data.userId,
            userName: data.userName,
            startedAt: new Date().toISOString(),
          }];
        });

        // Clear existing timeout
        const existingTimeout = typingTimeouts.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set timeout to remove user from typing list
        const timeout = setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
          typingTimeouts.current.delete(data.userId);
        }, 5000);

        typingTimeouts.current.set(data.userId, timeout);
      }
    };

    const handleTypingStop = (data: { threadId: string; userId: string }) => {
      if (data.threadId === threadId) {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
        
        const existingTimeout = typingTimeouts.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingTimeouts.current.delete(data.userId);
        }
      }
    };

    client.on('typing:start', handleTypingStart);
    client.on('typing:stop', handleTypingStop);

    return () => {
      client.off('typing:start', handleTypingStart);
      client.off('typing:stop', handleTypingStop);
      
      // Clear all timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, [threadId]);

  const startTyping = useCallback(() => {
    client.sendTyping(threadId, true);
  }, [threadId]);

  const stopTyping = useCallback(() => {
    client.sendTyping(threadId, false);
  }, [threadId]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}

export function useReadReceipts(threadId: string) {
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);
  const client = getWebSocketClient();

  useEffect(() => {
    const handleMessageRead = (data: { threadId: string; messageId: string; userId: string }) => {
      if (data.threadId === threadId) {
        const receipt: ReadReceipt = {
          messageId: data.messageId,
          userId: data.userId,
          userName: 'Unknown User', // This should come from the server
          readAt: new Date().toISOString(),
        };
        
        setReadReceipts(prev => {
          const filtered = prev.filter(r => !(r.messageId === data.messageId && r.userId === data.userId));
          return [...filtered, receipt];
        });
      }
    };

    client.on('message:read', handleMessageRead);

    return () => {
      client.off('message:read', handleMessageRead);
    };
  }, [threadId]);

  const markAsRead = useCallback((messageId: string) => {
    client.markMessageAsRead(threadId, messageId);
  }, [threadId]);

  return {
    readReceipts,
    markAsRead,
  };
}

export function useMessageReactions() {
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const client = getWebSocketClient();

  useEffect(() => {
    const handleReactionAdded = (data: { messageId: string; userId: string; emoji: string }) => {
      const reaction: MessageReaction = {
        id: `${data.messageId}-${data.userId}-${data.emoji}`,
        messageId: data.messageId,
        userId: data.userId,
        userName: 'Unknown User', // This should come from the server
        emoji: data.emoji,
        createdAt: new Date().toISOString(),
      };
      
      setReactions(prev => {
        const filtered = prev.filter(r => 
          !(r.messageId === data.messageId && r.userId === data.userId && r.emoji === data.emoji)
        );
        return [...filtered, reaction];
      });
    };

    const handleReactionRemoved = (data: { messageId: string; userId: string; emoji: string }) => {
      setReactions(prev => 
        prev.filter(r => 
          !(r.messageId === data.messageId && r.userId === data.userId && r.emoji === data.emoji)
        )
      );
    };

    client.on('reaction:added', handleReactionAdded);
    client.on('reaction:removed', handleReactionRemoved);

    return () => {
      client.off('reaction:added', handleReactionAdded);
      client.off('reaction:removed', handleReactionRemoved);
    };
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    client.addReaction(messageId, emoji);
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    client.removeReaction(messageId, emoji);
  }, []);

  return {
    reactions,
    addReaction,
    removeReaction,
  };
}

export function useUserPresence() {
  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const client = getWebSocketClient();

  useEffect(() => {
    const handleUserOnline = (data: { userId: string; status: 'online' | 'away' | 'offline' }) => {
      const presence: UserPresence = {
        userId: data.userId,
        status: data.status,
        lastSeen: new Date().toISOString(),
      };
      
      setUserPresence(prev => new Map(prev.set(data.userId, presence)));
    };

    client.on('user:online', handleUserOnline);

    return () => {
      client.off('user:online', handleUserOnline);
    };
  }, []);

  const updatePresence = useCallback((status: 'online' | 'away' | 'offline') => {
    client.updatePresence(status);
  }, []);

  const getUserPresence = useCallback((userId: string): UserPresence | undefined => {
    return userPresence.get(userId);
  }, [userPresence]);

  return {
    userPresence,
    updatePresence,
    getUserPresence,
  };
}

export function useFileUpload(threadId: string) {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const client = getWebSocketClient();

  const notifyFileUpload = useCallback((fileName: string, fileSize: number) => {
    client.notifyFileUpload(threadId, fileName, fileSize);
    
    const progress: FileUploadProgress = {
      threadId,
      fileName,
      fileSize,
      uploadedBytes: 0,
      progress: 0,
      status: 'uploading',
    };
    
    setUploadProgress(prev => [...prev, progress]);
  }, [threadId]);

  const updateProgress = useCallback((fileName: string, uploadedBytes: number) => {
    setUploadProgress(prev => 
      prev.map(p => {
        if (p.fileName === fileName && p.threadId === threadId) {
          const progress = Math.round((uploadedBytes / p.fileSize) * 100);
          return {
            ...p,
            uploadedBytes,
            progress,
            status: progress === 100 ? 'completed' : 'uploading',
          };
        }
        return p;
      })
    );
  }, [threadId]);

  const markUploadComplete = useCallback((fileName: string) => {
    setUploadProgress(prev => 
      prev.map(p => {
        if (p.fileName === fileName && p.threadId === threadId) {
          return { ...p, status: 'completed', progress: 100 };
        }
        return p;
      })
    );
  }, [threadId]);

  const markUploadError = useCallback((fileName: string) => {
    setUploadProgress(prev => 
      prev.map(p => {
        if (p.fileName === fileName && p.threadId === threadId) {
          return { ...p, status: 'error' };
        }
        return p;
      })
    );
  }, [threadId]);

  const clearProgress = useCallback((fileName?: string) => {
    if (fileName) {
      setUploadProgress(prev => 
        prev.filter(p => !(p.fileName === fileName && p.threadId === threadId))
      );
    } else {
      setUploadProgress(prev => prev.filter(p => p.threadId !== threadId));
    }
  }, [threadId]);

  return {
    uploadProgress,
    notifyFileUpload,
    updateProgress,
    markUploadComplete,
    markUploadError,
    clearProgress,
  };
}