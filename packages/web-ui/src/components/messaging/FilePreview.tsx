'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Modal } from '../molecules/Modal';
import { MessageAttachment } from './MessageAttachments';

interface FilePreviewProps {
  attachment: MessageAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (attachment: MessageAttachment) => void;
}

export function FilePreview({
  attachment,
  isOpen,
  onClose,
  onDownload,
}: FilePreviewProps) {
  if (!attachment) return null;

  const isImage = attachment.mimeType.startsWith('image/');
  const isVideo = attachment.mimeType.startsWith('video/');
  const isAudio = attachment.mimeType.startsWith('audio/');
  const isPdf = attachment.mimeType === 'application/pdf';
  const isText = attachment.mimeType.startsWith('text/');

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          className="max-w-full max-h-[70vh] mx-auto"
          preload="metadata"
        >
          <source src={attachment.fileUrl} type={attachment.mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center space-y-4 py-8">
          <div className="text-6xl">🎵</div>
          <audio controls className="w-full max-w-md">
            <source src={attachment.fileUrl} type={attachment.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={attachment.fileUrl}
          className="w-full h-[70vh] border-0"
          title={attachment.fileName}
        />
      );
    }

    if (isText) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600 mb-4">
            Text file preview not available
          </p>
          <button
            onClick={() => window.open(attachment.fileUrl, '_blank')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </button>
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📎</div>
        <p className="text-gray-600 mb-2">
          Preview not available for this file type
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {attachment.fileName}
        </p>
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024) * 10) / 10} MB`;
  };

  const footer = (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        <p className="font-medium">{attachment.fileName}</p>
        <p className="text-xs">
          {formatFileSize(attachment.fileSize)} • 
          {new Date(attachment.uploadedAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onDownload && (
          <button
            onClick={() => onDownload(attachment)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
        
        <button
          onClick={() => window.open(attachment.fileUrl, '_blank')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="File Preview"
      size="xl"
      footer={footer}
      className="max-h-[90vh]"
    >
      <div className="flex items-center justify-center min-h-[300px]">
        {renderPreview()}
      </div>
    </Modal>
  );
}