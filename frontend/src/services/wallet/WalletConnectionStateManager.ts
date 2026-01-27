/**
 * Wallet Connection State Management
 * Manages wallet connection state with persistence and recovery
 */

import { StacksConnectorAdapter } from './StacksConnectorAdapter';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'unknown';

export interface WalletConnectionState {
  status: ConnectionStatus;
  walletId: string | null;
  address: string | null;
  publicKey: string | null;
  chainId: string | null;
  connectedAt: number | null;
  disconnectedAt: number | null;
  error: Error | null;
  metadata?: Record<string, any>;
}

export interface ConnectionSessionData {
  walletId: string;
  address: string;
  publicKey: string;
  chainId: string;
  timestamp: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

export class WalletConnectionStateManager {
  private static state: WalletConnectionState = {
    status: 'disconnected',
    walletId: null,
    address: null,
    publicKey: null,
    chainId: null,
    connectedAt: null,
    disconnectedAt: null,
    error: null,
  };

  private static listeners: Set<(state: WalletConnectionState) => void> = new Set();
  private static sessionListeners: Set<(session: ConnectionSessionData | null) => void> = new Set();
  private static adapter: StacksConnectorAdapter | null = null;
  private static sessionCheckInterval: NodeJS.Timeout | null = null;
  private static readonly SESSION_STORAGE_KEY = 'wallet_connection_session';
  private static readonly SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Initialize connection state manager
   */
  static initialize(): void {
    // Restore session from storage
    const savedSession = this.getSavedSession();
    if (savedSession && !this.isSessionExpired(savedSession)) {
      this.state = {
        status: 'connected',
        walletId: savedSession.walletId,
        address: savedSession.address,
        publicKey: savedSession.publicKey,
        chainId: savedSession.chainId,
        connectedAt: savedSession.timestamp,
        disconnectedAt: null,
        error: null,
        metadata: savedSession.metadata,
      };
    }

    // Start session expiry check
    this.startSessionCheck();
  }

  /**
   * Get current connection state
   */
  static getState(): WalletConnectionState {
    return { ...this.state };
  }

  /**
   * Get connection status
   */
  static getStatus(): ConnectionStatus {
    return this.state.status;
  }

  /**
   * Check if connected
   */
  static isConnected(): boolean {
    return this.state.status === 'connected';
  }

  /**
   * Get connected wallet ID
   */
  static getConnectedWalletId(): string | null {
    return this.state.walletId;
  }

  /**
   * Get connected address
   */
  static getConnectedAddress(): string | null {
    return this.state.address;
  }

  /**
   * Set connection state
   */
  static setConnected(
    walletId: string,
    address: string,
    publicKey: string,
    chainId: string = 'stacks:1',
    metadata?: Record<string, any>
  ): void {
    this.state = {
      status: 'connected',
      walletId,
      address,
      publicKey,
      chainId,
      connectedAt: Date.now(),
      disconnectedAt: null,
      error: null,
      metadata,
    };

    // Save session
    this.saveSession({
      walletId,
      address,
      publicKey,
      chainId,
      timestamp: this.state.connectedAt,
      expiresAt: Date.now() + this.SESSION_EXPIRY_MS,
      metadata,
    });

    this.notifyListeners();
  }

  /**
   * Set connecting state
   */
  static setConnecting(walletId: string): void {
    this.state = {
      ...this.state,
      status: 'connecting',
      walletId,
      error: null,
    };

    this.notifyListeners();
  }

  /**
   * Set disconnected state
   */
  static setDisconnected(): void {
    this.state = {
      status: 'disconnected',
      walletId: null,
      address: null,
      publicKey: null,
      chainId: null,
      connectedAt: null,
      disconnectedAt: Date.now(),
      error: null,
    };

    // Clear saved session
    this.clearSession();
    this.adapter = null;

    this.notifyListeners();
  }

  /**
   * Set error state
   */
  static setError(error: Error, walletId?: string): void {
    this.state = {
      ...this.state,
      status: 'error',
      error,
      walletId: walletId || this.state.walletId,
    };

    this.notifyListeners();
  }

  /**
   * Set unknown state
   */
  static setUnknown(): void {
    this.state = {
      ...this.state,
      status: 'unknown',
      error: null,
    };

    this.notifyListeners();
  }

  /**
   * Set adapter
   */
  static setAdapter(adapter: StacksConnectorAdapter | null): void {
    this.adapter = adapter;
  }

  /**
   * Get adapter
   */
  static getAdapter(): StacksConnectorAdapter | null {
    return this.adapter;
  }

