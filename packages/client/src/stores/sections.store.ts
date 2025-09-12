import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { sectionsRepository } from '../repositories';
import type {
  WikiSection,
  WikiSectionUsage,
  WikiSectionVersion,
  WikiSectionLink,
  CreateSectionData,
  UpdateSectionData,
  CreateSectionUsageData,
  SectionWithRelations,
  SectionFilters,
  SectionSort,
  SectionSearchOptions,
  SectionSearchResult
} from '../repositories/sections.repository';

interface SectionsState {
  // Section data
  sections: WikiSection[];
  currentSection: SectionWithRelations | null;
  usages: WikiSectionUsage[];
  versions: WikiSectionVersion[];
  links: WikiSectionLink[];
  searchResults: SectionSearchResult[];
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedSectionIds: string[];
  filters: SectionFilters;
  sortBy: SectionSort[];
  
  // Section picker state
  isPickerOpen: boolean;
  pickerCallback: ((section: WikiSection) => void) | null;
  
  // Template state
  templates: WikiSection[];
  templatesLoading: boolean;
}

interface SectionsActions {
  // Section management
  fetchSections: (filters?: SectionFilters, sort?: SectionSort[]) => Promise<void>;
  createSection: (data: CreateSectionData) => Promise<WikiSection>;
  updateSection: (id: string, data: UpdateSectionData) => Promise<WikiSection>;
  deleteSection: (id: string) => Promise<void>;
  duplicateSection: (id: string, title: string) => Promise<WikiSection>;
  
  // Section details
  fetchSectionWithRelations: (id: string) => Promise<void>;
  clearCurrentSection: () => void;
  
  // Section usage management
  addSectionToPage: (data: CreateSectionUsageData) => Promise<WikiSectionUsage>;
  removeSectionFromPage: (usageId: string) => Promise<void>;
  fetchPageSections: (pageId: string) => Promise<WikiSectionUsage[]>;
  reorderPageSections: (pageId: string, usageIds: string[]) => Promise<void>;
  
  // Version management
  fetchSectionVersions: (sectionId: string) => Promise<void>;
  restoreVersion: (sectionId: string, versionId: string) => Promise<void>;
  
  // Cross-referencing
  createSectionLink: (fromSectionId: string, toSectionId: string, linkType: string, description?: string) => Promise<void>;
  deleteSectionLink: (linkId: string) => Promise<void>;
  
  // Search and filtering
  searchSections: (options: SectionSearchOptions) => Promise<void>;
  updateFilters: (filters: Partial<SectionFilters>) => void;
  updateSort: (sort: SectionSort[]) => void;
  clearSearch: () => void;
  
  // Selection
  selectSection: (id: string) => void;
  selectMultipleSections: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Section picker
  openSectionPicker: (callback: (section: WikiSection) => void) => void;
  closeSectionPicker: () => void;
  selectSectionFromPicker: (section: WikiSection) => void;
  
  // Templates
  fetchTemplates: (spaceId?: string) => Promise<void>;
  createFromTemplate: (templateId: string, data: Partial<CreateSectionData>) => Promise<WikiSection>;
  
  // Publishing
  publishSection: (id: string) => Promise<void>;
  archiveSection: (id: string) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  reset: () => void;
}

type SectionsStore = SectionsState & SectionsActions;

const initialState: SectionsState = {
  sections: [],
  currentSection: null,
  usages: [],
  versions: [],
  links: [],
  searchResults: [],
  loading: false,
  error: null,
  selectedSectionIds: [],
  filters: {},
  sortBy: [{ field: 'updatedAt', direction: 'desc' }],
  isPickerOpen: false,
  pickerCallback: null,
  templates: [],
  templatesLoading: false
};

