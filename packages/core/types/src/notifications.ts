import type { NotificationPayload } from './types';

export interface PushNotificationConfig {
  vapidPublicKey: string;
  serviceWorkerPath?: string;
  showBadge?: boolean;
  enableSound?: boolean;
}

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: PushNotificationConfig;
  private permission: NotificationPermission = 'default';

  constructor(config: PushNotificationConfig) {
    this.config = config;
    this.init();
  }

  private async init() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
      await this.registerServiceWorker();
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const swPath = this.config.serviceWorkerPath || '/sw.js';
        this.registration = await navigator.serviceWorker.register(swPath);
        console.log('SW registered:', this.registration);
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }

    return this.permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe to push notifications
      const appServerKey = this.urlB64ToUint8Array(this.config.vapidPublicKey);
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        return await subscription.unsubscribe();
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notifications not permitted');
      return;
    }

    // Don't show notification if page is focused (user is already active)
    if (!document.hidden) {
      return;
    }

    const options: NotificationOptions & { actions?: any[]; timestamp?: number } = {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: this.config.showBadge ? '/icons/badge-72.png' : undefined,
      data: {
        threadId: payload.threadId,
        messageId: payload.messageId,
        userId: payload.userId,
        action: payload.action,
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply',
        },
        {
          action: 'mark_read',
          title: 'Mark as Read',
        },
      ],
      requireInteraction: false,
      silent: !this.config.enableSound,
      timestamp: new Date(payload.timestamp).getTime(),
    };

    if (this.registration) {
      await this.registration.showNotification(payload.title, options);
    } else if ('Notification' in window) {
      new Notification(payload.title, options);
    }
  }

  // Browser notification (fallback)
  showBrowserNotification(title: string, body: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') {
      return;
    }

    // Don't show if page is focused
    if (!document.hidden) {
      return;
    }

    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      ...options,
    });
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return this.isSupported() && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Update badge count (for PWA)
  async updateBadge(count: number): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (error) {
        console.warn('Failed to update app badge:', error);
      }
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }

  // Clear notifications for specific thread
  async clearThreadNotifications(threadId: string): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications
        .filter(notification => notification.data?.threadId === threadId)
        .forEach(notification => notification.close());
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Singleton instance
let notificationManager: PushNotificationManager | null = null;

export function getNotificationManager(config?: PushNotificationConfig): PushNotificationManager {
  if (!notificationManager && config) {
    notificationManager = new PushNotificationManager(config);
  }
  
  if (!notificationManager) {
    throw new Error('Notification manager not initialized. Please provide config first.');
  }
  
  return notificationManager;
}

export function createNotificationManager(config: PushNotificationConfig): PushNotificationManager {
  return new PushNotificationManager(config);
}

// React hook for notifications
export function useNotifications(config?: PushNotificationConfig) {
  const manager = config ? getNotificationManager(config) : getNotificationManager();
  
  return {
    manager,
    requestPermission: () => manager.requestPermission(),
    subscribeToPush: () => manager.subscribeToPush(),
    unsubscribeFromPush: () => manager.unsubscribeFromPush(),
    showNotification: (payload: NotificationPayload) => manager.showNotification(payload),
    showBrowserNotification: (title: string, body: string, options?: NotificationOptions) => 
      manager.showBrowserNotification(title, body, options),
    updateBadge: (count: number) => manager.updateBadge(count),
    clearAllNotifications: () => manager.clearAllNotifications(),
    clearThreadNotifications: (threadId: string) => manager.clearThreadNotifications(threadId),
    isSupported: () => manager.isSupported(),
    isPushSupported: () => manager.isPushSupported(),
    getPermission: () => manager.getPermission(),
  };
}