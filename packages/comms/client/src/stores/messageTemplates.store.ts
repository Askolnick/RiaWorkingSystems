import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  messageTemplatesRepository,
  type MessageTemplate,
  type MessageTemplateType,
  type CreateMessageTemplateData,
  type UpdateMessageTemplateData,
  type MessageTemplateFilters,
  type MessageTemplateSort,
  type TemplatePreviewData,
  type TemplatePreviewResult
} from '../repositories/messageTemplates.repository';

interface MessageTemplatesState {
  // Data
  templates: MessageTemplate[];
  currentTemplate: MessageTemplate | null;
  previewResult: TemplatePreviewResult | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  previewLoading: boolean;
  
  // Filters and Sorting
  filters: MessageTemplateFilters;
  sort: MessageTemplateSort[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalTemplates: number;
  pageSize: number;
  
  // Categories and Stats
  categories: string[];
  templatesByType: Record<MessageTemplateType, number>;
}

interface MessageTemplatesActions {
  // CRUD Operations
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: CreateMessageTemplateData) => Promise<MessageTemplate>;
  updateTemplate: (id: string, data: UpdateMessageTemplateData) => Promise<MessageTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, name: string) => Promise<MessageTemplate>;
  
  // Template Operations
  setCurrentTemplate: (template: MessageTemplate | null) => void;
  previewTemplate: (data: TemplatePreviewData) => Promise<void>;
  clearPreview: () => void;
  toggleTemplateStatus: (id: string) => Promise<void>;
  
  // Filtering and Sorting
  setFilters: (filters: Partial<MessageTemplateFilters>) => void;
  setSort: (sort: MessageTemplateSort[]) => void;
  clearFilters: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Utility
  clearError: () => void;
  refreshStats: () => Promise<void>;
  getTemplatesByCategory: (category: string) => MessageTemplate[];
  getTemplatesByType: (type: MessageTemplateType) => MessageTemplate[];
}

type MessageTemplatesStore = MessageTemplatesState & MessageTemplatesActions;

const initialFilters: MessageTemplateFilters = {};

const initialSort: MessageTemplateSort[] = [
  { field: 'updatedAt', direction: 'desc' }
];

export const useMessageTemplatesStore = create<MessageTemplatesStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      templates: [],
      currentTemplate: null,
      previewResult: null,
      loading: false,
      error: null,
      previewLoading: false,
      filters: initialFilters,
      sort: initialSort,
      currentPage: 1,
      totalPages: 0,
      totalTemplates: 0,
      pageSize: 20,
      categories: [],
      templatesByType: {
        email: 0,
        sms: 0,
        push: 0,
        'in-app': 0
      },

      // CRUD Operations
      fetchTemplates: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await messageTemplatesRepository.instance.findFiltered(
            get().filters,
            get().sort,
            get().currentPage,
            get().pageSize
          );

          set(state => {
            state.templates = response.data;
            state.totalPages = response.totalPages;
            state.totalTemplates = response.total;
            state.loading = false;
          });

          // Update stats
          await get().refreshStats();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch templates';
            state.loading = false;
          });
        }
      },

      createTemplate: async (data: CreateMessageTemplateData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const template = await messageTemplatesRepository.instance.create(data);
          
          set(state => {
            state.templates.unshift(template);
            state.totalTemplates += 1;
            state.loading = false;
          });

          await get().refreshStats();
          return template;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create template';
            state.loading = false;
          });
          throw error;
        }
      },

      updateTemplate: async (id: string, data: UpdateMessageTemplateData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const template = await messageTemplatesRepository.instance.update(id, data);
          
          set(state => {
            const index = state.templates.findIndex(t => t.id === id);
            if (index >= 0) {
              state.templates[index] = template;
            }
            if (state.currentTemplate?.id === id) {
              state.currentTemplate = template;
            }
            state.loading = false;
          });

          await get().refreshStats();
          return template;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update template';
            state.loading = false;
          });
          throw error;
        }
      },

      deleteTemplate: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await messageTemplatesRepository.instance.delete(id);
          
          set(state => {
            state.templates = state.templates.filter(t => t.id !== id);
            state.totalTemplates -= 1;
            if (state.currentTemplate?.id === id) {
              state.currentTemplate = null;
            }
            state.loading = false;
          });

          await get().refreshStats();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete template';
            state.loading = false;
          });
          throw error;
        }
      },

      duplicateTemplate: async (id: string, name: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const template = await messageTemplatesRepository.instance.duplicateTemplate(id, name);
          
          set(state => {
            state.templates.unshift(template);
            state.totalTemplates += 1;
            state.loading = false;
          });

          await get().refreshStats();
          return template;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to duplicate template';
            state.loading = false;
          });
          throw error;
        }
      },

      // Template Operations
      setCurrentTemplate: (template: MessageTemplate | null) => {
        set(state => {
          state.currentTemplate = template;
        });
      },

      previewTemplate: async (data: TemplatePreviewData) => {
        set(state => {
          state.previewLoading = true;
          state.error = null;
        });

        try {
          const result = await messageTemplatesRepository.instance.previewTemplate(data);
          
          set(state => {
            state.previewResult = result;
            state.previewLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to preview template';
            state.previewLoading = false;
          });
        }
      },

      clearPreview: () => {
        set(state => {
          state.previewResult = null;
        });
      },

      toggleTemplateStatus: async (id: string) => {
        const template = get().templates.find(t => t.id === id);
        if (!template) return;

        try {
          await get().updateTemplate(id, { isActive: !template.isActive });
        } catch (error) {
          // Error handling is done in updateTemplate
        }
      },

      // Filtering and Sorting
      setFilters: (newFilters: Partial<MessageTemplateFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...newFilters };
          state.currentPage = 1; // Reset to first page when filters change
        });
        get().fetchTemplates();
      },

      setSort: (sort: MessageTemplateSort[]) => {
        set(state => {
          state.sort = sort;
          state.currentPage = 1; // Reset to first page when sorting changes
        });
        get().fetchTemplates();
      },

      clearFilters: () => {
        set(state => {
          state.filters = initialFilters;
          state.currentPage = 1;
        });
        get().fetchTemplates();
      },

      // Pagination
      setPage: (page: number) => {
        set(state => {
          state.currentPage = page;
        });
        get().fetchTemplates();
      },

      setPageSize: (size: number) => {
        set(state => {
          state.pageSize = size;
          state.currentPage = 1; // Reset to first page when page size changes
        });
        get().fetchTemplates();
      },

      // Utility
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      refreshStats: async () => {
        try {
          // Get all templates to calculate stats
          const allTemplatesResponse = await messageTemplatesRepository.instance.findFiltered({}, [], 1, 1000);
          const allTemplates = allTemplatesResponse.data;

          const categories = [...new Set(allTemplates.map(t => t.category).filter(Boolean))];
          const templatesByType = allTemplates.reduce(
            (acc, template) => {
              acc[template.templateType] = (acc[template.templateType] || 0) + 1;
              return acc;
            },
            { email: 0, sms: 0, push: 0, 'in-app': 0 }
          );

          set(state => {
            state.categories = categories;
            state.templatesByType = templatesByType;
          });
        } catch (error) {
          // Silently fail stats refresh
          console.warn('Failed to refresh template stats:', error);
        }
      },

      getTemplatesByCategory: (category: string) => {
        return get().templates.filter(t => t.category === category);
      },

      getTemplatesByType: (type: MessageTemplateType) => {
        return get().templates.filter(t => t.templateType === type);
      }
    }))
  )
);