  /**
   * Update connection metadata
   */
  static updateMetadata(metadata: Record<string, any>): void {
    this.state.metadata = {
      ...this.state.metadata,
      ...metadata,
    };

    if (this.state.walletId && this.state.address) {
      const session = this.getSavedSession();
      if (session) {
        this.saveSession({
          ...session,
          metadata: this.state.metadata,
        });
      }
    }

    this.notifyListeners();
  }

  /**
   * Get connection duration in ms
   */
  static getConnectionDuration(): number | null {
    if (!this.state.connectedAt) return null;

    const endTime = this.state.disconnectedAt || Date.now();
    return endTime - this.state.connectedAt;
  }

  /**
   * Check session validity
   */
  static validateSession(): boolean {
    const session = this.getSavedSession();
    
    if (!session) {
      return false;
    }

    if (this.isSessionExpired(session)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Restore session from storage
   */
  static restoreSession(): ConnectionSessionData | null {
    const session = this.getSavedSession();
    
    if (!session || this.isSessionExpired(session)) {
      return null;
    }

    return session;
  }

  /**
   * Get saved session from storage
   */
  private static getSavedSession(): ConnectionSessionData | null {
    try {
      const saved = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!saved) return null;

      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse saved session:', error);
      return null;
    }
  }

  /**
   * Save session to storage
   */
  private static saveSession(session: ConnectionSessionData): void {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
      this.notifySessionListeners(session);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Clear session from storage
   */
  private static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
      this.notifySessionListeners(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is expired
   */
  private static isSessionExpired(session: ConnectionSessionData): boolean {
    return Date.now() > session.expiresAt;
  }

  /**
   * Start session expiry check
   */
  private static startSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check every minute
    this.sessionCheckInterval = setInterval(() => {
      const session = this.getSavedSession();
      
      if (session && this.isSessionExpired(session)) {
        this.setDisconnected();
      }
    }, 60000);
  }

  /**
   * Stop session check
   */
  private static stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Subscribe to state changes
   */
  static onStateChange(listener: (state: WalletConnectionState) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to session changes
   */
  static onSessionChange(listener: (session: ConnectionSessionData | null) => void): () => void {
    this.sessionListeners.add(listener);

    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Notify session listeners
   */
  private static notifySessionListeners(session: ConnectionSessionData | null): void {
    this.sessionListeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        console.error('Session listener error:', error);
      }
    });
  }

  /**
   * Reset to initial state
   */
  static reset(): void {
    this.state = {
      status: 'disconnected',
      walletId: null,
      address: null,
      publicKey: null,
      chainId: null,
      connectedAt: null,
      disconnectedAt: null,
      error: null,
    };

    this.clearSession();
    this.adapter = null;
    this.notifyListeners();
  }

  /**
   * Cleanup
   */
  static destroy(): void {
    this.stopSessionCheck();
    this.listeners.clear();
    this.sessionListeners.clear();
    this.reset();
  }

  /**
   * Get state statistics
   */
  static getStats(): {
    isConnected: boolean;
    status: ConnectionStatus;
    uptime: number | null;
    sessionValid: boolean;
    adaptersLoaded: number;
  } {
    return {
      isConnected: this.isConnected(),
      status: this.state.status,
      uptime: this.getConnectionDuration(),
      sessionValid: this.validateSession(),
      adaptersLoaded: this.adapter ? 1 : 0,
    };
  }

  /**
   * Create state snapshot
   */
  static createSnapshot(): {
    state: WalletConnectionState;
    session: ConnectionSessionData | null;
    timestamp: number;
  } {
    return {
      state: { ...this.state },
      session: this.getSavedSession(),
      timestamp: Date.now(),
    };
  }

  /**
   * Restore from snapshot
   */
  static restoreFromSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void {
    this.state = { ...snapshot.state };
    
    if (snapshot.session) {
      this.saveSession(snapshot.session);
    }

    this.notifyListeners();
  }
}

/**
 * Initialize state manager on module load
 */
if (typeof window !== 'undefined') {
  WalletConnectionStateManager.initialize();
}

/**
 * React hook for connection state
 */
export const useWalletConnectionState = () => {
  const [state, setState] = React.useState<WalletConnectionState>(() =>
    WalletConnectionStateManager.getState()
  );

  React.useEffect(() => {
    const unsubscribe = WalletConnectionStateManager.onStateChange(setState);
    return unsubscribe;
  }, []);

  return state;
};

// Import React for hook
import * as React from 'react';
