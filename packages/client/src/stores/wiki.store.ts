import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { wikiRepository } from '../repositories';
import type {
  WikiSpace,
  WikiPage,
  WikiPageWithRelations,
  WikiSpaceWithPages,
  WikiRevision,
  CreateWikiSpaceData,
  UpdateWikiSpaceData,
  CreateWikiPageData,
  UpdateWikiPageData,
  WikiPageFilters,
  WikiSpaceFilters,
  WikiSearchResult,
  WikiSearchOptions,
  WikiStats,
  WikiBookmark,
} from '@ria/wiki-server';

interface WikiState {
  // Spaces
  spaces: WikiSpace[];
  currentSpace: WikiSpaceWithPages | null;
  
  // Pages
  pages: WikiPage[];
  currentPage: WikiPageWithRelations | null;
  pageTree: WikiPage[];
  
  // Revisions
  revisions: WikiRevision[];
  
  // Search
  searchResults: WikiSearchResult[];
  
  // Bookmarks
  bookmarks: WikiBookmark[];
  
  // UI State
  loading: {
    spaces: boolean;
    pages: boolean;
    currentSpace: boolean;
    currentPage: boolean;
    revisions: boolean;
    search: boolean;
    bookmarks: boolean;
  };
  
  error: string | null;
  
  // Stats
  stats: WikiStats | null;
}

interface WikiActions {
  // Space actions
  fetchSpaces: (filters?: WikiSpaceFilters) => Promise<void>;
  fetchSpace: (id: string) => Promise<void>;
  createSpace: (data: CreateWikiSpaceData) => Promise<string>;
  updateSpace: (id: string, data: UpdateWikiSpaceData) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  
  // Page actions
  fetchPages: (spaceId?: string, filters?: WikiPageFilters) => Promise<void>;
  fetchPage: (id: string) => Promise<void>;
  fetchPageTree: (spaceId: string, parentId?: string) => Promise<void>;
  createPage: (data: CreateWikiPageData) => Promise<string>;
  updatePage: (id: string, data: UpdateWikiPageData) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  publishPage: (id: string) => Promise<void>;
  archivePage: (id: string) => Promise<void>;
  
  // Revision actions
  fetchRevisions: (pageId: string) => Promise<void>;
  restoreRevision: (pageId: string, revisionId: string) => Promise<void>;
  
  // Search actions
  search: (options: WikiSearchOptions) => Promise<void>;
  clearSearch: () => void;
  
  // Bookmark actions
  fetchBookmarks: () => Promise<void>;
  addBookmark: (pageId: string) => Promise<void>;
  removeBookmark: (pageId: string) => Promise<void>;
  
  // Stats actions
  fetchStats: () => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setCurrentSpace: (space: WikiSpaceWithPages | null) => void;
  setCurrentPage: (page: WikiPageWithRelations | null) => void;
}

type WikiStore = WikiState & WikiActions;

