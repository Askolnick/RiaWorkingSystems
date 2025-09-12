import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { messagingRepository } from '../repositories/messaging.repository';
import type { 
  Conversation, 
  Message, 
  Inbox, 
  ConversationStatus 
} from '@ria/messaging-client';

interface MessagingState {
  // Data
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  inboxes: Inbox[];
  currentConversation: Conversation | null;
  
  // Direct Message State
  directMessages: Conversation[];
  searchedUsers: any[];
  userSearchQuery: string;
  
  // UI State
  loading: boolean;
  error: string | null;
  conversationsLoading: boolean;
  messagesLoading: Record<string, boolean>; // conversationId -> loading
  userSearchLoading: boolean;
  
  // Filters
  activeFilter: {
    inbox?: string;
    q?: string;
    status?: ConversationStatus;
    tag?: string;
  };
}

interface MessagingActions {
  // Data Actions
  fetchInboxes: () => Promise<void>;
  fetchConversations: (filter?: MessagingState['activeFilter']) => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, data: { bodyText: string; as?: 'email' | 'chat' }) => Promise<void>;
  updateConversationStatus: (id: string, status: ConversationStatus) => Promise<void>;
  assignConversation: (id: string, userId?: string) => Promise<void>;
  addConversationTag: (id: string, tag: string) => Promise<void>;
  
  // Direct Message Actions
  createDirectMessage: (recipientIds: string[], subject?: string) => Promise<Conversation>;
  fetchDirectMessages: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  addParticipants: (threadId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (threadId: string, userId: string) => Promise<void>;
  markConversationAsRead: (threadId: string) => Promise<void>;
  
  // UI Actions
  setActiveFilter: (filter: MessagingState['activeFilter']) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
  setUserSearchQuery: (query: string) => void;
  
  // Optimistic Updates
  optimisticSendMessage: (conversationId: string, message: Omit<Message, 'id' | 'sentAt'>) => void;
  optimisticUpdateStatus: (conversationId: string, status: ConversationStatus) => void;
}

