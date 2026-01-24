type NotificationType = 'transaction' | 'security' | 'reward' | 'system' | 'wallet_session' | 'wallet_request' | 'wallet_error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
  actions?: string[];
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private userId: string;
  private baseUrl: string;
  private listeners: ((notification: Notification) => void)[] = [];

  constructor(userId: string) {
    this.userId = userId;
    this.baseUrl = 'http://localhost:3003/api/notifications';
  }

  static getInstance(userId: string): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(userId);
    }
    return NotificationService.instance;
  }

  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false
    };

    // Save to local storage
    const saved = localStorage.getItem(`notifications_${this.userId}`);
    const notifications = saved ? JSON.parse(saved) : [];
    notifications.unshift(fullNotification);
    localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(notifications));

    // Play sound and vibrate if enabled
    this.playNotificationSound(fullNotification.priority);
    this.vibrate(fullNotification.priority);

    // Notify listeners
    this.listeners.forEach(l => l(fullNotification));
  }

  private playNotificationSound(priority?: string) {
    const prefs = this.getUserPreferences(this.userId);
    if (prefs?.soundEnabled === false) return;

    try {
      const audio = new Audio(priority === 'high' ? '/sounds/alert.mp3' : '/sounds/notification.mp3');
      audio.play().catch(e => console.warn('Audio play failed:', e));
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  private vibrate(priority?: string) {
    const prefs = this.getUserPreferences(this.userId);
    if (prefs?.vibrationEnabled === false) return;

    if ('vibrate' in navigator) {
      if (priority === 'high') {
        navigator.vibrate([200, 100, 200]);
      } else {
        navigator.vibrate(200);
      }
    }
  }

  // WalletKit Notifications
  notifySessionProposal(proposerName: string, metadata: any, id: string) {
    this.notify({
      type: 'wallet_session',
      title: 'New Connection Request',
      message: `${proposerName} wants to connect to your wallet`,
      priority: 'high',
      actions: ['Approve', 'Reject'],
      data: { metadata, proposalId: id }
    });
  }

  notifySessionRequest(method: string, data: any, id: number, topic: string) {
    this.notify({
      type: 'wallet_request',
      title: 'Signature Request',
      message: `New request: ${method}`,
      priority: 'high',
      actions: ['Approve', 'Reject'],
      data: { ...data, requestId: id, topic, method }
    });
  }

  notifySessionUpdate(topic: string, namespaces: any) {
    this.notify({
      type: 'wallet_session',
      title: 'Session Updated',
      message: 'Wallet session has been updated',
      priority: 'low',
      data: { topic, namespaces }
    });
  }

  notifySessionDelete(topic: string) {
    this.notify({
      type: 'wallet_session',
      title: 'Session Ended',
      message: 'Wallet disconnected',
      priority: 'medium',
      data: { topic }
    });
  }

  notifySessionExpire(topic: string) {
    this.notify({
      type: 'wallet_session',
      title: 'Session Expired',
      message: 'Please reconnect your wallet',
      priority: 'medium',
      data: { topic }
    });
  }

  notifyConnectionError(error: string) {
    this.notify({
      type: 'wallet_error',
      title: 'Connection Failed',
      message: error,
      priority: 'high'
    });
  }

  notifySuspiciousSession(proposerName: string, url: string) {
    this.notify({
      type: 'security',
      title: '⚠️ Suspicious Connection',
      message: `Unknown dApp ${proposerName} (${url}) is attempting to connect.`,
      priority: 'high',
      actions: ['Block', 'Review']
    });
  }

  notifyUnknownDApp(url: string) {
    this.notify({
      type: 'security',
      title: 'Unknown dApp Connection',
      message: `Connecting to untrusted source: ${url}`,
      priority: 'medium'
    });
  }

  notifyMultipleFailedAttempts() {
    this.notify({
      type: 'security',
      title: 'Security Warning',
      message: 'Multiple failed connection attempts detected.',
      priority: 'high'
    });
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      const response = await fetch(`${this.baseUrl}/subscribe-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys
        }),
      });

      if (response.ok) {
        console.log('✅ Successfully subscribed to push notifications');
        return true;
      } else {
        console.error('❌ Failed to subscribe to push notifications');
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/unsubscribe-push/${this.userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Successfully unsubscribed from push notifications');
        return true;
      } else {
        console.error('❌ Failed to unsubscribe from push notifications');
        return false;
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          preferences
        }),
      });

      if (response.ok) {
        console.log('✅ Notification preferences updated');
        return true;
      } else {
        console.error('❌ Failed to update notification preferences');
        return false;
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Test notification methods (for development)
  async testDepositNotification(amount: number, balance: number): Promise<void> {
    await this.sendTestNotification('test-deposit', { userId: this.userId, amount, balance });
  }

  async testWithdrawalNotification(amount: number, balance: number): Promise<void> {
    await this.sendTestNotification('test-withdrawal', { userId: this.userId, amount, balance });
  }

  async testStakingRewardNotification(amount: number, stakedAmount: number): Promise<void> {
    await this.sendTestNotification('test-staking-reward', { userId: this.userId, amount, stakedAmount });
  }

  async testLiquidityRewardNotification(amount: number, poolName: string): Promise<void> {
    await this.sendTestNotification('test-liquidity-reward', { userId: this.userId, amount, poolName });
  }

  async testFailedLoginNotification(ipAddress: string, userAgent: string): Promise<void> {
    await this.sendTestNotification('test-failed-login', { userId: this.userId, ipAddress, userAgent });
  }

  async testSuspiciousActivityNotification(activity: string, ipAddress: string): Promise<void> {
    await this.sendTestNotification('test-suspicious-activity', { userId: this.userId, activity, ipAddress });
  }

  async testTwoFactorEnabledNotification(): Promise<void> {
    await this.sendTestNotification('test-2fa-enabled', { userId: this.userId });
  }

  async testTwoFactorDisabledNotification(): Promise<void> {
    await this.sendTestNotification('test-2fa-disabled', { userId: this.userId });
  }

  private async sendTestNotification(endpoint: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log(`✅ Test ${endpoint} notification sent`);
      } else {
        console.error(`❌ Failed to send test ${endpoint} notification`);
      }
    } catch (error) {
      console.error(`Error sending test ${endpoint} notification:`, error);
    }
  }

  // Get user preferences from localStorage
  getUserPreferences(userId: string): any {
    const saved = localStorage.getItem(`notificationPrefs_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }

  // Save user preferences to localStorage
  saveUserPreferences(userId: string, preferences: any): void {
    localStorage.setItem(`notificationPrefs_${userId}`, JSON.stringify(preferences));
  }

  // Helper function for VAPID key conversion
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCode(i);
    }
    return outputArray;
  }
}

export default NotificationService;