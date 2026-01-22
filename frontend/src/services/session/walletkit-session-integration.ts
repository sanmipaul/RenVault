/**
 * WalletKit Session Integration Service
 * Provides seamless integration with WalletKit's native session management
 * Features: automatic reconnection, session persistence, event handling
 */

import { AppKitService } from '../walletkit-service';
import { logger } from '../../utils/logger';

export interface WalletKitSession {
  topic: string;
  pairingTopic: string;
  peer: {
    publicKey: string;
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  expiry: number;
  accounts: string[];
  chainId: string;
  permissions?: {
    blockchain?: {
      chains: string[];
      methods: string[];
      events: string[];
    };
    jsonrpc?: {
      methods: string[];
    };
  };
  metadata?: Record<string, any>;
}

export interface SessionEventPayload {
  topic: string;
  params: any;
  timestamp: number;
}

export type SessionEventType = 'session_created' | 'session_updated' | 'session_deleted' | 'session_expired' | 'session_error';

export interface SessionEventListener {
  (event: SessionEventPayload): void;
}

export class WalletKitSessionIntegration {
  private static instance: WalletKitSessionIntegration;
  private appKit: any = null;
  private activeSessions: Map<string, WalletKitSession> = new Map();
  private eventListeners: Map<SessionEventType, Set<SessionEventListener>> = new Map();
  private sessionMonitoringInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_MONITOR_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initializeEventListeners();
  }

  static getInstance(): WalletKitSessionIntegration {
    if (!WalletKitSessionIntegration.instance) {
      WalletKitSessionIntegration.instance = new WalletKitSessionIntegration();
    }
    return WalletKitSessionIntegration.instance;
  }

  /**
   * Initialize WalletKit session integration
   * Loads active sessions from WalletKit and sets up event listeners
   */
  async initialize(appKitService: AppKitService): Promise<void> {
    try {
      logger.info('Initializing WalletKit session integration...');
      const appKit = appKitService.getAppKit();

      if (!appKit) {
        throw new Error('AppKit not available');
      }

      this.appKit = appKit;

      // Subscribe to WalletKit session events
      this.setupWalletKitEventListeners();

      // Load existing sessions
      await this.loadActiveSessions();

      // Start periodic monitoring
      this.startSessionMonitoring();

      logger.info('WalletKit session integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WalletKit session integration', error);
      throw error;
    }
  }

  /**
   * Set up WalletKit event listeners for session lifecycle events
   */
  private setupWalletKitEventListeners(): void {
    if (!this.appKit) return;

    // Session created event
    if (this.appKit.on) {
      this.appKit.on('session_created', (event: any) => {
        logger.info('WalletKit session_created event received', { topic: event.topic });
        this.handleSessionCreated(event);
      });

      // Session updated event
      this.appKit.on('session_updated', (event: any) => {
        logger.info('WalletKit session_updated event received', { topic: event.topic });
        this.handleSessionUpdated(event);
      });

      // Session deleted event
      this.appKit.on('session_deleted', (event: any) => {
        logger.info('WalletKit session_deleted event received', { topic: event.topic });
        this.handleSessionDeleted(event);
      });

      // Session expired event
      if (this.appKit.on('session_expired')) {
        this.appKit.on('session_expired', (event: any) => {
          logger.info('WalletKit session_expired event received', { topic: event.topic });
          this.handleSessionExpired(event);
        });
      }

      // Session error event
      if (this.appKit.on('session_error')) {
        this.appKit.on('session_error', (error: any) => {
          logger.error('WalletKit session error', error);
          this.emitEvent('session_error', {
            topic: error.topic || 'unknown',
            params: error,
            timestamp: Date.now(),
          });
        });
      }
    }
  }

