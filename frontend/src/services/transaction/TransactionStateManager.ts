import { TransactionState, TransactionStatus } from '../../types/transactionState';

export class TransactionStateManager {
  private states: Map<string, TransactionState> = new Map();

  setState(txId: string, status: TransactionStatus, error?: string): void {
    const existing = this.states.get(txId);
    this.states.set(txId, {
      txId,
      status,
      timestamp: Date.now(),
      retryCount: existing?.retryCount || 0,
      error
    });
  }

  getState(txId: string): TransactionState | undefined {
    return this.states.get(txId);
  }

  incrementRetry(txId: string): void {
    const state = this.states.get(txId);
    if (state) {
      state.retryCount++;
    }
  }

  clear(txId: string): void {
    this.states.delete(txId);
  }

  getAllStates(): TransactionState[] {
    return Array.from(this.states.values());
  }
}
