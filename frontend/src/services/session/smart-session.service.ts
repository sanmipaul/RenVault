/**
 * Smart Session Config Service
 * Manages Smart Session creation, storage, and lifecycle
 */

import { SmartSessionConfig, SessionStatus, SessionConstraints, SpendingLimit } from '../types/smartsessions';
import { sessionPermissionManager } from './session/session-permission-manager';

export interface CreateSessionOptions {
  duration: number; // in milliseconds
  spendingLimit: SpendingLimit;
  constraints: SessionConstraints;
  walletAddress: string;
}

export class SmartSessionService {
  private static instance: SmartSessionService;
  private sessions: Map<string, SmartSessionConfig> = new Map();
  private readonly STORAGE_KEY = 'smart_sessions_v1';
  private readonly ENCRYPTION_ENABLED = true;

  static getInstance(): SmartSessionService {
    if (!SmartSessionService.instance) {
      SmartSessionService.instance = new SmartSessionService();
    }
    return SmartSessionService.instance;
  }

  constructor() {
    this.loadSessionsFromStorage();
  }

  /**
   * Create a new smart session
   */
  createSession(options: CreateSessionOptions): SmartSessionConfig {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + options.duration;

    const session: SmartSessionConfig = {
      id: sessionId,
      walletAddress: options.walletAddress,
      duration: options.duration,
      createdAt: now,
      expiresAt,
      status: SessionStatus.ACTIVE,
      spendingLimit: options.spendingLimit,
      constraints: options.constraints,
      isEncrypted: this.ENCRYPTION_ENABLED,
      encryptionKey: this.deriveEncryptionKey(options.walletAddress, sessionId),
    };

    this.sessions.set(sessionId, session);
    this.persistSessionsToStorage();
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SmartSessionConfig | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions for a wallet
   */
  getActiveSessions(walletAddress: string): SmartSessionConfig[] {
    const now = Date.now();
    return Array.from(this.sessions.values()).filter(
      (session) =>
        session.walletAddress === walletAddress &&
        session.status === SessionStatus.ACTIVE &&
        session.expiresAt > now
    );
  }

  /**
   * Revoke a session
   */
  revokeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = SessionStatus.REVOKED;
      this.persistSessionsToStorage();
    }
  }

  /**
   * Revoke all sessions for a wallet
   */
  revokeAllSessions(walletAddress: string): void {
    for (const session of this.sessions.values()) {
      if (session.walletAddress === walletAddress && session.status === SessionStatus.ACTIVE) {
        session.status = SessionStatus.REVOKED;
      }
    }
    this.persistSessionsToStorage();
  }

  /**
   * Check if session is expired and update status
   */
  refreshSessionStatus(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.status === SessionStatus.ACTIVE && Date.now() > session.expiresAt) {
      session.status = SessionStatus.EXPIRED;
      this.persistSessionsToStorage();
    }
  }

  /**
   * Get all sessions (for admin)
   */
  getAllSessions(): SmartSessionConfig[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete session from storage
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.persistSessionsToStorage();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Derive encryption key (simple version)
   */
  private deriveEncryptionKey(walletAddress: string, sessionId: string): string {
    // In production, use proper key derivation (PBKDF2, Argon2, etc.)
    const combined = walletAddress + sessionId;
    return Buffer.from(combined).toString('base64').substring(0, 32);
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        for (const sessionData of data) {
          this.sessions.set(sessionData.id, sessionData);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions from storage:', error);
    }
  }

  /**
   * Persist sessions to localStorage
   */
  private persistSessionsToStorage(): void {
    try {
      const data = Array.from(this.sessions.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist sessions to storage:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.sessions.clear();
  }
}

export const smartSessionService = SmartSessionService.getInstance();
