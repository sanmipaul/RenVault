export type WalletState = 'disconnected' | 'connecting' | 'connected' | 'error';

export class WalletStateManager {
  private state: WalletState = 'disconnected';
  private listeners: Set<(state: WalletState) => void> = new Set();
  private metadata: any = {};

  setState(newState: WalletState, metadata?: any) {
    if (this.state !== newState) {
      this.state = newState;
      this.metadata = metadata || {};
      this.notifyListeners();
    }
  }

  getState(): WalletState {
    return this.state;
  }

  getMetadata() {
    return this.metadata;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  isConnecting(): boolean {
    return this.state === 'connecting';
  }

  onStateChange(callback: (state: WalletState) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  reset() {
    this.setState('disconnected');
    this.metadata = {};
  }
}

export const walletState = new WalletStateManager();
