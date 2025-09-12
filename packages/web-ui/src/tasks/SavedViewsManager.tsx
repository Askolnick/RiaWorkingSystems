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
  TaskSavedView, 
  CreateTaskSavedViewData, 
  UpdateTaskSavedViewData,
  TaskViewType 
} from '@ria/tasks-server';

interface SavedViewsManagerProps {
  savedViews: TaskSavedView[];
  currentView: TaskSavedView | null;
  defaultView: TaskSavedView | null;
  loading?: boolean;
  error?: string | null;
  onCreateView: (data: CreateTaskSavedViewData) => Promise<void>;
  onUpdateView: (id: string, data: UpdateTaskSavedViewData) => Promise<void>;
  onDeleteView: (id: string) => Promise<void>;
  onSetCurrentView: (view: TaskSavedView | null) => void;
  onSetDefaultView: (id: string) => Promise<void>;
}

const VIEW_TYPES: { value: TaskViewType; label: string }[] = [
  { value: 'list', label: 'List View' },
  { value: 'board', label: 'Board View' },
  { value: 'calendar', label: 'Calendar View' },
  { value: 'timeline', label: 'Timeline View' },
];

export function SavedViewsManager({
  savedViews,
  currentView,
  defaultView,
  loading = false,
  error = null,
  onCreateView,
  onUpdateView,
  onDeleteView,
  onSetCurrentView,
  onSetDefaultView,
}: SavedViewsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingView, setEditingView] = useState<TaskSavedView | null>(null);
  const [formData, setFormData] = useState<CreateTaskSavedViewData>({
    name: '',
    description: '',
    viewType: 'list',
    filters: {},
    sorting: [],
    isShared: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      viewType: 'list',
      filters: {},
      sorting: [],
      isShared: false,
    });
    setIsCreating(false);
    setEditingView(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingView) {
        await onUpdateView(editingView.id, formData);
      } else {
        await onCreateView(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save view:', error);
    }
  };

  const handleEdit = (view: TaskSavedView) => {
    setEditingView(view);
    setFormData({
      name: view.name,
      description: view.description || '',
      viewType: view.viewType,
      filters: view.filters,
      sorting: view.sorting,
      groupBy: view.groupBy,
      columns: view.columns,
      isShared: view.isShared,
    });
    setIsCreating(true);
  };

  const handleDelete = async (view: TaskSavedView) => {
    if (confirm(`Are you sure you want to delete the view "${view.name}"?`)) {
      try {
        await onDeleteView(view.id);
      } catch (error) {
        console.error('Failed to delete view:', error);
      }
    }
  };

  const handleSetDefault = async (view: TaskSavedView) => {
    try {
      await onSetDefaultView(view.id);
    } catch (error) {
      console.error('Failed to set default view:', error);
    }
  };

  const handleSetCurrent = (view: TaskSavedView) => {
    onSetCurrentView(view);
  };

  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Saved Views</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            Create New View
          </Button>
        )}
      </div>

      {/* Current View Info */}
      {currentView && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Current View</h3>
          <p className="text-sm text-blue-700">{currentView.name}</p>
          {currentView.description && (
            <p className="text-xs text-blue-600">{currentView.description}</p>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingView ? 'Edit View' : 'Create New View'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev: CreateTaskSavedViewData) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Tasks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View Type *
                  </label>
                  <Select
                    options={VIEW_TYPES}
                    value={formData.viewType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev: CreateTaskSavedViewData) => ({ ...prev, viewType: e.target.value as TaskViewType }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev: CreateTaskSavedViewData) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this view"
                  rows={2}
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => setFormData((prev: CreateTaskSavedViewData) => ({ ...prev, isShared: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Share with team</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingView ? 'Update View' : 'Create View'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Views List */}
      <div className="grid gap-4">
        {savedViews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No saved views yet</p>
              <Button onClick={() => setIsCreating(true)}>
                Create Your First View
              </Button>
            </CardContent>
          </Card>
        ) : (
          savedViews.map(view => (
            <Card key={view.id} className={`${currentView?.id === view.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{view.name}</h3>
                    {view.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                    {view.isShared && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Shared
                      </span>
                    )}
                    {currentView?.id === view.id && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {VIEW_TYPES.find(t => t.value === view.viewType)?.label}
                    {view.description && ` • ${view.description}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetCurrent(view)}
                    disabled={currentView?.id === view.id}
                  >
                    {currentView?.id === view.id ? 'Active' : 'Use'}
                  </Button>
                  
                  {!view.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetDefault(view)}
                    >
                      Set Default
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(view)}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(view)}
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