  /**
   * Load active sessions from WalletKit
   */
  private async loadActiveSessions(): Promise<void> {
    try {
      if (!this.appKit) return;

      // Get active sessions from WalletKit
      const sessions = this.appKit.getActiveSessions?.() || [];

      if (!Array.isArray(sessions)) {
        logger.warn('WalletKit getActiveSessions returned non-array', { sessions });
        return;
      }

      // Clear and rebuild active sessions map
      this.activeSessions.clear();

      for (const session of sessions) {
        if (this.isValidSession(session)) {
          this.activeSessions.set(session.topic, session as WalletKitSession);
        }
      }

      logger.info(`Loaded ${this.activeSessions.size} active sessions from WalletKit`);
    } catch (error) {
      logger.error('Failed to load active sessions', error);
    }
  }

  /**
   * Handle session created event
   */
  private handleSessionCreated(event: any): void {
    try {
      const session: WalletKitSession = {
        topic: event.topic,
        pairingTopic: event.pairingTopic || '',
        peer: event.peer || { publicKey: '', metadata: { name: '', description: '', url: '', icons: [] } },
        expiry: event.expiry || Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        accounts: event.accounts || [],
        chainId: event.chainId || 'stacks:1',
        permissions: event.permissions,
        metadata: event.metadata,
      };

      this.activeSessions.set(session.topic, session);

      this.emitEvent('session_created', {
        topic: session.topic,
        params: session,
        timestamp: Date.now(),
      });

      logger.info('Session created and stored', { topic: session.topic });
    } catch (error) {
      logger.error('Error handling session created event', error);
    }
  }

  /**
   * Handle session updated event
   */
  private handleSessionUpdated(event: any): void {
    try {
      const existingSession = this.activeSessions.get(event.topic);

      if (!existingSession) {
        logger.warn('Session update received for unknown session', { topic: event.topic });
        return;
      }

      const updatedSession: WalletKitSession = {
        ...existingSession,
        accounts: event.accounts || existingSession.accounts,
        chainId: event.chainId || existingSession.chainId,
        permissions: event.permissions || existingSession.permissions,
        expiry: event.expiry || existingSession.expiry,
      };

      this.activeSessions.set(event.topic, updatedSession);

      this.emitEvent('session_updated', {
        topic: event.topic,
        params: updatedSession,
        timestamp: Date.now(),
      });

      logger.info('Session updated', { topic: event.topic });
    } catch (error) {
      logger.error('Error handling session updated event', error);
    }
  }

  /**
   * Handle session deleted event
   */
  private handleSessionDeleted(event: any): void {
    try {
      this.activeSessions.delete(event.topic);

      this.emitEvent('session_deleted', {
        topic: event.topic,
        params: { reason: event.reason || 'deleted' },
        timestamp: Date.now(),
      });

      logger.info('Session deleted', { topic: event.topic });
    } catch (error) {
      logger.error('Error handling session deleted event', error);
    }
  }

  /**
   * Handle session expired event
   */
  private handleSessionExpired(event: any): void {
    try {
      this.activeSessions.delete(event.topic);

      this.emitEvent('session_expired', {
        topic: event.topic,
        params: { expiredAt: Date.now() },
        timestamp: Date.now(),
      });

      logger.info('Session expired', { topic: event.topic });
    } catch (error) {
      logger.error('Error handling session expired event', error);
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): WalletKitSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get session by topic
   */
  getSession(topic: string): WalletKitSession | undefined {
    return this.activeSessions.get(topic);
  }

  /**
   * Get the primary/most recent session
   */
  getPrimarySession(): WalletKitSession | undefined {
    if (this.activeSessions.size === 0) return undefined;

    // Return the first session (WalletKit typically manages order)
    return Array.from(this.activeSessions.values())[0];
  }

  /**
   * Check if a session is valid
   */
  private isValidSession(session: any): boolean {
    return (
      session &&
      typeof session === 'object' &&
      'topic' in session &&
      'accounts' in session &&
      'expiry' in session &&
      session.expiry > Date.now()
    );
  }

  /**
   * Check if a session has expired
   */
  isSessionExpired(session: WalletKitSession): boolean {
    return Date.now() > session.expiry;
  }

  /**
   * Extend session expiration
   */
  async extendSession(topic: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(topic);
      if (!session) {
        logger.warn('Cannot extend unknown session', { topic });
        return false;
      }

      // Extend expiration by 7 days
      session.expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

      // Notify WalletKit if it supports session extension
      if (this.appKit?.extendSession) {
        await this.appKit.extendSession(topic);
      }

      logger.info('Session extended', { topic, newExpiry: session.expiry });
      return true;
    } catch (error) {
      logger.error('Failed to extend session', error);
      return false;
    }
  }

