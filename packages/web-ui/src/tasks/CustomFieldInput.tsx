'use client';

import React from 'react';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import type { 
  TaskCustomField, 
  TaskCustomFieldValue, 
  CustomFieldType,
  CustomFieldOption 
} from '@ria/tasks-server';

interface CustomFieldInputProps {
  field: TaskCustomField;
  value?: TaskCustomFieldValue;
  onChange: (value: any) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomFieldInput({
  field,
  value,
  onChange,
  disabled = false,
  className = ''
}: CustomFieldInputProps) {
  const currentValue = value?.value;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            disabled={disabled}
            className={className}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.description}
            disabled={disabled}
            className={className}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'boolean':
        return (
          <label className={`flex items-center space-x-2 ${className}`}>
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.description}</span>
          </label>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={className}
          />
        );

      case 'select':
        const selectOptions = field.options || [];
        const options = [
          { value: '', label: `Select ${field.name}` },
          ...selectOptions.map((opt: CustomFieldOption) => ({ value: opt.value, label: opt.label }))
        ];
        return (
          <Select
            options={options}
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={className}
          />
        );

      case 'multiselect':
        const multiselectOptions = field.options || [];
        const selectedValues = currentValue || [];
        
        return (
          <div className={`space-y-2 ${className}`}>
            {multiselectOptions.map((option: CustomFieldOption) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v: string) => v !== option.value);
                    onChange(newValues);
                  }}
                  disabled={disabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'url':
        return (
          <Input
            type="url"
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || 'https://...'}
            disabled={disabled}
            className={className}
          />
        );

      case 'user':
        // This would normally be a user picker component
        // For now, just use a text input
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="User ID or name"
            disabled={disabled}
            className={className}
          />
        );

      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            disabled={disabled}
            className={className}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {field.description && field.type !== 'boolean' && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
    </div>
  );
}

interface CustomFieldValueDisplayProps {
  field: TaskCustomField;
  value?: TaskCustomFieldValue;
  className?: string;
}

export function CustomFieldValueDisplay({
  field,
  value,
  className = ''
}: CustomFieldValueDisplayProps) {
  if (!value?.value && value?.value !== 0 && value?.value !== false) {
    return (
      <span className={`text-gray-400 text-sm ${className}`}>
        No value
      </span>
    );
  }

  const displayValue = () => {
    switch (field.type) {
      case 'boolean':
        return value.value ? 'Yes' : 'No';
        
      case 'select':
        const option = field.options?.find((opt: CustomFieldOption) => opt.value === value.value);
        return option ? (
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: option.color + '20', 
              color: option.color || '#374151' 
            }}
          >
            {option.label}
          </span>
        ) : value.value;
        
      case 'multiselect':
        const selectedOptions = field.options?.filter((opt: CustomFieldOption) => 
          value.value?.includes(opt.value)
        ) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option: CustomFieldOption) => (
              <span 
                key={option.value}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: option.color + '20', 
                  color: option.color || '#374151' 
                }}
              >
                {option.label}
              </span>
            ))}
          </div>
        );
        
      case 'url':
        return (
          <a 
            href={value.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {value.value}
          </a>
        );
        
      case 'date':
        return new Date(value.value).toLocaleDateString();
        
      default:
        return String(value.value);
    }
  };

  return (
    <div className={`${className}`}>
      <span className="text-xs text-gray-500 block">{field.name}</span>
      <div className="text-sm text-gray-900">{displayValue()}</div>
    </div>
  );
}