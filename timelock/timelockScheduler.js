// Timelock Scheduler
const { TimelockManager } = require('./timelockManager');

class TimelockScheduler {
  constructor() {
    this.manager = new TimelockManager();
    this.isRunning = false;
    this.checkInterval = 60000; // 1 minute
    this.executionQueue = [];
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Timelock scheduler started');
    
    this.intervalId = setInterval(() => {
      this.checkAndExecute();
    }, this.checkInterval);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('Timelock scheduler stopped');
  }

  async checkAndExecute() {
    const readyTransactions = this.manager.getReadyTransactions();
    
    for (const transaction of readyTransactions) {
      try {
        const result = this.manager.executeTransaction(transaction.id);
        console.log(`Auto-executed transaction ${transaction.id}`);
        
        this.executionQueue.push({
          txId: transaction.id,
          result,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Failed to execute transaction ${transaction.id}:`, error.message);
      }
    }

    // Cleanup old transactions
    this.manager.cleanup();
  }

  scheduleTransaction(target, functionName, args, delay) {
    const txId = this.manager.queueTransaction(target, functionName, args, delay);
    
    console.log(`Transaction ${txId} scheduled for execution in ${this.formatDelay(delay)}`);
    
    return {
      txId,
      eta: Date.now() + delay,
      delay: this.formatDelay(delay)
    };
  }

  getScheduledTransactions() {
    return this.manager.getPendingTransactions().map(tx => ({
      ...tx,
      timeRemaining: this.manager.getTimeRemaining(tx.id),
      formattedTime: this.formatTimeRemaining(tx.id)
    }));
  }

  getExecutionHistory(limit = 50) {
    return this.executionQueue
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  formatDelay(milliseconds) {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatTimeRemaining(txId) {
    const remaining = this.manager.getTimeRemaining(txId);
    if (remaining === null) return 'Unknown';
    if (remaining <= 0) return 'Ready';
    
    return this.formatDelay(remaining);
  }

  getStatus() {
    const pending = this.manager.getPendingTransactions();
    const ready = this.manager.getReadyTransactions();
    
    return {
      isRunning: this.isRunning,
      pendingTransactions: pending.length,
      readyTransactions: ready.length,
      executedTransactions: this.executionQueue.length,
      checkInterval: this.checkInterval,
      delays: this.manager.getDelays()
    };
  }

  setCheckInterval(milliseconds) {
    this.checkInterval = milliseconds;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

module.exports = { TimelockScheduler };