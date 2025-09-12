'use client';

import { useEffect, useState } from 'react';
import { useMessageTemplatesStore } from '@ria/client';
import { 
  MessageTemplateManager, 
  MessageTemplateForm, 
  MessageTemplatePreview,
  type CreateMessageTemplateData,
  type MessageTemplate
} from '@ria/web-ui';

export default function MessageTemplatesPage() {
  const {
    templates,
    loading,
    error,
    filters,
    categories,
    templatesByType,
    previewResult,
    previewLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleTemplateStatus,
    setFilters,
    previewTemplate,
    clearError
  } = useMessageTemplatesStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<MessageTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleCreateTemplate = async (data: CreateMessageTemplateData) => {
    try {
      await createTemplate(data);
      setShowCreateForm(false);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleUpdateTemplate = async (data: CreateMessageTemplateData) => {
    if (!editingTemplate) return;

    try {
      await updateTemplate(editingTemplate.id, data);
      setEditingTemplate(null);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleDuplicateTemplate = async (id: string, name: string) => {
    try {
      await duplicateTemplate(id, name);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleTemplateStatus(id);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handlePreviewTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setPreviewingTemplate(template);
      setShowPreview(true);
    }
  };

  const handlePreview = async (variables: Record<string, any>) => {
    if (!previewingTemplate) return;

    try {
      await previewTemplate({
        templateId: previewingTemplate.id,
        variables
      });
    } catch (error) {
      // Error handling is done in the store
    }
  };

  // Show create form
  if (showCreateForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MessageTemplateForm
          onSave={handleCreateTemplate}
          onCancel={() => setShowCreateForm(false)}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  // Show edit form
  if (editingTemplate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MessageTemplateForm
          template={editingTemplate}
          onSave={handleUpdateTemplate}
          onCancel={() => setEditingTemplate(null)}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  // Show preview
  if (showPreview && previewingTemplate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MessageTemplatePreview
          template={previewingTemplate}
          onPreview={handlePreview}
          previewResult={previewResult}
          loading={previewLoading}
          error={error}
          onClose={() => {
            setShowPreview(false);
            setPreviewingTemplate(null);
          }}
        />
      </div>
    );
  }

  // Show main manager
  return (
    <div className="container mx-auto px-4 py-8">
      <MessageTemplateManager
        templates={templates}
        loading={loading}
        error={error}
        filters={filters}
        categories={categories}
        templatesByType={templatesByType}
        onCreateTemplate={() => setShowCreateForm(true)}
        onUpdateTemplate={(id) => {
          const template = templates.find(t => t.id === id);
          if (template) setEditingTemplate(template);
        }}
        onDeleteTemplate={handleDeleteTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
        onToggleStatus={handleToggleStatus}
        onFiltersChange={setFilters}
        onPreviewTemplate={handlePreviewTemplate}
      />
    </div>
  );
}