export const useMessagingStore = create<MessagingState & MessagingActions>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      conversations: [],
      messages: {},
      inboxes: [],
      currentConversation: null,
      directMessages: [],
      searchedUsers: [],
      userSearchQuery: '',
      loading: false,
      error: null,
      conversationsLoading: false,
      messagesLoading: {},
      userSearchLoading: false,
      activeFilter: {},

      // Data Actions
      fetchInboxes: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const inboxes = await messagingRepository.instance.listInboxes();
          set(state => {
            state.inboxes = inboxes;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch inboxes';
            state.loading = false;
          });
        }
      },

      fetchConversations: async (filter) => {
        set(state => {
          state.conversationsLoading = true;
          state.error = null;
          if (filter) state.activeFilter = filter;
        });

        try {
          const conversations = await messagingRepository.instance.listConversations(
            filter || get().activeFilter
          );
          set(state => {
            state.conversations = conversations;
            state.conversationsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch conversations';
            state.conversationsLoading = false;
          });
        }
      },

      fetchConversation: async (id) => {
        set(state => {
          state.messagesLoading[id] = true;
          state.error = null;
        });

        try {
          const { convo, messages } = await messagingRepository.instance.getConversation(id);
          set(state => {
            state.messages[id] = messages;
            state.currentConversation = convo;
            state.messagesLoading[id] = false;
            
            // Update conversation in list if present
            const convIndex = state.conversations.findIndex(c => c.id === id);
            if (convIndex >= 0) {
              state.conversations[convIndex] = convo;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch conversation';
            state.messagesLoading[id] = false;
          });
        }
      },

      sendMessage: async (conversationId, data) => {
        try {
          // Optimistic update
          const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId,
            source: data.as === 'email' ? 'email' : 'internal',
            direction: 'out',
            author: 'you',
            bodyText: data.bodyText,
            sentAt: new Date().toISOString(),
            tenantId: 'demo-tenant'
          };

          set(state => {
            if (!state.messages[conversationId]) {
              state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(optimisticMessage);
          });

          // Send to server
          const message = await messagingRepository.instance.postMessage(conversationId, data);
          
          set(state => {
            // Replace optimistic message with real one
            if (state.messages[conversationId]) {
              const optimisticIndex = state.messages[conversationId].findIndex(
                m => m.id === optimisticMessage.id
              );
              if (optimisticIndex >= 0) {
                state.messages[conversationId][optimisticIndex] = message;
              }
            }
            
            // Update conversation lastAt
            const convIndex = state.conversations.findIndex(c => c.id === conversationId);
            if (convIndex >= 0) {
              state.conversations[convIndex].lastAt = message.sentAt;
            }
          });
        } catch (error) {
          // Remove optimistic message on error
          set(state => {
            if (state.messages[conversationId]) {
              state.messages[conversationId] = state.messages[conversationId].filter(
                m => !m.id.startsWith('temp-')
              );
            }
            state.error = error instanceof Error ? error.message : 'Failed to send message';
          });
        }
      },

      updateConversationStatus: async (id, status) => {
        // Optimistic update
        get().optimisticUpdateStatus(id, status);

        try {
          await messagingRepository.instance.setStatus(id, status);
        } catch (error) {
          // Revert on error
          await get().fetchConversation(id);
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update status';
          });
        }
      },

      assignConversation: async (id, userId) => {
        try {
          await messagingRepository.instance.setAssignee(id, userId);
          await get().fetchConversation(id);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to assign conversation';
          });
        }
      },

      addConversationTag: async (id, tag) => {
        try {
          await messagingRepository.instance.addTag(id, tag);
          await get().fetchConversation(id);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to add tag';
          });
        }
      },

      // UI Actions
      setActiveFilter: (filter) => {
        set(state => {
          state.activeFilter = filter;
        });
      },

      setCurrentConversation: (conversation) => {
        set(state => {
          state.currentConversation = conversation;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      // Optimistic Updates
      optimisticSendMessage: (conversationId, message) => {
        set(state => {
          const fullMessage: Message = {
            ...message,
            id: `temp-${Date.now()}`,
            sentAt: new Date().toISOString(),
          };
          
          if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
          }
          state.messages[conversationId].push(fullMessage);
        });
      },

      optimisticUpdateStatus: (conversationId, status) => {
        set(state => {
          const convIndex = state.conversations.findIndex(c => c.id === conversationId);
          if (convIndex >= 0) {
            state.conversations[convIndex].status = status;
          }
          if (state.currentConversation?.id === conversationId) {
            state.currentConversation.status = status;
          }
        });
      },

      // Direct Message Actions
      createDirectMessage: async (recipientIds, subject) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const conversation = await messagingRepository.createDirectMessage(recipientIds, subject);
          set(state => {
            state.conversations.unshift(conversation);
            state.directMessages.unshift(conversation);
            state.loading = false;
          });
          return conversation;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create direct message';
            state.loading = false;
          });
          throw error;
        }
      },

      fetchDirectMessages: async () => {
        set(state => {
          state.conversationsLoading = true;
          state.error = null;
        });

        try {
          // Fetch conversations that are direct messages
          const conversations = await messagingRepository.listConversations({ tag: 'dm' });
          set(state => {
            state.directMessages = conversations.filter(c => c.isDirect);
            state.conversationsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch direct messages';
            state.conversationsLoading = false;
          });
        }
      },

      searchUsers: async (query) => {
        set(state => {
          state.userSearchLoading = true;
          state.userSearchQuery = query;
          state.error = null;
        });

        try {
          const users = await messagingRepository.searchUsers(query);
          set(state => {
            state.searchedUsers = users;
            state.userSearchLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to search users';
            state.userSearchLoading = false;
          });
        }
      },

      addParticipants: async (threadId, userIds) => {
        try {
          await messagingRepository.addParticipants(threadId, userIds);
          // Update local state
          set(state => {
            const convIndex = state.conversations.findIndex(c => c.id === threadId);
            if (convIndex >= 0) {
              const conv = state.conversations[convIndex];
              const currentParticipants = conv.participantIds || [];
              state.conversations[convIndex].participantIds = [...new Set([...currentParticipants, ...userIds])];
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to add participants';
          });
        }
      },

      removeParticipant: async (threadId, userId) => {
        try {
          await messagingRepository.removeParticipant(threadId, userId);
          // Update local state
          set(state => {
            const convIndex = state.conversations.findIndex(c => c.id === threadId);
            if (convIndex >= 0) {
              const conv = state.conversations[convIndex];
              state.conversations[convIndex].participantIds = (conv.participantIds || []).filter(id => id !== userId);
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to remove participant';
          });
        }
      },

      markConversationAsRead: async (threadId) => {
        try {
          await messagingRepository.markAsRead(threadId);
          // Could update UI to show read status
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to mark as read';
          });
        }
      },

      setUserSearchQuery: (query) => {
        set(state => {
          state.userSearchQuery = query;
        });
      },
    }))
  )
);