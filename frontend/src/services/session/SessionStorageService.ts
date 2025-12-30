// services/session/SessionStorageService.ts
import { WalletProviderType } from '../../types/wallet';

export interface WalletSession {
  providerType: WalletProviderType;
  address: string;
  publicKey: string;
  connectedAt: number;
  expiresAt: number;
  sessionId: string;
  metadata?: {
    chainId?: string;
    network?: string;
    permissions?: string[];
  };
}

export interface SessionConfig {
  maxAge: number; // in milliseconds
  secure: boolean;
  httpOnly: boolean; // for future server-side storage
  sameSite: 'strict' | 'lax' | 'none';
}

export class SessionStorageService {
  private static instance: SessionStorageService;
  private readonly STORAGE_KEY = 'renvault_wallet_session';
  private readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  private constructor() {}

  static getInstance(): SessionStorageService {
    if (!SessionStorageService.instance) {
      SessionStorageService.instance = new SessionStorageService();
    }
    return SessionStorageService.instance;
  }

  // Store wallet session securely
  storeSession(session: Omit<WalletSession, 'expiresAt' | 'sessionId'>): void {
    try {
      const fullSession: WalletSession = {
        ...session,
        expiresAt: Date.now() + this.SESSION_DURATION,
        sessionId: this.generateSessionId()
      };

      // Encrypt sensitive data before storage
      const encryptedSession = this.encryptSession(fullSession);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedSession));
      console.log('Wallet session stored securely');
    } catch (error) {
      console.error('Failed to store wallet session:', error);
      throw new Error('Failed to store wallet session');
    }
  }

  // Retrieve and decrypt stored session
  getStoredSession(): WalletSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const encryptedSession = JSON.parse(stored);
      const session = this.decryptSession(encryptedSession);

      // Check if session is still valid
      if (this.isSessionExpired(session)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to retrieve wallet session:', error);
      this.clearSession(); // Clear corrupted data
      return null;
    }
  }

  // Check if a valid session exists
  hasValidSession(): boolean {
    const session = this.getStoredSession();
    return session !== null;
  }

  // Clear stored session
  clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Wallet session cleared');
    } catch (error) {
      console.error('Failed to clear wallet session:', error);
    }
  }

  // Update session metadata
  updateSessionMetadata(metadata: Partial<WalletSession['metadata']>): void {
    const session = this.getStoredSession();
    if (!session) return;

    session.metadata = { ...session.metadata, ...metadata };
    this.storeSession(session);
  }

  // Extend session expiration
  extendSession(): void {
    const session = this.getStoredSession();
    if (!session) return;

    session.expiresAt = Date.now() + this.SESSION_DURATION;
    this.storeSession(session);
  }

  // Get session expiration time
  getSessionExpiration(): number | null {
    const session = this.getStoredSession();
    return session?.expiresAt || null;
  }

  // Check if session is expired
  private isSessionExpired(session: WalletSession): boolean {
    return Date.now() > session.expiresAt;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Simple encryption for sensitive session data (in production, use proper encryption)
  private encryptSession(session: WalletSession): any {
    // In a real implementation, you would use proper encryption
    // For now, we'll use base64 encoding as a basic obfuscation
    const sessionString = JSON.stringify(session);
    const encoded = btoa(sessionString);

    return {
      data: encoded,
      checksum: this.generateChecksum(sessionString)
    };
  }

  // Decrypt session data
  private decryptSession(encrypted: any): WalletSession {
    try {
      const decoded = atob(encrypted.data);
      const session: WalletSession = JSON.parse(decoded);

      // Verify checksum
      const checksum = this.generateChecksum(JSON.stringify(session));
      if (checksum !== encrypted.checksum) {
        throw new Error('Session data integrity check failed');
      }

      return session;
    } catch (error) {
      throw new Error('Failed to decrypt session data');
    }
  }

  // Generate checksum for data integrity
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Get session info for debugging
  getSessionInfo(): { hasSession: boolean; expiresAt?: number; providerType?: string } {
    const session = this.getStoredSession();
    if (!session) {
      return { hasSession: false };
    }

    return {
      hasSession: true,
      expiresAt: session.expiresAt,
      providerType: session.providerType
    };
  }

  // Clean up expired sessions (can be called periodically)
  cleanupExpiredSessions(): void {
    const session = this.getStoredSession();
    if (session && this.isSessionExpired(session)) {
      this.clearSession();
    }
  }

  // Clean up all wallet-related data
  clearAllWalletData(): void {
    try {
      // Clear session data
      this.clearSession();

      // Clear any other wallet-related localStorage keys
      const keysToRemove = [
        'leather-session',
        'xverse-session',
        'hiro-session',
        'walletconnect-session',
        'renvault-wallet-state',
        'stacks-connect-session'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('All wallet data cleared');
    } catch (error) {
      console.error('Failed to clear wallet data:', error);
    }
  }

  // Validate session data integrity
  validateSessionIntegrity(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const encryptedSession = JSON.parse(stored);
      const session = this.decryptSession(encryptedSession);

      // Check if session structure is valid
      if (!session.providerType || !session.address || !session.publicKey || !session.expiresAt) {
        return false;
      }

      // Check expiration
      return !this.isSessionExpired(session);
    } catch (error) {
      console.error('Session integrity check failed:', error);
      return false;
    }
  }
}
}