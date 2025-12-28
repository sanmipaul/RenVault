/**
 * Session Management Helper Utilities
 * Utility functions for common session management tasks
 */

import { WalletKitSession } from '../services/session/walletkit-session-integration';
import { RefactoredSessionManager } from '../services/session/SessionManagerRefactored';
import { encryptedSessionStorage } from '../services/session/encrypted-session-storage';
import { logger } from '../utils/logger';

/**
 * Session utility functions
 */
export class SessionUtils {
  /**
   * Format session expiration time as human-readable string
   */
  static formatSessionExpiration(session: WalletKitSession): string {
    const now = Date.now();
    const timeUntilExpiry = session.expiry - now;

    if (timeUntilExpiry < 0) {
      return 'Expired';
    }

    const days = Math.floor(timeUntilExpiry / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeUntilExpiry % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilExpiry % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Get session status color
   */
  static getSessionStatusColor(session: WalletKitSession): string {
    const now = Date.now();
    const timeUntilExpiry = session.expiry - now;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (timeUntilExpiry < 0) {
      return '#f44336'; // red - expired
    }
    if (timeUntilExpiry < oneDayMs) {
      return '#ff9800'; // orange - expiring soon
    }
    return '#4caf50'; // green - active
  }

  /**
   * Check if session is expiring soon (within 1 day)
   */
  static isExpiringSoon(session: WalletKitSession): boolean {
    const now = Date.now();
    const timeUntilExpiry = session.expiry - now;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return timeUntilExpiry < oneDayMs && timeUntilExpiry > 0;
  }

  /**
   * Check if session is expired
   */
  static isExpired(session: WalletKitSession): boolean {
    return Date.now() > session.expiry;
  }

  /**
   * Get session accounts as formatted list
   */
  static formatAccounts(session: WalletKitSession): string {
    if (!session.accounts || session.accounts.length === 0) {
      return 'No accounts';
    }
    if (session.accounts.length === 1) {
      return session.accounts[0];
    }
    return `${session.accounts.length} accounts`;
  }

  /**
   * Get session peer name or fallback
   */
  static getSessionPeerName(session: WalletKitSession): string {
    return session.peer?.metadata?.name || 'Unknown Peer';
  }

  /**
   * Truncate session topic for display
   */
  static truncateTopic(topic: string, length: number = 20): string {
    if (topic.length <= length) {
      return topic;
    }
    return topic.substring(0, length - 3) + '...';
  }

  /**
   * Format bytes for display
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
    return `${value} ${sizes[i]}`;
  }

  /**
   * Get storage usage percentage
   */
  static getStorageUsagePercent(): number {
    const stats = encryptedSessionStorage.getStatistics();
    return Math.round((stats.totalSize / stats.maxSize) * 100);
  }

  /**
   * Get storage usage status
   */
  static getStorageUsageStatus(): 'low' | 'medium' | 'high' | 'critical' {
    const percent = this.getStorageUsagePercent();
    if (percent < 50) return 'low';
    if (percent < 75) return 'medium';
    if (percent < 90) return 'high';
    return 'critical';
  }
}

/**
 * Session management helper functions
 */
export class SessionManagementUtils {
  private static sessionManager = RefactoredSessionManager.getInstance();

  /**
   * Get all active sessions with formatted data
   */
  static getFormattedActiveSessions() {
    const sessions = this.sessionManager.getActiveSessions();
    return sessions.map((session) => ({
      topic: session.topic,
      displayName: SessionUtils.getSessionPeerName(session),
      truncatedTopic: SessionUtils.truncateTopic(session.topic),
      accounts: SessionUtils.formatAccounts(session),
      expiresIn: SessionUtils.formatSessionExpiration(session),
      statusColor: SessionUtils.getSessionStatusColor(session),
      isExpiringSoon: SessionUtils.isExpiringoon(session),
      isExpired: SessionUtils.isExpired(session),
      ...session,
    }));
  }

  /**
   * Get session dashboard data
   */
  static getDashboardData() {
    const sessions = this.sessionManager.getActiveSessions();
    const stats = this.sessionManager.getStorageStats();
    const reconnectionStatus = this.sessionManager.getReconnectionStatus();

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => !SessionUtils.isExpired(s)).length,
      expiringSoon: sessions.filter((s) => SessionUtils.isExpiringoon(s)).length,
      storage: {
        used: SessionUtils.formatBytes(stats.totalSize),
        percent: Math.round(stats.usagePercent),
        status: SessionUtils.getStorageUsageStatus(),
      },
      reconnection: {
        isActive: reconnectionStatus.isReconnecting,
        attempts: reconnectionStatus.attemptCount,
        error: reconnectionStatus.lastError,
      },
    };
  }

