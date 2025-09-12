import React from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import Select from '../atoms/Select';

interface MessagingSettingsProps {
  settings?: any;
  onSave?: (settings: any) => void;
}

export default function MessagingSettings({ settings = {}, onSave }: MessagingSettingsProps) {
  const [formData, setFormData] = React.useState({
    emailSignature: settings.emailSignature || '',
    autoReply: settings.autoReply || false,
    notifications: settings.notifications || true,
    theme: settings.theme || 'default',
    ...settings
  });

  const handleSave = () => {
    onSave?.(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <Input
              label="Email Signature"
              value={formData.emailSignature}
              onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
              placeholder="Your email signature..."
              fullWidth
            />
            <Select
              label="Theme"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              fullWidth
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="compact">Compact</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                className="mr-2"
              />
              Enable email notifications
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoReply}
                onChange={(e) => setFormData({ ...formData, autoReply: e.target.checked })}
                className="mr-2"
              />
              Enable auto-reply
            </label>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} variant="primary">
        Save Settings
      </Button>
    </div>
  );
}