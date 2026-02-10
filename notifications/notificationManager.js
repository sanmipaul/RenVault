const EmailService = require('./emailService');
const PushNotificationService = require('./pushService');
const Logger = require('./logger');

class NotificationManager {
  static PRIORITIES = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    URGENT: 3
  };

  constructor() {
    this.logger = new Logger('NotificationManager');
    this.emailService = new EmailService();
    this.pushService = new PushNotificationService();
    this.userPreferences = new Map();
    this.lastNotificationTime = new Map(); // userId -> timestamp
    this.RATE_LIMIT_MS = 1000 * 60; // 1 minute default
  }

  setUserPreferences(userId, preferences) {
    if (!userId) {
      this.logger.error('Cannot set preferences: userId is missing');
      throw new Error('userId is required');
    }
    if (!preferences || typeof preferences !== 'object') {
      this.logger.error('Cannot set preferences: preferences must be an object', { userId });
      throw new Error('preferences object is required');
    }

    if (preferences.emailEnabled && preferences.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(preferences.email)) {
        this.logger.warn('Invalid email format provided', { userId, email: preferences.email });
        // We might not want to throw here to allow other prefs to be set, 
        // but let's be strict for this implementation
        throw new Error('Invalid email format');
      }
    }

    this.logger.info('Updating user preferences', { userId });
    this.userPreferences.set(userId, {
      email: preferences.email || null,
      emailEnabled: preferences.emailEnabled || false,
      pushEnabled: preferences.pushEnabled || false,
      minPriority: preferences.minPriority !== undefined ? preferences.minPriority : NotificationManager.PRIORITIES.LOW,
      // Transaction notifications
      depositNotifications: preferences.depositNotifications !== false,
      withdrawalNotifications: preferences.withdrawalNotifications !== false,
      stakingNotifications: preferences.stakingNotifications !== false,
      rewardNotifications: preferences.rewardNotifications !== false,
      // Security alerts
      securityAlerts: preferences.securityAlerts !== false,
      loginAlerts: preferences.loginAlerts !== false,
      suspiciousActivityAlerts: preferences.suspiciousActivityAlerts !== false,
      twoFactorAlerts: preferences.twoFactorAlerts !== false,
      ...preferences
    });
  }

  async _sendNotification(userId, emailMethod, emailArgs, pushMethod, pushArgs, priority, prefKey = null) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || (prefKey && !prefs[prefKey]) || priority < prefs.minPriority) {
      return;
    }

    // Rate limiting (except for URGENT)
    if (priority < NotificationManager.PRIORITIES.URGENT) {
      const lastTime = this.lastNotificationTime.get(userId);
      if (lastTime && (Date.now() - lastTime < this.RATE_LIMIT_MS)) {
        this.logger.warn('Notification rate limited', { userId, priority });
        return;
      }
    }

    const promises = [];

    if (prefs.emailEnabled && prefs.email && emailMethod) {
      promises.push(
        this.emailService[emailMethod](prefs.email, ...emailArgs)
      );
    }

    if (prefs.pushEnabled && pushMethod) {
      promises.push(
        this.pushService[pushMethod](userId, ...pushArgs)
      );
    }

    await Promise.allSettled(promises);
    this.lastNotificationTime.set(userId, Date.now());
  }

  async notifyDeposit(userId, amount, balance, priority = NotificationManager.PRIORITIES.MEDIUM) {
    await this._sendNotification(
      userId,
      'sendDepositAlert', [amount, balance],
      'sendDepositNotification', [amount],
      priority
    );
  }

  async notifyWithdrawal(userId, amount, balance, priority = NotificationManager.PRIORITIES.MEDIUM) {
    await this._sendNotification(
      userId,
      'sendWithdrawAlert', [amount, balance],
      'sendWithdrawNotification', [amount],
      priority
    );
  }

  async notifyRankingChange(userId, rank, score, priority = NotificationManager.PRIORITIES.LOW) {
    await this._sendNotification(
      userId,
      'sendLeaderboardUpdate', [rank, score],
      'sendRankingNotification', [rank],
      priority
    );
  }

  async notifyStakingReward(userId, amount, stakedAmount, priority = NotificationManager.PRIORITIES.MEDIUM) {
    await this._sendNotification(
      userId,
      'sendStakingRewardAlert', [amount, stakedAmount],
      'sendStakingRewardNotification', [amount],
      priority,
      'stakingNotifications'
    );
  }

  async notifyLiquidityReward(userId, amount, poolName, priority = NotificationManager.PRIORITIES.MEDIUM) {
    await this._sendNotification(
      userId,
      'sendLiquidityRewardAlert', [amount, poolName],
      'sendLiquidityRewardNotification', [amount, poolName],
      priority,
      'rewardNotifications'
    );
  }

  async notifyFailedLogin(userId, ipAddress, userAgent, priority = NotificationManager.PRIORITIES.HIGH) {
    await this._sendNotification(
      userId,
      'sendFailedLoginAlert', [ipAddress, userAgent],
      'sendFailedLoginNotification', [ipAddress],
      priority,
      'loginAlerts'
    );
  }

  async notifySuspiciousActivity(userId, activity, ipAddress, priority = NotificationManager.PRIORITIES.URGENT) {
    await this._sendNotification(
      userId,
      'sendSuspiciousActivityAlert', [activity, ipAddress],
      'sendSuspiciousActivityNotification', [userId, activity],
      priority,
      'suspiciousActivityAlerts'
    );
  }

  async notifyTwoFactorEnabled(userId, priority = NotificationManager.PRIORITIES.MEDIUM) {
    await this._sendNotification(
      userId,
      'sendTwoFactorEnabledAlert', [],
      'sendTwoFactorEnabledNotification', [],
      priority,
      'twoFactorAlerts'
    );
  }

  async notifyTwoFactorDisabled(userId, priority = NotificationManager.PRIORITIES.HIGH) {
    await this._sendNotification(
      userId,
      'sendTwoFactorDisabledAlert', [],
      'sendTwoFactorDisabledNotification', [],
      priority,
      'twoFactorAlerts'
    );
  }

  subscribeToPush(userId, endpoint, keys) {
    this.pushService.subscribe(userId, endpoint, keys);
  }

  unsubscribeFromPush(userId) {
    this.pushService.unsubscribe(userId);
  }

  getStats() {
    return {
      totalUsers: this.userPreferences.size,
      pushSubscribers: this.pushService.getSubscriberCount(),
      emailUsers: Array.from(this.userPreferences.values())
        .filter(p => p.emailEnabled).length
    };
  }
}

module.exports = NotificationManager;