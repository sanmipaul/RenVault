/**
 * Session Revocation Service
 * Handles emergency revocation and session cleanup
 */

import { smartSessionService } from './session/smart-session.service';
import { sessionActivityLogger } from './session/session-activity-logger';
import { smartSessionAnalytics } from './smart-session-analytics';

export class SessionRevocationService {
  private static instance: SessionRevocationService;

  static getInstance(): SessionRevocationService {
    if (!SessionRevocationService.instance) {
      SessionRevocationService.instance = new SessionRevocationService();
    }
    return SessionRevocationService.instance;
  }

  /**
   * Revoke a single session
   */
  revokeSession(sessionId: string, reason?: string): void {
    smartSessionService.revokeSession(sessionId);
    smartSessionAnalytics.trackSessionRevoked(sessionId, reason);
  }

  /**
   * Emergency revoke all sessions for a wallet
   */
  emergencyRevokeAll(walletAddress: string, reason?: string): number {
    smartSessionService.revokeAllSessions(walletAddress);
    const sessions = smartSessionService.getAllSessions();
    const revokedCount = sessions.filter((s) => s.walletAddress === walletAddress).length;
    
    smartSessionAnalytics.trackSessionRevoked(
      'all_sessions',
      reason || 'emergency_revocation'
    );
    
    return revokedCount;
  }

  /**
   * Revoke sessions by severity level
   * Revoke high-risk sessions (based on anomalies)
   */
  revokeHighRiskSessions(severity: 'high' | 'medium' | 'low'): number {
    let revokedCount = 0;
    const allSessions = smartSessionService.getAllSessions();

    for (const session of allSessions) {
      const anomalies = sessionActivityLogger.detectAnomalies(session);
      const hasHighSeverity = anomalies.some((a) => a.severity === severity);

      if (hasHighSeverity) {
        this.revokeSession(session.id, `auto_revoke_${severity}_anomaly`);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleanedCount = 0;
    const allSessions = smartSessionService.getAllSessions();

    for (const session of allSessions) {
      if (Date.now() > session.expiresAt && session.id) {
        sessionActivityLogger.clearSessionLogs(session.id);
        smartSessionService.deleteSession(session.id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get revocation audit trail
   */
  getRevocationAudit(): Array<{ sessionId: string; revokedAt: number; reason?: string }> {
    // In a real implementation, this would be stored in an audit log
    return [];
  }
}

export const sessionRevocationService = SessionRevocationService.getInstance();
