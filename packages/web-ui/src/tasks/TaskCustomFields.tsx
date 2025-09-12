'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Button } from '../Button/Button';
import { CustomFieldInput, CustomFieldValueDisplay } from './CustomFieldInput';
import { LoadingCard } from '../components/atoms/Loading';
import { Alert } from '../components/molecules/Alert';
import type { 
  TaskCustomField, 
  TaskCustomFieldValue
} from '@ria/tasks-server';

interface TaskCustomFieldsProps {
  taskId: string;
  customFields: TaskCustomField[];
  customFieldValues: TaskCustomFieldValue[];
  loading?: boolean;
  error?: string | null;
  onUpdateValue: (customFieldId: string, value: any) => Promise<void>;
  onRemoveValue: (customFieldId: string) => Promise<void>;
  readonly?: boolean;
}

export function TaskCustomFields({
  taskId,
  customFields,
  customFieldValues,
  loading = false,
  error = null,
  onUpdateValue,
  onRemoveValue,
  readonly = false,
}: TaskCustomFieldsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Initialize editing values when custom field values change
  useEffect(() => {
    const values: Record<string, any> = {};
    customFieldValues.forEach(value => {
      values[value.customFieldId] = value.value;
    });
    setEditingValues(values);
  }, [customFieldValues]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    const values: Record<string, any> = {};
    customFieldValues.forEach(value => {
      values[value.customFieldId] = value.value;
    });
    setEditingValues(values);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update all changed values
      const promises: Promise<void>[] = [];
      
      for (const field of customFields) {
        const newValue = editingValues[field.id];
        const existingValue = customFieldValues.find(v => v.customFieldId === field.id);
        
        // If value changed or was added/removed
        if (existingValue?.value !== newValue) {
          if (newValue === undefined || newValue === null || newValue === '') {
            // Remove value if empty
            if (existingValue) {
              promises.push(onRemoveValue(field.id));
            }
          } else {
            // Update value
            promises.push(onUpdateValue(field.id, newValue));
          }
        }
      }
      
      await Promise.all(promises);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save custom field values:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (customFieldId: string, value: any) => {
    setEditingValues(prev => ({
      ...prev,
      [customFieldId]: value
    }));
  };

  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;

  if (customFields.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No custom fields configured</p>
        </CardContent>
      </Card>
    );
  }

  const hasValues = customFieldValues.some(value => 
    value.value !== null && value.value !== undefined && value.value !== ''
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Custom Fields</CardTitle>
          {!readonly && !isEditing && (
            <Button variant="secondary" size="sm" onClick={handleStartEdit}>
              {hasValues ? 'Edit' : 'Add Values'}
            </Button>
          )}
          {!readonly && isEditing && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {customFields.map(field => {
              const existingValue = customFieldValues.find(v => v.customFieldId === field.id);
              const mockValue = {
                ...existingValue,
                value: editingValues[field.id]
              } as TaskCustomFieldValue;
              
              return (
                <CustomFieldInput
                  key={field.id}
                  field={field}
                  value={mockValue}
                  onChange={(value) => handleValueChange(field.id, value)}
                  disabled={saving}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {customFields.map(field => {
              const value = customFieldValues.find(v => v.customFieldId === field.id);
              
              return (
                <CustomFieldValueDisplay
                  key={field.id}
                  field={field}
                  value={value}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCustomFieldsSummaryProps {
  customFieldValues: TaskCustomFieldValue[];
  limit?: number;
  className?: string;
}

export function TaskCustomFieldsSummary({
  customFieldValues,
  limit = 3,
  className = ''
}: TaskCustomFieldsSummaryProps) {
  const visibleValues = customFieldValues
    .filter(value => value.value !== null && value.value !== undefined && value.value !== '')
    .slice(0, limit);

  if (visibleValues.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleValues.map(value => (
        <CustomFieldValueDisplay
          key={value.id}
          field={value.customField!}
          value={value}
          className="text-xs"
        />
      ))}
      {customFieldValues.length > limit && (
        <span className="text-xs text-gray-400">
          +{customFieldValues.length - limit} more
        </span>
      )}
    </div>
  );
}