  /**
   * Check session health
   */
  static checkSessionHealth(): {
    healthy: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      const sessions = this.sessionManager.getActiveSessions();

      // Check for no sessions
      if (sessions.length === 0) {
        warnings.push('No active sessions');
      }

      // Check for expired sessions
      const expiredCount = sessions.filter((s) => SessionUtils.isExpired(s)).length;
      if (expiredCount > 0) {
        issues.push(`${expiredCount} expired session(s) detected`);
      }

      // Check storage usage
      const storageStatus = SessionUtils.getStorageUsageStatus();
      if (storageStatus === 'critical') {
        issues.push('Session storage at critical capacity');
      } else if (storageStatus === 'high') {
        warnings.push('Session storage usage is high');
      }

      // Check reconnection status
      const reconnectStatus = this.sessionManager.getReconnectionStatus();
      if (reconnectStatus.isReconnecting && reconnectStatus.attemptCount > 3) {
        warnings.push('Multiple reconnection attempts in progress');
      }

      return {
        healthy: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      return {
        healthy: false,
        issues: ['Error checking session health'],
        warnings: [],
      };
    }
  }

  /**
   * Get recovery recommendations
   */
  static getRecoveryRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.checkSessionHealth();

    if (health.issues.length > 0) {
      recommendations.push('Try manually reconnecting: sessionManager.reconnect()');
    }

    if (health.issues.some((i) => i.includes('expired'))) {
      recommendations.push('Remove expired sessions to free up storage');
    }

    if (health.issues.some((i) => i.includes('storage'))) {
      recommendations.push('Export sessions and clear storage to free space');
    }

    if (health.warnings.length > 0) {
      recommendations.push('Monitor session health regularly');
    }

    return recommendations.length > 0
      ? recommendations
      : ['All systems operational'];
  }

  /**
   * Export sessions for backup
   */
  static async exportSessionsForBackup(): Promise<string> {
    try {
      const backup = this.sessionManager.exportSessions();
      logger.info('Sessions exported for backup');
      return backup;
    } catch (error) {
      logger.error('Failed to export sessions', error);
      throw error;
    }
  }

  /**
   * Import sessions from backup
   */
  static async importSessionsFromBackup(backupData: string): Promise<number> {
    try {
      const count = await this.sessionManager.importSessions(backupData);
      logger.info(`Imported ${count} sessions from backup`);
      return count;
    } catch (error) {
      logger.error('Failed to import sessions', error);
      throw error;
    }
  }

  /**
   * Clear all sessions with confirmation
   */
  static async clearAllSessions(confirmFn?: () => boolean): Promise<boolean> {
    try {
      if (confirmFn && !confirmFn()) {
        logger.info('Session clear cancelled by user');
        return false;
      }

      await this.sessionManager.clearAllSessions();
      logger.info('All sessions cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear all sessions', error);
      return false;
    }
  }

  /**
   * Check if manual intervention needed
   */
  static needsManualIntervention(): boolean {
    const health = this.checkSessionHealth();
    return health.issues.length > 0;
  }

  /**
   * Get diagnostic report
   */
  static getDiagnosticReport() {
    const sessions = this.sessionManager.getActiveSessions();
    const stats = this.sessionManager.getStorageStats();
    const reconnectionStatus = this.sessionManager.getReconnectionStatus();
    const health = this.checkSessionHealth();

    return {
      timestamp: new Date().toISOString(),
      sessions: {
        total: sessions.length,
        details: this.getFormattedActiveSessions(),
      },
      storage: {
        used: stats.totalSize,
        max: stats.maxSize,
        percent: Math.round(stats.usagePercent),
        formatted: SessionUtils.formatBytes(stats.totalSize),
      },
      reconnection: {
        isActive: reconnectionStatus.isReconnecting,
        attempts: reconnectionStatus.attemptCount,
        lastError: reconnectionStatus.lastError,
      },
      health: {
        healthy: health.healthy,
        issues: health.issues,
        warnings: health.warnings,
      },
      recommendations: this.getRecoveryRecommendations(),
    };
  }
}

