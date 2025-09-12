'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, Video, Music, Archive, FileText } from 'lucide-react';

export interface FileUploadItem {
  file: File;
  id: string;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: FileUploadItem[]) => void;
  onFileRemove: (fileId: string) => void;
  files: FileUploadItem[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'video/*', 
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  '.zip',
  '.rar',
  '.tar',
  '.gz'
];

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  files,
  maxFiles = 10,
  maxFileSize = 25, // 25MB default
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const createFileItem = useCallback((file: File): FileUploadItem => {
    const id = `${file.name}-${Date.now()}-${Math.random()}`;
    const item: FileUploadItem = {
      file,
      id,
      status: 'pending',
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedFiles = files.map(f => 
          f.id === id ? { ...f, preview: e.target?.result as string } : f
        );
        onFilesSelected(updatedFiles);
      };
      reader.readAsDataURL(file);
    }

    return item;
  }, [files, onFilesSelected]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return 'File type not supported';
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const handleFiles = useCallback((newFiles: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(newFiles);
    const validFiles: FileUploadItem[] = [];
    const errors: string[] = [];

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(createFileItem(file));
      }
    });

    if (validFiles.length > 0) {
      onFilesSelected([...files, ...validFiles]);
    }

    if (errors.length > 0) {
      // In a real app, you'd show these errors to the user
      console.warn('File upload errors:', errors);
    }
  }, [disabled, files, maxFiles, validateFile, createFileItem, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  }, [handleFiles]);

  const getFileIcon = (file: File) => {
    const type = file.type;
    
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
      return <Archive className="h-4 w-4" />;
    }
    
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024) * 10) / 10} MB`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Drop files here or click to select
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, {maxFileSize}MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
            >
              {/* File Preview/Icon */}
              <div className="flex-shrink-0">
                {fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt=""
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                    {getFileIcon(fileItem.file)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileItem.file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                  
                  {/* Status */}
                  {fileItem.status === 'uploading' && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${fileItem.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-blue-600">
                        {fileItem.progress || 0}%
                      </span>
                    </div>
                  )}
                  
                  {fileItem.status === 'completed' && (
                    <span className="text-xs text-green-600">Uploaded</span>
                  )}
                  
                  {fileItem.status === 'error' && (
                    <span className="text-xs text-red-600">
                      {fileItem.error || 'Upload failed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(fileItem.id);
                }}
                disabled={disabled}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}