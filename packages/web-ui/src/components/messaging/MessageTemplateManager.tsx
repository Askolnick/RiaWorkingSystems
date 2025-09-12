import React from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface MessageTemplateManagerProps {
  templates?: any[];
  onEdit?: (template: any) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
}

export default function MessageTemplateManager({ 
  templates = [],
  onEdit,
  onDelete,
  onCreate
}: MessageTemplateManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Message Templates</h2>
        <Button onClick={onCreate} variant="primary">
          Create Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onEdit?.(template)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => onDelete?.(template.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <div className="p-8 text-center text-gray-500">
              No templates created yet.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}