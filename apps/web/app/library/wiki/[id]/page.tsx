"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LibraryTabs from '../../_components/LibraryTabs';
import { useLibraryStore, useUIStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Alert,
  Skeleton,
  ErrorBoundary,
  AlertDialog
} from '@ria/web-ui';

export default function WikiDocumentPage() {
  const params = useParams();
  const router = useRouter();
  
  // Store hooks
  const {
    currentDocument,
    documentsLoading,
    documentsError,
    fetchDocument,
    deleteDocument,
    cloneDocument,
  } = useLibraryStore();
  
  const {
    openModal,
    showNotification,
  } = useUIStore();

  // Fetch document on mount
  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string);
    }
  }, [params.id, fetchDocument]);

  // Handle document deletion
  const handleDelete = async () => {
    if (!currentDocument) return;
    
    try {
      await deleteDocument(currentDocument.id);
      showNotification({
        type: 'success',
        title: 'Document deleted',
        message: 'The document has been deleted successfully.',
      });
      router.push('/library/wiki');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  // Handle document clone
  const handleClone = async () => {
    if (!currentDocument) return;
    
    try {
      await cloneDocument(currentDocument.id);
      showNotification({
        type: 'success',
        title: 'Document cloned',
        message: 'The document has been cloned successfully.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to clone document',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  // Render markdown (basic implementation)
  const renderMarkdown = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, idx) => {
        // Headers
        if (paragraph.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold mb-4">{paragraph.slice(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-semibold mb-3">{paragraph.slice(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-medium mb-2">{paragraph.slice(4)}</h3>;
        }
        
        // Lists
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').map((item, i) => (
            <li key={i}>{item.slice(2)}</li>
          ));
          return <ul key={idx} className="list-disc list-inside mb-4">{items}</ul>;
        }
        
        // Regular paragraphs
        return <p key={idx} className="mb-4">{paragraph}</p>;
      });
  };

  if (documentsError) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
          <LibraryTabs />
          <div className="mt-6">
            <Alert type="error">
              {documentsError}
            </Alert>
            <Button
              onClick={() => router.push('/library/wiki')}
              variant="ghost"
              className="mt-4"
            >
              ← Back to Wiki
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (documentsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        <div className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton variant="text" width="60%" height={32} className="mb-2" />
              <Skeleton variant="text" width="80%" height={20} />
            </CardHeader>
            <CardContent>
              <Skeleton variant="text" width="100%" height={20} className="mb-2" />
              <Skeleton variant="text" width="100%" height={20} className="mb-2" />
              <Skeleton variant="text" width="75%" height={20} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        <div className="mt-6">
          <Alert type="warning">
            Document not found
          </Alert>
          <Button
            onClick={() => router.push('/library/wiki')}
            variant="ghost"
            className="mt-4"
          >
            ← Back to Wiki
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{currentDocument.title}</CardTitle>
                    {currentDocument.summary && (
                      <p className="text-gray-600 mt-2">{currentDocument.summary}</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded ${
                        currentDocument.status === 'published' ? 'bg-green-100 text-green-800' :
                        currentDocument.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {currentDocument.status}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {currentDocument.kind}
                      </span>
                      {currentDocument.tags?.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/library/wiki/${params.id}/edit`)}
                      variant="primary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => openModal('share-document', currentDocument)}
                      variant="secondary"
                      size="sm"
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose max-w-none">
                  {currentDocument.bodyMd ? (
                    renderMarkdown(currentDocument.bodyMd)
                  ) : (
                    <p className="text-gray-500 italic">No content yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle as="h3">Document Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium capitalize">{currentDocument.kind}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium capitalize">{currentDocument.status}</span>
                  </div>
                  {currentDocument.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">
                        {new Date(currentDocument.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {currentDocument.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated</span>
                      <span className="font-medium">
                        {new Date(currentDocument.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle as="h3">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    onClick={handleClone}
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                  >
                    📋 Clone Document
                  </Button>
                  <Button
                    onClick={() => {
                      const markdown = currentDocument.bodyMd || '';
                      const blob = new Blob([markdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${currentDocument.title}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                  >
                    📤 Export as Markdown
                  </Button>
                  <Button
                    onClick={() => openModal('permissions', currentDocument)}
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                  >
                    🔒 Change Permissions
                  </Button>
                  <Button
                    onClick={() => openModal('move', currentDocument)}
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                  >
                    📁 Move to Folder
                  </Button>
                  <Button
                    onClick={() => openModal('delete-confirm', currentDocument)}
                    variant="ghost"
                    fullWidth
                    className="justify-start text-red-600 hover:text-red-700"
                  >
                    🗑️ Delete Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={false} // This would be controlled by modal state
          onClose={() => {}}
          onConfirm={handleDelete}
          title="Delete Document"
          description={`Are you sure you want to delete "${currentDocument?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="error"
        />
      </div>
    </ErrorBoundary>
  );
}