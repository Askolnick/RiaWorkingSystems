'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { Select } from '../Select/Select';
import { LoadingCard } from '../components/atoms/Loading';
import { Alert } from '../components/molecules/Alert';
import type { 
  TaskCustomField, 
  CreateTaskCustomFieldData, 
  UpdateTaskCustomFieldData,
  CustomFieldType,
  CustomFieldOption 
} from '@ria/tasks-server';

interface CustomFieldsManagerProps {
  customFields: TaskCustomField[];
  loading?: boolean;
  error?: string | null;
  onCreateField: (data: CreateTaskCustomFieldData) => Promise<void>;
  onUpdateField: (id: string, data: UpdateTaskCustomFieldData) => Promise<void>;
  onDeleteField: (id: string) => Promise<void>;
}

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (Single)' },
  { value: 'multiselect', label: 'Select (Multiple)' },
  { value: 'url', label: 'URL' },
  { value: 'user', label: 'User' },
];

export function CustomFieldsManager({
  customFields,
  loading = false,
  error = null,
  onCreateField,
  onUpdateField,
  onDeleteField,
}: CustomFieldsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState<TaskCustomField | null>(null);
  const [formData, setFormData] = useState<CreateTaskCustomFieldData>({
    name: '',
    key: '',
    type: 'text',
    description: '',
    required: false,
    options: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      type: 'text',
      description: '',
      required: false,
      options: [],
    });
    setIsCreating(false);
    setEditingField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingField) {
        await onUpdateField(editingField.id, formData);
      } else {
        await onCreateField(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save custom field:', error);
    }
  };

  const handleEdit = (field: TaskCustomField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      key: field.key,
      type: field.type,
      description: field.description || '',
      required: field.required,
      options: field.options || [],
    });
    setIsCreating(true);
  };

  const handleDelete = async (field: TaskCustomField) => {
    if (confirm(`Are you sure you want to delete the custom field "${field.name}"?`)) {
      try {
        await onDeleteField(field.id);
      } catch (error) {
        console.error('Failed to delete custom field:', error);
      }
    }
  };

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);
  };

  const addOption = () => {
    setFormData((prev: CreateTaskCustomFieldData) => ({
      ...prev,
      options: [...(prev.options || []), { value: '', label: '', color: '#3B82F6' }]
    }));
  };

  const updateOption = (index: number, field: keyof CustomFieldOption, value: string) => {
    setFormData((prev: CreateTaskCustomFieldData) => ({
      ...prev,
      options: prev.options?.map((option: CustomFieldOption, i: number) => 
        i === index ? { ...option, [field]: value } : option
      ) || []
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev: CreateTaskCustomFieldData) => ({
      ...prev,
      options: prev.options?.filter((_: CustomFieldOption, i: number) => i !== index) || []
    }));
  };

  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Custom Fields</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            Add Custom Field
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev: CreateTaskCustomFieldData) => ({
                        ...prev,
                        name,
                        key: generateKey(name)
                      }));
                    }}
                    placeholder="e.g., Story Points"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Key *
                  </label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData((prev: CreateTaskCustomFieldData) => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g., story_points"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <Select
                  options={FIELD_TYPES}
                  value={formData.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev: CreateTaskCustomFieldData) => ({ ...prev, type: e.target.value as CustomFieldType }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev: CreateTaskCustomFieldData) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this field"
                  rows={2}
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData((prev: CreateTaskCustomFieldData) => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>
              </div>

              {/* Options for select/multiselect */}
              {(formData.type === 'select' || formData.type === 'multiselect') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <Button type="button" size="sm" onClick={addOption}>
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.options?.map((option: CustomFieldOption, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option.value}
                          onChange={(e) => updateOption(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Input
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <input
                          type="color"
                          value={option.color || '#3B82F6'}
                          onChange={(e) => updateOption(index, 'color', e.target.value)}
                          className="w-8 h-8 rounded border border-gray-300"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingField ? 'Update Field' : 'Create Field'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Custom Fields List */}
      <div className="grid gap-4">
        {customFields.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No custom fields created yet</p>
              <Button onClick={() => setIsCreating(true)}>
                Create First Custom Field
              </Button>
            </CardContent>
          </Card>
        ) : (
          customFields.map(field => (
            <Card key={field.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-500">
                    {field.key} • {FIELD_TYPES.find(t => t.value === field.type)?.label}
                    {field.required && ' • Required'}
                  </p>
                  {field.description && (
                    <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(field)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(field)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}