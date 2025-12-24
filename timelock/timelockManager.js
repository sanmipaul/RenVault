// Timelock Manager
class TimelockManager {
  constructor() {
    this.queuedTransactions = new Map();
    this.transactionCounter = 0;
    this.minDelay = 86400000; // 24 hours in milliseconds
    this.maxDelay = 2592000000; // 30 days in milliseconds
  }

  queueTransaction(target, functionName, args, delay) {
    if (delay < this.minDelay || delay > this.maxDelay) {
      throw new Error('Invalid delay period');
    }

    const txId = ++this.transactionCounter;
    const eta = Date.now() + delay;

    const transaction = {
      id: txId,
      target,
      functionName,
      args,
      eta,
      executed: false,
      cancelled: false,
      queuedAt: Date.now()
    };

    this.queuedTransactions.set(txId, transaction);
    return txId;
  }

  executeTransaction(txId) {
    const transaction = this.queuedTransactions.get(txId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.executed) throw new Error('Already executed');
    if (transaction.cancelled) throw new Error('Transaction cancelled');
    if (Date.now() < transaction.eta) throw new Error('Transaction not ready');

    transaction.executed = true;
    transaction.executedAt = Date.now();

    // Simulate execution
    console.log(`Executing: ${transaction.target}.${transaction.functionName}`);
    
    return {
      success: true,
      txId,
      executedAt: transaction.executedAt
    };
  }

  cancelTransaction(txId) {
    const transaction = this.queuedTransactions.get(txId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.executed) throw new Error('Already executed');

    transaction.cancelled = true;
    transaction.cancelledAt = Date.now();

    return {
      success: true,
      txId,
      cancelledAt: transaction.cancelledAt
    };
  }

  isReady(txId) {
    const transaction = this.queuedTransactions.get(txId);
    if (!transaction) return false;
    
    return Date.now() >= transaction.eta && 
           !transaction.executed && 
           !transaction.cancelled;
  }

  getTransaction(txId) {
    return this.queuedTransactions.get(txId);
  }

  getPendingTransactions() {
    return Array.from(this.queuedTransactions.values())
      .filter(tx => !tx.executed && !tx.cancelled);
  }

  getReadyTransactions() {
    return this.getPendingTransactions()
      .filter(tx => Date.now() >= tx.eta);
  }

  getTimeRemaining(txId) {
    const transaction = this.queuedTransactions.get(txId);
    if (!transaction) return null;
    
    const remaining = transaction.eta - Date.now();
    return Math.max(0, remaining);
  }

  setDelays(minDelay, maxDelay) {
    if (minDelay >= maxDelay) throw new Error('Invalid delay configuration');
    
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
    
    return { minDelay: this.minDelay, maxDelay: this.maxDelay };
  }

  getDelays() {
    return { minDelay: this.minDelay, maxDelay: this.maxDelay };
  }

  cleanup() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    for (const [txId, transaction] of this.queuedTransactions.entries()) {
      if ((transaction.executed || transaction.cancelled) && 
          transaction.queuedAt < cutoff) {
        this.queuedTransactions.delete(txId);
      }
    }
  }
}

module.exports = { TimelockManager };