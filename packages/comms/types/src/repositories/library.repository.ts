import { MockRepository, BaseRepository, QueryParams, PaginatedResponse, RepositoryError } from './base.repository';
import type { LibraryDoc, LibrarySection, DocPublish, DocKind, DocStatus } from '../library';

export interface LibraryQueryParams extends QueryParams {
  kind?: DocKind | 'all';
  status?: DocStatus | 'all';
  tag?: string;
  ownerId?: string;
}

export interface SectionQueryParams extends QueryParams {
  docId?: string;
}

/**
 * Mock Library Repository for development
 */
export class MockLibraryRepository extends MockRepository<LibraryDoc> {
  protected endpoint = '/library/docs';
  protected storageKey = 'library-docs';

  async findBySlug(slug: string): Promise<LibraryDoc> {
    await this.simulateDelay();
    const items = this.getStorage();
    const item = items.find(i => (i as any).slug === slug);
    
    if (!item) {
      throw new RepositoryError('Document not found', 'NOT_FOUND', 404);
    }
    
    return item;
  }

  async attachSection(docId: string, sectionId: string, position?: number): Promise<void> {
    await this.simulateDelay();
    // Mock implementation
    console.log(`Mock: Attaching section ${sectionId} to doc ${docId} at position ${position}`);
  }

  async detachSection(docId: string, sectionId: string): Promise<void> {
    await this.simulateDelay();
    // Mock implementation
    console.log(`Mock: Detaching section ${sectionId} from doc ${docId}`);
  }

  async getDocSections(docId: string): Promise<LibrarySection[]> {
    await this.simulateDelay();
    // Return mock sections
    return [
      {
        id: '1',
        title: 'Introduction',
        content: 'Welcome to this document...',
        docId,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ] as LibrarySection[];
  }

  async publish(docId: string, publish: Partial<DocPublish>): Promise<DocPublish> {
    await this.simulateDelay();
    return {
      id: Math.random().toString(36).substr(2, 9),
      docId,
      ...publish,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DocPublish;
  }

  async unpublish(docId: string, publishId: string): Promise<void> {
    await this.simulateDelay();
    console.log(`Mock: Unpublishing ${publishId} from doc ${docId}`);
  }

  async getPublications(docId: string): Promise<DocPublish[]> {
    await this.simulateDelay();
    return [];
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Real Library Repository for production API calls
 */
export class LibraryRepository extends BaseRepository<LibraryDoc> {
  protected endpoint = '/library/docs';

  async findAll(params?: LibraryQueryParams): Promise<PaginatedResponse<LibraryDoc>> {
    return super.findAll(params);
  }

  async findBySlug(slug: string): Promise<LibraryDoc> {
    return this.request<LibraryDoc>('GET', `/slug/${slug}`);
  }

  async attachSection(docId: string, sectionId: string, position?: number): Promise<void> {
    return this.request('POST', `/${docId}/sections`, { sectionId, position });
  }

  async detachSection(docId: string, sectionId: string): Promise<void> {
    return this.request('DELETE', `/${docId}/sections/${sectionId}`);
  }

  async getDocSections(docId: string): Promise<LibrarySection[]> {
    return this.request<LibrarySection[]>('GET', `/${docId}/sections`);
  }

  async publish(docId: string, publish: Partial<DocPublish>): Promise<DocPublish> {
    return this.request<DocPublish>('POST', `/${docId}/publish`, publish);
  }

  async unpublish(docId: string, publishId: string): Promise<void> {
    return this.request('DELETE', `/${docId}/publish/${publishId}`);
  }

  async getPublications(docId: string): Promise<DocPublish[]> {
    return this.request<DocPublish[]>('GET', `/${docId}/publications`);
  }

  async clone(docId: string, title?: string): Promise<LibraryDoc> {
    return this.request<LibraryDoc>('POST', `/${docId}/clone`, { title });
  }

  async exportMarkdown(docId: string): Promise<string> {
    return this.request<string>('GET', `/${docId}/export/markdown`);
  }

  async getBacklinks(docId: string): Promise<LibraryDoc[]> {
    return this.request<LibraryDoc[]>('GET', `/${docId}/backlinks`);
  }

  async search(query: string, params?: LibraryQueryParams): Promise<PaginatedResponse<LibraryDoc>> {
    return this.request<PaginatedResponse<LibraryDoc>>('GET', `/search?q=${query}${this.buildQueryString(params || {})}`);
  }
}

/**
 * Section Repository for managing reusable content sections
 */
export class SectionRepository extends BaseRepository<LibrarySection> {
  protected endpoint = '/library/sections';

  async findByDoc(docId: string): Promise<LibrarySection[]> {
    return this.request<LibrarySection[]>('GET', `?docId=${docId}`);
  }

  async incrementVersion(id: string): Promise<LibrarySection> {
    return this.request<LibrarySection>('POST', `/${id}/version`);
  }

  async getVersionHistory(id: string): Promise<LibrarySection[]> {
    return this.request<LibrarySection[]>('GET', `/${id}/versions`);
  }
}

// Export singleton instances
// Lazy initialization to prevent bundle bloat
let _libraryRepository: MockLibraryRepository | null = null;

export const libraryRepository = {
  get instance(): MockLibraryRepository {
    if (!_libraryRepository) {
      _libraryRepository = new MockLibraryRepository();
    }
    return _libraryRepository;
  }
};

