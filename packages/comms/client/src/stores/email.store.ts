import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { emailRepository, EmailAccount, EmailMessage, EmailThread, EmailFolder, EmailDraft } from '../repositories/email.repository';

interface EmailState {
  // Accounts
  accounts: EmailAccount[];
  currentAccountId: string | null;
  
  // Folders
  folders: EmailFolder[];
  currentFolderId: string;
  
  // Messages
  threads: EmailThread[];
  currentThread: EmailThread | null;
  messages: EmailMessage[];
  selectedMessageIds: string[];
  
  // Drafts
  drafts: EmailMessage[];
  currentDraft: EmailDraft | null;
  
  // UI State
  loading: boolean;
  syncing: boolean;
  error: string | null;
  searchQuery: string;
  composerOpen: boolean;
}

interface EmailActions {
  // Account management
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<EmailAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<EmailAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setCurrentAccount: (accountId: string) => void;
  syncAccount: (accountId?: string) => Promise<void>;
  
  // Folder management
  fetchFolders: (accountId?: string) => Promise<void>;
  setCurrentFolder: (folderId: string) => void;
  
  // Thread and message management
  fetchThreads: (accountId?: string, folderId?: string) => Promise<void>;
  fetchThread: (threadId: string) => Promise<void>;
  setCurrentThread: (thread: EmailThread | null) => void;
  
  // Message actions
  sendEmail: (draft: EmailDraft) => Promise<void>;
  saveDraft: (draft: EmailDraft) => Promise<void>;
  updateDraft: (draftId: string, draft: EmailDraft) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  
  // Bulk actions
  markAsRead: (messageIds?: string[]) => Promise<void>;
  markAsUnread: (messageIds?: string[]) => Promise<void>;
  flagMessages: (messageIds?: string[], flagged?: boolean) => Promise<void>;
  archiveMessages: (messageIds?: string[]) => Promise<void>;
  deleteMessages: (messageIds?: string[]) => Promise<void>;
  moveToFolder: (folderId: string, messageIds?: string[]) => Promise<void>;
  
  // Selection
  setSelectedMessages: (messageIds: string[]) => void;
  toggleMessageSelection: (messageId: string) => void;
  selectAllMessages: () => void;
  clearSelection: () => void;
  
  // Search
  searchMessages: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  
  // Composer
  openComposer: (draft?: Partial<EmailDraft>) => void;
  closeComposer: () => void;
  setCurrentDraft: (draft: EmailDraft | null) => void;
  
  // Utility
  clearError: () => void;
}

