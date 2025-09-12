'use client';

import { Select } from '@ria/web-ui';

interface TemplateFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function TemplateFilters({ selectedCategory, onCategoryChange }: TemplateFiltersProps) {
  const categories: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'startup', label: 'Startup' },
    { value: 'growth', label: 'Growth' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'transformation', label: 'Transformation' }
  ];

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">Category:</label>
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <Select.Trigger className="w-[180px]">
          <Select.Value placeholder="Select category" />
        </Select.Trigger>
        <Select.Content>
          {categories.map(category => (
            <Select.Item key={category.value} value={category.value}>
              {category.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}