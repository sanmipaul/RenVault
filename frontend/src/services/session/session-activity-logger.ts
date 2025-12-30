/**
 * Session Activity Logger
 * Logs and monitors smart session activity for audit and anomaly detection
 */

import { SessionActivityLog, SessionAnomalyAlert, SmartSessionConfig } from '../types/smartsessions';

export class SessionActivityLogger {
  private static instance: SessionActivityLogger;
  private logs: Map<string, SessionActivityLog[]> = new Map();
  private anomalies: SessionAnomalyAlert[] = [];
  private readonly MAX_LOGS_PER_SESSION = 1000;
  private readonly STORAGE_KEY = 'session_activity_logs_v1';

  static getInstance(): SessionActivityLogger {
    if (!SessionActivityLogger.instance) {
      SessionActivityLogger.instance = new SessionActivityLogger();
    }
    return SessionActivityLogger.instance;
  }

  constructor() {
    this.loadLogsFromStorage();
  }

  /**
   * Log session activity
   */
  logActivity(log: SessionActivityLog): void {
    const logs = this.logs.get(log.sessionId) || [];
    logs.push(log);

    // Trim logs if exceeds max
    if (logs.length > this.MAX_LOGS_PER_SESSION) {
      logs.splice(0, logs.length - this.MAX_LOGS_PER_SESSION);
    }

    this.logs.set(log.sessionId, logs);
    this.persistLogsToStorage();
  }

  /**
   * Get activity logs for session
   */
  getSessionLogs(sessionId: string): SessionActivityLog[] {
    return this.logs.get(sessionId) || [];
  }

  /**
   * Get activity logs for a time range
   */
  getLogsByTimeRange(sessionId: string, startTime: number, endTime: number): SessionActivityLog[] {
    const logs = this.logs.get(sessionId) || [];
    return logs.filter((log) => log.timestamp >= startTime && log.timestamp <= endTime);
  }

  /**
   * Count transactions in period
   */
  countTransactionsInPeriod(sessionId: string, periodMs: number): number {
    const now = Date.now();
    const startTime = now - periodMs;
    const logs = this.getLogsByTimeRange(sessionId, startTime, now);
    return logs.filter((log) => log.status === 'success').length;
  }

  /**
   * Detect anomalies in session activity
   */
  detectAnomalies(session: SmartSessionConfig): SessionAnomalyAlert[] {
    const alerts: SessionAnomalyAlert[] = [];
    const logs = this.getSessionLogs(session.id);

    if (logs.length === 0) return alerts;

    // Check transaction rate
    const transactionsPerHour = this.countTransactionsInPeriod(session.id, 3600000);
    if (transactionsPerHour > session.constraints.maxTransactionsPerDay) {
      alerts.push({
        sessionId: session.id,
        severity: 'high',
        type: 'rate_limit_exceeded',
        description: `${transactionsPerHour} transactions in last hour exceeds daily limit`,
        timestamp: Date.now(),
      });
    }

    // Check for unusual amounts (if available)
    const largeTransactions = logs.filter(
      (log) => log.amount && BigInt(log.amount) > BigInt(session.spendingLimit.amount) / BigInt(2)
    );
    if (largeTransactions.length > 3) {
      alerts.push({
        sessionId: session.id,
        severity: 'medium',
        type: 'unusual_amount',
        description: `${largeTransactions.length} large transactions detected`,
        timestamp: Date.now(),
      });
    }

    return alerts;
  }

  /**
   * Add anomaly alert
   */
  addAnomalyAlert(alert: SessionAnomalyAlert): void {
    this.anomalies.push(alert);
    // Keep only recent anomalies (last 100)
    if (this.anomalies.length > 100) {
      this.anomalies.splice(0, this.anomalies.length - 100);
    }
  }

  /**
   * Get recent anomalies
   */
  getRecentAnomalies(limit: number = 10): SessionAnomalyAlert[] {
    return this.anomalies.slice(-limit);
  }

  /**
   * Clear logs for session
   */
  clearSessionLogs(sessionId: string): void {
    this.logs.delete(sessionId);
    this.persistLogsToStorage();
  }

  /**
   * Load logs from storage
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        for (const [sessionId, logs] of Object.entries(data)) {
          this.logs.set(sessionId, logs as SessionActivityLog[]);
        }
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  }

  /**
   * Persist logs to storage
   */
  private persistLogsToStorage(): void {
    try {
      const data: Record<string, SessionActivityLog[]> = {};
      for (const [sessionId, logs] of this.logs.entries()) {
        data[sessionId] = logs;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist activity logs:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.logs.clear();
    this.anomalies = [];
  }
}

export const sessionActivityLogger = SessionActivityLogger.getInstance();
