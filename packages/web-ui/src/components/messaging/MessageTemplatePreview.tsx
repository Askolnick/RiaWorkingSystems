import React from 'react';
import { Card } from '../atoms/Card';

interface MessageTemplatePreviewProps {
  template?: any;
  variables?: Record<string, string>;
}

export default function MessageTemplatePreview({ 
  template,
  variables = {}
}: MessageTemplatePreviewProps) {
  const replaceVariables = (text: string) => {
    if (!text) return '';
    
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  if (!template) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          No template selected
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <div className="p-3 bg-gray-50 rounded border">
              {replaceVariables(template.subject) || '(no subject)'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <div className="p-3 bg-gray-50 rounded border min-h-[200px] whitespace-pre-wrap">
              {replaceVariables(template.body) || '(no content)'}
            </div>
          </div>

          {Object.keys(variables).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables Used
              </label>
              <div className="space-y-1">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                      {`{{${key}}}`}
                    </span>
                    <span className="mx-2">→</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}