'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';

// Import types
import { WikiSection, SectionType } from './SectionEditor';

interface SectionViewerProps {
  section: WikiSection;
  showMetadata?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  className?: string;
  compact?: boolean;
}

interface CalloutProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
}

function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const iconMap = {
    info: '🛈',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <div className={`border-l-4 p-4 rounded-r ${styles[type]}`}>
      <div className="flex items-start">
        <span className="mr-2 text-lg">{iconMap[type]}</span>
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

function renderSectionContent(section: WikiSection) {
  const { content, type } = section;

  switch (type) {
    case SectionType.text:
      return (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{content?.content || ''}</div>
        </div>
      );

    case SectionType.code:
      return (
        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
          {content?.language && (
            <div className="text-xs text-gray-500 mb-2 uppercase font-medium">
              {content.language}
            </div>
          )}
          <pre className="text-sm">
            <code>{content?.content || ''}</code>
          </pre>
        </div>
      );

    case SectionType.checklist:
      return (
        <div className="space-y-2">
          {content?.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                checked={item.completed}
                readOnly
                className="pointer-events-none"
              />
              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                {item.text}
              </span>
            </div>
          )) || <div className="text-gray-500">No items</div>}
        </div>
      );

    case SectionType.callout:
      return (
        <Callout 
          type={content?.calloutType || 'info'} 
          title={content?.title}
        >
          {content?.content || ''}
        </Callout>
      );

    case SectionType.quote:
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
          {content?.content || ''}
          {content?.author && (
            <footer className="mt-2 text-sm text-gray-500">
              — {content.author}
            </footer>
          )}
        </blockquote>
      );

    case SectionType.table:
      if (!content?.headers || !content?.rows) {
        return <div className="text-gray-500">No table data</div>;
      }
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {content.headers.map((header: string, index: number) => (
                  <th key={index} className="border border-gray-300 px-4 py-2 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case SectionType.image:
      return (
        <div className="text-center">
          {content?.url ? (
            <img 
              src={content.url} 
              alt={content?.caption || section.title}
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
              No image URL provided
            </div>
          )}
          {content?.caption && (
            <p className="mt-2 text-sm text-gray-600">{content.caption}</p>
          )}
        </div>
      );

    case SectionType.video:
      return (
        <div className="text-center">
          {content?.url ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">
                Video: {content.url}
                <br />
                <span className="text-xs">(Video player would be implemented here)</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
              No video URL provided
            </div>
          )}
          {content?.caption && (
            <p className="mt-2 text-sm text-gray-600">{content.caption}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 rounded p-4">
          <div className="text-xs text-gray-500 mb-2">Raw Content:</div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
  }
}

export function SectionViewer({
  section,
  showMetadata = true,
  showActions = true,
  onEdit,
  onDelete,
  onClone,
  className = '',
  compact = false
}: SectionViewerProps) {
  const getSectionTypeColor = (type: SectionType) => {
    const colors = {
      text: 'blue',
      code: 'purple',
      image: 'green',
      video: 'red',
      table: 'yellow',
      chart: 'indigo',
      checklist: 'pink',
      callout: 'orange',
      quote: 'gray',
      template: 'cyan'
    };
    return colors[type] || 'gray';
  };

  return (
    <Card className={className} padding={compact ? 'sm' : 'md'}>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle as={compact ? 'h4' : 'h3'} className={compact ? 'text-base' : undefined}>
              {section.title}
            </CardTitle>
            {section.description && !compact && (
              <p className="text-sm text-gray-500 mt-1">
                {section.description}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-1 ml-4">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onClone && (
                <Button variant="ghost" size="sm" onClick={onClone}>
                  Clone
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {showMetadata && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <Badge variant={getSectionTypeColor(section.type) as any} size="sm">
              {section.type}
            </Badge>
            <Badge variant={section.status === 'published' ? 'green' : 'gray'} size="sm">
              {section.status}
            </Badge>
            {section.isTemplate && (
              <Badge variant="purple" size="sm">
                Template
              </Badge>
            )}
            {section.isPublic && (
              <Badge variant="green" size="sm">
                Public
              </Badge>
            )}
            {section.isGlobal && (
              <Badge variant="cyan" size="sm">
                Global
              </Badge>
            )}
          </div>
        )}

        {showMetadata && section.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mt-2">
            {section.tags.map(tag => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : undefined}>
        {renderSectionContent(section)}
        
        {showMetadata && !compact && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>Version {section.version}</span>
              <span>Updated {new Date(section.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}