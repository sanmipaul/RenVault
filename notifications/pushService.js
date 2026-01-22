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

  async sendVaultCreatedNotification(userId, vaultId, vaultType) {
    return this.sendPushNotification(
      userId,
      '🏦 Vault Created',
      `New ${vaultType} vault ${vaultId} has been created successfully!`,
      { type: 'vault_created', vaultId, vaultType }
    );
  }

  async sendVaultUpdatedNotification(userId, vaultId, changes) {
    return this.sendPushNotification(
      userId,
      '🔄 Vault Updated',
      `Vault ${vaultId} parameters have been updated.`,
      { type: 'vault_updated', vaultId, changes }
    );
  }

  async sendRewardsNotification(userId, vaultId, amount) {
    return this.sendPushNotification(
      userId,
      '💰 Rewards Earned',
      `You've received ${amount} STX in rewards from vault ${vaultId}!`,
      { type: 'rewards', vaultId, amount }
    );
  }

  async sendVaultMaturityNotification(userId, vaultId, daysRemaining) {
    return this.sendPushNotification(
      userId,
      '⏰ Vault Maturity',
      `Vault ${vaultId} matures in ${daysRemaining} days.`,
      { type: 'maturity', vaultId, daysRemaining }
    );
  }

  async sendPriceAlertNotification(userId, asset, price, change) {
    return this.sendPushNotification(
      userId,
      '📈 Price Alert',
      `${asset} price: ${price} (${change > 0 ? '+' : ''}${change}%)`,
      { type: 'price_alert', asset, price, change }
    );
  }

  async sendLargeTransactionNotification(userId, amount, type) {
    return this.sendPushNotification(
      userId,
      '🚨 Security Alert',
      `Large ${type} transaction: ${amount} STX detected!`,
      { type: 'security', transactionType: type, amount }
    );
  }

  async sendMultisigNotification(userId, requestId, action) {
    return this.sendPushNotification(
      userId,
      '🔐 Multi-sig Request',
      `Approval needed for: ${action} (ID: ${requestId})`,
      { type: 'multisig', requestId, action }
    );
  }

  async sendSessionExpirationNotification(userId, minutesRemaining) {
    return this.sendPushNotification(
      userId,
      '⏳ Session Warning',
      `Your session expires in ${minutesRemaining} minutes.`,
      { type: 'session', minutesRemaining }
    );
  }

module.exports = PushNotificationService;