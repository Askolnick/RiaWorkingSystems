'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Modal } from '../molecules/Modal';
import { FileUpload, FileUploadItem } from '../messaging/FileUpload';
import { 
  Send, 
  Paperclip, 
  Shield, 
  ShieldCheck, 
  X, 
  Users, 
  Clock,
  Zap 
} from 'lucide-react';

export interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (draft: EmailDraft) => Promise<void>;
  replyTo?: EmailMessage | null;
  defaultTo?: Array<{ name?: string; email: string }>;
  defaultSubject?: string;
  enableEncryption?: boolean;
  enableScheduling?: boolean;
  enableTemplates?: boolean;
  className?: string;
}

export interface EmailDraft {
  to: Array<{ name?: string; email: string }>;
  cc?: Array<{ name?: string; email: string }>;
  bcc?: Array<{ name?: string; email: string }>;
  subject: string;
  html?: string;
  text?: string;
  attachments?: FileUploadItem[];
  encrypt?: boolean;
  sign?: boolean;
  priority?: 'low' | 'normal' | 'high';
  scheduleAt?: string;
  templateId?: string;
}

export interface EmailMessage {
  id: string;
  messageId: string;
  subject: string;
  from: Array<{ name?: string; email: string }>;
  html?: string;
  text?: string;
  date: string;
}

export function EmailComposer({
  isOpen,
  onClose,
  onSend,
  replyTo,
  defaultTo = [],
  defaultSubject = '',
  enableEncryption = false,
  enableScheduling = false,
  enableTemplates = false,
  className = '',
}: EmailComposerProps) {
  const [draft, setDraft] = useState<EmailDraft>({
    to: defaultTo,
    subject: defaultSubject,
    text: '',
    priority: 'normal',
  });
  
  const [attachments, setAttachments] = useState<FileUploadItem[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize draft when replyTo changes
  useEffect(() => {
    if (replyTo && isOpen) {
      setDraft(prev => ({
        ...prev,
        to: replyTo.from,
        subject: replyTo.subject?.startsWith('Re:') 
          ? replyTo.subject 
          : `Re: ${replyTo.subject}`,
        text: `\n\n--- Original Message ---\nFrom: ${replyTo.from[0]?.email}\nDate: ${new Date(replyTo.date).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.text || ''}`,
      }));
    }
  }, [replyTo, isOpen]);

  const handleSend = async () => {
    if (!draft.to.length || !draft.subject.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        ...draft,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      // Reset form
      setDraft({
        to: [],
        subject: '',
        text: '',
        priority: 'normal',
      });
      setAttachments([]);
      setShowCc(false);
      setShowBcc(false);
      setShowScheduling(false);
      setShowAdvanced(false);
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const updateRecipients = (field: 'to' | 'cc' | 'bcc', value: string) => {
    const emails = value.split(',').map(email => ({
      email: email.trim(),
    })).filter(addr => addr.email);
    
    setDraft(prev => ({
      ...prev,
      [field]: emails,
    }));
  };

  const priorityColors = {
    low: 'text-blue-600',
    normal: 'text-gray-600',
    high: 'text-red-600',
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Compose Email"
      size="xl"
      className={`max-h-[90vh] ${className}`}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium w-12">To:</label>
            <input
              type="text"
              value={draft.to.map(a => a.email).join(', ')}
              onChange={(e) => updateRecipients('to', e.target.value)}
              placeholder="Enter email addresses..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setShowCc(!showCc)}
                className={`text-sm px-2 py-1 rounded ${showCc ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc(!showBcc)}
                className={`text-sm px-2 py-1 rounded ${showBcc ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bcc
              </button>
            </div>
          </div>

          {showCc && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">Cc:</label>
              <input
                type="text"
                value={draft.cc?.map(a => a.email).join(', ') || ''}
                onChange={(e) => updateRecipients('cc', e.target.value)}
                placeholder="Carbon copy recipients..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">Bcc:</label>
              <input
                type="text"
                value={draft.bcc?.map(a => a.email).join(', ') || ''}
                onChange={(e) => updateRecipients('bcc', e.target.value)}
                placeholder="Blind carbon copy recipients..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-12">Subject:</label>
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => setDraft(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message body */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <textarea
            value={draft.text}
            onChange={(e) => setDraft(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Write your message..."
            className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <FileUpload
            files={attachments}
            onFilesSelected={setAttachments}
            onFileRemove={(fileId) => setAttachments(prev => prev.filter(f => f.id !== fileId))}
            maxFiles={10}
            maxFileSize={25}
            className="border-dashed"
          />
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <Card className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Advanced Options</h4>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={draft.priority}
                  onChange={(e) => setDraft(prev => ({ 
                    ...prev, 
                    priority: e.target.value as 'low' | 'normal' | 'high' 
                  }))}
                  className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Encryption */}
              {enableEncryption && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encrypt"
                    checked={draft.encrypt || false}
                    onChange={(e) => setDraft(prev => ({ ...prev, encrypt: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="encrypt" className="text-sm flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Encrypt message
                  </label>
                </div>
              )}

              {/* Signing */}
              {enableEncryption && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sign"
                    checked={draft.sign || false}
                    onChange={(e) => setDraft(prev => ({ ...prev, sign: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="sign" className="text-sm flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Sign message
                  </label>
                </div>
              )}

              {/* Scheduling */}
              {enableScheduling && (
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule Send</label>
                  <input
                    type="datetime-local"
                    value={draft.scheduleAt || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, scheduleAt: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              title="Advanced options"
            >
              <Zap className="h-4 w-4" />
            </button>

            {attachments.length > 0 && (
              <span className="text-sm text-gray-500">
                {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
              </span>
            )}

            {draft.priority !== 'normal' && (
              <span className={`text-sm ${priorityColors[draft.priority]}`}>
                {draft.priority} priority
              </span>
            )}

            {draft.encrypt && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Encrypted
              </span>
            )}

            {draft.scheduleAt && (
              <span className="text-sm text-blue-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Scheduled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!draft.to.length || !draft.subject.trim() || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}