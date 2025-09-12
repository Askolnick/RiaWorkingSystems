import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { portalRepository } from '../repositories/portal.repository';
import type { DashboardLayout, WidgetInstance } from '@ria/portal-server';

interface PortalState {
  currentLayout: DashboardLayout | null;
  widgets: WidgetInstance[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedWidget: WidgetInstance | null;
  isEditing: boolean;
}

interface PortalActions {
  loadLayout: (name?: string, userId?: string) => Promise<void>;
  saveLayout: (name?: string, userId?: string) => Promise<void>;
  addWidget: (widget: Omit<WidgetInstance, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetInstance>) => void;
  removeWidget: (id: string) => void;
  updateWidgets: (widgets: WidgetInstance[]) => void;
  setSelectedWidget: (widget: WidgetInstance | null) => void;
  setEditing: (editing: boolean) => void;
  clearError: () => void;
}

export const usePortalStore = create<PortalState & PortalActions>()(
  devtools(
    immer((set, get) => ({
      currentLayout: null,
      widgets: [],
      loading: false,
      saving: false,
      error: null,
      selectedWidget: null,
      isEditing: false,

      loadLayout: async (name = 'default', userId) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const layout = await portalRepository.instance.getLayout(name, userId);
          set(state => {
            if (layout) {
              state.currentLayout = layout;
              state.widgets = layout.widgets;
            } else {
              const defaultLayout: DashboardLayout = {
                id: 'temp',
                name,
                tenantId: 'demo-tenant',
                userId: userId || null,
                widgets: [],
                createdAt: new Date(),
                updatedAt: new Date()
              };
              state.currentLayout = defaultLayout;
              state.widgets = [];
            }
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to load layout';
            state.loading = false;
          });
        }
      },

      saveLayout: async (name, userId) => {
        const currentLayout = get().currentLayout;
        if (!currentLayout) return;

        set(state => { state.saving = true; });

        try {
          const layoutData = {
            name: name || currentLayout.name,
            userId: userId !== undefined ? userId : currentLayout.userId,
            widgets: get().widgets
          };
          const savedLayout = await portalRepository.instance.saveLayout(layoutData);
          set(state => {
            state.currentLayout = savedLayout;
            state.saving = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to save layout';
            state.saving = false;
          });
        }
      },

      addWidget: (widget) => {
        set(state => {
          const newWidget: WidgetInstance = {
            ...widget,
            id: `widget-${Date.now()}`
          };
          state.widgets.push(newWidget);
        });
      },

      updateWidget: (id, updates) => {
        set(state => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index >= 0) {
            state.widgets[index] = { ...state.widgets[index], ...updates };
          }
        });
      },

      removeWidget: (id) => {
        set(state => {
          state.widgets = state.widgets.filter(w => w.id !== id);
        });
      },

      updateWidgets: (widgets) => {
        set(state => {
          state.widgets = widgets;
        });
      },

      setSelectedWidget: (widget) => {
        set(state => {
          state.selectedWidget = widget;
        });
      },

      setEditing: (editing) => {
        set(state => {
          state.isEditing = editing;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
    }))
  )
);