import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ModalType = 
  | 'create-document'
  | 'edit-document'
  | 'delete-document'
  | 'create-section'
  | 'edit-section'
  | 'share-document'
  | 'export-document'
  | null;

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Dock
  dockPosition: 'left' | 'bottom';
  dockVisible: boolean;
  dockItems: string[];
  
  // Modal
  modalType: ModalType;
  modalData: any;
  
  // Notifications
  notifications: Notification[];
  
  // Loading
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  viewMode: 'grid' | 'list' | 'cards';
  showPreview: boolean;
}

export interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Dock actions
  setDockPosition: (position: 'left' | 'bottom') => void;
  setDockVisible: (visible: boolean) => void;
  reorderDockItems: (items: string[]) => void;
  addDockItem: (item: string) => void;
  removeDockItem: (item: string) => void;
  
  // Modal actions
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  
  // Notification actions
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout actions
  setViewMode: (mode: 'grid' | 'list' | 'cards') => void;
  togglePreview: () => void;
}

type UIStore = UIState & UIActions;

/**
 * UI Store
 * Manages all UI-related state including modals, notifications, sidebar, etc.
 */
export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      
      dockPosition: 'left',
      dockVisible: true,
      dockItems: ['portal', 'library', 'finance', 'messaging', 'tasks'],
      
      modalType: null,
      modalData: null,
      
      notifications: [],
      
      globalLoading: false,
      loadingMessage: null,
      
      theme: 'light',
      
      viewMode: 'list',
      showPreview: false,

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      setSidebarCollapsed: (collapsed) => {
        set((state) => {
          state.sidebarCollapsed = collapsed;
        });
      },

      // Dock actions
      setDockPosition: (position) => {
        set((state) => {
          state.dockPosition = position;
        });
      },

      setDockVisible: (visible) => {
        set((state) => {
          state.dockVisible = visible;
        });
      },

      reorderDockItems: (items) => {
        set((state) => {
          state.dockItems = items;
        });
      },

      addDockItem: (item) => {
        set((state) => {
          if (!state.dockItems.includes(item)) {
            state.dockItems.push(item);
          }
        });
      },

      removeDockItem: (item) => {
        set((state) => {
          // Don't allow removing 'portal' as it's always pinned
          if (item !== 'portal') {
            state.dockItems = state.dockItems.filter(i => i !== item);
          }
        });
      },

      // Modal actions
      openModal: (type, data) => {
        set((state) => {
          state.modalType = type;
          state.modalData = data;
        });
      },

      closeModal: () => {
        set((state) => {
          state.modalType = null;
          state.modalData = null;
        });
      },

      // Notification actions
      showNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration || 5000,
        };
        
        set((state) => {
          state.notifications.push(newNotification);
        });
        
        // Auto-remove after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      // Loading actions
      setGlobalLoading: (loading, message) => {
        set((state) => {
          state.globalLoading = loading;
          state.loadingMessage = message || null;
        });
      },

      // Theme actions
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'dark' : 'light');
          } else {
            root.classList.add(theme);
          }
        }
      },

      // Layout actions
      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
        });
      },

      togglePreview: () => {
        set((state) => {
          state.showPreview = !state.showPreview;
        });
      },
    })),
    {
      name: 'UIStore',
    }
  )
);

// Selectors
export const selectSidebarOpen = (state: UIStore) => state.sidebarOpen;
export const selectModalType = (state: UIStore) => state.modalType;
export const selectModalData = (state: UIStore) => state.modalData;
export const selectNotifications = (state: UIStore) => state.notifications;
export const selectTheme = (state: UIStore) => state.theme;
export const selectViewMode = (state: UIStore) => state.viewMode;
export const selectDockItems = (state: UIStore) => state.dockItems;