export const useEmailStore = create<EmailState & EmailActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      accounts: [],
      currentAccountId: null,
      folders: [],
      currentFolderId: 'inbox',
      threads: [],
      currentThread: null,
      messages: [],
      selectedMessageIds: [],
      drafts: [],
      currentDraft: null,
      loading: false,
      syncing: false,
      error: null,
      searchQuery: '',
      composerOpen: false,

      // Account management
      fetchAccounts: async () => {
        set(state => { state.loading = true; });
        try {
          const accounts = await emailRepository.getAccounts();
          set(state => {
            state.accounts = accounts;
            if (!state.currentAccountId && accounts.length > 0) {
              state.currentAccountId = accounts.find(a => a.isDefault)?.id || accounts[0].id;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      addAccount: async (account) => {
        set(state => { state.loading = true; });
        try {
          const newAccount = await emailRepository.addAccount(account);
          set(state => {
            state.accounts.push(newAccount);
            if (!state.currentAccountId) {
              state.currentAccountId = newAccount.id;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateAccount: async (id, updates) => {
        set(state => { state.loading = true; });
        try {
          const updatedAccount = await emailRepository.updateAccount(id, updates);
          set(state => {
            const index = state.accounts.findIndex(a => a.id === id);
            if (index >= 0) {
              state.accounts[index] = updatedAccount;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      deleteAccount: async (id) => {
        set(state => { state.loading = true; });
        try {
          await emailRepository.deleteAccount(id);
          set(state => {
            state.accounts = state.accounts.filter(a => a.id !== id);
            if (state.currentAccountId === id) {
              state.currentAccountId = state.accounts[0]?.id || null;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      setCurrentAccount: (accountId) => {
        set(state => {
          state.currentAccountId = accountId;
          state.threads = [];
          state.currentThread = null;
        });
        // Fetch folders and threads for new account
        get().fetchFolders(accountId);
        get().fetchThreads(accountId);
      },

      syncAccount: async (accountId) => {
        const id = accountId || get().currentAccountId;
        if (!id) return;
        
        set(state => { state.syncing = true; });
        try {
          const result = await emailRepository.syncAccount(id);
          set(state => { state.syncing = false; });
          
          // Refresh threads after sync
          await get().fetchThreads(id);
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.syncing = false;
          });
        }
      },

      // Folder management
      fetchFolders: async (accountId) => {
        const id = accountId || get().currentAccountId;
        if (!id) return;
        
        set(state => { state.loading = true; });
        try {
          const folders = await emailRepository.getFolders(id);
          set(state => {
            state.folders = folders;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      setCurrentFolder: (folderId) => {
        set(state => {
          state.currentFolderId = folderId;
          state.threads = [];
          state.currentThread = null;
        });
        get().fetchThreads(undefined, folderId);
      },

      // Thread and message management
      fetchThreads: async (accountId, folderId) => {
        const accId = accountId || get().currentAccountId;
        const fId = folderId || get().currentFolderId;
        if (!accId) return;
        
        set(state => { state.loading = true; });
        try {
          const threads = await emailRepository.getThreads(accId, fId);
          set(state => {
            state.threads = threads;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      fetchThread: async (threadId) => {
        set(state => { state.loading = true; });
        try {
          const thread = await emailRepository.getThread(threadId);
          set(state => {
            state.currentThread = thread;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      setCurrentThread: (thread) => {
        set(state => {
          state.currentThread = thread;
        });
      },

      // Message actions
      sendEmail: async (draft) => {
        const accountId = get().currentAccountId;
        if (!accountId) throw new Error('No account selected');
        
        set(state => { state.loading = true; });
        try {
          await emailRepository.sendEmail(accountId, draft);
          set(state => {
            state.loading = false;
            state.composerOpen = false;
            state.currentDraft = null;
          });
          
          // Refresh threads
          await get().fetchThreads();
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
          throw error;
        }
      },

      saveDraft: async (draft) => {
        const accountId = get().currentAccountId;
        if (!accountId) throw new Error('No account selected');
        
        set(state => { state.loading = true; });
        try {
          const savedDraft = await emailRepository.saveDraft(accountId, draft);
          set(state => {
            state.drafts.push(savedDraft);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      updateDraft: async (draftId, draft) => {
        set(state => { state.loading = true; });
        try {
          const updatedDraft = await emailRepository.updateDraft(draftId, draft);
          set(state => {
            const index = state.drafts.findIndex(d => d.id === draftId);
            if (index >= 0) {
              state.drafts[index] = updatedDraft;
            }
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      deleteDraft: async (draftId) => {
        set(state => { state.loading = true; });
        try {
          await emailRepository.deleteDraft(draftId);
          set(state => {
            state.drafts = state.drafts.filter(d => d.id !== draftId);
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      // Bulk actions
      markAsRead: async (messageIds) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.markAsRead(ids);
          set(state => {
            state.threads.forEach(thread => {
              thread.messages.forEach(msg => {
                if (ids.includes(msg.id) && msg.flags) {
                  msg.flags.seen = true;
                }
              });
            });
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      markAsUnread: async (messageIds) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.markAsUnread(ids);
          set(state => {
            state.threads.forEach(thread => {
              thread.messages.forEach(msg => {
                if (ids.includes(msg.id) && msg.flags) {
                  msg.flags.seen = false;
                }
              });
            });
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      flagMessages: async (messageIds, flagged = true) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.flagMessages(ids, flagged);
          set(state => {
            state.threads.forEach(thread => {
              thread.messages.forEach(msg => {
                if (ids.includes(msg.id) && msg.flags) {
                  msg.flags.flagged = flagged;
                }
              });
            });
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      archiveMessages: async (messageIds) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.archiveMessages(ids);
          set(state => {
            state.threads = state.threads.filter(thread => 
              !thread.messages.some(msg => ids.includes(msg.id))
            );
            state.selectedMessageIds = [];
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      deleteMessages: async (messageIds) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.deleteMessages(ids);
          set(state => {
            state.threads = state.threads.filter(thread => 
              !thread.messages.some(msg => ids.includes(msg.id))
            );
            state.selectedMessageIds = [];
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      moveToFolder: async (folderId, messageIds) => {
        const ids = messageIds || get().selectedMessageIds;
        if (!ids.length) return;
        
        try {
          await emailRepository.moveToFolder(ids, folderId);
          set(state => {
            state.threads = state.threads.filter(thread => 
              !thread.messages.some(msg => ids.includes(msg.id))
            );
            state.selectedMessageIds = [];
          });
        } catch (error: any) {
          set(state => { state.error = error.message; });
        }
      },

      // Selection
      setSelectedMessages: (messageIds) => {
        set(state => {
          state.selectedMessageIds = messageIds;
        });
      },

      toggleMessageSelection: (messageId) => {
        set(state => {
          const index = state.selectedMessageIds.indexOf(messageId);
          if (index >= 0) {
            state.selectedMessageIds.splice(index, 1);
          } else {
            state.selectedMessageIds.push(messageId);
          }
        });
      },

      selectAllMessages: () => {
        set(state => {
          state.selectedMessageIds = state.threads.flatMap(t => t.messages.map(m => m.id));
        });
      },

      clearSelection: () => {
        set(state => {
          state.selectedMessageIds = [];
        });
      },

      // Search
      searchMessages: async (query) => {
        const accountId = get().currentAccountId;
        if (!accountId) return;
        
        set(state => { 
          state.loading = true;
          state.searchQuery = query;
        });
        
        try {
          const messages = await emailRepository.searchMessages(accountId, query);
          set(state => {
            state.messages = messages;
            state.loading = false;
          });
        } catch (error: any) {
          set(state => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      setSearchQuery: (query) => {
        set(state => {
          state.searchQuery = query;
        });
      },

      // Composer
      openComposer: (draft) => {
        set(state => {
          state.composerOpen = true;
          state.currentDraft = draft ? {
            to: draft.to || [],
            cc: draft.cc || [],
            bcc: draft.bcc || [],
            subject: draft.subject || '',
            text: draft.text || '',
            html: draft.html,
            priority: draft.priority || 'normal',
            ...draft
          } : null;
        });
      },

      closeComposer: () => {
        set(state => {
          state.composerOpen = false;
          state.currentDraft = null;
        });
      },

      setCurrentDraft: (draft) => {
        set(state => {
          state.currentDraft = draft;
        });
      },

      // Utility
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
    }))
  )
);