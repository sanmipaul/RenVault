const EmailService = require('./emailService');
const PushNotificationService = require('./pushService');

class NotificationManager {
  constructor() {
    this.emailService = new EmailService();
    this.pushService = new PushNotificationService();
    this.userPreferences = new Map();
  }

  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      email: preferences.email || null,
      emailEnabled: preferences.emailEnabled || false,
      pushEnabled: preferences.pushEnabled || false,
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