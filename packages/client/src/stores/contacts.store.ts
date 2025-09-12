import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  contactsRepository,
  type Contact,
  type ContactType,
  type ContactStatus,
  type CreateContactData,
  type UpdateContactData,
  type ContactFilters,
  type ContactSort,
  type ContactInteraction
} from '../repositories/contacts.repository';

interface ContactsState {
  // Data
  contacts: Contact[];
  currentContact: Contact | null;
  interactions: ContactInteraction[];
  stats: any;
  
  // UI State
  loading: boolean;
  error: string | null;
  interactionsLoading: boolean;
  statsLoading: boolean;
  
  // Filters and Sorting
  filters: ContactFilters;
  sort: ContactSort[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalContacts: number;
  pageSize: number;
  
  // View State
  selectedContacts: Set<string>;
  viewMode: 'table' | 'cards' | 'list';
}

interface ContactsActions {
  // CRUD Operations
  fetchContacts: () => Promise<void>;
  createContact: (data: CreateContactData) => Promise<Contact>;
  updateContact: (id: string, data: UpdateContactData) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  deleteContacts: (ids: string[]) => Promise<void>;
  
  // Contact Operations
  setCurrentContact: (contact: Contact | null) => void;
  assignContact: (id: string, userId: string) => Promise<void>;
  updateContactScore: (id: string, score: number) => Promise<void>;
  updateContactStatus: (id: string, status: ContactStatus) => Promise<void>;
  addContactTag: (id: string, tag: string) => Promise<void>;
  removeContactTag: (id: string, tag: string) => Promise<void>;
  
  // Interactions
  fetchInteractions: (contactId: string) => Promise<void>;
  createInteraction: (contactId: string, data: Partial<ContactInteraction>) => Promise<ContactInteraction>;
  updateInteraction: (contactId: string, interactionId: string, data: Partial<ContactInteraction>) => Promise<ContactInteraction>;
  deleteInteraction: (contactId: string, interactionId: string) => Promise<void>;
  
  // Filtering and Sorting
  setFilters: (filters: Partial<ContactFilters>) => void;
  setSort: (sort: ContactSort[]) => void;
  clearFilters: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Selection
  selectContact: (id: string) => void;
  deselectContact: (id: string) => void;
  selectAllContacts: () => void;
  clearSelection: () => void;
  
  // View
  setViewMode: (mode: 'table' | 'cards' | 'list') => void;
  
  // Stats
  fetchStats: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  getContactsByType: (type: ContactType) => Contact[];
  getContactsByStatus: (status: ContactStatus) => Contact[];
  getUpcomingFollowUps: () => Contact[];
}

type ContactsStore = ContactsState & ContactsActions;

const initialFilters: ContactFilters = {};

const initialSort: ContactSort[] = [
  { field: 'updatedAt', direction: 'desc' }
];

export const useContactsStore = create<ContactsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      contacts: [],
      currentContact: null,
      interactions: [],
      stats: null,
      loading: false,
      error: null,
      interactionsLoading: false,
      statsLoading: false,
      filters: initialFilters,
      sort: initialSort,
      currentPage: 1,
      totalPages: 0,
      totalContacts: 0,
      pageSize: 20,
      selectedContacts: new Set(),
      viewMode: 'table',

      // CRUD Operations
      fetchContacts: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await contactsRepository.instance.findFiltered(
            get().filters,
            get().sort,
            get().currentPage,
            get().pageSize
          );