export const useWikiStore = create<WikiStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      spaces: [],
      currentSpace: null,
      pages: [],
      currentPage: null,
      pageTree: [],
      revisions: [],
      searchResults: [],
      bookmarks: [],
      loading: {
        spaces: false,
        pages: false,
        currentSpace: false,
        currentPage: false,
        revisions: false,
        search: false,
        bookmarks: false,
      },
      error: null,
      stats: null,
      
      // Space Actions
      fetchSpaces: async (filters) => {
        set(state => { 
          state.loading.spaces = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getSpaces(filters);
          set(state => { 
            state.spaces = response.data;
            state.loading.spaces = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch spaces';
            state.loading.spaces = false;
          });
        }
      },
      
      fetchSpace: async (id: string) => {
        set(state => { 
          state.loading.currentSpace = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getSpaceWithPages(id);
          set(state => { 
            state.currentSpace = response.data;
            state.loading.currentSpace = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch space';
            state.loading.currentSpace = false;
          });
        }
      },
      
      createSpace: async (data: CreateWikiSpaceData) => {
        try {
          const response = await wikiRepository.instance.createSpace(data);
          set(state => { 
            state.spaces.push(response.data);
          });
          return response.data.id;
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create space';
          });
          throw error;
        }
      },
      
      updateSpace: async (id: string, data: UpdateWikiSpaceData) => {
        try {
          const response = await wikiRepository.instance.updateSpace(id, data);
          set(state => { 
            const index = state.spaces.findIndex(s => s.id === id);
            if (index !== -1) {
              state.spaces[index] = response.data;
            }
            if (state.currentSpace?.id === id) {
              state.currentSpace = { ...state.currentSpace, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update space';
          });
          throw error;
        }
      },
      
      deleteSpace: async (id: string) => {
        try {
          await wikiRepository.instance.deleteSpace(id);
          set(state => { 
            state.spaces = state.spaces.filter(s => s.id !== id);
            if (state.currentSpace?.id === id) {
              state.currentSpace = null;
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete space';
          });
          throw error;
        }
      },
      
      // Page Actions
      fetchPages: async (spaceId?: string, filters?: WikiPageFilters) => {
        set(state => { 
          state.loading.pages = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getPages({ ...filters, spaceId });
          set(state => { 
            state.pages = response.data;
            state.loading.pages = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch pages';
            state.loading.pages = false;
          });
        }
      },
      
      fetchPage: async (id: string) => {
        set(state => { 
          state.loading.currentPage = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getPageWithRelations(id);
          set(state => { 
            state.currentPage = response.data;
            state.loading.currentPage = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch page';
            state.loading.currentPage = false;
          });
        }
      },
      
      fetchPageTree: async (spaceId: string, parentId?: string) => {
        try {
          const response = await wikiRepository.instance.getPageTree(spaceId, parentId);
          set(state => { 
            state.pageTree = response.data;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch page tree';
          });
        }
      },
      
      createPage: async (data: CreateWikiPageData) => {
        try {
          const response = await wikiRepository.instance.createPage(data);
          set(state => { 
            state.pages.push(response.data);
            // Update current space pages if relevant
            if (state.currentSpace?.id === data.spaceId) {
              state.currentSpace.pages.push(response.data);
              state.currentSpace.pageCount += 1;
            }
          });
          return response.data.id;
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to create page';
          });
          throw error;
        }
      },
      
      updatePage: async (id: string, data: UpdateWikiPageData) => {
        try {
          const response = await wikiRepository.instance.updatePage(id, data);
          set(state => { 
            const index = state.pages.findIndex(p => p.id === id);
            if (index !== -1) {
              state.pages[index] = response.data;
            }
            if (state.currentPage?.id === id) {
              state.currentPage = { ...state.currentPage, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to update page';
          });
          throw error;
        }
      },
      
      deletePage: async (id: string) => {
        try {
          await wikiRepository.instance.deletePage(id);
          set(state => { 
            state.pages = state.pages.filter(p => p.id !== id);
            if (state.currentPage?.id === id) {
              state.currentPage = null;
            }
            // Update current space if relevant
            if (state.currentSpace) {
              state.currentSpace.pages = state.currentSpace.pages.filter(p => p.id !== id);
              state.currentSpace.pageCount = Math.max(0, state.currentSpace.pageCount - 1);
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to delete page';
          });
          throw error;
        }
      },
      
      publishPage: async (id: string) => {
        try {
          const response = await wikiRepository.instance.publishPage(id);
          set(state => { 
            const index = state.pages.findIndex(p => p.id === id);
            if (index !== -1) {
              state.pages[index] = response.data;
            }
            if (state.currentPage?.id === id) {
              state.currentPage = { ...state.currentPage, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to publish page';
          });
          throw error;
        }
      },
      
      archivePage: async (id: string) => {
        try {
          const response = await wikiRepository.instance.archivePage(id);
          set(state => { 
            const index = state.pages.findIndex(p => p.id === id);
            if (index !== -1) {
              state.pages[index] = response.data;
            }
            if (state.currentPage?.id === id) {
              state.currentPage = { ...state.currentPage, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to archive page';
          });
          throw error;
        }
      },
      
      // Revision Actions
      fetchRevisions: async (pageId: string) => {
        set(state => { 
          state.loading.revisions = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getRevisions(pageId);
          set(state => { 
            state.revisions = response.data;
            state.loading.revisions = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch revisions';
            state.loading.revisions = false;
          });
        }
      },
      
      restoreRevision: async (pageId: string, revisionId: string) => {
        try {
          const response = await wikiRepository.instance.restoreRevision(pageId, revisionId);
          set(state => { 
            const index = state.pages.findIndex(p => p.id === pageId);
            if (index !== -1) {
              state.pages[index] = response.data;
            }
            if (state.currentPage?.id === pageId) {
              state.currentPage = { ...state.currentPage, ...response.data };
            }
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to restore revision';
          });
          throw error;
        }
      },
      
      // Search Actions
      search: async (options: WikiSearchOptions) => {
        set(state => { 
          state.loading.search = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.search(options);
          set(state => { 
            state.searchResults = response.data;
            state.loading.search = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Search failed';
            state.loading.search = false;
          });
        }
      },
      
      clearSearch: () => {
        set(state => {
          state.searchResults = [];
        });
      },
      
      // Bookmark Actions
      fetchBookmarks: async () => {
        set(state => { 
          state.loading.bookmarks = true;
          state.error = null;
        });
        try {
          const response = await wikiRepository.instance.getBookmarks();
          set(state => { 
            state.bookmarks = response.data;
            state.loading.bookmarks = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch bookmarks';
            state.loading.bookmarks = false;
          });
        }
      },
      
      addBookmark: async (pageId: string) => {
        try {
          const response = await wikiRepository.instance.addBookmark(pageId);
          set(state => { 
            state.bookmarks.push(response.data);
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to add bookmark';
          });
          throw error;
        }
      },
      
      removeBookmark: async (pageId: string) => {
        try {
          await wikiRepository.instance.removeBookmark(pageId);
          set(state => { 
            state.bookmarks = state.bookmarks.filter(b => b.pageId !== pageId);
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to remove bookmark';
          });
          throw error;
        }
      },
      
      // Stats Actions
      fetchStats: async () => {
        try {
          const response = await wikiRepository.instance.getStats();
          set(state => { 
            state.stats = response.data;
          });
        } catch (error) {
          set(state => { 
            state.error = error instanceof Error ? error.message : 'Failed to fetch stats';
          });
        }
      },
      
      // Utility Actions
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      setCurrentSpace: (space: WikiSpaceWithPages | null) => {
        set(state => {
          state.currentSpace = space;
        });
      },
      
      setCurrentPage: (page: WikiPageWithRelations | null) => {
        set(state => {
          state.currentPage = page;
        });
      },
    })),
    { name: 'wiki-store' }
  )
);