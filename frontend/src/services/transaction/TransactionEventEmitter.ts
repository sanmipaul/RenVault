export type TransactionEvent = 'prepared' | 'signed' | 'broadcasting' | 'confirmed' | 'failed';

export class TransactionEventEmitter {
  private listeners: Map<TransactionEvent, Set<(data: any) => void>> = new Map();

  on(event: TransactionEvent, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: TransactionEvent, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: TransactionEvent, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}
