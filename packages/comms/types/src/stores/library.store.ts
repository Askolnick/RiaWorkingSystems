import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { LibraryDoc, LibrarySection, DocKind, DocStatus } from '../library';
import { libraryRepository } from '../repositories';
import type { LibraryQueryParams } from '../repositories/library.repository';

export interface LibraryState {
  // Documents
  documents: LibraryDoc[];
  currentDocument: LibraryDoc | null;
  documentsLoading: boolean;
  documentsError: string | null;
  
  // Sections
  sections: LibrarySection[];
  currentSection: LibrarySection | null;
  sectionsLoading: boolean;
  sectionsError: string | null;
  
  // Filters
  filters: {
    kind: DocKind | 'all';
    status: DocStatus | 'all';
    tag: string | null;
    search: string;
  };
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface LibraryActions {
  // Document actions
  fetchDocuments: (params?: LibraryQueryParams) => Promise<void>;
  fetchDocument: (id: string) => Promise<void>;
  createDocument: (doc: Partial<LibraryDoc>) => Promise<LibraryDoc>;
  updateDocument: (id: string, updates: Partial<LibraryDoc>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  cloneDocument: (id: string, title?: string) => Promise<void>;
  
  // Section actions
  fetchSections: () => Promise<void>;
  fetchSection: (id: string) => Promise<void>;
  createSection: (section: Partial<LibrarySection>) => Promise<LibrarySection>;
  updateSection: (id: string, updates: Partial<LibrarySection>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  attachSectionToDoc: (docId: string, sectionId: string, position?: number) => Promise<void>;
  detachSectionFromDoc: (docId: string, sectionId: string) => Promise<void>;
  
  // Filter actions
  setFilter: (key: keyof LibraryState['filters'], value: any) => void;
  clearFilters: () => void;
  search: (query: string) => Promise<void>;
  
  // Utility actions
  clearErrors: () => void;
  setCurrentDocument: (doc: LibraryDoc | null) => void;
  setCurrentSection: (section: LibrarySection | null) => void;
}

type LibraryStore = LibraryState & LibraryActions;

/**
 * Library Store
 * Manages wiki documents, sections, and related state
 */
export const useLibraryStore = create<LibraryStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      documents: [],
      currentDocument: null,
      documentsLoading: false,
      documentsError: null,
      
      sections: [],
      currentSection: null,
      sectionsLoading: false,
      sectionsError: null,
      
      filters: {
        kind: 'all',
        status: 'all',
        tag: null,
        search: '',
      },
      
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false,
      },

      // Document actions
      fetchDocuments: async (params?: LibraryQueryParams) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          const { filters, pagination } = get();
          const queryParams = {
            ...params,
            page: pagination.page,
            limit: pagination.limit,
            kind: filters.kind !== 'all' ? filters.kind : undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
            tag: filters.tag || undefined,
            search: filters.search || undefined,
          };
          
          const response = await libraryRepository.instance.findAll(queryParams);
          
          set((state) => {
            state.documents = response.data;
            state.pagination.total = response.total;
            state.pagination.hasMore = response.hasMore;
            state.documentsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
        }
      },

      fetchDocument: async (id: string) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          const doc = await libraryRepository.instance.findById(id);
          
          set((state) => {
            state.currentDocument = doc;
            state.documentsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
        }
      },

      createDocument: async (doc: Partial<LibraryDoc>) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          const newDoc = await libraryRepository.instance.create(doc);
          
          set((state) => {
            state.documents.unshift(newDoc);
            state.currentDocument = newDoc;
            state.documentsLoading = false;
          });
          
          return newDoc;
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
          throw error;
        }
      },

      updateDocument: async (id: string, updates: Partial<LibraryDoc>) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          const updatedDoc = await libraryRepository.instance.update(id, updates);
          
          set((state) => {
            const index = state.documents.findIndex(d => d.id === id);
            if (index !== -1) {
              state.documents[index] = updatedDoc;
            }
            if (state.currentDocument?.id === id) {
              state.currentDocument = updatedDoc;
            }
            state.documentsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
          throw error;
        }
      },

      deleteDocument: async (id: string) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          await libraryRepository.instance.delete(id);
          
          set((state) => {
            state.documents = state.documents.filter(d => d.id !== id);
            if (state.currentDocument?.id === id) {
              state.currentDocument = null;
            }
            state.documentsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
          throw error;
        }
      },

      cloneDocument: async (id: string, title?: string) => {
        set((state) => {
          state.documentsLoading = true;
          state.documentsError = null;
        });

        try {
          const clonedDoc = await libraryRepository.instance.clone(id, title);
          
          set((state) => {
            state.documents.unshift(clonedDoc);
            state.currentDocument = clonedDoc;
            state.documentsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
            state.documentsLoading = false;
          });
          throw error;
        }
      },

      // Section actions
      fetchSections: async () => {
        set((state) => {
          state.sectionsLoading = true;
          state.sectionsError = null;
        });

        try {
          const response = await sectionRepository.findAll();
          
          set((state) => {
            state.sections = response.data;
            state.sectionsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.sectionsError = error.message;
            state.sectionsLoading = false;
          });
        }
      },

      fetchSection: async (id: string) => {
        set((state) => {
          state.sectionsLoading = true;
          state.sectionsError = null;
        });

        try {
          const section = await sectionRepository.findById(id);
          
          set((state) => {
            state.currentSection = section;
            state.sectionsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.sectionsError = error.message;
            state.sectionsLoading = false;
          });
        }
      },

      createSection: async (section: Partial<LibrarySection>) => {
        set((state) => {
          state.sectionsLoading = true;
          state.sectionsError = null;
        });

        try {
          const newSection = await sectionRepository.create(section);
          
          set((state) => {
            state.sections.unshift(newSection);
            state.currentSection = newSection;
            state.sectionsLoading = false;
          });
          
          return newSection;
        } catch (error: any) {
          set((state) => {
            state.sectionsError = error.message;
            state.sectionsLoading = false;
          });
          throw error;
        }
      },

      updateSection: async (id: string, updates: Partial<LibrarySection>) => {
        set((state) => {
          state.sectionsLoading = true;
          state.sectionsError = null;
        });

        try {
          const updatedSection = await sectionRepository.update(id, updates);
          
          set((state) => {
            const index = state.sections.findIndex(s => s.id === id);
            if (index !== -1) {
              state.sections[index] = updatedSection;
            }
            if (state.currentSection?.id === id) {
              state.currentSection = updatedSection;
            }
            state.sectionsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.sectionsError = error.message;
            state.sectionsLoading = false;
          });
          throw error;
        }
      },

      deleteSection: async (id: string) => {
        set((state) => {
          state.sectionsLoading = true;
          state.sectionsError = null;
        });

        try {
          await sectionRepository.delete(id);
          
          set((state) => {
            state.sections = state.sections.filter(s => s.id !== id);
            if (state.currentSection?.id === id) {
              state.currentSection = null;
            }
            state.sectionsLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.sectionsError = error.message;
            state.sectionsLoading = false;
          });
          throw error;
        }
      },

      attachSectionToDoc: async (docId: string, sectionId: string, position?: number) => {
        try {
          await libraryRepository.instance.attachSection(docId, sectionId, position);
          // Refresh current document if it's the one being modified
          if (get().currentDocument?.id === docId) {
            await get().fetchDocument(docId);
          }
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
          });
          throw error;
        }
      },

      detachSectionFromDoc: async (docId: string, sectionId: string) => {
        try {
          await libraryRepository.instance.detachSection(docId, sectionId);
          // Refresh current document if it's the one being modified
          if (get().currentDocument?.id === docId) {
            await get().fetchDocument(docId);
          }
        } catch (error: any) {
          set((state) => {
            state.documentsError = error.message;
          });
          throw error;
        }
      },

      // Filter actions
      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
          state.pagination.page = 1; // Reset to first page when filters change
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {
            kind: 'all',
            status: 'all',
            tag: null,
            search: '',
          };
          state.pagination.page = 1;
        });
      },

      search: async (query: string) => {
        set((state) => {
          state.filters.search = query;
          state.pagination.page = 1;
        });
        await get().fetchDocuments();
      },

      // Utility actions
      clearErrors: () => {
        set((state) => {
          state.documentsError = null;
          state.sectionsError = null;
        });
      },

      setCurrentDocument: (doc) => {
        set((state) => {
          state.currentDocument = doc;
        });
      },

      setCurrentSection: (section) => {
        set((state) => {
          state.currentSection = section;
        });
      },
    })),
    {
      name: 'LibraryStore',
    }
  )
);

// Selectors
export const selectDocuments = (state: LibraryStore) => state.documents;
export const selectCurrentDocument = (state: LibraryStore) => state.currentDocument;
export const selectDocumentsLoading = (state: LibraryStore) => state.documentsLoading;
export const selectDocumentsError = (state: LibraryStore) => state.documentsError;
export const selectFilters = (state: LibraryStore) => state.filters;
export const selectPagination = (state: LibraryStore) => state.pagination;