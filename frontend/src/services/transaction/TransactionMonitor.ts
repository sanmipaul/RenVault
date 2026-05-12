export interface TransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  retriedTransactions: number;
  averageConfirmationTime: number;
  lastConfirmationTime: number;
  totalFeesSpent: number;
  averageFeeSpent: number;
}

export class TransactionMonitor {
  private metrics: TransactionMetrics = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    retriedTransactions: 0,
    averageConfirmationTime: 0,
    lastConfirmationTime: 0,
    totalFeesSpent: 0,
    averageFeeSpent: 0,
  };

  recordTransaction(): void {
    this.metrics.totalTransactions++;
  }

  recordSuccess(confirmationTime: number, fee?: number): void {
    this.metrics.successfulTransactions++;
    this.metrics.lastConfirmationTime = confirmationTime;
    this.updateAverageTime(confirmationTime);
    if (fee !== undefined) {
      this.metrics.totalFeesSpent += fee;
      this.metrics.averageFeeSpent = this.metrics.totalFeesSpent / this.metrics.successfulTransactions;
    }
  }

  recordFailure(): void {
    this.metrics.failedTransactions++;
  }

  recordRetry(): void {
    this.metrics.retriedTransactions++;
  }

  private updateAverageTime(time: number): void {
    const total = this.metrics.averageConfirmationTime * (this.metrics.successfulTransactions - 1) + time;
    this.metrics.averageConfirmationTime = total / this.metrics.successfulTransactions;
  }

  getMetrics(): TransactionMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = { totalTransactions: 0, successfulTransactions: 0, failedTransactions: 0, retriedTransactions: 0, averageConfirmationTime: 0, lastConfirmationTime: 0 };
  }
}
