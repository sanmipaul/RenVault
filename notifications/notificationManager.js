const EmailService = require('./emailService');
const PushNotificationService = require('./pushService');
const Logger = require('./logger');

class NotificationManager {
  constructor() {
    this.logger = new Logger('NotificationManager');
    this.emailService = new EmailService();
    this.pushService = new PushNotificationService();
    this.userPreferences = new Map();
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

  async notifyDeposit(userId, amount, balance) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendDepositAlert(prefs.email, amount, balance)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendDepositNotification(userId, amount)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyWithdrawal(userId, amount, balance) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendWithdrawAlert(prefs.email, amount, balance)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendWithdrawNotification(userId, amount)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyRankingChange(userId, rank, score) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendLeaderboardUpdate(prefs.email, rank, score)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendRankingNotification(userId, rank)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyStakingReward(userId, amount, stakedAmount) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.stakingNotifications) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendStakingRewardAlert(prefs.email, amount, stakedAmount)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendStakingRewardNotification(userId, amount)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyLiquidityReward(userId, amount, poolName) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.rewardNotifications) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendLiquidityRewardAlert(prefs.email, amount, poolName)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendLiquidityRewardNotification(userId, amount, poolName)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyFailedLogin(userId, ipAddress, userAgent) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.securityAlerts || !prefs.loginAlerts) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendFailedLoginAlert(prefs.email, ipAddress, userAgent)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendFailedLoginNotification(userId, ipAddress)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifySuspiciousActivity(userId, activity, ipAddress) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.securityAlerts || !prefs.suspiciousActivityAlerts) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendSuspiciousActivityAlert(prefs.email, activity, ipAddress)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendSuspiciousActivityNotification(userId, activity)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyTwoFactorEnabled(userId) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.securityAlerts || !prefs.twoFactorAlerts) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendTwoFactorEnabledAlert(prefs.email)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendTwoFactorEnabledNotification(userId)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyTwoFactorDisabled(userId) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || !prefs.securityAlerts || !prefs.twoFactorAlerts) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendTwoFactorDisabledAlert(prefs.email)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendTwoFactorDisabledNotification(userId)
      );
    }

    await Promise.allSettled(promises);
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