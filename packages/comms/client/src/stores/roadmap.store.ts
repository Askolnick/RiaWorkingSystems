import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { roadmapRepository } from '../repositories/roadmap.repository';
import type { 
  RoadmapItem, 
  RoadmapComment, 
  RoadmapItemWithComments,
  CreateRoadmapItemData,
  UpdateRoadmapItemData,
  CreateRoadmapCommentData,
  RoadmapStatus 
} from '@ria/roadmap-server';

interface RoadmapState {
  items: RoadmapItem[];
  currentItem: RoadmapItemWithComments | null;
  comments: Record<string, RoadmapComment[]>;
  loading: boolean;
  itemLoading: boolean;
  commentsLoading: Record<string, boolean>;
  error: string | null;
  itemError: string | null;
  commentsError: Record<string, string | null>;
}

interface RoadmapActions {
  // Items
  fetchItems: () => Promise<void>;
  fetchPublicItems: () => Promise<void>;
  fetchItemsByStatus: (status: RoadmapStatus) => Promise<void>;
  fetchItemBySlug: (slug: string) => Promise<void>;
  createItem: (data: CreateRoadmapItemData) => Promise<void>;
  updateItem: (id: string, data: UpdateRoadmapItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Comments
  fetchComments: (roadmapItemId: string) => Promise<void>;
  createComment: (data: CreateRoadmapCommentData) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Optimistic updates
  addCommentOptimistically: (comment: RoadmapComment) => void;
  removeCommentOptimistically: (commentId: string) => void;
  
  // State management
  clearError: () => void;
  clearCurrentItem: () => void;
}

type RoadmapStore = RoadmapState & RoadmapActions;

const initialState: RoadmapState = {
  items: [],
  currentItem: null,
  comments: {},
  loading: false,
  itemLoading: false,
  commentsLoading: {},
  error: null,
  itemError: null,
  commentsError: {},
};

export const useRoadmapStore = create<RoadmapStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Items
      fetchItems: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const response = await roadmapRepository.instance.findAll();
          set(state => {
            state.items = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch roadmap items';
            state.loading = false;
          });
        }
      },

      fetchPublicItems: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const items = await roadmapRepository.instance.getPublicItems();
          set(state => {
            state.items = items;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch public roadmap items';
            state.loading = false;
          });
        }
      },

      fetchItemsByStatus: async (status: RoadmapStatus) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const items = await roadmapRepository.instance.getItemsByStatus(status);
          set(state => {
            state.items = items;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch roadmap items';
            state.loading = false;
          });
        }
      },

      fetchItemBySlug: async (slug: string) => {
        set(state => {
          state.itemLoading = true;
          state.itemError = null;
        });
        
        try {
          const item = await roadmapRepository.instance.getBySlug(slug);
          set(state => {
            state.currentItem = item;
            state.comments[item.id] = item.comments;
            state.itemLoading = false;
          });
        } catch (error) {
          set(state => {
            state.itemError = error instanceof Error ? error.message : 'Failed to fetch roadmap item';
            state.itemLoading = false;
          });
        }
      },

      createItem: async (data: CreateRoadmapItemData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          const newItem = await roadmapRepository.instance.create(data);
          set(state => {
            state.items.unshift(newItem);
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create roadmap item';
            state.loading = false;
          });
        }
      },

      updateItem: async (id: string, data: UpdateRoadmapItemData) => {
        try {
          const updatedItem = await roadmapRepository.instance.update(id, data);
          set(state => {
            const index = state.items.findIndex(item => item.id === id);
            if (index !== -1) {
              state.items[index] = updatedItem;
            }
            if (state.currentItem?.id === id) {
              state.currentItem = { ...state.currentItem, ...updatedItem };
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update roadmap item';
          });
        }
      },

      deleteItem: async (id: string) => {
        try {
          await roadmapRepository.instance.delete(id);
          set(state => {
            state.items = state.items.filter(item => item.id !== id);
            if (state.currentItem?.id === id) {
              state.currentItem = null;
            }
            delete state.comments[id];
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete roadmap item';
          });
        }
      },

      // Comments
      fetchComments: async (roadmapItemId: string) => {
        set(state => {
          state.commentsLoading[roadmapItemId] = true;
          state.commentsError[roadmapItemId] = null;
        });
        
        try {
          const comments = await roadmapRepository.instance.getComments(roadmapItemId);
          set(state => {
            state.comments[roadmapItemId] = comments;
            state.commentsLoading[roadmapItemId] = false;
          });
        } catch (error) {
          set(state => {
            state.commentsError[roadmapItemId] = error instanceof Error ? error.message : 'Failed to fetch comments';
            state.commentsLoading[roadmapItemId] = false;
          });
        }
      },

      createComment: async (data: CreateRoadmapCommentData) => {
        try {
          const newComment = await roadmapRepository.instance.createComment(data);
          set(state => {
            if (!state.comments[data.roadmapItemId]) {
              state.comments[data.roadmapItemId] = [];
            }
            state.comments[data.roadmapItemId].push(newComment);
            
            // Update current item if it matches
            if (state.currentItem?.id === data.roadmapItemId) {
              state.currentItem.comments.push(newComment);
            }
          });
        } catch (error) {
          set(state => {
            state.commentsError[data.roadmapItemId] = error instanceof Error ? error.message : 'Failed to create comment';
          });
        }
      },

      deleteComment: async (commentId: string) => {
        try {
          await roadmapRepository.instance.deleteComment(commentId);
          set(state => {
            // Remove from all comments collections
            Object.keys(state.comments).forEach(roadmapItemId => {
              state.comments[roadmapItemId] = state.comments[roadmapItemId].filter(c => c.id !== commentId);
            });
            
            // Remove from current item
            if (state.currentItem?.comments) {
              state.currentItem.comments = state.currentItem.comments.filter(c => c.id !== commentId);
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete comment';
          });
        }
      },

      // Optimistic updates
      addCommentOptimistically: (comment: RoadmapComment) => {
        set(state => {
          if (!state.comments[comment.roadmapItemId]) {
            state.comments[comment.roadmapItemId] = [];
          }
          state.comments[comment.roadmapItemId].push(comment);
          
          if (state.currentItem?.id === comment.roadmapItemId) {
            state.currentItem.comments.push(comment);
          }
        });
      },

      removeCommentOptimistically: (commentId: string) => {
        set(state => {
          Object.keys(state.comments).forEach(roadmapItemId => {
            state.comments[roadmapItemId] = state.comments[roadmapItemId].filter(c => c.id !== commentId);
          });
          
          if (state.currentItem?.comments) {
            state.currentItem.comments = state.currentItem.comments.filter(c => c.id !== commentId);
          }
        });
      },

      // State management
      clearError: () => {
        set(state => {
          state.error = null;
          state.itemError = null;
          state.commentsError = {};
        });
      },

      clearCurrentItem: () => {
        set(state => {
          state.currentItem = null;
          state.itemError = null;
        });
      },
    })),
    { name: 'roadmap-store' }
  )
);