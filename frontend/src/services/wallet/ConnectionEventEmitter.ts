export type ConnectionEvent = 'connected' | 'disconnected' | 'reconnecting' | 'error';

export class ConnectionEventEmitter {
  private listeners: Map<ConnectionEvent, Set<(data: any) => void>> = new Map();

  on(event: ConnectionEvent, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: ConnectionEvent, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: ConnectionEvent, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}
