export type TransactionEvent = 'prepared' | 'signed' | 'broadcasting' | 'confirmed' | 'failed';
export type TransactionEventData = Record<string, unknown>;

export class TransactionEventEmitter {
  private listeners: Map<TransactionEvent, Set<(data: TransactionEventData) => void>> = new Map();

  on(event: TransactionEvent, callback: (data: TransactionEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: TransactionEvent, callback: (data: TransactionEventData) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: TransactionEvent, data: TransactionEventData): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}
