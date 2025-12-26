class NotificationService {
  private userId: string;
  private baseUrl: string;

  constructor(userId: string) {
    this.userId = userId;
    this.baseUrl = 'http://localhost:3003/api/notifications';
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