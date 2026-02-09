export class TransactionTimeout {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  set(txId: string, callback: () => void, timeoutMs: number = this.DEFAULT_TIMEOUT): void {
    this.clear(txId);
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(txId);
    }, timeoutMs);
    this.timeouts.set(txId, timeout);
  }

  clear(txId: string): void {
    const timeout = this.timeouts.get(txId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(txId);
    }
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}
