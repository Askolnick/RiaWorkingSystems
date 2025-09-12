"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LibraryTabs from '../_components/LibraryTabs';
import { useSectionsStore } from '@ria/client';
import { useUIStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Alert,
  Skeleton,
  ErrorBoundary,
  Badge,
  Table,
  SectionEditor,
  SectionViewer
} from '@ria/web-ui';

export default function SectionsPage() {
  const router = useRouter();
  
  // Store hooks
  const {
    sections,
    sectionsLoading,
    sectionsError,
    fetchSections,
    deleteSection,
    searchSections
  } = useSectionsStore();
  
  const {
    showNotification
  } = useUIStore();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [previewingSection, setPreviewingSection] = useState<any>(null);
  
  // Fetch sections on mount
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);
  
  // Filter sections based on search and type
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchQuery === '' || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === '' || section.type === typeFilter;
    return matchesSearch && matchesType;
  });
  
  const handleDelete = async (section: any) => {
    if (!confirm(`Are you sure you want to delete "${section.title}"?`)) {
      return;
    }
    
    try {
      await deleteSection(section.id);
      showNotification({
        type: 'success',
        title: 'Section deleted',
        message: 'The section has been deleted successfully.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to delete section',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };
  
  const handleEdit = (section: any) => {
    setEditingSection(section);
  };
  
  const handlePreview = (section: any) => {
    setPreviewingSection(section);
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
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  if (sectionsLoading && sections.length === 0) {
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
              <Skeleton variant="text" width="100%" height={200} />
            </CardContent>
          </Card>
        </div>
      </div>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content Sections</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Create reusable content sections that can be included in multiple wiki articles
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                >
                  Create Section
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-48"
                >
                  <option value="">All Types</option>
                  <option value="text">Text</option>
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="table">Table</option>
                  <option value="chart">Chart</option>
                  <option value="checklist">Checklist</option>
                  <option value="callout">Callout</option>
                  <option value="quote">Quote</option>
                  <option value="template">Template</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sections List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredSections.length} Section{filteredSections.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {sections.length === 0 
                      ? "No sections created yet. Create your first section to get started!"
                      : "No sections match your current filters."
                    }
                  </p>
                  {sections.length === 0 && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="primary"
                    >
                      Create First Section
                    </Button>
                  )}
                </div>
              ) : (
                <Table
                  data={filteredSections}
                  columns={[
                    {
                      key: 'title',
                      label: 'Title',
                      render: (section: any) => (
                        <div>
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-gray-500">/{section.slug}</div>
                        </div>
                      )
                    },
                    {
                      key: 'type',
                      label: 'Type',
                      render: (section: any) => (
                        <Badge variant="secondary">
                          {section.type}
                        </Badge>
                      )
                    },
                    {
                      key: 'tags',
                      label: 'Tags',
                      render: (section: any) => (
                        <div className="flex gap-1 flex-wrap">
                          {section.tags?.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {section.tags?.length > 2 && (
                            <span className="text-sm text-gray-500">
                              +{section.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )
                    },
                    {
                      key: 'updatedAt',
                      label: 'Last Updated',
                      render: (section: any) => (
                        <span className="text-sm text-gray-500">
                          {new Date(section.updatedAt).toLocaleDateString()}
                        </span>
                      )
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (section: any) => (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handlePreview(section)}
                            variant="ghost"
                            size="sm"
                          >
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleEdit(section)}
                            variant="ghost"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(section)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Modal */}
        <SectionEditor
          isOpen={showCreateModal || !!editingSection}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSection(null);
          }}
          section={editingSection}
          onSave={(section) => {
            showNotification({
              type: 'success',
              title: editingSection ? 'Section updated' : 'Section created',
              message: `The section "${section.title}" has been ${editingSection ? 'updated' : 'created'} successfully.`,
            });
            setShowCreateModal(false);
            setEditingSection(null);
            fetchSections(); // Refresh the list
          }}
        />

        {/* Preview Modal */}
        {previewingSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Preview: {previewingSection.title}</h3>
                <Button
                  onClick={() => setPreviewingSection(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <SectionViewer
                  section={previewingSection}
                  compact={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}