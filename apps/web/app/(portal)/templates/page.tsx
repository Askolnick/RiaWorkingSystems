'use client';

import { useEffect, useState } from 'react';
import { useTemplatesStore } from '@ria/client';
import { 
  Card, 
  Button, 
  LoadingCard, 
  Alert, 
  ErrorBoundary,
  Input,
  Badge,
  EmptyState
} from '@ria/web-ui';
import { TemplateCard } from '../../../components/templates/TemplateCard';
import { TemplateFilters } from '../../../components/templates/TemplateFilters';
import { TemplateSearch } from '../../../components/templates/TemplateSearch';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@ria/utils/routes';

export default function TemplatesPage() {
  const router = useRouter();
  const { 
    templates, 
    loading, 
    error, 
    fetchTemplates,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery 
  } = useTemplatesStore();
  
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  const handleTemplateSelect = (templateId: string) => {
    router.push(`${ROUTES.TEMPLATES}/${templateId}`);
  };

  const handleCreateInstance = (templateId: string) => {
    router.push(`${ROUTES.TEMPLATES}/${templateId}/new`);
  };

  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Business Templates</h1>
            <p className="text-muted-foreground mt-2">
              Pre-built templates for common business processes and workflows
            </p>
          </div>
          <Button 
            onClick={() => router.push(`${ROUTES.TEMPLATES}/import`)}
            variant="outline"
          >
            Import Template
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <TemplateSearch 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search templates by name, description, or tags..."
              />
            </div>
            <TemplateFilters 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.category === 'startup').length}
            </div>
            <div className="text-sm text-muted-foreground">Startup Templates</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.category === 'enterprise').length}
            </div>
            <div className="text-sm text-muted-foreground">Enterprise Templates</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.featured).length}
            </div>
            <div className="text-sm text-muted-foreground">Featured Templates</div>
          </Card>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <EmptyState
            title="No templates found"
            description="Try adjusting your search or filters"
            action={
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleTemplateSelect(template.id)}
                onCreateInstance={() => handleCreateInstance(template.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}