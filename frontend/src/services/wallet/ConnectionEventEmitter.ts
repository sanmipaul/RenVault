export type ConnectionEvent = 'connected' | 'disconnected' | 'reconnecting' | 'error';
export type ConnectionEventData = Record<string, unknown>;

export class ConnectionEventEmitter {
  private listeners: Map<ConnectionEvent, Set<(data: ConnectionEventData) => void>> = new Map();

  on(event: ConnectionEvent, callback: (data: ConnectionEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: ConnectionEvent, callback: (data: ConnectionEventData) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: ConnectionEvent, data: ConnectionEventData): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}
