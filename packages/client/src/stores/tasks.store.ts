import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { tasksRepository, type Task } from '../repositories/tasks.repository';
import type { TaskStatus, TaskDependency } from '@ria/web-ui';
import type {
  TaskCustomField,
  TaskCustomFieldValue,
  CreateTaskCustomFieldData,
  UpdateTaskCustomFieldData,
  TaskSavedView,
  CreateTaskSavedViewData,
  UpdateTaskSavedViewData
} from '@ria/tasks-server';

interface TasksState {
  // Data
  tasks: Task[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  currentTask: Task | null;
  taskDependencies: Record<string, { predecessors: TaskDependency[]; successors: TaskDependency[] }>; // taskId -> dependencies
  
  // Custom Fields
  customFields: TaskCustomField[];
  taskCustomFieldValues: Record<string, TaskCustomFieldValue[]>; // taskId -> values
  
  // Saved Views
  savedViews: TaskSavedView[];
  currentView: TaskSavedView | null;
  defaultView: TaskSavedView | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  moveLoading: Record<string, boolean>; // taskId -> loading
  dependenciesLoading: Record<string, boolean>; // taskId -> loading
  customFieldsLoading: boolean;
  customFieldValuesLoading: Record<string, boolean>; // taskId -> loading
  savedViewsLoading: boolean;
  
  // Filters
  activeFilter: {
    status?: TaskStatus;
    assigneeId?: string;
    priority?: Task['priority'];
    search?: string;
  };
}

interface TasksActions {
  // Data Actions
  fetchTasks: (filter?: TasksState['activeFilter']) => Promise<void>;
  fetchTasksByStatus: (status: TaskStatus) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Task['priority'];
    assigneeId?: string;
    dueAt?: string;
  }) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus, newRank?: string) => Promise<void>;
  
  // Dependency Actions
  fetchTaskDependencies: (taskId: string) => Promise<void>;
  createDependency: (predecessorId: string, successorId: string, type?: string, lagMinutes?: number) => Promise<void>;
  removeDependency: (predecessorId: string, successorId: string) => Promise<void>;
  
  // Custom Fields Actions
  fetchCustomFields: () => Promise<void>;
  createCustomField: (data: CreateTaskCustomFieldData) => Promise<void>;
  updateCustomField: (id: string, data: UpdateTaskCustomFieldData) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;
  fetchTaskCustomFieldValues: (taskId: string) => Promise<void>;
  setTaskCustomFieldValue: (taskId: string, customFieldId: string, value: any) => Promise<void>;
  removeTaskCustomFieldValue: (taskId: string, customFieldId: string) => Promise<void>;
  
  // Saved Views Actions
  fetchSavedViews: () => Promise<void>;
  createSavedView: (data: CreateTaskSavedViewData) => Promise<void>;
  updateSavedView: (id: string, data: UpdateTaskSavedViewData) => Promise<void>;
  deleteSavedView: (id: string) => Promise<void>;
  setCurrentView: (view: TaskSavedView | null) => void;
  setDefaultView: (id: string) => Promise<void>;
  fetchDefaultView: () => Promise<void>;
  
  // UI Actions
  setActiveFilter: (filter: TasksState['activeFilter']) => void;
  setCurrentTask: (task: Task | null) => void;
  clearError: () => void;
  
  // Optimistic Updates
  optimisticMoveTask: (id: string, newStatus: TaskStatus, newRank?: string) => void;
  optimisticUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      tasks: [],
      tasksByStatus: {
        todo: [],
        doing: [],
        blocked: [],
        done: []
      },
      currentTask: null,
      taskDependencies: {},
      customFields: [],
      taskCustomFieldValues: {},
      savedViews: [],
      currentView: null,
      defaultView: null,
      loading: false,
      error: null,
      moveLoading: {},
      dependenciesLoading: {},
      customFieldsLoading: false,
      customFieldValuesLoading: {},
      savedViewsLoading: false,
      activeFilter: {},

      // Data Actions
      fetchTasks: async (filter) => {
        set(state => {
          state.loading = true;
          state.error = null;
          if (filter) state.activeFilter = filter;
        });

        try {
          const params = {
            filters: filter || get().activeFilter,
            sortBy: 'rank',
            sortOrder: 'asc' as const
          };
          
          const response = await tasksRepository.instance.findAll(params);
          const tasks = response.data;

          set(state => {
            state.tasks = tasks;
            
            // Group by status
            state.tasksByStatus = {
              todo: tasks.filter(t => t.status === 'todo'),
              doing: tasks.filter(t => t.status === 'doing'),
              blocked: tasks.filter(t => t.status === 'blocked'),
              done: tasks.filter(t => t.status === 'done')
            };
            
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch tasks';
            state.loading = false;
          });
        }
      },

      fetchTasksByStatus: async (status) => {
        try {
          const tasks = await tasksRepository.instance.getTasksByStatus(status);
          set(state => {
            state.tasksByStatus[status] = tasks;
            
            // Update main tasks array
            const otherTasks = state.tasks.filter(t => t.status !== status);
            state.tasks = [...otherTasks, ...tasks];
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : `Failed to fetch ${status} tasks`;
          });
        }
      },

      fetchTask: async (id) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const task = await tasksRepository.instance.findById(id);
          set(state => {
            state.currentTask = task;
            
            // Update in tasks array
            const taskIndex = state.tasks.findIndex(t => t.id === id);
            if (taskIndex >= 0) {
              state.tasks[taskIndex] = task;
            } else {
              state.tasks.push(task);
            }
            
            // Update in tasksByStatus
            state.tasksByStatus[task.status] = state.tasksByStatus[task.status].map(t =>
              t.id === id ? task : t
            );
            
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch task';
            state.loading = false;
          });
        }
      },

      createTask: async (data) => {
        try {
          const task = await tasksRepository.instance.create(data);
          set(state => {
            state.tasks.push(task);
            state.tasksByStatus[task.status].push(task);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create task';
          });
        }
      },

      updateTask: async (id, data) => {
        // Optimistic update
        get().optimisticUpdateTask(id, data);

        try {
          const updatedTask = await tasksRepository.instance.update(id, data);
          set(state => {
            const taskIndex = state.tasks.findIndex(t => t.id === id);
            if (taskIndex >= 0) {
              state.tasks[taskIndex] = updatedTask;
            }
            
            // Update in tasksByStatus
            Object.keys(state.tasksByStatus).forEach(status => {
              const statusTasks = state.tasksByStatus[status as TaskStatus];
              const statusTaskIndex = statusTasks.findIndex(t => t.id === id);
              if (statusTaskIndex >= 0) {
                if (updatedTask.status === status) {
                  statusTasks[statusTaskIndex] = updatedTask;
                } else {
                  // Task moved to different status
                  statusTasks.splice(statusTaskIndex, 1);
                  state.tasksByStatus[updatedTask.status].push(updatedTask);
                }
              }
            });

            if (state.currentTask?.id === id) {
              state.currentTask = updatedTask;
            }
          });
        } catch (error) {
          // Revert optimistic update
          await get().fetchTask(id);
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update task';
          });
        }
      },

      deleteTask: async (id) => {
        try {
          await tasksRepository.instance.delete(id);
          set(state => {
            state.tasks = state.tasks.filter(t => t.id !== id);
            
            // Remove from tasksByStatus
            Object.keys(state.tasksByStatus).forEach(status => {
              state.tasksByStatus[status as TaskStatus] = state.tasksByStatus[status as TaskStatus]
                .filter(t => t.id !== id);
            });

            if (state.currentTask?.id === id) {
              state.currentTask = null;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete task';
          });
        }
      },

      moveTask: async (id, newStatus, newRank) => {
        set(state => {
          state.moveLoading[id] = true;
        });

        // Optimistic update
        get().optimisticMoveTask(id, newStatus, newRank);

        try {
          const updatedTask = await tasksRepository.instance.moveTask(id, newStatus);
          
          set(state => {
            const taskIndex = state.tasks.findIndex(t => t.id === id);
            if (taskIndex >= 0) {
              state.tasks[taskIndex] = updatedTask;
            }
            state.moveLoading[id] = false;
          });

          // Refresh tasks to ensure correct ordering
          await get().fetchTasks();
        } catch (error) {
          // Revert optimistic update
          await get().fetchTasks();
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to move task';
            state.moveLoading[id] = false;
          });
        }
      },

      // UI Actions
      setActiveFilter: (filter) => {
        set(state => {
          state.activeFilter = filter;
        });
      },

      setCurrentTask: (task) => {
        set(state => {
          state.currentTask = task;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      // Optimistic Updates
      optimisticMoveTask: (id, newStatus, newRank) => {
        set(state => {
          const task = state.tasks.find(t => t.id === id);
          if (!task) return;

          const oldStatus = task.status;
          const updatedTask = { 
            ...task, 
            status: newStatus,
            ...(newRank && { rank: newRank }),
            updatedAt: new Date().toISOString()
          };

          // Update in main tasks array
          const taskIndex = state.tasks.findIndex(t => t.id === id);
          if (taskIndex >= 0) {
            state.tasks[taskIndex] = updatedTask;
          }

          // Move between status arrays
          if (oldStatus !== newStatus) {
            state.tasksByStatus[oldStatus] = state.tasksByStatus[oldStatus].filter(t => t.id !== id);
            state.tasksByStatus[newStatus].push(updatedTask);
            
            // Sort by rank
            state.tasksByStatus[newStatus].sort((a, b) => (a.rank || '').localeCompare(b.rank || ''));
          } else {
            // Update in same status array
            const statusTaskIndex = state.tasksByStatus[newStatus].findIndex(t => t.id === id);
            if (statusTaskIndex >= 0) {
              state.tasksByStatus[newStatus][statusTaskIndex] = updatedTask;
              state.tasksByStatus[newStatus].sort((a, b) => (a.rank || '').localeCompare(b.rank || ''));
            }
          }

          if (state.currentTask?.id === id) {
            state.currentTask = updatedTask;
          }
        });
      },

      optimisticUpdateTask: (id, updates) => {
        set(state => {
          const taskIndex = state.tasks.findIndex(t => t.id === id);
          if (taskIndex >= 0) {
            state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
          }

          // Update in tasksByStatus
          Object.keys(state.tasksByStatus).forEach(status => {
            const statusTaskIndex = state.tasksByStatus[status as TaskStatus].findIndex(t => t.id === id);
            if (statusTaskIndex >= 0) {
              state.tasksByStatus[status as TaskStatus][statusTaskIndex] = {
                ...state.tasksByStatus[status as TaskStatus][statusTaskIndex],
                ...updates
              };
            }
          });

          if (state.currentTask?.id === id) {
            state.currentTask = { ...state.currentTask, ...updates };
          }
        });
      },

      // Dependency Actions
      fetchTaskDependencies: async (taskId) => {
        set(state => {
          state.dependenciesLoading[taskId] = true;
          state.error = null;
        });

        try {
          const dependencies = await tasksRepository.instance.getTaskDependencies(taskId);
          set(state => {
            state.taskDependencies[taskId] = dependencies;
            state.dependenciesLoading[taskId] = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch task dependencies';
            state.dependenciesLoading[taskId] = false;
          });
        }
      },

      createDependency: async (predecessorId, successorId, type, lagMinutes) => {
        try {
          await tasksRepository.instance.createDependency(predecessorId, successorId, type, lagMinutes);
          
          // Refresh dependencies for both affected tasks
          await get().fetchTaskDependencies(predecessorId);
          await get().fetchTaskDependencies(successorId);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create task dependency';
          });
          throw error; // Re-throw for UI error handling
        }
      },

      removeDependency: async (predecessorId, successorId) => {
        try {
          await tasksRepository.instance.removeDependency(predecessorId, successorId);
          
          // Refresh dependencies for both affected tasks
          await get().fetchTaskDependencies(predecessorId);
          await get().fetchTaskDependencies(successorId);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to remove task dependency';
          });
          throw error; // Re-throw for UI error handling
        }
      },

      // Custom Fields Actions
      fetchCustomFields: async () => {
        set(state => {
          state.customFieldsLoading = true;
          state.error = null;
        });
        
        try {
          const customFields = await tasksRepository.instance.getCustomFields();
          set(state => {
            state.customFields = customFields;
            state.customFieldsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch custom fields';
            state.customFieldsLoading = false;
          });
        }
      },

      createCustomField: async (data) => {
        try {
          const newField = await tasksRepository.instance.createCustomField(data);
          set(state => {
            state.customFields.push(newField);
            state.customFields.sort((a, b) => a.sortOrder - b.sortOrder);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create custom field';
          });
          throw error;
        }
      },

      updateCustomField: async (id, data) => {
        try {
          const updatedField = await tasksRepository.instance.updateCustomField(id, data);
          set(state => {
            const index = state.customFields.findIndex(field => field.id === id);
            if (index !== -1) {
              state.customFields[index] = updatedField;
              state.customFields.sort((a, b) => a.sortOrder - b.sortOrder);
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update custom field';
          });
          throw error;
        }
      },

      deleteCustomField: async (id) => {
        try {
          await tasksRepository.instance.deleteCustomField(id);
          set(state => {
            state.customFields = state.customFields.filter(field => field.id !== id);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete custom field';
          });
          throw error;
        }
      },

      fetchTaskCustomFieldValues: async (taskId) => {
        set(state => {
          state.customFieldValuesLoading[taskId] = true;
        });
        
        try {
          const values = await tasksRepository.instance.getTaskCustomFieldValues(taskId);
          set(state => {
            state.taskCustomFieldValues[taskId] = values;
            state.customFieldValuesLoading[taskId] = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch custom field values';
            state.customFieldValuesLoading[taskId] = false;
          });
        }
      },

      setTaskCustomFieldValue: async (taskId, customFieldId, value) => {
        try {
          await tasksRepository.instance.setTaskCustomFieldValue(taskId, customFieldId, value);
          
          // Refresh task's custom field values
          await get().fetchTaskCustomFieldValues(taskId);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to set custom field value';
          });
          throw error;
        }
      },

      removeTaskCustomFieldValue: async (taskId, customFieldId) => {
        try {
          await tasksRepository.instance.removeTaskCustomFieldValue(taskId, customFieldId);
          
          // Refresh task's custom field values
          await get().fetchTaskCustomFieldValues(taskId);
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to remove custom field value';
          });
          throw error;
        }
      },

      // Saved Views Actions
      fetchSavedViews: async () => {
        set(state => {
          state.savedViewsLoading = true;
          state.error = null;
        });

        try {
          const views = await tasksRepository.instance.getSavedViews();
          set(state => {
            state.savedViews = views;
            state.savedViewsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch saved views';
            state.savedViewsLoading = false;
          });
        }
      },

      createSavedView: async (data) => {
        try {
          const view = await tasksRepository.instance.createSavedView(data);
          set(state => {
            state.savedViews.push(view);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create saved view';
          });
          throw error;
        }
      },

      updateSavedView: async (id, data) => {
        try {
          const updatedView = await tasksRepository.instance.updateSavedView(id, data);
          set(state => {
            const index = state.savedViews.findIndex(view => view.id === id);
            if (index !== -1) {
              state.savedViews[index] = updatedView;
            }
            if (state.currentView?.id === id) {
              state.currentView = updatedView;
            }
            if (state.defaultView?.id === id) {
              state.defaultView = updatedView;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update saved view';
          });
          throw error;
        }
      },

      deleteSavedView: async (id) => {
        try {
          await tasksRepository.instance.deleteSavedView(id);
          set(state => {
            state.savedViews = state.savedViews.filter(view => view.id !== id);
            if (state.currentView?.id === id) {
              state.currentView = null;
            }
            if (state.defaultView?.id === id) {
              state.defaultView = null;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete saved view';
          });
          throw error;
        }
      },

      setCurrentView: (view) => {
        set(state => {
          state.currentView = view;
        });
      },

      setDefaultView: async (id) => {
        try {
          await tasksRepository.instance.setDefaultView(id);
          set(state => {
            // Update all views to not be default
            state.savedViews.forEach(view => {
              view.isDefault = view.id === id;
            });
            // Set new default view
            const defaultView = state.savedViews.find(view => view.id === id);
            state.defaultView = defaultView || null;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to set default view';
          });
          throw error;
        }
      },

      fetchDefaultView: async () => {
        try {
          const defaultView = await tasksRepository.instance.getDefaultView();
          set(state => {
            state.defaultView = defaultView;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch default view';
          });
        }
      },

      // UI Actions
      setActiveFilter: (filter) => {
        set(state => {
          state.activeFilter = filter;
        });
      },

      setCurrentTask: (task) => {
        set(state => {
          state.currentTask = task;
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