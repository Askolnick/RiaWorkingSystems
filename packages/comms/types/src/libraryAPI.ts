import { library } from './library';
import type { LibraryDoc, LibrarySection, ID } from './library';

// Simplified API wrapper for wiki pages
export const libraryAPI = {
  async list() {
    return library.listDocs();
  },

  async get(id: string): Promise<LibraryDoc | null> {
    try {
      const result = await library.getDoc(id);
      return result.doc;
    } catch {
      return null;
    }
  },

  async create(doc: Partial<LibraryDoc>): Promise<LibraryDoc> {
    return library.createDoc({
      title: doc.title || 'Untitled',
      kind: doc.kind || 'wiki',
      bodyMd: doc.bodyMd || '',
      tags: doc.tags || []
    });
  },

  async update(id: string, updates: Partial<LibraryDoc>): Promise<LibraryDoc> {
    return library.updateDoc(id, updates);
  },

  async delete(id: string): Promise<void> {
    // Mock deletion - in real implementation would call API
    console.log('Deleting document:', id);
  },

  async getSection(id: string): Promise<LibrarySection | null> {
    const sections = await library.listSections();
    return sections.find(s => s.id === id) || null;
  },

  async createSection(section: Partial<LibrarySection>): Promise<LibrarySection> {
    return library.createSection({
      name: section.name || 'Untitled Section',
      bodyMd: section.bodyMd || ''
    });
  },

  async updateSection(id: string, updates: Partial<LibrarySection>): Promise<LibrarySection> {
    return library.updateSection(id, updates);
  }
};

export type { LibraryDoc, LibrarySection } from './library';