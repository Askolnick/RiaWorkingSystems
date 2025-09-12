'use client';

import { useState } from 'react';
import { Button } from '../atoms/Button';
import { FileUpload, FileUploadItem } from './FileUpload';
import { Paperclip, X } from 'lucide-react';

interface ComposerProps {
  onSend?: (data: { 
    bodyText: string; 
    as?: 'email' | 'chat';
    attachments?: FileUploadItem[];
  }) => void;
  placeholder?: string;
  enableAttachments?: boolean;
  maxAttachments?: number;
  maxFileSize?: number;
}

export function Composer({ 
  onSend, 
  placeholder = "Type your message...",
  enableAttachments = true,
  maxAttachments = 5,
  maxFileSize = 25
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileUploadItem[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend?.({ 
        bodyText: message, 
        as: 'chat',
        attachments: attachments.length > 0 ? attachments : undefined
      });
      setMessage('');
      setAttachments([]);
      setShowAttachments(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (files: FileUploadItem[]) => {
    setAttachments(files);
    if (files.length > 0 && !showAttachments) {
      setShowAttachments(true);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };

  const hasContent = message.trim() || attachments.length > 0;

  return (
    <div className="border rounded-lg bg-white">
      {/* File Upload Section */}
      {showAttachments && enableAttachments && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Attachments</h4>
            <button
              type="button"
              onClick={() => setShowAttachments(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <FileUpload
            files={attachments}
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            maxFiles={maxAttachments}
            maxFileSize={maxFileSize}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={showAttachments ? 2 : 3}
        />
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {enableAttachments && (
              <button
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={`p-2 rounded-md transition-colors ${
                  showAttachments || attachments.length > 0
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}
            
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!hasContent}
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}