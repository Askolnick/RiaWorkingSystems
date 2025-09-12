"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LibraryTabs from '../../_components/LibraryTabs';
import { useSectionsStore } from '@ria/client';
import { useUIStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Alert,
  Skeleton,
  ErrorBoundary,
  Badge,
  SectionViewer,
  SectionEditor
} from '@ria/web-ui';

export default function SectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Store hooks
  const {
    currentSection,
    sectionsLoading,
    sectionsError,
    fetchSection,
    deleteSection,
    getSectionUsages
  } = useSectionsStore();
  
  const {
    showNotification
  } = useUIStore();
  
  // Local state
  const [showEditModal, setShowEditModal] = useState(false);
  const [usages, setUsages] = useState<any[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);
  
  // Fetch section and its usages on mount
  useEffect(() => {
    if (params.id) {
      fetchSection(params.id as string);
      loadUsages();
    }
  }, [params.id, fetchSection]);
  
  const loadUsages = async () => {
    if (!params.id) return;
    
    setLoadingUsages(true);
    try {
      const sectionUsages = await getSectionUsages(params.id as string);
      setUsages(sectionUsages || []);
    } catch (error) {
      console.error('Failed to load usages:', error);
    } finally {
      setLoadingUsages(false);
    }
  };
  
  const handleDelete = async () => {
    if (!currentSection) return;
    
    if (usages.length > 0) {
      showNotification({
        type: 'error',
        title: 'Cannot delete section',
        message: 'This section is being used in other documents. Remove all usages first.',
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${currentSection.title}"?`)) {
      return;
    }
    
    try {
      await deleteSection(currentSection.id);
      showNotification({
        type: 'success',
        title: 'Section deleted',
        message: 'The section has been deleted successfully.',
      });
      router.push('/library/sections');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to delete section',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };
  
  if (sectionsError) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Library - Sections</h1>
          <LibraryTabs />
          <div className="mt-6">
            <Alert type="error">
              {sectionsError}
            </Alert>
            <Button
              onClick={() => router.push('/library/sections')}
              variant="ghost"
              className="mt-4"
            >
              ← Back to Sections
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  if (sectionsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Sections</h1>
        <LibraryTabs />
        <div className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton variant="text" width="60%" height={32} className="mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton variant="text" width="100%" height={300} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!currentSection) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Library - Sections</h1>
          <LibraryTabs />
          <div className="mt-6">
            <Alert type="warning">
              Section not found
            </Alert>
            <Button
              onClick={() => router.push('/library/sections')}
              variant="ghost"
              className="mt-4"
            >
              ← Back to Sections
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Sections</h1>
        <LibraryTabs />
        
        <div className="mt-6">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{currentSection.title}</CardTitle>
                    <Badge variant="secondary">{currentSection.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Slug: /{currentSection.slug}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(currentSection.updatedAt).toLocaleDateString()}
                  </p>
                  {currentSection.tags && currentSection.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {currentSection.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="secondary"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="ghost"
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => router.push('/library/sections')}
                    variant="ghost"
                  >
                    ← Back
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <SectionViewer
                    section={currentSection}
                    compact={false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Usage Information */}
              <Card>
                <CardHeader>
                  <CardTitle as="h3">Usage Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingUsages ? (
                    <div className="space-y-2">
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        This section is used in <strong>{usages.length}</strong> document{usages.length !== 1 ? 's' : ''}
                      </p>
                      
                      {usages.length > 0 && (
                        <div className="space-y-2">
                          {usages.slice(0, 5).map((usage: any) => (
                            <div key={usage.id} className="p-2 border rounded text-sm">
                              <div className="font-medium">{usage.document?.title || 'Unknown Document'}</div>
                              <div className="text-xs text-gray-500">
                                Used at position {usage.position}
                              </div>
                            </div>
                          ))}
                          {usages.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{usages.length - 5} more usage{usages.length - 5 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle as="h3">Section Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>ID:</strong> {currentSection.id}
                    </div>
                    <div>
                      <strong>Type:</strong> {currentSection.type}
                    </div>
                    <div>
                      <strong>Slug:</strong> {currentSection.slug}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(currentSection.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Modified:</strong> {new Date(currentSection.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle as="h3">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`::include{slug="${currentSection.slug}"}`);
                        showNotification({
                          type: 'success',
                          title: 'Copied to clipboard',
                          message: 'Section reference has been copied to clipboard.',
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Copy Reference
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(currentSection.content, null, 2));
                        showNotification({
                          type: 'success',
                          title: 'Copied to clipboard',
                          message: 'Section content has been copied to clipboard.',
                        });
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      Copy Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <SectionEditor
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          section={currentSection}
          onSave={(section) => {
            showNotification({
              type: 'success',
              title: 'Section updated',
              message: `The section "${section.title}" has been updated successfully.`,
            });
            setShowEditModal(false);
            // Refresh the section data
            fetchSection(params.id as string);
            loadUsages();
          }}
        />
      </div>
    </ErrorBoundary>
  );
}