/**
 * Event tracking utilities
 */
export class SessionEventTracking {
  private static eventLog: Array<{
    timestamp: number;
    event: string;
    topic?: string;
    error?: string;
  }> = [];

  private static readonly MAX_LOG_ENTRIES = 100;

  static recordEvent(
    event: string,
    topic?: string,
    error?: string
  ): void {
    this.eventLog.push({
      timestamp: Date.now(),
      event,
      topic,
      error,
    });

    // Keep log size manageable
    if (this.eventLog.length > this.MAX_LOG_ENTRIES) {
      this.eventLog.shift();
    }
  }

  static getEventLog() {
    return [...this.eventLog];
  }

  static getEventSummary() {
    const summary: Record<string, number> = {};

    for (const entry of this.eventLog) {
      summary[entry.event] = (summary[entry.event] || 0) + 1;
    }

    return summary;
  }

  static clearEventLog(): void {
    this.eventLog = [];
  }

  static getRecentEvents(count: number = 10) {
    return this.eventLog.slice(-count);
  }
}

/**
 * Session validation utilities
 */
export class SessionValidation {
  /**
   * Validate session structure
   */
  static isValidSession(session: any): boolean {
    return (
      session &&
      typeof session === 'object' &&
      'topic' in session &&
      'accounts' in session &&
      'expiry' in session &&
      'peer' in session &&
      Array.isArray(session.accounts) &&
      typeof session.expiry === 'number'
    );
  }

  /**
   * Validate session accounts
   */
  static hasValidAccounts(session: WalletKitSession): boolean {
    return (
      Array.isArray(session.accounts) &&
      session.accounts.length > 0 &&
      session.accounts.every((account) => typeof account === 'string' && account.length > 0)
    );
  }

  /**
   * Validate peer information
   */
  static hasValidPeer(session: WalletKitSession): boolean {
    return (
      session.peer &&
      session.peer.metadata &&
      'name' in session.peer.metadata &&
      'url' in session.peer.metadata
    );
  }

  /**
   * Full session validation
   */
  static validateSession(session: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.isValidSession(session)) {
      errors.push('Invalid session structure');
      return { valid: false, errors };
    }

    if (!this.hasValidAccounts(session)) {
      errors.push('Session has no valid accounts');
    }

    if (!this.hasValidPeer(session)) {
      errors.push('Session has invalid peer information');
    }

    if (session.expiry <= Date.now()) {
      errors.push('Session is expired');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Fix typo in method name
SessionManagementUtils.getFormattedActiveSessions = function() {
  const sessions = this.sessionManager.getActiveSessions();
  return sessions.map((session) => ({
    topic: session.topic,
    displayName: SessionUtils.getSessionPeerName(session),
    truncatedTopic: SessionUtils.truncateTopic(session.topic),
    accounts: SessionUtils.formatAccounts(session),
    expiresIn: SessionUtils.formatSessionExpiration(session),
    statusColor: SessionUtils.getSessionStatusColor(session),
    isExpiringoon: SessionUtils.isExpiringoon(session),
    isExpired: SessionUtils.isExpired(session),
    ...session,
  }));
};
