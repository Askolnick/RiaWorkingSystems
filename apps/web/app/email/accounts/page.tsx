'use client';

import React, { useEffect, useState } from 'react';
import { useEmailStore } from '@ria/client';
import { 
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Modal
} from '@ria/web-ui';
import { 
  Mail, 
  Plus, 
  Edit2, 
  Trash2,
  Check,
  X,
  Shield,
  Server
} from 'lucide-react';

interface AccountFormData {
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'custom';
  settings: {
    imapHost?: string;
    imapPort?: number;
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
  };
  isDefault?: boolean;
}

export default function EmailAccountsPage() {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    clearError
  } = useEmailStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    email: '',
    provider: 'gmail',
    settings: {},
    isDefault: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingAccount) {
        await updateAccount(editingAccount, formData);
        setEditingAccount(null);
      } else {
        await addAccount(formData);
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save account:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: any) => {
    setFormData({
      name: account.name,
      email: account.email,
      provider: account.provider,
      settings: account.settings || {},
      isDefault: account.isDefault
    });
    setEditingAccount(account.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this email account?')) {
      await deleteAccount(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      provider: 'gmail',
      settings: {},
      isDefault: false
    });
    setEditingAccount(null);
  };

  const getProviderDefaults = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return {
          imapHost: 'imap.gmail.com',
          imapPort: 993,
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587
        };
      case 'outlook':
        return {
          imapHost: 'outlook.office365.com',
          imapPort: 993,
          smtpHost: 'smtp.office365.com',
          smtpPort: 587
        };
      default:
        return {};
    }
  };

  if (loading && accounts.length === 0) {
    return <LoadingCard />;
  }

  return (
    <ErrorBoundary>
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Email Accounts</h1>
            <p className="text-gray-600">Manage your email accounts and settings</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        {error && (
          <Alert type="error" onClose={clearError} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Accounts list */}
        <div className="grid gap-4">
          {accounts.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No email accounts</h3>
              <p className="text-gray-600 mb-4">Add your first email account to start managing emails</p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Account
              </Button>
            </Card>
          ) : (
            accounts.map(account => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.name}</h3>
                          {account.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Provider: {account.provider}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Account Modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title={editingAccount ? 'Edit Email Account' : 'Add Email Account'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Work Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => {
                  const provider = e.target.value as 'gmail' | 'outlook' | 'custom';
                  setFormData({ 
                    ...formData, 
                    provider,
                    settings: {
                      ...formData.settings,
                      ...getProviderDefaults(provider)
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="custom">Custom IMAP/SMTP</option>
              </select>
            </div>

            {formData.provider === 'custom' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">IMAP Host</label>
                    <Input
                      type="text"
                      value={formData.settings.imapHost || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, imapHost: e.target.value }
                      })}
                      placeholder="imap.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IMAP Port</label>
                    <Input
                      type="number"
                      value={formData.settings.imapPort || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, imapPort: parseInt(e.target.value) }
                      })}
                      placeholder="993"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                    <Input
                      type="text"
                      value={formData.settings.smtpHost || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, smtpHost: e.target.value }
                      })}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                    <Input
                      type="number"
                      value={formData.settings.smtpPort || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, smtpPort: parseInt(e.target.value) }
                      })}
                      placeholder="587"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                type="text"
                value={formData.settings.username || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, username: e.target.value }
                })}
                placeholder="Usually your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={formData.settings.password || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, password: e.target.value }
                })}
                placeholder="Your email password or app password"
              />
              {formData.provider === 'gmail' && (
                <p className="text-xs text-gray-500 mt-1">
                  For Gmail, use an app-specific password. Enable 2FA and generate one at myaccount.google.com
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm">
                Set as default account
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingAccount ? 'Update Account' : 'Add Account')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}