          set(state => {
            state.contacts = response.data;
            state.totalPages = response.totalPages;
            state.totalContacts = response.total;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch contacts';
            state.loading = false;
          });
        }
      },

      createContact: async (data: CreateContactData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const contact = await contactsRepository.instance.create(data);
          
          set(state => {
            state.contacts.unshift(contact);
            state.totalContacts += 1;
            state.loading = false;
          });

          return contact;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create contact';
            state.loading = false;
          });
          throw error;
        }
      },

      updateContact: async (id: string, data: UpdateContactData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const contact = await contactsRepository.instance.update(id, data);
          
          set(state => {
            const index = state.contacts.findIndex(c => c.id === id);
            if (index >= 0) {
              state.contacts[index] = contact;
            }
            if (state.currentContact?.id === id) {
              state.currentContact = contact;
            }
            state.loading = false;
          });

          return contact;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update contact';
            state.loading = false;
          });
          throw error;
        }
      },

      deleteContact: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await contactsRepository.instance.delete(id);
          
          set(state => {
            state.contacts = state.contacts.filter(c => c.id !== id);
            state.totalContacts -= 1;
            state.selectedContacts.delete(id);
            if (state.currentContact?.id === id) {
              state.currentContact = null;
            }
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete contact';
            state.loading = false;
          });
          throw error;
        }
      },

      deleteContacts: async (ids: string[]) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Delete contacts one by one (in real implementation, this would be a batch operation)
          for (const id of ids) {
            await contactsRepository.instance.delete(id);
          }
          
          set(state => {
            state.contacts = state.contacts.filter(c => !ids.includes(c.id));
            state.totalContacts -= ids.length;
            ids.forEach(id => state.selectedContacts.delete(id));
            if (state.currentContact && ids.includes(state.currentContact.id)) {
              state.currentContact = null;
            }
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete contacts';
            state.loading = false;
          });
          throw error;
        }
      },

      // Contact Operations
      setCurrentContact: (contact: Contact | null) => {
        set(state => {
          state.currentContact = contact;
        });
      },

      assignContact: async (id: string, userId: string) => {
        try {
          await get().updateContact(id, { assignedTo: userId });
        } catch (error) {
          // Error handling is done in updateContact
        }
      },

      updateContactScore: async (id: string, score: number) => {
        try {
          await get().updateContact(id, { leadScore: score });
        } catch (error) {
          // Error handling is done in updateContact
        }
      },

      updateContactStatus: async (id: string, status: ContactStatus) => {
        try {
          await get().updateContact(id, { status });
        } catch (error) {
          // Error handling is done in updateContact
        }
      },

      addContactTag: async (id: string, tag: string) => {
        const contact = get().contacts.find(c => c.id === id);
        if (!contact) return;

        const updatedTags = [...contact.tags];
        if (!updatedTags.includes(tag)) {
          updatedTags.push(tag);
          try {
            await get().updateContact(id, { tags: updatedTags });
          } catch (error) {
            // Error handling is done in updateContact
          }
        }
      },

      removeContactTag: async (id: string, tag: string) => {
        const contact = get().contacts.find(c => c.id === id);
        if (!contact) return;

        const updatedTags = contact.tags.filter(t => t !== tag);
        try {
          await get().updateContact(id, { tags: updatedTags });
        } catch (error) {
          // Error handling is done in updateContact
        }
      },

      // Interactions
      fetchInteractions: async (contactId: string) => {
        set(state => {
          state.interactionsLoading = true;
          state.error = null;
        });

        try {
          const interactions = await contactsRepository.instance.getInteractions(contactId);
          
          set(state => {
            state.interactions = interactions;
            state.interactionsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch interactions';
            state.interactionsLoading = false;
          });
        }
      },

      createInteraction: async (contactId: string, data: Partial<ContactInteraction>) => {
        set(state => {
          state.interactionsLoading = true;
          state.error = null;
        });

        try {
          const interaction = await contactsRepository.instance.createInteraction(contactId, data as any);
          
          set(state => {
            state.interactions.unshift(interaction);
            state.interactionsLoading = false;
          });

          // Update lastContactDate if this is a completed interaction
          if (data.completedDate) {
            await get().updateContact(contactId, { lastContactDate: data.completedDate });
          }

          return interaction;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to create interaction';
            state.interactionsLoading = false;
          });
          throw error;
        }
      },

      updateInteraction: async (contactId: string, interactionId: string, data: Partial<ContactInteraction>) => {
        try {
          const interaction = await contactsRepository.instance.updateInteraction(contactId, interactionId, data);
          
          set(state => {
            const index = state.interactions.findIndex(i => i.id === interactionId);
            if (index >= 0) {
              state.interactions[index] = interaction;
            }
          });

          return interaction;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to update interaction';
          });
          throw error;
        }
      },

      deleteInteraction: async (contactId: string, interactionId: string) => {
        try {
          await contactsRepository.instance.deleteInteraction(contactId, interactionId);
          
          set(state => {
            state.interactions = state.interactions.filter(i => i.id !== interactionId);
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete interaction';
          });
          throw error;
        }
      },

      // Filtering and Sorting
      setFilters: (newFilters: Partial<ContactFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...newFilters };
          state.currentPage = 1; // Reset to first page when filters change
        });
        get().fetchContacts();
      },

      setSort: (sort: ContactSort[]) => {
        set(state => {
          state.sort = sort;
          state.currentPage = 1; // Reset to first page when sorting changes
        });
        get().fetchContacts();
      },

      clearFilters: () => {
        set(state => {
          state.filters = initialFilters;
          state.currentPage = 1;
        });
        get().fetchContacts();
      },

      // Pagination
      setPage: (page: number) => {
        set(state => {
          state.currentPage = page;
        });
        get().fetchContacts();
      },

      setPageSize: (size: number) => {
        set(state => {
          state.pageSize = size;
          state.currentPage = 1; // Reset to first page when page size changes
        });
        get().fetchContacts();
      },

      // Selection
      selectContact: (id: string) => {
        set(state => {
          state.selectedContacts.add(id);
        });
      },

      deselectContact: (id: string) => {
        set(state => {
          state.selectedContacts.delete(id);
        });
      },

      selectAllContacts: () => {
        set(state => {
          state.selectedContacts = new Set(state.contacts.map(c => c.id));
        });
      },

      clearSelection: () => {
        set(state => {
          state.selectedContacts.clear();
        });
      },

      // View
      setViewMode: (mode: 'table' | 'cards' | 'list') => {
        set(state => {
          state.viewMode = mode;
        });
      },

      // Stats
      fetchStats: async () => {
        set(state => {
          state.statsLoading = true;
          state.error = null;
        });

        try {
          const stats = await contactsRepository.instance.getStats();
          
          set(state => {
            state.stats = stats;
            state.statsLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch stats';
            state.statsLoading = false;
          });
        }
      },

      // Utility
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      getContactsByType: (type: ContactType) => {
        return get().contacts.filter(c => c.contactType === type);
      },

      getContactsByStatus: (status: ContactStatus) => {
        return get().contacts.filter(c => c.status === status);
      },

      getUpcomingFollowUps: () => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return get().contacts.filter(c => {
          if (!c.nextFollowUpDate) return false;
          const followUpDate = new Date(c.nextFollowUpDate);
          return followUpDate >= today && followUpDate <= nextWeek;
        }).sort((a, b) => new Date(a.nextFollowUpDate!).getTime() - new Date(b.nextFollowUpDate!).getTime());
      }
    }))
  )
);