'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Input, Textarea } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Checkbox } from '../atoms/Checkbox';
import { Modal } from '../molecules/Modal';

// Import the types from the client package
export interface WikiSection {
  id: string;
  tenantId: string;
  spaceId?: string;
  title: string;
  slug: string;
  description?: string;
  content: any;
  type: SectionType;
  status: SectionStatus;
  isTemplate: boolean;
  templateId?: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum SectionType {
  text = 'text',
  code = 'code',
  image = 'image',
  video = 'video',
  table = 'table',
  chart = 'chart',
  checklist = 'checklist',
  callout = 'callout',
  quote = 'quote',
  template = 'template'
}

export enum SectionStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}

export interface CreateSectionData {
  spaceId?: string;
  title: string;
  slug: string;
  description?: string;
  content: any;
  type: SectionType;
  isTemplate?: boolean;
  templateId?: string;
  tags?: string[];
  isPublic?: boolean;
  isGlobal?: boolean;
}

export interface UpdateSectionData {
  title?: string;
  slug?: string;
  description?: string;
  content?: any;
  type?: SectionType;
  status?: SectionStatus;
  tags?: string[];
  isPublic?: boolean;
  isGlobal?: boolean;
  changeNote?: string;
}

interface SectionEditorProps {
  section?: WikiSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSectionData | UpdateSectionData) => Promise<void>;
  spaceId?: string;
  loading?: boolean;
}

const SECTION_TYPE_OPTIONS = [
  { value: SectionType.text, label: 'Text' },
  { value: SectionType.code, label: 'Code' },
  { value: SectionType.image, label: 'Image' },
  { value: SectionType.video, label: 'Video' },
  { value: SectionType.table, label: 'Table' },
  { value: SectionType.chart, label: 'Chart' },
  { value: SectionType.checklist, label: 'Checklist' },
  { value: SectionType.callout, label: 'Callout' },
  { value: SectionType.quote, label: 'Quote' },
  { value: SectionType.template, label: 'Template' }
];

export function SectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
  spaceId,
  loading = false
}: SectionEditorProps) {
  const [formData, setFormData] = useState<CreateSectionData>({
    spaceId: spaceId,
    title: '',
    slug: '',
    description: '',
    content: { type: 'text', content: '' },
    type: SectionType.text,
    isTemplate: false,
    tags: [],
    isPublic: false,
    isGlobal: false
  });

  const [changeNote, setChangeNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!section;

  useEffect(() => {
    if (section) {
      setFormData({
        spaceId: section.spaceId,
        title: section.title,
        slug: section.slug,
        description: section.description || '',
        content: section.content,
        type: section.type,
        isTemplate: section.isTemplate,
        tags: section.tags,
        isPublic: section.isPublic,
        isGlobal: section.isGlobal
      });
    } else {
      setFormData({
        spaceId: spaceId,
        title: '',
        slug: '',
        description: '',
        content: { type: 'text', content: '' },
        type: SectionType.text,
        isTemplate: false,
        tags: [],
        isPublic: false,
        isGlobal: false
      });
    }
    setChangeNote('');
    setTagInput('');
    setErrors({});
  }, [section, spaceId, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: !isEditing ? generateSlug(newTitle) : prev.slug
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.type === SectionType.code && !formData.content?.content) {
      newErrors.content = 'Code content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const saveData = isEditing
        ? { ...formData, changeNote: changeNote || undefined } as UpdateSectionData
        : formData;

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const renderContentEditor = () => {
    switch (formData.type) {
      case SectionType.text:
        return (
          <Textarea
            label="Content"
            value={formData.content?.content || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { type: 'text', content: e.target.value }
            }))}
            rows={8}
            placeholder="Enter your text content..."
            fullWidth
          />
        );

      case SectionType.code:
        return (
          <div className="space-y-3">
            <Input
              label="Language"
              value={formData.content?.language || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { 
                  ...prev.content, 
                  type: 'code', 
                  language: e.target.value 
                }
              }))}
              placeholder="javascript, python, etc."
              fullWidth
            />
            <Textarea
              label="Code"
              value={formData.content?.content || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { 
                  ...prev.content, 
                  type: 'code', 
                  content: e.target.value 
                }
              }))}
              rows={8}
              placeholder="Enter your code..."
              fullWidth
              error={errors.content}
              className="font-mono text-sm"
            />
          </div>
        );

      case SectionType.checklist:
        const items = formData.content?.items || [];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist Items
            </label>
            {items.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={item.completed}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, completed: e.target.checked };
                    setFormData(prev => ({
                      ...prev,
                      content: { type: 'checklist', items: newItems }
                    }));
                  }}
                />
                <Input
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, text: e.target.value };
                    setFormData(prev => ({
                      ...prev,
                      content: { type: 'checklist', items: newItems }
                    }));
                  }}
                  fullWidth
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== index);
                    setFormData(prev => ({
                      ...prev,
                      content: { type: 'checklist', items: newItems }
                    }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newItems = [...items, { text: '', completed: false }];
                setFormData(prev => ({
                  ...prev,
                  content: { type: 'checklist', items: newItems }
                }));
              }}
            >
              Add Item
            </Button>
          </div>
        );

      case SectionType.callout:
        return (
          <div className="space-y-3">
            <Select
              label="Callout Type"
              value={formData.content?.calloutType || 'info'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { 
                  ...prev.content, 
                  type: 'callout', 
                  calloutType: e.target.value 
                }
              }))}
              options={[
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' },
                { value: 'success', label: 'Success' }
              ]}
              fullWidth
            />
            <Input
              label="Title"
              value={formData.content?.title || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { 
                  ...prev.content, 
                  type: 'callout', 
                  title: e.target.value 
                }
              }))}
              fullWidth
            />
            <Textarea
              label="Content"
              value={formData.content?.content || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { 
                  ...prev.content, 
                  type: 'callout', 
                  content: e.target.value 
                }
              }))}
              rows={4}
              fullWidth
            />
          </div>
        );

      default:
        return (
          <Textarea
            label="Content (JSON)"
            value={JSON.stringify(formData.content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, content: parsed }));
              } catch {
                // Invalid JSON, keep as string for now
              }
            }}
            rows={8}
            placeholder="Enter JSON content..."
            fullWidth
            className="font-mono text-sm"
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card className="max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Section' : 'Create Section'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={handleTitleChange}
              error={errors.title}
              fullWidth
              required
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              error={errors.slug}
              fullWidth
              required
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            fullWidth
            placeholder="Brief description of this section..."
          />

          {/* Section Type */}
          <Select
            label="Section Type"
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value as SectionType;
              setFormData(prev => ({
                ...prev,
                type: newType,
                content: newType === SectionType.checklist 
                  ? { type: 'checklist', items: [] }
                  : { type: newType, content: '' }
              }));
            }}
            options={SECTION_TYPE_OPTIONS}
            fullWidth
          />

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            {renderContentEditor()}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Checkbox
              label="Is Template"
              checked={formData.isTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, isTemplate: e.target.checked }))}
            />
            <Checkbox
              label="Public"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            />
            <Checkbox
              label="Global"
              checked={formData.isGlobal}
              onChange={(e) => setFormData(prev => ({ ...prev, isGlobal: e.target.checked }))}
            />
          </div>

          {/* Change Note for edits */}
          {isEditing && (
            <Textarea
              label="Change Note (Optional)"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              rows={2}
              fullWidth
              placeholder="Describe what changed in this version..."
            />
          )}
        </CardContent>

        <CardFooter align="between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
          >
            {isEditing ? 'Update Section' : 'Create Section'}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}