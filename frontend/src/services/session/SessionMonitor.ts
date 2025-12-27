// services/session/SessionMonitor.ts
import { SessionManager } from './SessionManager';
import { WalletSession } from './SessionStorageService';

export interface SessionEvent {
  type: 'created' | 'restored' | 'expired' | 'extended' | 'cleared' | 'reconnected' | 'failed';
  timestamp: number;
  sessionId?: string;
  providerType?: string;
  metadata?: any;
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  reconnectionAttempts: number;
  successfulReconnections: number;
  failedReconnections: number;
}

export class SessionMonitor {
  private static instance: SessionMonitor;
  private events: SessionEvent[] = [];
  private maxEvents: number = 1000;
  private sessionManager: SessionManager;

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
    this.startPeriodicMetricsCollection();
  }

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  // Record a session event
  recordEvent(event: Omit<SessionEvent, 'timestamp'>): void {
    const fullEvent: SessionEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    console.log(`Session event recorded: ${event.type}`, event);
  }

  // Get recent events
  getRecentEvents(limit: number = 50): SessionEvent[] {
    return this.events.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: SessionEvent['type']): SessionEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // Get session metrics
  getMetrics(): SessionMetrics {
    const now = Date.now();
    const allEvents = this.events;

    const sessionCreated = allEvents.filter(e => e.type === 'created');
    const sessionExpired = allEvents.filter(e => e.type === 'expired');
    const reconnections = allEvents.filter(e => e.type === 'reconnected');
    const failedReconnections = allEvents.filter(e => e.type === 'failed');

    // Calculate average session duration
    const sessionDurations: number[] = [];
    const sessionStartTimes = new Map<string, number>();

    allEvents.forEach(event => {
      if (event.type === 'created' && event.sessionId) {
        sessionStartTimes.set(event.sessionId, event.timestamp);
      } else if ((event.type === 'expired' || event.type === 'cleared') && event.sessionId) {
        const startTime = sessionStartTimes.get(event.sessionId);
        if (startTime) {
          sessionDurations.push(event.timestamp - startTime);
          sessionStartTimes.delete(event.sessionId);
        }
      }
    });

    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    return {
      totalSessions: sessionCreated.length,
      activeSessions: sessionStartTimes.size,
      expiredSessions: sessionExpired.length,
      averageSessionDuration,
      reconnectionAttempts: reconnections.length + failedReconnections.length,
      successfulReconnections: reconnections.length,
      failedReconnections: failedReconnections.length
    };
  }

  // Get session health report
  getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for high failure rates
    const totalReconnections = metrics.reconnectionAttempts;
    if (totalReconnections > 0) {
      const failureRate = metrics.failedReconnections / totalReconnections;
      if (failureRate > 0.5) {
        issues.push(`High reconnection failure rate: ${(failureRate * 100).toFixed(1)}%`);
        recommendations.push('Investigate wallet connection issues');
      }
    }

    // Check for frequent session expirations
    if (metrics.expiredSessions > metrics.totalSessions * 0.3) {
      issues.push('High session expiration rate detected');
      recommendations.push('Consider increasing session duration or improving user experience');
    }

    // Check for very short average session duration
    if (metrics.averageSessionDuration < 24 * 60 * 60 * 1000) { // Less than 24 hours
      issues.push('Average session duration is very short');
      recommendations.push('Review session timeout settings');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      recommendations
    };
  }

  // Export session data for analysis
  exportSessionData(): {
    events: SessionEvent[];
    metrics: SessionMetrics;
    healthReport: ReturnType<SessionMonitor['getHealthReport']>;
    exportTime: number;
  } {
    return {
      events: this.events,
      metrics: this.getMetrics(),
      healthReport: this.getHealthReport(),
      exportTime: Date.now()
    };
  }

  // Clear old events (cleanup)
  clearOldEvents(olderThanDays: number = 30): void {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
  }

  // Start periodic metrics collection
  private startPeriodicMetricsCollection(): void {
    // Collect metrics every hour
    setInterval(() => {
      const metrics = this.getMetrics();
      console.log('Session metrics:', metrics);

      // Log warnings for concerning metrics
      const health = this.getHealthReport();
      if (health.status !== 'healthy') {
        console.warn('Session health issues detected:', health.issues);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  // Get session analytics for a specific time period
  getAnalytics(startTime: number, endTime: number = Date.now()): {
    periodEvents: SessionEvent[];
    periodMetrics: Partial<SessionMetrics>;
    peakUsageHours: number[];
  } {
    const periodEvents = this.events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );

    // Calculate period-specific metrics
    const periodCreated = periodEvents.filter(e => e.type === 'created').length;
    const periodExpired = periodEvents.filter(e => e.type === 'expired').length;
    const periodReconnected = periodEvents.filter(e => e.type === 'reconnected').length;
    const periodFailed = periodEvents.filter(e => e.type === 'failed').length;

    // Find peak usage hours
    const hourlyUsage = new Array(24).fill(0);
    periodEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyUsage[hour]++;
    });

    const maxUsage = Math.max(...hourlyUsage);
    const peakUsageHours = hourlyUsage
      .map((usage, hour) => ({ usage, hour }))
      .filter(item => item.usage === maxUsage)
      .map(item => item.hour);

    return {
      periodEvents,
      periodMetrics: {
        totalSessions: periodCreated,
        expiredSessions: periodExpired,
        reconnectionAttempts: periodReconnected + periodFailed,
        successfulReconnections: periodReconnected,
        failedReconnections: periodFailed
      },
      peakUsageHours
    };
  }
}