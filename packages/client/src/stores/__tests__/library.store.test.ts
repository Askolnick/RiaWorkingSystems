import '@testing-library/jest-dom';
import { useLibraryStore } from '../library.store';
import { act } from '@testing-library/react';

// Mock the repository factory
jest.mock('../repositories/factory', () => ({
  libraryRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('LibraryStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useLibraryStore.setState({
      documents: [],
      currentDocument: null,
      sections: {},
      isLoading: false,
      error: null,
      searchQuery: '',
      filters: {
        kind: 'all',
        status: 'all',
        tag: '',
        ownerId: '',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false,
      },
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const state = useLibraryStore.getState();
    
    expect(state.documents).toEqual([]);
    expect(state.currentDocument).toBeNull();
    expect(state.sections).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.filters).toEqual({
      kind: 'all',
      status: 'all',
      tag: '',
      ownerId: '',
    });
    expect(state.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false,
    });
  });

  it('sets loading state correctly', () => {
    act(() => {
      useLibraryStore.getState().setLoading(true);
    });

    expect(useLibraryStore.getState().isLoading).toBe(true);

    act(() => {
      useLibraryStore.getState().setLoading(false);
    });

    expect(useLibraryStore.getState().isLoading).toBe(false);
  });

  it('sets error state correctly', () => {
    const errorMessage = 'Test error message';
    
    act(() => {
      useLibraryStore.getState().setError(errorMessage);
    });

    expect(useLibraryStore.getState().error).toBe(errorMessage);
  });

  it('clears error state', () => {
    // First set an error
    act(() => {
      useLibraryStore.getState().setError('Some error');
    });

    expect(useLibraryStore.getState().error).toBe('Some error');

    // Then clear it
    act(() => {
      useLibraryStore.getState().clearError();
    });

    expect(useLibraryStore.getState().error).toBeNull();
  });

  it('updates search query', () => {
    const searchQuery = 'test search';
    
    act(() => {
      useLibraryStore.getState().setSearchQuery(searchQuery);
    });

    expect(useLibraryStore.getState().searchQuery).toBe(searchQuery);
  });

  it('updates filters', () => {
    const newFilters = {
      kind: 'guide' as const,
      status: 'published' as const,
      tag: 'important',
      ownerId: 'user-123',
    };
    
    act(() => {
      useLibraryStore.getState().setFilters(newFilters);
    });

    expect(useLibraryStore.getState().filters).toEqual(newFilters);
  });

  it('sets documents correctly', () => {
    const mockDocuments = [
      {
        id: '1',
        title: 'Test Document 1',
        content: 'Content 1',
        kind: 'guide' as const,
        status: 'draft' as const,
        slug: 'test-1',
        authorId: 'user-1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Test Document 2',
        content: 'Content 2',
        kind: 'article' as const,
        status: 'published' as const,
        slug: 'test-2',
        authorId: 'user-2',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];
    
    act(() => {
      useLibraryStore.getState().setDocuments(mockDocuments);
    });

    expect(useLibraryStore.getState().documents).toEqual(mockDocuments);
  });

  it('sets current document correctly', () => {
    const mockDocument = {
      id: '1',
      title: 'Test Document',
      content: 'Test content',
      kind: 'guide' as const,
      status: 'draft' as const,
      slug: 'test-doc',
      authorId: 'user-1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
    
    act(() => {
      useLibraryStore.getState().setCurrentDocument(mockDocument);
    });

    expect(useLibraryStore.getState().currentDocument).toEqual(mockDocument);
  });

  it('updates pagination correctly', () => {
    const newPagination = {
      page: 2,
      limit: 20,
      total: 100,
      hasMore: true,
    };
    
    act(() => {
      useLibraryStore.getState().setPagination(newPagination);
    });

    expect(useLibraryStore.getState().pagination).toEqual(newPagination);
  });

  it('adds a document correctly', () => {
    const existingDocument = {
      id: '1',
      title: 'Existing Document',
      content: 'Existing content',
      kind: 'guide' as const,
      status: 'draft' as const,
      slug: 'existing',
      authorId: 'user-1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const newDocument = {
      id: '2',
      title: 'New Document',
      content: 'New content',
      kind: 'article' as const,
      status: 'published' as const,
      slug: 'new',
      authorId: 'user-2',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    };

    // Set existing documents
    act(() => {
      useLibraryStore.getState().setDocuments([existingDocument]);
    });

    // Add new document
    act(() => {
      useLibraryStore.getState().addDocument(newDocument);
    });

    const documents = useLibraryStore.getState().documents;
    expect(documents).toHaveLength(2);
    expect(documents).toContainEqual(existingDocument);
    expect(documents).toContainEqual(newDocument);
  });

  it('updates a document correctly', () => {
    const originalDocument = {
      id: '1',
      title: 'Original Title',
      content: 'Original content',
      kind: 'guide' as const,
      status: 'draft' as const,
      slug: 'original',
      authorId: 'user-1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    // Set initial document
    act(() => {
      useLibraryStore.getState().setDocuments([originalDocument]);
    });

    const updatedDocument = {
      ...originalDocument,
      title: 'Updated Title',
      content: 'Updated content',
      updatedAt: '2023-01-01T12:00:00Z',
    };

    // Update document
    act(() => {
      useLibraryStore.getState().updateDocument('1', {
        title: 'Updated Title',
        content: 'Updated content',
        updatedAt: '2023-01-01T12:00:00Z',
      });
    });

    const documents = useLibraryStore.getState().documents;
    expect(documents).toHaveLength(1);
    expect(documents[0]).toEqual(updatedDocument);
  });

  it('removes a document correctly', () => {
    const doc1 = {
      id: '1',
      title: 'Document 1',
      content: 'Content 1',
      kind: 'guide' as const,
      status: 'draft' as const,
      slug: 'doc-1',
      authorId: 'user-1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const doc2 = {
      id: '2',
      title: 'Document 2',
      content: 'Content 2',
      kind: 'article' as const,
      status: 'published' as const,
      slug: 'doc-2',
      authorId: 'user-2',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    };

    // Set initial documents
    act(() => {
      useLibraryStore.getState().setDocuments([doc1, doc2]);
    });

    // Remove first document
    act(() => {
      useLibraryStore.getState().removeDocument('1');
    });

    const documents = useLibraryStore.getState().documents;
    expect(documents).toHaveLength(1);
    expect(documents[0]).toEqual(doc2);
    expect(documents.find(d => d.id === '1')).toBeUndefined();
  });
});