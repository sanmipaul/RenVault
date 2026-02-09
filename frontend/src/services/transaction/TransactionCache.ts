import { SignedTransaction } from '../../services/transaction/TransactionService';

export class TransactionCache {
  private cache: Map<string, { tx: SignedTransaction; timestamp: number }> = new Map();
  private readonly TTL = 3600000; // 1 hour

  set(txId: string, tx: SignedTransaction): void {
    this.cache.set(txId, { tx, timestamp: Date.now() });
  }

  get(txId: string): SignedTransaction | null {
    const cached = this.cache.get(txId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(txId);
      return null;
    }
    return cached.tx;
  }

  has(txId: string): boolean {
    return this.get(txId) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}
