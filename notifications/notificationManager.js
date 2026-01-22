const EmailService = require('./emailService');
const PushNotificationService = require('./pushService');
const BlockchainEventListener = require('./blockchainEventListener');

class NotificationManager {
  constructor() {
    this.emailService = new EmailService();
    this.pushService = new PushNotificationService();
    this.userPreferences = new Map();
    this.notificationHistory = new Map(); // Track notification history
    this.blockchainListener = new BlockchainEventListener(this);
  }

  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      email: preferences.email || null,
      emailEnabled: preferences.emailEnabled || false,
      pushEnabled: preferences.pushEnabled || false,
      web3Enabled: preferences.web3Enabled || false, // New Web3 notifications
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

  async notifyVaultCreated(userId, vaultId, vaultType) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendVaultCreatedAlert(prefs.email, vaultId, vaultType)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendVaultCreatedNotification(userId, vaultId, vaultType)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyRewardsDistributed(userId, vaultId, amount) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendRewardsDistributedAlert(prefs.email, vaultId, amount)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendRewardsNotification(userId, vaultId, amount)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyVaultMaturity(userId, vaultId, daysRemaining) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendVaultMaturityAlert(prefs.email, vaultId, daysRemaining)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendVaultMaturityNotification(userId, vaultId, daysRemaining)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyLargeTransaction(userId, amount, type) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendLargeTransactionAlert(prefs.email, amount, type)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendLargeTransactionNotification(userId, amount, type)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifyMultisigRequest(userId, requestId, action) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendMultisigAlert(prefs.email, requestId, action)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendMultisigNotification(userId, requestId, action)
      );
    }

    await Promise.allSettled(promises);
  }

  async notifySessionExpiration(userId, minutesRemaining) {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return;

    const promises = [];

    if (prefs.emailEnabled && prefs.email) {
      promises.push(
        this.emailService.sendSessionExpirationAlert(prefs.email, minutesRemaining)
      );
    }

    if (prefs.pushEnabled) {
      promises.push(
        this.pushService.sendSessionExpirationNotification(userId, minutesRemaining)
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
        .filter(p => p.emailEnabled).length,
      blockchainListener: this.blockchainListener.getStats()
    };
  }

  async startBlockchainListener() {
    await this.blockchainListener.startListening();
  }

  stopBlockchainListener() {
    this.blockchainListener.stopListening();
  }

  // Methods for testing/simulating blockchain events
  simulateVaultCreated(userId, vaultId, vaultType) {
    this.blockchainListener.simulateVaultCreated(userId, vaultId, vaultType);
  }

  simulateDeposit(userId, vaultId, amount, balance) {
    this.blockchainListener.simulateDeposit(userId, vaultId, amount, balance);
  }

  simulateWithdrawal(userId, vaultId, amount, balance) {
    this.blockchainListener.simulateWithdrawal(userId, vaultId, amount, balance);
  }

  simulateRewardsDistributed(vaultId, recipients) {
    this.blockchainListener.simulateRewardsDistributed(vaultId, recipients);
  }

  simulateVaultUpdated(vaultId, changes, userId) {
    this.blockchainListener.simulateVaultUpdated(vaultId, changes, userId);
  }

  simulateLargeTransaction(userId, amount, type) {
    this.blockchainListener.simulateLargeTransaction(userId, amount, type);
  }

  simulateMultisigRequest(userId, requestId, action) {
    this.blockchainListener.simulateMultisigRequest(userId, requestId, action);
  }

module.exports = NotificationManager;