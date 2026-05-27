const { FilePersistence } = require('../shared/persistence');
const Logger = require('./logger');

class PushNotificationService {
  constructor() {
    this.logger = new Logger('PushService');
    this.persistence = new FilePersistence('push-subscriptions');
    this.subscribers = this.persistence.toMap();
  }

  subscribe(userId, endpoint, keys) {
    this.subscribers.set(userId, {
      endpoint,
      keys,
      subscribed: Date.now()
    });
    this.persistence.fromMap(this.subscribers);
    this.logger.info('User subscribed to push notifications', { userId });
  }

  unsubscribe(userId) {
    this.subscribers.delete(userId);
    this.persistence.fromMap(this.subscribers);
    this.logger.info('User unsubscribed from push notifications', { userId });
  }

  async sendPushNotification(userId, title, body, data = {}) {
    const subscription = this.subscribers.get(userId);
    if (!subscription) {
      console.log(`❌ No subscription found for user ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data
    });

    try {
      // Mock push notification send
      console.log(`📱 Push notification sent to ${userId}: ${title}`);
      console.log(`   Body: ${body}`);
      return true;
    } catch (error) {
      console.error('❌ Push notification failed:', error.message);
      return false;
    }
  }

  async sendDepositNotification(userId, amount) {
    return this.sendPushNotification(
      userId,
      '🏦 Deposit Confirmed',
      `Your ${amount} STX deposit was successful!`,
      { type: 'deposit', amount }
    );
  }

  async sendWithdrawNotification(userId, amount) {
    return this.sendPushNotification(
      userId,
      '💰 Withdrawal Processed',
      `Your ${amount} STX withdrawal is complete!`,
      { type: 'withdrawal', amount }
    );
  }

  async sendRankingNotification(userId, newRank) {
    return this.sendPushNotification(
      userId,
      '🏆 Ranking Update',
      `You're now ranked #${newRank} on the leaderboard!`,
      { type: 'ranking', rank: newRank }
    );
  }

  async sendStakingRewardNotification(userId, amount) {
    return this.sendPushNotification(
      userId,
      '🌱 Staking Reward Earned',
      `You've earned ${amount} STX in staking rewards!`,
      { type: 'staking_reward', amount }
    );
  }

  async sendLiquidityRewardNotification(userId, amount, poolName) {
    return this.sendPushNotification(
      userId,
      '💧 Liquidity Reward Earned',
      `You've earned ${amount} STX from ${poolName} pool!`,
      { type: 'liquidity_reward', amount, poolName }
    );
  }

  async sendFailedLoginNotification(userId, ipAddress) {
    return this.sendPushNotification(
      userId,
      '🚨 Security Alert',
      `Failed login attempt detected from ${ipAddress}`,
      { type: 'security', alertType: 'failed_login', ipAddress }
    );
  }

  async sendSuspiciousActivityNotification(userId, activity) {
    return this.sendPushNotification(
      userId,
      '🚨 Security Alert',
      `Suspicious activity detected: ${activity}`,
      { type: 'security', alertType: 'suspicious_activity', activity }
    );
  }

  async sendTwoFactorEnabledNotification(userId) {
    return this.sendPushNotification(
      userId,
      '🔐 Security Enhanced',
      'Two-factor authentication has been enabled',
      { type: 'security', alertType: '2fa_enabled' }
    );
  }

  async sendTwoFactorDisabledNotification(userId) {
    return this.sendPushNotification(
      userId,
      '⚠️ Security Changed',
      'Two-factor authentication has been disabled',
      { type: 'security', alertType: '2fa_disabled' }
    );
  }

  getSubscriberCount() {
    return this.subscribers.size;
  }
}

module.exports = PushNotificationService;