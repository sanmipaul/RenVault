/**
 * Smart Sessions Analytics
 * Track and analyze smart session usage patterns
 */

import { SmartSessionConfig } from '../types/smartsessions';
import { analyticsService } from './analytics-service';

export interface SessionAnalytics {
  sessionId: string;
  createdAt: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalSpent: string; // in microSTX
  averageTransactionValue: string;
  uptimePercentage: number;
}

export class SmartSessionAnalytics {
  private static instance: SmartSessionAnalytics;

  static getInstance(): SmartSessionAnalytics {
    if (!SmartSessionAnalytics.instance) {
      SmartSessionAnalytics.instance = new SmartSessionAnalytics();
    }
    return SmartSessionAnalytics.instance;
  }

  /**
   * Track session creation
   */
  trackSessionCreated(session: SmartSessionConfig): void {
    analyticsService.trackFeatureAdoption('smart_session_created', {
      session_id: session.id,
      duration_days: Math.ceil(session.duration / (1000 * 60 * 60 * 24)),
      spending_limit_stx: (BigInt(session.spendingLimit.amount) / BigInt(1000000)).toString(),
      operations_count: session.constraints.operationWhitelist.length,
      allows_batching: session.constraints.allowBatching ? 1 : 0,
    });
  }

  /**
   * Track session revocation
   */
  trackSessionRevoked(sessionId: string, reason?: string): void {
    analyticsService.trackFeatureAdoption('smart_session_revoked', {
      session_id: sessionId,
      reason: reason || 'user_initiated',
    });
  }

  /**
   * Track session expiration
   */
  trackSessionExpired(sessionId: string): void {
    analyticsService.trackFeatureAdoption('smart_session_expired', {
      session_id: sessionId,
    });
  }

  /**
   * Track automated transaction
   */
  trackAutomatedTransaction(sessionId: string, operation: string, amount?: string): void {
    analyticsService.trackFeatureAdoption('smart_session_auto_transaction', {
      session_id: sessionId,
      operation,
      amount: amount || '0',
    });
  }

  /**
   * Track anomaly detection
   */
  trackAnomalyDetected(sessionId: string, anomalyType: string, severity: string): void {
    analyticsService.trackError('smart_session_anomaly', `Anomaly detected: ${anomalyType}`, {
      session_id: sessionId,
      anomaly_type: anomalyType,
      severity,
    });
  }

  /**
   * Track permission validation
   */
  trackPermissionValidation(sessionId: string, allowed: boolean): void {
    analyticsService.trackFeatureAdoption('smart_session_permission_check', {
      session_id: sessionId,
      allowed: allowed ? 1 : 0,
    });
  }
}

export const smartSessionAnalytics = SmartSessionAnalytics.getInstance();