  /**
   * Disconnect a session
   */
  async disconnectSession(topic: string): Promise<void> {
    try {
      if (!this.appKit?.disconnectSession) {
        throw new Error('WalletKit disconnectSession not available');
      }

      await this.appKit.disconnectSession({
        topic,
        reason: 'User disconnected',
      });

      this.activeSessions.delete(topic);
      logger.info('Session disconnected', { topic });
    } catch (error) {
      logger.error('Failed to disconnect session', error);
      throw error;
    }
  }

  /**
   * Register event listener
   */
  on(eventType: SessionEventType, listener: SessionEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)?.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: SessionEventType, listener: SessionEventListener): void {
    this.eventListeners.get(eventType)?.delete(listener);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(eventType: SessionEventType, event: SessionEventPayload): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          logger.error(`Error in ${eventType} listener`, error);
        }
      });
    }
  }

  /**
   * Start periodic session monitoring
   */
  private startSessionMonitoring(): void {
    if (this.sessionMonitoringInterval) {
      return;
    }

    this.sessionMonitoringInterval = setInterval(() => {
      this.monitorSessions();
    }, this.SESSION_MONITOR_INTERVAL);

    logger.info('Session monitoring started');
  }

  /**
   * Stop periodic session monitoring
   */
  stopSessionMonitoring(): void {
    if (this.sessionMonitoringInterval) {
      clearInterval(this.sessionMonitoringInterval);
      this.sessionMonitoringInterval = null;
      logger.info('Session monitoring stopped');
    }
  }

  /**
   * Monitor sessions for expiration and validity
   */
  private async monitorSessions(): Promise<void> {
    try {
      const now = Date.now();
      const expiredSessions: string[] = [];

      for (const [topic, session] of this.activeSessions) {
        // Check for expired sessions
        if (now > session.expiry) {
          expiredSessions.push(topic);
        }

        // Check if session is expiring soon (within 1 day)
        const timeUntilExpiry = session.expiry - now;
        if (timeUntilExpiry < 24 * 60 * 60 * 1000 && timeUntilExpiry > 0) {
          // Attempt to extend session
          await this.extendSession(topic);
        }
      }

      // Remove expired sessions
      for (const topic of expiredSessions) {
        this.activeSessions.delete(topic);
        this.emitEvent('session_expired', {
          topic,
          params: { expiredAt: Date.now() },
          timestamp: Date.now(),
        });
      }

      if (expiredSessions.length > 0) {
        logger.info('Expired sessions removed', { count: expiredSessions.length });
      }
    } catch (error) {
      logger.error('Error monitoring sessions', error);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    expiringSoon: number;
  } {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let expiringSoon = 0;

    for (const session of this.activeSessions.values()) {
      if (session.expiry - now < oneDayMs) {
        expiringSoon++;
      }
    }

    return {
      totalSessions: this.activeSessions.size,
      activeSessions: Array.from(this.activeSessions.values()).filter(s => !this.isSessionExpired(s)).length,
      expiringSoon,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopSessionMonitoring();
    this.activeSessions.clear();
    this.eventListeners.clear();
    this.appKit = null;
    logger.info('WalletKit session integration destroyed');
  }

  /**
   * Initialize event listeners map
   */
  private initializeEventListeners(): void {
    this.eventListeners.set('session_created', new Set());
    this.eventListeners.set('session_updated', new Set());
    this.eventListeners.set('session_deleted', new Set());
    this.eventListeners.set('session_expired', new Set());
    this.eventListeners.set('session_error', new Set());
  }
}

export const walletKitSessionIntegration = WalletKitSessionIntegration.getInstance();
