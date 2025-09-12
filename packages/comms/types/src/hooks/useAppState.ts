/**
 * RIA App State Management Hook
 * 
 * Global app state management for UI state, selections, and preview modes
 * Based on Buoy's sophisticated app state patterns
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types for selections
export interface SelectedItems {
  invoiceId: string | null;
  taskId: string | null;
  projectId: string | null;
  clientId: string | null;
  documentId: string | null;
  contactId: string | null;
  libraryItemId: string | null;
}

// UI state for modals, overlays, and navigation
export interface UIState {
  // Navigation
  sidebarOpen: boolean;
  sidebarAnimating: boolean;
  navigationCollapsed: boolean;
  
  // Modals and overlays
  searchOverlayOpen: boolean;
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;
  helpOverlayOpen: boolean;
  notificationsPanelOpen: boolean;
  
  // Module-specific UI
  financeViewMode: 'table' | 'cards' | 'chart';
  tasksViewMode: 'list' | 'board' | 'calendar' | 'timeline';
  libraryViewMode: 'grid' | 'list' | 'tree';
  
  // Global loading states
  globalLoading: boolean;
  syncInProgress: boolean;
  
  // Feature flags
  experimentalFeaturesEnabled: boolean;
  debugMode: boolean;
}

// Preview states for settings changes
export interface PreviewState {
  previewingSettings: boolean;
  previewedTheme: string | null;
  previewedColors: Record<string, string> | null;
  previewTimeout: NodeJS.Timeout | null;
}

// Complete app state
export interface AppState extends UIState, PreviewState {
  selectedItems: SelectedItems;
  
  // Last activity tracking
  lastActivity: number;
  isIdle: boolean;
  
  // Context data
  currentTenant: string | null;
  currentUser: string | null;
  
  // Error state
  globalError: string | null;
  errorHistory: Array<{
    error: string;
    timestamp: number;
    context?: string;
  }>;
}

// Actions for app state management
interface AppStateActions {
  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarAnimating: (animating: boolean) => void;
  toggleNavigationCollapsed: () => void;
  
  // Modal/Overlay Actions
  openModal: (modal: keyof Pick<UIState, 'searchOverlayOpen' | 'commandPaletteOpen' | 'settingsModalOpen' | 'helpOverlayOpen' | 'notificationsPanelOpen'>) => void;
  closeModal: (modal: keyof Pick<UIState, 'searchOverlayOpen' | 'commandPaletteOpen' | 'settingsModalOpen' | 'helpOverlayOpen' | 'notificationsPanelOpen'>) => void;
  closeAllModals: () => void;
  
  // View Mode Actions
  setFinanceViewMode: (mode: UIState['financeViewMode']) => void;
  setTasksViewMode: (mode: UIState['tasksViewMode']) => void;
  setLibraryViewMode: (mode: UIState['libraryViewMode']) => void;
  
  // Selection Actions
  selectItem: <K extends keyof SelectedItems>(key: K, id: SelectedItems[K]) => void;
  clearSelection: <K extends keyof SelectedItems>(key?: K) => void;
  clearAllSelections: () => void;
  
  // Loading States
  setGlobalLoading: (loading: boolean) => void;
  setSyncInProgress: (syncing: boolean) => void;
  
  // Preview Actions
  startPreview: (type: 'theme' | 'colors', data: any) => void;
  applyPreview: () => void;
  cancelPreview: () => void;
  
  // Activity Tracking
  updateActivity: () => void;
  setIdle: (idle: boolean) => void;
  
  // Context Actions
  setCurrentTenant: (tenantId: string | null) => void;
  setCurrentUser: (userId: string | null) => void;
  
  // Error Handling
  setGlobalError: (error: string | null, context?: string) => void;
  clearError: () => void;
  addToErrorHistory: (error: string, context?: string) => void;
  
  // Debug & Development
  toggleDebugMode: () => void;
  enableExperimentalFeatures: (enabled: boolean) => void;
  
  // Batch Actions
  setBatch: (updates: Partial<AppState>) => void;
}

const INITIAL_STATE: AppState = {
  // UI State
  sidebarOpen: true,
  sidebarAnimating: false,
  navigationCollapsed: false,
  searchOverlayOpen: false,
  commandPaletteOpen: false,
  settingsModalOpen: false,
  helpOverlayOpen: false,
  notificationsPanelOpen: false,
  financeViewMode: 'table',
  tasksViewMode: 'list',
  libraryViewMode: 'grid',
  globalLoading: false,
  syncInProgress: false,
  experimentalFeaturesEnabled: false,
  debugMode: false,
  
  // Selections
  selectedItems: {
    invoiceId: null,
    taskId: null,
    projectId: null,
    clientId: null,
    documentId: null,
    contactId: null,
    libraryItemId: null,
  },
  
  // Preview State
  previewingSettings: false,
  previewedTheme: null,
  previewedColors: null,
  previewTimeout: null,
  
  // Activity
  lastActivity: Date.now(),
  isIdle: false,
  
  // Context
  currentTenant: null,
  currentUser: null,
  
  // Error State
  globalError: null,
  errorHistory: [],
};

/**
 * Zustand store for app state management
 */
