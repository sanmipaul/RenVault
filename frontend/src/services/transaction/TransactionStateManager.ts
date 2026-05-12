import { TransactionState, TransactionStatus } from '../../types/transactionState';

export class TransactionStateManager {
  private states: Map<string, TransactionState> = new Map();

  setState(txId: string, status: TransactionStatus, error?: string, fee?: number, estimatedFee?: number): void {
    const existing = this.states.get(txId);
    this.states.set(txId, {
      txId,
      status,
      timestamp: Date.now(),
      retryCount: existing?.retryCount || 0,
      error,
      fee: fee ?? existing?.fee,
      estimatedFee: estimatedFee ?? existing?.estimatedFee,
    });
  }

  getState(txId: string): TransactionState | undefined {
    return this.states.get(txId);
  }

  incrementRetry(txId: string): void {
    const state = this.states.get(txId);
    if (state) {
      this.states.set(txId, {
        ...state,
        retryCount: state.retryCount + 1,
        timestamp: Date.now()
      });
    }
  }

  clear(txId: string): void {
    this.states.delete(txId);
  }

  getAllStates(): TransactionState[] {
    return Array.from(this.states.values());
  }
}
