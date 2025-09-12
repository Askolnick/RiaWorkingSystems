'use client';

import { useState } from 'react';
import { MessagingSettings, type MessagingSettings as MessagingSettingsType } from '@ria/web-ui';

export default function MessagingSettingsPage() {
  // Mock settings data - in real implementation, this would come from a store/API
  const [settings, setSettings] = useState<MessagingSettingsType>({
    channels: [
      {
        id: 'email-1',
        name: 'Primary Email',
        type: 'email',
        status: 'active',
        provider: 'SendGrid',
        configuration: {
          apiKey: '***hidden***',
          fromEmail: 'noreply@ria.com',
          fromName: 'Ria Living Systems'
        },
        createdAt: '2024-01-15T10:00:00Z',
        lastUsed: '2024-01-20T15:30:00Z',
        messagesSent: 12458,
        deliveryRate: 98.7
      },
      {
        id: 'sms-1',
        name: 'SMS Notifications',
        type: 'sms',
        status: 'active',
        provider: 'Twilio',
        configuration: {
          accountSid: '***hidden***',
          authToken: '***hidden***',
          phoneNumber: '+1234567890'
        },
        createdAt: '2024-01-10T08:00:00Z',
        lastUsed: '2024-01-19T12:15:00Z',
        messagesSent: 3247,
        deliveryRate: 97.2
      },
      {
        id: 'push-1',
        name: 'Mobile Push',
        type: 'push',
        status: 'inactive',
        provider: 'Firebase',
        configuration: {
          serverKey: '***hidden***',
          projectId: 'ria-mobile-app'
        },
        createdAt: '2024-01-12T14:00:00Z',
        messagesSent: 856,
        deliveryRate: 94.3
      }
    ],
    preferences: {
      id: 'pref-1',
      userId: 'user-1',
      email: {
        enabled: true,
        taskAssignments: true,
        dueDateReminders: true,
        projectUpdates: false,
        systemAlerts: true,
        weeklyDigest: true
      },
      push: {
        enabled: true,
        taskAssignments: true,
        dueDateReminders: true,
        projectUpdates: false,
        systemAlerts: true
      },
      sms: {
        enabled: false,
        urgentOnly: true,
        systemAlerts: false
      },
      inApp: {
        enabled: true,
        showDesktopNotifications: true,
        playSound: false
      }
    },
    templates: {
      defaultLanguage: 'en',
      autoTranslation: false,
      customSignature: 'Best regards,\nRia Living Systems Team'
    },
    delivery: {
      retryAttempts: 3,
      retryDelay: 5,
      timeoutMinutes: 10,
      enableDeliveryTracking: true
    },
    security: {
      requireEncryption: true,
      enableAuditLog: true,
      allowExternalChannels: true,
      rateLimiting: {
        enabled: true,
        perMinute: 10,
        perHour: 100
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSettings = async (updates: Partial<MessagingSettingsType>) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        ...updates
      }));
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate test message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert('Test message sent successfully!');
    } catch (err) {
      setError('Failed to send test message');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (channelData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newChannel = {
        ...channelData,
        id: `channel-${Date.now()}`,
        createdAt: new Date().toISOString(),
        messagesSent: 0,
        deliveryRate: 0
      };

      setSettings(prev => ({
        ...prev,
        channels: [...prev.channels, newChannel]
      }));
    } catch (err) {
      setError('Failed to add channel');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChannel = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        channels: prev.channels.map(channel =>
          channel.id === id ? { ...channel, ...updates } : channel
        )
      }));
    } catch (err) {
      setError('Failed to update channel');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        channels: prev.channels.filter(channel => channel.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MessagingSettings
        settings={settings}
        loading={loading}
        error={error}
        onUpdateSettings={handleUpdateSettings}
        onTestChannel={handleTestChannel}
        onAddChannel={handleAddChannel}
        onUpdateChannel={handleUpdateChannel}
        onDeleteChannel={handleDeleteChannel}
      />
    </div>
  );
}