'use client';

import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Alert,
  ErrorBoundary
} from '@ria/web-ui';
import { 
  Settings,
  Shield,
  Bell,
  Tag,
  FileText,
  Save,
  Key,
  Upload,
  Download
} from 'lucide-react';

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState({
    signature: '',
    autoReply: false,
    autoReplyMessage: '',
    notifications: {
      desktop: true,
      sound: false,
      newMessage: true,
      mentions: true
    },
    encryption: {
      enabled: false,
      publicKey: '',
      privateKey: ''
    },
    filters: [],
    labels: []
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'encryption', label: 'Encryption', icon: Shield },
    { id: 'filters', label: 'Filters & Labels', icon: Tag },
    { id: 'templates', label: 'Templates', icon: FileText }
  ];

  return (
    <ErrorBoundary>
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Email Settings</h1>
            <p className="text-gray-600">Configure your email preferences</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {saved && (
          <Alert type="success" className="mb-4">
            Settings saved successfully!
          </Alert>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Signature</label>
                    <textarea
                      value={settings.signature}
                      onChange={(e) => setSettings({ ...settings, signature: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md h-32 resize-none"
                      placeholder="Your email signature..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="autoReply"
                        checked={settings.autoReply}
                        onChange={(e) => setSettings({ ...settings, autoReply: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="autoReply" className="text-sm font-medium">
                        Enable Auto-Reply
                      </label>
                    </div>
                    {settings.autoReply && (
                      <textarea
                        value={settings.autoReplyMessage}
                        onChange={(e) => setSettings({ ...settings, autoReplyMessage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md h-24 resize-none"
                        placeholder="Auto-reply message..."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Desktop Notifications</p>
                      <p className="text-sm text-gray-600">Show notifications for new emails</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.desktop}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, desktop: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound Notifications</p>
                      <p className="text-sm text-gray-600">Play sound for new emails</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.sound}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sound: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Message Alerts</p>
                      <p className="text-sm text-gray-600">Notify for all new messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.newMessage}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newMessage: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mention Alerts</p>
                      <p className="text-sm text-gray-600">Notify when mentioned in emails</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.mentions}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, mentions: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'encryption' && (
              <Card>
                <CardHeader>
                  <CardTitle>Encryption Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="encryptionEnabled"
                      checked={settings.encryption.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        encryption: { ...settings.encryption, enabled: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <label htmlFor="encryptionEnabled" className="text-sm font-medium">
                      Enable OpenPGP Encryption
                    </label>
                  </div>

                  {settings.encryption.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Public Key</label>
                        <div className="space-y-2">
                          <textarea
                            value={settings.encryption.publicKey}
                            onChange={(e) => setSettings({
                              ...settings,
                              encryption: { ...settings.encryption, publicKey: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-md h-32 resize-none font-mono text-xs"
                            placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Import Key
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export Key
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Private Key</label>
                        <div className="space-y-2">
                          <textarea
                            value={settings.encryption.privateKey}
                            onChange={(e) => setSettings({
                              ...settings,
                              encryption: { ...settings.encryption, privateKey: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-md h-32 resize-none font-mono text-xs"
                            placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Key className="h-4 w-4 mr-2" />
                              Generate New Keys
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'filters' && (
              <Card>
                <CardHeader>
                  <CardTitle>Filters & Labels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No filters configured yet</p>
                    <Button>Create Filter</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'templates' && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No templates created yet</p>
                    <Button>Create Template</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}