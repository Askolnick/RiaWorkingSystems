"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LibraryTabs from '../_components/LibraryTabs';
import { useLibraryStore, useUIStore } from '@ria/client';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  SearchInput,
  Alert,
  Modal,
  Input,
  Textarea,
  LoadingCard,
  ErrorBoundary
} from '@ria/web-ui';

export default function WikiPage() {
  const router = useRouter();
  
  // Store hooks
  const {
    documents,
    documentsLoading,
    documentsError,
    filters,
    fetchDocuments,
    createDocument,
    setFilter,
    search,
  } = useLibraryStore();
  
  const {
    modalType,
    modalData,
    openModal,
    closeModal,
    showNotification,
  } = useUIStore();

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments({ kind: 'wiki' });
  }, [fetchDocuments]);

  // Handle search
  const handleSearch = async (query: string) => {
    await search(query);
  };

  // Handle document creation
  const handleCreateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const newDoc = await createDocument({
        title: formData.get('title') as string,
        summary: formData.get('summary') as string,
        kind: 'wiki',
        status: 'draft',
        bodyMd: '',
        tags: [],
      });
      
      showNotification({
        type: 'success',
        title: 'Document created',
        message: `"${newDoc.title}" has been created successfully.`,
      });
      
      closeModal();
      router.push(`/library/wiki/${newDoc.id}`);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to create document',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        
        <div className="mt-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Documentation & Knowledge Base</h2>
            <Button
              onClick={() => openModal('create-document')}
              variant="primary"
              size="md"
            >
              + New Document
            </Button>
          </div>
          
          {/* Main Content */}
          <Card>
            {/* Search Bar */}
            <div className="p-4 border-b">
              <SearchInput
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                onSearch={handleSearch}
                onClear={() => setFilter('search', '')}
                fullWidth
              />
            </div>
            
            {/* Documents List */}
            <CardContent className="p-4">
              {documentsError && (
                <Alert type="error" className="mb-4">
                  {documentsError}
                </Alert>
              )}
              
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <LoadingCard key={i} rows={2} />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-500 mb-4">
                    {filters.search 
                      ? `No documents found matching "${filters.search}"`
                      : 'No wiki documents yet'
                    }
                  </p>
                  {!filters.search && (
                    <Button
                      onClick={() => openModal('create-document')}
                      variant="primary"
                    >
                      Create Your First Document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <a
                      key={doc.id}
                      href={`/library/wiki/${doc.id}`}
                      className="block border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      {doc.summary && (
                        <p className="text-sm text-gray-600 mt-1">{doc.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status || 'draft')}`}>
                          {doc.status || 'draft'}
                        </span>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex gap-1">
                            {doc.tags.map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {doc.updatedAt && (
                          <span className="text-xs text-gray-500">
                            Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Document Modal */}
        <Modal
          open={modalType === 'create-document'}
          onClose={closeModal}
          title="Create New Document"
          size="md"
        >
          <form onSubmit={handleCreateDocument}>
            <div className="space-y-4">
              <Input
                name="title"
                label="Document Title"
                placeholder="e.g., Employee Handbook"
                required
                fullWidth
              />
              <Textarea
                name="summary"
                label="Summary"
                placeholder="Brief description of the document..."
                rows={3}
                fullWidth
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Create Document
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}