export const useSectionsStore = create<SectionsStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Section management
      fetchSections: async (filters?, sort?) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });
        
        try {
          const currentFilters = filters || get().filters;
          const currentSort = sort || get().sortBy;
          
          const response = await sectionsRepository.getFilteredSections(currentFilters, currentSort);
          
          set(state => {
            state.sections = response.data;
            state.filters = currentFilters;
            state.sortBy = currentSort;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch sections';
            state.loading = false;
          });
        }
      },

      createSection: async (data) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });
        
        try {
          const section = await sectionsRepository.createSection(data);
          
          set(state => {
            state.sections.unshift(section);
            state.loading = false;
          });
          
          return section;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create section';
            state.loading = false;
          });
          throw error;
        }
      },

      updateSection: async (id, data) => {
        try {
          const section = await sectionsRepository.updateSection(id, data);
          
          set(state => {
            const index = state.sections.findIndex(s => s.id === id);
            if (index !== -1) {
              state.sections[index] = section;
            }
            
            if (state.currentSection && state.currentSection.id === id) {
              state.currentSection = { ...state.currentSection, ...section };
            }
          });
          
          return section;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update section';
          });
          throw error;
        }
      },

      deleteSection: async (id) => {
        try {
          await sectionsRepository.deleteSection(id);
          
          set(state => {
            state.sections = state.sections.filter(s => s.id !== id);
            state.selectedSectionIds = state.selectedSectionIds.filter(sid => sid !== id);
            
            if (state.currentSection && state.currentSection.id === id) {
              state.currentSection = null;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete section';
          });
          throw error;
        }
      },

      duplicateSection: async (id, title) => {
        try {
          const section = await sectionsRepository.duplicateSection(id, title);
          
          set(state => {
            state.sections.unshift(section);
          });
          
          return section;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to duplicate section';
          });
          throw error;
        }
      },

      // Section details
      fetchSectionWithRelations: async (id) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });
        
        try {
          const section = await sectionsRepository.getSectionWithRelations(id);
          
          set(state => {
            state.currentSection = section;
            state.usages = section.usages;
            state.versions = section.versions;
            state.links = [...section.links, ...section.backlinks];
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch section';
            state.loading = false;
          });
        }
      },

      clearCurrentSection: () => {
        set(state => {
          state.currentSection = null;
          state.usages = [];
          state.versions = [];
          state.links = [];
        });
      },

      // Section usage management
      addSectionToPage: async (data) => {
        try {
          const usage = await sectionsRepository.addSectionToPage(data);
          
          set(state => {
            state.usages.push(usage);
          });
          
          return usage;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to add section to page';
          });
          throw error;
        }
      },

      removeSectionFromPage: async (usageId) => {
        try {
          await sectionsRepository.removeSectionFromPage(usageId);
          
          set(state => {
            state.usages = state.usages.filter(u => u.id !== usageId);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to remove section from page';
          });
          throw error;
        }
      },

      fetchPageSections: async (pageId) => {
        try {
          const usages = await sectionsRepository.getPageSections(pageId);
          return usages;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch page sections';
          });
          throw error;
        }
      },

      reorderPageSections: async (pageId, usageIds) => {
        try {
          const usages = await sectionsRepository.reorderPageSections(pageId, usageIds);
          
          set(state => {
            // Update local usages if they're for this page
            if (state.usages.some(u => u.pageId === pageId)) {
              state.usages = usages;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to reorder sections';
          });
          throw error;
        }
      },

      // Search and filtering
      searchSections: async (options) => {
        set(state => { 
          state.loading = true; 
          state.error = null;
        });
        
        try {
          const results = await sectionsRepository.searchSections(options);
          
          set(state => {
            state.searchResults = results;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to search sections';
            state.loading = false;
          });
        }
      },

      updateFilters: (filters) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      updateSort: (sort) => {
        set(state => {
          state.sortBy = sort;
        });
      },

      clearSearch: () => {
        set(state => {
          state.searchResults = [];
        });
      },

      // Selection
      selectSection: (id) => {
        set(state => {
          state.selectedSectionIds = [id];
        });
      },

      selectMultipleSections: (ids) => {
        set(state => {
          state.selectedSectionIds = ids;
        });
      },

      clearSelection: () => {
        set(state => {
          state.selectedSectionIds = [];
        });
      },

      // Section picker
      openSectionPicker: (callback) => {
        set(state => {
          state.isPickerOpen = true;
          state.pickerCallback = callback;
        });
      },

      closeSectionPicker: () => {
        set(state => {
          state.isPickerOpen = false;
          state.pickerCallback = null;
        });
      },

      selectSectionFromPicker: (section) => {
        const { pickerCallback } = get();
        if (pickerCallback) {
          pickerCallback(section);
        }
        get().closeSectionPicker();
      },

      // Templates
      fetchTemplates: async (spaceId) => {
        set(state => { 
          state.templatesLoading = true; 
          state.error = null;
        });
        
        try {
          const templates = await sectionsRepository.getTemplates(spaceId);
          
          set(state => {
            state.templates = templates;
            state.templatesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch templates';
            state.templatesLoading = false;
          });
        }
      },

      createFromTemplate: async (templateId, data) => {
        try {
          const section = await sectionsRepository.createFromTemplate(templateId, data);
          
          set(state => {
            state.sections.unshift(section);
          });
          
          return section;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create from template';
          });
          throw error;
        }
      },

      // Publishing
      publishSection: async (id) => {
        try {
          const section = await sectionsRepository.publishSection(id);
          
          set(state => {
            const index = state.sections.findIndex(s => s.id === id);
            if (index !== -1) {
              state.sections[index] = section;
            }
            
            if (state.currentSection && state.currentSection.id === id) {
              state.currentSection = { ...state.currentSection, ...section };
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to publish section';
          });
          throw error;
        }
      },

      archiveSection: async (id) => {
        try {
          const section = await sectionsRepository.archiveSection(id);
          
          set(state => {
            const index = state.sections.findIndex(s => s.id === id);
            if (index !== -1) {
              state.sections[index] = section;
            }
            
            if (state.currentSection && state.currentSection.id === id) {
              state.currentSection = { ...state.currentSection, ...section };
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to archive section';
          });
          throw error;
        }
      },

      // Version management
      fetchSectionVersions: async (sectionId) => {
        try {
          const versions = await sectionsRepository.getSectionVersions(sectionId);
          
          set(state => {
            state.versions = versions;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch versions';
          });
        }
      },

      restoreVersion: async (sectionId, versionId) => {
        try {
          const section = await sectionsRepository.restoreVersion(sectionId, versionId);
          
          set(state => {
            const index = state.sections.findIndex(s => s.id === sectionId);
            if (index !== -1) {
              state.sections[index] = section;
            }
            
            if (state.currentSection && state.currentSection.id === sectionId) {
              state.currentSection = { ...state.currentSection, ...section };
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to restore version';
          });
          throw error;
        }
      },

      // Cross-referencing
      createSectionLink: async (fromSectionId, toSectionId, linkType, description) => {
        try {
          const link = await sectionsRepository.createSectionLink(fromSectionId, toSectionId, linkType, description);
          
          set(state => {
            state.links.push(link);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create section link';
          });
          throw error;
        }
      },

      deleteSectionLink: async (linkId) => {
        try {
          await sectionsRepository.deleteSectionLink(linkId);
          
          set(state => {
            state.links = state.links.filter(l => l.id !== linkId);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete section link';
          });
          throw error;
        }
      },

      // Utilities
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      reset: () => {
        set(state => {
          Object.assign(state, initialState);
        });
      }
    }))
  )
);