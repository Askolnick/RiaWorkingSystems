/**
 * Templates Store
 * 
 * State management for business templates
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { templatesRepository } from '../repositories';

// Define types locally until templates package is available
interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  featured?: boolean;
  tags?: string[];
  phases?: any[];
  estimatedDuration?: number;
  type?: string;
}

interface TemplateInstance {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  progress: {
    currentPhase: string;
    completedPhases: string[];
    tasksCompleted: number;
    totalTasks: number;
    percentComplete: number;
  };
  customizations?: any;
  projectId?: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplatesState {
  // Templates
  templates: BusinessTemplate[];
  currentTemplate: BusinessTemplate | null;
  
  // Instances
  instances: TemplateInstance[];
  currentInstance: TemplateInstance | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  
  // Metrics
  metrics: Map<string, any>;
}

interface TemplatesActions {
  // Template Actions
  fetchTemplates: (filter?: any) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  importTemplate: (templateJson: string) => Promise<void>;
  exportTemplate: (id: string) => Promise<string>;
  cloneTemplate: (id: string, name: string) => Promise<void>;
  
  // Instance Actions
  createInstance: (templateId: string, data: any) => Promise<void>;
  fetchInstance: (id: string) => Promise<void>;
  updateInstance: (id: string, updates: any) => Promise<void>;
  generateTasks: (instanceId: string) => Promise<any[]>;
  
  // UI Actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // Recommendations
  fetchRecommendations: (context: any) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState & TemplatesActions>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      templates: [],
      currentTemplate: null,
      instances: [],
      currentInstance: null,
      loading: false,
      error: null,
      selectedCategory: 'all',
      searchQuery: '',
      metrics: new Map(),

      // Template Actions
      fetchTemplates: async (filter) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.getTemplates(filter);
          set(state => {
            state.templates = response.data;
            if (response.metrics) {
              state.metrics = new Map(Object.entries(response.metrics));
            }
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch templates';
            state.loading = false;
          });
        }
      },

      fetchTemplate: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.getTemplate(id);
          set(state => {
            state.currentTemplate = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch template';
            state.loading = false;
          });
        }
      },

      importTemplate: async (templateJson) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.importTemplate(templateJson);
          set(state => {
            state.templates.push(response.data);
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to import template';
            state.loading = false;
          });
        }
      },

      exportTemplate: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.exportTemplate(id);
          set(state => {
            state.loading = false;
          });
          return response.data;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to export template';
            state.loading = false;
          });
          throw error;
        }
      },

      cloneTemplate: async (id, name) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.cloneTemplate(id, name);
          set(state => {
            state.templates.push(response.data);
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to clone template';
            state.loading = false;
          });
        }
      },

      // Instance Actions
      createInstance: async (templateId, data) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.createInstance({
            templateId,
            ...data
          });
          set(state => {
            state.instances.push(response.data);
            state.currentInstance = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create instance';
            state.loading = false;
          });
        }
      },

      fetchInstance: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.getInstance(id);
          set(state => {
            state.currentInstance = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch instance';
            state.loading = false;
          });
        }
      },

      updateInstance: async (id, updates) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.updateInstance(id, updates);
          set(state => {
            state.currentInstance = response.data;
            const index = state.instances.findIndex(i => i.id === id);
            if (index !== -1) {
              state.instances[index] = response.data;
            }
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update instance';
            state.loading = false;
          });
        }
      },

      generateTasks: async (instanceId) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.generateTasks(instanceId);
          set(state => {
            state.loading = false;
          });
          return response.data;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to generate tasks';
            state.loading = false;
          });
          throw error;
        }
      },

      // UI Actions
      setSelectedCategory: (category) => {
        set(state => {
          state.selectedCategory = category;
        });
      },

      setSearchQuery: (query) => {
        set(state => {
          state.searchQuery = query;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      // Recommendations
      fetchRecommendations: async (context) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await templatesRepository.getRecommendations(context);
          set(state => {
            state.templates = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch recommendations';
            state.loading = false;
          });
        }
      },
    })),
    {
      name: 'templates-store',
    }
  )
);