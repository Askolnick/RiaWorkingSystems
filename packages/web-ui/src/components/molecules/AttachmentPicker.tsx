"use client";
import { useEffect, useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  createdAt?: string;
}

interface AttachmentPickerProps {
  files: FileItem[];
  onSelect: (file: FileItem) => void;
  searchPlaceholder?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * AttachmentPicker displays a searchable list of files and returns the selected file
 * via the onSelect callback. It's a generic component that can work with any file data.
 */
export function AttachmentPicker({
  files,
  onSelect,
  searchPlaceholder = "Search files…",
  className = "",
  loading = false,
  emptyMessage = "No files found"
}: AttachmentPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter((file) => 
    !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Input
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            {emptyMessage}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <button
              key={file.id}
              className="w-full text-left border border-border rounded-lg p-3 hover:bg-bg-elev-1 hover:border-theme transition-colors"
              onClick={() => onSelect(file)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-text truncate">
                  {file.name}
                </span>
                <span className="text-xs text-text-muted bg-bg-elev-2 px-2 py-1 rounded">
                  {file.type}
                </span>
              </div>
              <div className="text-xs text-text-muted mt-1 truncate">
                {file.url}
              </div>
              {file.size && (
                <div className="text-xs text-text-muted mt-1">
                  {formatFileSize(file.size)}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}