import { SignedTransaction } from '../../services/transaction/TransactionService';

export class TransactionRecovery {
  private static readonly STORAGE_KEY = 'pending_transactions';

  static savePendingTransaction(tx: SignedTransaction): void {
    const pending = this.getPendingTransactions();
    pending.push({ ...tx, savedAt: Date.now() });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));
  }

  static getPendingTransactions(): any[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static removePendingTransaction(txId: string): void {
    const pending = this.getPendingTransactions().filter(tx => tx.txId !== txId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));
  }

  static clearOldTransactions(maxAgeMs: number = 86400000): void {
    const now = Date.now();
    const pending = this.getPendingTransactions().filter(tx => now - tx.savedAt < maxAgeMs);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));
  }
}
