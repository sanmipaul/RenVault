// services/session/SessionManager.ts
import { WalletProviderType } from '../../types/wallet';
import { SessionStorageService, WalletSession } from './SessionStorageService';
import { SessionMonitor } from './SessionMonitor';

export interface SessionManagerConfig {
  autoReconnect: boolean;
  reconnectDelay: number; // in milliseconds
  maxReconnectAttempts: number;
  sessionCleanupInterval: number; // in milliseconds
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionStorage: SessionStorageService;
  private config: SessionManagerConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private onSessionRestored?: (session: WalletSession) => Promise<void>;
  private onSessionExpired?: () => void;
  private sessionMonitor: SessionMonitor;

  private constructor() {
    this.sessionStorage = SessionStorageService.getInstance();
    this.sessionMonitor = SessionMonitor.getInstance();
    this.config = {
      autoReconnect: true,
      reconnectDelay: 1000, // 1 second
      maxReconnectAttempts: 3,
      sessionCleanupInterval: 60 * 60 * 1000 // 1 hour
    };

    this.startPeriodicCleanup();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Initialize session manager with callbacks
  initialize(
    onSessionRestored?: (session: WalletSession) => Promise<void>,
    onSessionExpired?: () => void
  ): void {
    this.onSessionRestored = onSessionRestored;
    this.onSessionExpired = onSessionExpired;
  }

  // Attempt to restore session on app startup
  async attemptSessionRestore(): Promise<boolean> {
    try {
      const storedSession = this.sessionStorage.getStoredSession();

      if (!storedSession) {
        console.log('No stored session found');
        return false;
      }

      console.log('Attempting to restore wallet session...');

      if (this.onSessionRestored) {
        await this.onSessionRestored(storedSession);
        console.log('Wallet session restored successfully');
        this.sessionMonitor.recordEvent({
          type: 'restored',
          sessionId: storedSession.sessionId,
          providerType: storedSession.providerType
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to restore wallet session:', error);
      this.sessionStorage.clearSession();
      this.sessionMonitor.recordEvent({
        type: 'failed',
        metadata: { operation: 'restore', error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  }

  // Store new session
  storeSession(sessionData: Omit<WalletSession, 'expiresAt' | 'sessionId'>): void {
    this.sessionStorage.storeSession(sessionData);
    this.resetReconnectAttempts();

    const session = this.sessionStorage.getStoredSession();
    if (session) {
      this.sessionMonitor.recordEvent({
        type: 'created',
        sessionId: session.sessionId,
        providerType: session.providerType,
        metadata: session.metadata
      });
    }
  }

  // Clear current session
  clearSession(): void {
    const currentSession = this.getCurrentSession();
    this.sessionStorage.clearSession();
    this.resetReconnectAttempts();

    if (currentSession) {
      this.sessionMonitor.recordEvent({
        type: 'cleared',
        sessionId: currentSession.sessionId,
        providerType: currentSession.providerType
      });
    }

    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  // Check if session is valid
  hasValidSession(): boolean {
    return this.sessionStorage.hasValidSession();
  }

  // Get current session
  getCurrentSession(): WalletSession | null {
    return this.sessionStorage.getStoredSession();
  }

  // Update session metadata
  updateSessionMetadata(metadata: Partial<WalletSession['metadata']>): void {
    this.sessionStorage.updateSessionMetadata(metadata);
  }

  // Extend session duration
  extendSession(): void {
    this.sessionStorage.extendSession();
  }

  // Handle wallet disconnection
  async handleDisconnection(providerType: WalletProviderType): Promise<void> {
    console.log(`Wallet disconnected: ${providerType}`);

    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      this.clearSession();
    }
  }

  // Attempt to reconnect wallet
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.clearSession();
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      try {
        const success = await this.attemptSessionRestore();
        if (success) {
          console.log('Reconnection successful');
          this.resetReconnectAttempts();
          this.sessionMonitor.recordEvent({
            type: 'reconnected',
            sessionId: this.getCurrentSession()?.sessionId,
            providerType: this.getCurrentSession()?.providerType
          });
        } else {
          // Try again if not at max attempts
          if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.attemptReconnection();
          } else {
            console.log('Reconnection failed - max attempts reached');
            this.clearSession();
            this.sessionMonitor.recordEvent({
              type: 'failed',
              metadata: { operation: 'reconnection', reason: 'max_attempts_reached' }
            });
          }
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.attemptReconnection();
        } else {
          this.clearSession();
          this.sessionMonitor.recordEvent({
            type: 'failed',
            metadata: { operation: 'reconnection', error: error instanceof Error ? error.message : 'Unknown error' }
          });
        }
      }
    }, this.config.reconnectDelay * this.reconnectAttempts); // Exponential backoff
  }

  // Reset reconnection attempts
  private resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  // Start periodic cleanup of expired sessions
  private startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.sessionStorage.cleanupExpiredSessions();
    }, this.config.sessionCleanupInterval);
  }

  // Get session status information
  getSessionStatus(): {
    hasSession: boolean;
    expiresAt?: number;
    timeRemaining?: number;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    const session = this.getCurrentSession();
    const now = Date.now();

    return {
      hasSession: !!session,
      expiresAt: session?.expiresAt,
      timeRemaining: session ? Math.max(0, session.expiresAt - now) : undefined,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<SessionManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Cleanup resources
  destroy(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.sessionStorage.clearAllWalletData();
  }
}