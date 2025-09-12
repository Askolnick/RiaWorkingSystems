'use client';

import React from 'react';
import { Download, File, Image, Video, Music, Archive, FileText, Eye } from 'lucide-react';

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  onDownload?: (attachment: MessageAttachment) => void;
  onPreview?: (attachment: MessageAttachment) => void;
  className?: string;
}

export function MessageAttachments({
  attachments,
  onDownload,
  onPreview,
  className = '',
}: MessageAttachmentsProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
      return <Archive className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024) * 10) / 10} MB`;
  };

  const canPreview = (mimeType: string): boolean => {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('video/') || 
           mimeType.startsWith('audio/') ||
           mimeType === 'application/pdf' ||
           mimeType.startsWith('text/');
  };

  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith('image/');
        const canShowPreview = canPreview(attachment.mimeType);
        const extension = getFileExtension(attachment.fileName);

        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
          >
            {/* Thumbnail or Icon */}
            <div className="flex-shrink-0">
              {isImage ? (
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="h-12 w-12 object-cover rounded cursor-pointer"
                  onClick={() => onPreview?.(attachment)}
                />
              ) : (
                <div className="h-12 w-12 bg-white rounded border flex items-center justify-center">
                  {getFileIcon(attachment.mimeType)}
                  {extension && (
                    <span className="absolute -bottom-1 -right-1 text-xs bg-gray-200 px-1 rounded text-gray-600">
                      {extension}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.fileName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(attachment.fileSize)}</span>
                <span>•</span>
                <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {canShowPreview && onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(attachment)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              <button
                type="button"
                onClick={() => onDownload?.(attachment)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Component for inline image gallery
interface ImageGalleryProps {
  images: MessageAttachment[];
  onImageClick?: (attachment: MessageAttachment) => void;
  className?: string;
}

export function MessageImageGallery({
  images,
  onImageClick,
  className = '',
}: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className={`grid gap-2 ${className}`}>
      {images.length === 1 ? (
        <img
          src={images[0].fileUrl}
          alt={images[0].fileName}
          className="max-w-sm max-h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick?.(images[0])}
        />
      ) : images.length === 2 ? (
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {images.map((image) => (
            <img
              key={image.id}
              src={image.fileUrl}
              alt={image.fileName}
              className="h-32 w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick?.(image)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {images.slice(0, 3).map((image, index) => (
            <div
              key={image.id}
              className={`relative ${index === 0 ? 'row-span-2' : ''}`}
            >
              <img
                src={image.fileUrl}
                alt={image.fileName}
                className="h-full w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(image)}
              />
              {index === 2 && images.length > 3 && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer"
                  onClick={() => onImageClick?.(image)}
                >
                  <span className="text-white font-semibold">
                    +{images.length - 3}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}