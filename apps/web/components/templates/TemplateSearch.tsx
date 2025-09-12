'use client';

import { Input } from '@ria/web-ui';
import { Search } from 'lucide-react';

interface TemplateSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TemplateSearch({ value, onChange, placeholder }: TemplateSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search templates..."}
        className="pl-10"
      />
    </div>
  );
}