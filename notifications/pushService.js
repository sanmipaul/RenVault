class PushNotificationService {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(userId, endpoint, keys) {
    this.subscribers.set(userId, {
      endpoint,
      keys,
      subscribed: Date.now()
    });
    console.log(`📱 User ${userId} subscribed to push notifications`);
  }

  unsubscribe(userId) {
    this.subscribers.delete(userId);
    console.log(`📱 User ${userId} unsubscribed from push notifications`);
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

  getSubscriberCount() {
    return this.subscribers.size;
  }
}

module.exports = PushNotificationService;