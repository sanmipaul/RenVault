export type WalletEvent = 
  | 'connected'
  | 'disconnected'
  | 'accountChanged'
  | 'networkChanged'
  | 'error';

export class WalletEventEmitter {
  private listeners = new Map<WalletEvent, Set<Function>>();

  on(event: WalletEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: WalletEvent, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: WalletEvent, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  once(event: WalletEvent, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  removeAllListeners(event?: WalletEvent) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: WalletEvent): number {
    return this.listeners.get(event)?.size || 0;
  }
}

export const walletEvents = new WalletEventEmitter();
