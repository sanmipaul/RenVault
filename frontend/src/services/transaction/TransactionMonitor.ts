export interface TransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  retriedTransactions: number;
  averageConfirmationTime: number;
}

export class TransactionMonitor {
  private metrics: TransactionMetrics = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    retriedTransactions: 0,
    averageConfirmationTime: 0
  };

  recordTransaction(): void {
    this.metrics.totalTransactions++;
  }

  recordSuccess(confirmationTime: number): void {
    this.metrics.successfulTransactions++;
    this.updateAverageTime(confirmationTime);
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
    this.metrics = { totalTransactions: 0, successfulTransactions: 0, failedTransactions: 0, retriedTransactions: 0, averageConfirmationTime: 0 };
  }
}
