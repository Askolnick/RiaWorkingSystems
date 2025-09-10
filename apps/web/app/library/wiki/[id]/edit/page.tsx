"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LibraryTabs from '../../../_components/LibraryTabs';
import { useLibraryStore, useUIStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  Alert,
  Skeleton,
  ErrorBoundary,
  Badge
} from '@ria/web-ui';

export default function WikiDocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  
  // Store hooks
  const {
    currentDocument,
    documentsLoading,
    documentsError,
    fetchDocument,
    updateDocument,
  } = useLibraryStore();
  
  const {
    showNotification,
  } = useUIStore();
  
  // Local state for form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'review' | 'published'>('draft');
  const [kind, setKind] = useState<'wiki' | 'spec' | 'policy' | 'howto' | 'memo' | 'brief'>('wiki');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch document on mount
  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string);
    }
  }, [params.id, fetchDocument]);
  
  // Initialize form when document loads
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setSummary(currentDocument.summary || '');
      setContent(currentDocument.bodyMd || '');
      setStatus(currentDocument.status as any);
      setKind(currentDocument.kind as any);
      setTags(currentDocument.tags || []);
    }
  }, [currentDocument]);

  const handleSave = async () => {
    if (!currentDocument) return;
    
    setSaving(true);
    try {
      await updateDocument(currentDocument.id, {
        title,
        summary,
        bodyMd: content,
        status,
        kind,
        tags
      });
      
      showNotification({
        type: 'success',
        title: 'Document saved',
        message: 'Your changes have been saved successfully.',
      });
      
      router.push(`/library/wiki/${currentDocument.id}`);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to save document',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + selectedText + after;
    
    setContent(
      content.substring(0, start) + replacement + content.substring(end)
    );
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
      textarea.focus();
    }, 0);
  };

  // Render markdown preview
  const renderMarkdown = (text: string) => {
    return text.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold mb-4">{paragraph.slice(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-semibold mb-3">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-medium mb-2">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').map((item, i) => (
          <li key={i}>{item.slice(2)}</li>
        ));
        return <ul key={idx} className="list-disc list-inside mb-4">{items}</ul>;
      }
      return <p key={idx} className="mb-4">{paragraph}</p>;
    });
  };
  
  if (documentsError) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
          <LibraryTabs />
          <div className="mt-6">
            <Alert type="error">
              {documentsError}
            </Alert>
            <Button
              onClick={() => router.push('/library/wiki')}
              variant="ghost"
              className="mt-4"
            >
              ← Back to Wiki
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  if (documentsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        <div className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton variant="text" width="60%" height={32} className="mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton variant="text" width="100%" height={200} className="mb-4" />
              <Skeleton variant="text" width="100%" height={400} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!currentDocument) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
          <LibraryTabs />
          <div className="mt-6">
            <Alert type="warning">
              Document not found
            </Alert>
            <Button
              onClick={() => router.push('/library/wiki')}
              variant="ghost"
              className="mt-4"
            >
              ← Back to Wiki
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Library - Wiki</h1>
        <LibraryTabs />
        
        <div className="mt-6">
          {/* Editor Header */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Edit Document</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="secondary"
                    size="sm"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                  <Button
                    onClick={() => router.push(`/library/wiki/${params.id}`)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    variant="primary"
                    size="sm"
                    loading={saving}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {/* Title */}
                  <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title..."
                    fullWidth
                    className="mb-4"
                  />

                  {/* Summary */}
                  <Input
                    label="Summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief description..."
                    fullWidth
                    className="mb-4"
                  />

                  {/* Content Editor */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Content (Markdown)
                      </label>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => insertMarkdown('**', '**')}
                          variant="ghost"
                          size="sm"
                          title="Bold"
                        >
                          B
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('*', '*')}
                          variant="ghost"
                          size="sm"
                          title="Italic"
                        >
                          I
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('# ')}
                          variant="ghost"
                          size="sm"
                          title="Heading"
                        >
                          H1
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('## ')}
                          variant="ghost"
                          size="sm"
                          title="Subheading"
                        >
                          H2
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('- ')}
                          variant="ghost"
                          size="sm"
                          title="List"
                        >
                          •
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('[', '](url)')}
                          variant="ghost"
                          size="sm"
                          title="Link"
                        >
                          🔗
                        </Button>
                        <Button
                          onClick={() => insertMarkdown('`', '`')}
                          variant="ghost"
                          size="sm"
                          title="Code"
                        >
                          {'</>'}
                        </Button>
                      </div>
                    </div>
                    
                    {showPreview ? (
                      <div className="border rounded p-4 min-h-[400px] bg-gray-50">
                        <div className="prose max-w-none">
                          {renderMarkdown(content)}
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="font-mono text-sm"
                        rows={20}
                        placeholder="Start writing in Markdown..."
                        fullWidth
                      />
                    )}
                  </div>

                  {/* Cross-Reference Helper */}
                  <Alert type="info" className="mt-4">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Tip:</strong> Reference other documents using [[Document Title]] syntax
                      </p>
                      <p className="text-sm">
                        <strong>Include sections:</strong> Use ::include{'{'}slug="section-name"{'}'} to include reusable sections
                      </p>
                    </div>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Document Settings */}
              <Card>
                <CardHeader>
                  <CardTitle as="h3">Document Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Status */}
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    fullWidth
                    className="mb-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Under Review</option>
                    <option value="published">Published</option>
                  </Select>

                  {/* Kind */}
                  <Select
                    label="Document Type"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as any)}
                    fullWidth
                    className="mb-3"
                  >
                    <option value="wiki">Wiki</option>
                    <option value="spec">Specification</option>
                    <option value="policy">Policy</option>
                    <option value="howto">How-To Guide</option>
                    <option value="memo">Memo</option>
                    <option value="brief">Brief</option>
                  </Select>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          onRemove={() => handleRemoveTag(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag..."
                        size="sm"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddTag}
                        variant="primary"
                        size="sm"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Markdown Guide */}
              <Card>
                <CardHeader>
                  <CardTitle as="h3">Markdown Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded"># Heading 1</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">## Heading 2</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">**bold text**</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">*italic text*</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">- List item</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">1. Numbered item</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">[Link text](url)</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">`inline code`</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">```code block```</code></div>
                    <div><code className="bg-gray-100 px-1 py-0.5 rounded">[[Wiki Link]]</code></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}