export const useAppStateStore = create<AppState & AppStateActions>()(
  devtools(
    immer((set, get) => ({
      ...INITIAL_STATE,

      // UI Actions
      toggleSidebar: () => set(state => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

      setSidebarOpen: (open: boolean) => set(state => {
        state.sidebarOpen = open;
      }),

      setSidebarAnimating: (animating: boolean) => set(state => {
        state.sidebarAnimating = animating;
      }),

      toggleNavigationCollapsed: () => set(state => {
        state.navigationCollapsed = !state.navigationCollapsed;
      }),

      // Modal Actions
      openModal: (modal) => set(state => {
        // Close other modals first
        state.searchOverlayOpen = false;
        state.commandPaletteOpen = false;
        state.settingsModalOpen = false;
        state.helpOverlayOpen = false;
        state.notificationsPanelOpen = false;
        
        // Open requested modal
        state[modal] = true;
      }),

      closeModal: (modal) => set(state => {
        state[modal] = false;
      }),

      closeAllModals: () => set(state => {
        state.searchOverlayOpen = false;
        state.commandPaletteOpen = false;
        state.settingsModalOpen = false;
        state.helpOverlayOpen = false;
        state.notificationsPanelOpen = false;
      }),

      // View Mode Actions
      setFinanceViewMode: (mode) => set(state => {
        state.financeViewMode = mode;
      }),

      setTasksViewMode: (mode) => set(state => {
        state.tasksViewMode = mode;
      }),

      setLibraryViewMode: (mode) => set(state => {
        state.libraryViewMode = mode;
      }),

      // Selection Actions
      selectItem: (key, id) => set(state => {
        state.selectedItems[key] = id;
        state.lastActivity = Date.now();
      }),

      clearSelection: (key) => set(state => {
        if (key) {
          state.selectedItems[key] = null;
        } else {
          // Clear most recent selection
          const items = state.selectedItems;
          const keys = Object.keys(items) as (keyof SelectedItems)[];
          for (const k of keys.reverse()) {
            if (items[k]) {
              items[k] = null;
              break;
            }
          }
        }
      }),

      clearAllSelections: () => set(state => {
        Object.keys(state.selectedItems).forEach(key => {
          (state.selectedItems as any)[key] = null;
        });
      }),

      // Loading States
      setGlobalLoading: (loading) => set(state => {
        state.globalLoading = loading;
      }),

      setSyncInProgress: (syncing) => set(state => {
        state.syncInProgress = syncing;
      }),

      // Preview Actions
      startPreview: (type, data) => set(state => {
        state.previewingSettings = true;
        
        if (type === 'theme') {
          state.previewedTheme = data;
        } else if (type === 'colors') {
          state.previewedColors = data;
        }
        
        // Auto-cancel after 10 seconds
        if (state.previewTimeout) {
          clearTimeout(state.previewTimeout);
        }
        
        state.previewTimeout = setTimeout(() => {
          get().cancelPreview();
        }, 10000);
      }),

      applyPreview: () => set(state => {
        // Preview would be applied by calling updateSettings
        state.previewingSettings = false;
        state.previewedTheme = null;
        state.previewedColors = null;
        
        if (state.previewTimeout) {
          clearTimeout(state.previewTimeout);
          state.previewTimeout = null;
        }
      }),

      cancelPreview: () => set(state => {
        state.previewingSettings = false;
        state.previewedTheme = null;
        state.previewedColors = null;
        
        if (state.previewTimeout) {
          clearTimeout(state.previewTimeout);
          state.previewTimeout = null;
        }
      }),

      // Activity Tracking
      updateActivity: () => set(state => {
        state.lastActivity = Date.now();
        if (state.isIdle) {
          state.isIdle = false;
        }
      }),

      setIdle: (idle) => set(state => {
        state.isIdle = idle;
      }),

      // Context Actions
      setCurrentTenant: (tenantId) => set(state => {
        state.currentTenant = tenantId;
      }),

      setCurrentUser: (userId) => set(state => {
        state.currentUser = userId;
      }),

      // Error Handling
      setGlobalError: (error, context) => set(state => {
        state.globalError = error;
        if (error && context) {
          state.errorHistory.push({
            error,
            context,
            timestamp: Date.now(),
          });
          
          // Keep only last 50 errors
          if (state.errorHistory.length > 50) {
            state.errorHistory = state.errorHistory.slice(-50);
          }
        }
      }),

      clearError: () => set(state => {
        state.globalError = null;
      }),

      addToErrorHistory: (error, context) => set(state => {
        state.errorHistory.push({
          error,
          context,
          timestamp: Date.now(),
        });
        
        // Keep only last 50 errors
        if (state.errorHistory.length > 50) {
          state.errorHistory = state.errorHistory.slice(-50);
        }
      }),

      // Debug & Development
      toggleDebugMode: () => set(state => {
        state.debugMode = !state.debugMode;
      }),

      enableExperimentalFeatures: (enabled) => set(state => {
        state.experimentalFeaturesEnabled = enabled;
      }),

      // Batch Actions
      setBatch: (updates) => set(state => {
        Object.assign(state, updates);
      }),
    })),
    { name: 'ria-app-state' }
  )
);

/**
 * React hook for app state management
 */
export function useAppState() {
  return useAppStateStore();
}

/**
 * Hook for UI state only
 */
export function useUIState() {
  const store = useAppStateStore();
  
  return {
    // State
    sidebarOpen: store.sidebarOpen,
    sidebarAnimating: store.sidebarAnimating,
    navigationCollapsed: store.navigationCollapsed,
    modalsOpen: {
      searchOverlay: store.searchOverlayOpen,
      commandPalette: store.commandPaletteOpen,
      settings: store.settingsModalOpen,
      help: store.helpOverlayOpen,
      notifications: store.notificationsPanelOpen,
    },
    viewModes: {
      finance: store.financeViewMode,
      tasks: store.tasksViewMode,
      library: store.libraryViewMode,
    },
    loading: {
      global: store.globalLoading,
      sync: store.syncInProgress,
    },
    
    // Actions
    toggleSidebar: store.toggleSidebar,
    setSidebarOpen: store.setSidebarOpen,
    toggleNavigationCollapsed: store.toggleNavigationCollapsed,
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    setFinanceViewMode: store.setFinanceViewMode,
    setTasksViewMode: store.setTasksViewMode,
    setLibraryViewMode: store.setLibraryViewMode,
    setGlobalLoading: store.setGlobalLoading,
    setSyncInProgress: store.setSyncInProgress,
  };
}

/**
 * Hook for selection management
 */
export function useSelection() {
  const store = useAppStateStore();
  
  return {
    selectedItems: store.selectedItems,
    selectItem: store.selectItem,
    clearSelection: store.clearSelection,
    clearAllSelections: store.clearAllSelections,
  };
}

/**
 * Hook for activity tracking
 */
export function useActivity() {
  const store = useAppStateStore();
  
  return {
    lastActivity: store.lastActivity,
    isIdle: store.isIdle,
    updateActivity: store.updateActivity,
    setIdle: store.setIdle,
  };
}