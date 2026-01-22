import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { WalletKit, WalletKitTypes } from '@reown/walletkit';

export interface NotificationPreferences {
  email?: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  web3Enabled: boolean;
  eventTypes: {
    deposits: boolean;
    withdrawals: boolean;
    vaultCreated: boolean;
    vaultUpdated: boolean;
    rewards: boolean;
    maturity: boolean;
    priceAlerts: boolean;
    largeTransactions: boolean;
    multisig: boolean;
    session: boolean;
  };
  frequency: 'instant' | 'digest';
  doNotDisturb: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

class NotificationService {
  private walletKit: WalletKit | null = null;
  private preferences: Map<string, NotificationPreferences> = new Map();
  private notifications: NotificationItem[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeWalletKit();
    this.loadFromStorage();
  }

  private async initializeWalletKit() {
    try {
      const core = new Core({
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '',
        relayUrl: 'wss://relay.walletconnect.com'
      });

      this.walletKit = await WalletKit.init({
        core,
        metadata: {
          name: 'RenVault',
          description: 'Web3-native notifications for RenVault',
          url: 'https://renvault.com',
          icons: ['https://renvault.com/icon.png']
        }
      });

      this.setupWalletKitListeners();
    } catch (error) {
      console.error('Failed to initialize WalletKit for notifications:', error);
    }
  }

  private setupWalletKitListeners() {
    if (!this.walletKit) return;

    this.walletKit.on('session_proposal', async (event) => {
      // Handle notification session proposals
    });

    this.walletKit.on('session_request', async (event) => {
      // Handle notification requests
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToWeb3Notifications(userId: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error('WalletKit not initialized');
    }

    // Implementation for subscribing to Web3 notifications via AppKit
    // This would involve creating a session with the notification service
  }

  setUserPreferences(userId: string, preferences: NotificationPreferences): void {
    this.preferences.set(userId, preferences);
    this.saveToStorage();
    this.emit('preferencesUpdated', { userId, preferences });
  }

  getUserPreferences(userId: string): NotificationPreferences | undefined {
    return this.preferences.get(userId);
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();

    // Show browser notification if enabled
    this.showBrowserNotification(newNotification);

    this.emit('notificationAdded', newNotification);
  }

  getNotifications(userId?: string): NotificationItem[] {
    return this.notifications.filter(n => !userId || n.data?.userId === userId);
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.emit('notificationRead', notification);
    }
  }

  markAllAsRead(userId?: string): void {
    this.notifications
      .filter(n => !userId || n.data?.userId === userId)
      .forEach(n => n.read = true);
    this.saveToStorage();
  }

  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const deleted = this.notifications.splice(index, 1)[0];
      this.saveToStorage();
      this.emit('notificationDeleted', deleted);
    }
  }

  private showBrowserNotification(notification: NotificationItem): void {
    if (Notification.permission !== 'granted') return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: notification.data
    });

    browserNotification.onclick = () => {
      window.focus();
      this.markAsRead(notification.id);
    };
  }

  // Event system for real-time updates
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('renvault_notifications', JSON.stringify({
        preferences: Array.from(this.preferences.entries()),
        notifications: this.notifications
      }));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('renvault_notifications');
      if (stored) {
        const data = JSON.parse(stored);
        this.preferences = new Map(data.preferences || []);
        this.notifications = (data.notifications || []).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  // API integration methods
  async syncWithBackend(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/preferences/${userId}`);
      if (response.ok) {
        const backendPrefs = await response.json();
        this.setUserPreferences(userId, backendPrefs);
      }
    } catch (error) {
      console.error('Failed to sync preferences with backend:', error);
    }
  }

  async updateBackendPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences })
      });
    } catch (error) {
      console.error('Failed to update backend preferences:', error);
    }
  }
}

export const notificationService = new NotificationService();