import { TransactionDetails } from '../../services/transaction/TransactionService';

export class TransactionBatchProcessor {
  private batch: TransactionDetails[] = [];
  private readonly maxBatchSize: number;

  constructor(maxBatchSize: number = 5) {
    this.maxBatchSize = maxBatchSize;
  }

  add(transaction: TransactionDetails): void {
    if (this.batch.length >= this.maxBatchSize) {
      throw new Error(
        `Batch is full (max ${this.maxBatchSize}). Call getBatch() and clear() before adding more transactions.`
      );
    }
    this.batch.push(transaction);
  }

  canProcess(): boolean {
    return this.batch.length >= this.maxBatchSize;
  }

  getBatch(): TransactionDetails[] {
    return [...this.batch];
  }

  clear(): void {
    this.batch = [];
  }

  size(): number {
    return this.batch.length;
  }
}
