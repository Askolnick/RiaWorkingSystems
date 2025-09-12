import React from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input, Textarea } from '../atoms/Input';
import { Select } from '../atoms/Select';

interface MessageTemplateFormProps {
  template?: any;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

export default function MessageTemplateForm({ 
  template,
  onSave,
  onCancel
}: MessageTemplateFormProps) {
  const [formData, setFormData] = React.useState({
    name: template?.name || '',
    description: template?.description || '',
    subject: template?.subject || '',
    body: template?.body || '',
    type: template?.type || 'email',
    category: template?.category || 'general',
    ...template
  });

  const handleSave = () => {
    onSave?.(formData);
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            {template ? 'Edit Template' : 'Create Template'}
          </h3>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Template
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Template name..."
              fullWidth
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="notification">Notification</option>
            </Select>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description..."
            fullWidth
          />

          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Message subject..."
            fullWidth
          />

          <Textarea
            label="Message Body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Template content..."
            rows={8}
            fullWidth
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            fullWidth
          >
            <option value="general">General</option>
            <option value="marketing">Marketing</option>
            <option value="support">Support</option>
            <option value="billing">Billing</option>
          </Select>
        </div>
      </div>
    </Card>
  );
}