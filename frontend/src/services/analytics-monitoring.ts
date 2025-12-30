/**
 * Analytics Monitoring and Alerting Service
 * Real-time monitoring with automated alerts
 */

import { errorAnalyticsService } from './error-analytics';
import { performanceMetricsService } from './performance-metrics';
import { analyticsService } from './analytics-service';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface MonitoringThresholds {
  errorRateThreshold?: number; // Percentage (0-100)
  errorCountThreshold?: number; // Number of errors in time window
  transactionLatencyThreshold?: number; // Milliseconds
  connectionFailureThreshold?: number; // Number of failures
  timeWindow?: number; // Milliseconds for threshold evaluation
}

export interface AlertCallback {
  (alert: Alert): void;
}

class AnalyticsMonitoringService {
  private alerts: Map<string, Alert> = new Map();
  private alertSubscribers: Set<AlertCallback> = new Set();
  private monitoringActive = false;
  private thresholds: Required<MonitoringThresholds> = {
    errorRateThreshold: 5, // 5% error rate
    errorCountThreshold: 10, // 10 errors
    transactionLatencyThreshold: 3000, // 3 seconds
    connectionFailureThreshold: 3, // 3 failures
    timeWindow: 300000, // 5 minutes
  };

  private monitoringIntervals: NodeJS.Timeout[] = [];

  /**
   * Start monitoring analytics metrics
   */
  startMonitoring(thresholds?: Partial<MonitoringThresholds>): void {
    if (this.monitoringActive) {
      console.warn('Monitoring already active');
      return;
    }

    if (thresholds) {
      this.thresholds = { ...this.thresholds, ...thresholds };
    }

    this.monitoringActive = true;

    // Setup monitoring intervals
    this.setupErrorRateMonitoring();
    this.setupPerformanceMonitoring();
    this.setupConnectionMonitoring();
    this.setupTransactionMonitoring();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitoringActive = false;
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals = [];
  }

  private setupErrorRateMonitoring(): void {
    const checkErrors = () => {
      if (!this.monitoringActive) return;

      const errorSummary = errorAnalyticsService.getSummary();
      const totalErrors = errorSummary.totalErrors;

      // Check error count threshold
      if (totalErrors >= this.thresholds.errorCountThreshold) {
        this.createAlert('error_threshold_exceeded', 'critical', {
          message: `Error count exceeded threshold: ${totalErrors} errors`,
          data: { errorCount: totalErrors, threshold: this.thresholds.errorCountThreshold },
        });
      }

      // Check error rate
      const trackedEvents = analyticsService.getSessionStats().eventCount;
      if (trackedEvents > 0) {
        const errorRate = (totalErrors / trackedEvents) * 100;
        if (errorRate > this.thresholds.errorRateThreshold) {
          this.createAlert('error_rate_threshold_exceeded', 'warning', {
            message: `Error rate exceeded threshold: ${errorRate.toFixed(2)}%`,
            data: { errorRate, threshold: this.thresholds.errorRateThreshold },
          });
        }
      }

      // Check for specific error categories
      const topErrors = errorAnalyticsService.getTopErrors();
      topErrors.forEach((error) => {
        if (error.count >= 5) {
          this.createAlert('recurring_error', 'warning', {
            message: `Recurring error detected: ${error.category} (${error.count} occurrences)`,
            data: { category: error.category, count: error.count, message: error.message },
          });
        }
      });
    };

    const interval = setInterval(checkErrors, this.thresholds.timeWindow / 5); // Check 5 times per window
    this.monitoringIntervals.push(interval);
  }

  private setupPerformanceMonitoring(): void {
    const checkPerformance = () => {
      if (!this.monitoringActive) return;

      const metrics = performanceMetricsService.getMetrics();

      // Check transaction latency
      if (metrics.averageLatency > this.thresholds.transactionLatencyThreshold) {
        this.createAlert('high_latency', 'warning', {
          message: `High transaction latency detected: ${metrics.averageLatency.toFixed(2)}ms`,
          data: {
            averageLatency: metrics.averageLatency,
            threshold: this.thresholds.transactionLatencyThreshold,
          },
        });
      }

      // Check percentile latencies
      if (metrics.p95Latency > this.thresholds.transactionLatencyThreshold * 1.5) {
        this.createAlert('p95_latency_high', 'warning', {
          message: `P95 latency is concerning: ${metrics.p95Latency.toFixed(2)}ms`,
          data: { p95: metrics.p95Latency, threshold: this.thresholds.transactionLatencyThreshold },
        });
      }

      if (metrics.p99Latency > this.thresholds.transactionLatencyThreshold * 2) {
        this.createAlert('p99_latency_critical', 'critical', {
          message: `P99 latency is critical: ${metrics.p99Latency.toFixed(2)}ms`,
          data: { p99: metrics.p99Latency, threshold: this.thresholds.transactionLatencyThreshold },
        });
      }
    };

    const interval = setInterval(checkPerformance, this.thresholds.timeWindow / 5);
    this.monitoringIntervals.push(interval);
  }

  private setupConnectionMonitoring(): void {
    const checkConnections = () => {
      if (!this.monitoringActive) return;

      const sessionStats = analyticsService.getSessionStats();

      // Monitor wallet connections
      const connectionFailures = analyticsService.getEventsByType('wallet_connection_failed').length;
      if (connectionFailures >= this.thresholds.connectionFailureThreshold) {
        this.createAlert('connection_failures', 'warning', {
          message: `Multiple wallet connection failures detected: ${connectionFailures}`,
          data: { failureCount: connectionFailures, threshold: this.thresholds.connectionFailureThreshold },
        });
      }

      // Check session health
      if (sessionStats.eventCount === 0) {
        this.createAlert('no_activity', 'info', {
          message: 'No analytics events recorded in current session',
          data: { sessionDuration: sessionStats.sessionDuration },
        });
      }
    };

    const interval = setInterval(checkConnections, this.thresholds.timeWindow / 5);
    this.monitoringIntervals.push(interval);
  }

  private setupTransactionMonitoring(): void {
    const checkTransactions = () => {
      if (!this.monitoringActive) return;

      const depositEvents = analyticsService.getEventsByType('deposit_initiated');
      const withdrawalEvents = analyticsService.getEventsByType('withdrawal_initiated');
      const failedDeposits = analyticsService.getEventsByType('deposit_failed');
      const failedWithdrawals = analyticsService.getEventsByType('withdrawal_failed');

      // Check transaction failure rates
      const depositFailureRate = depositEvents.length > 0 
        ? (failedDeposits.length / depositEvents.length) * 100 
        : 0;
      const withdrawalFailureRate = withdrawalEvents.length > 0 
        ? (failedWithdrawals.length / withdrawalEvents.length) * 100 
        : 0;

      if (depositFailureRate > 20) {
        this.createAlert('high_deposit_failure_rate', 'critical', {
          message: `High deposit failure rate: ${depositFailureRate.toFixed(2)}%`,
          data: {
            failureRate: depositFailureRate,
            failedCount: failedDeposits.length,
            totalCount: depositEvents.length,
          },
        });
      }

      if (withdrawalFailureRate > 20) {
        this.createAlert('high_withdrawal_failure_rate', 'critical', {
          message: `High withdrawal failure rate: ${withdrawalFailureRate.toFixed(2)}%`,
          data: {
            failureRate: withdrawalFailureRate,
            failedCount: failedWithdrawals.length,
            totalCount: withdrawalEvents.length,
          },
        });
      }
    };

    const interval = setInterval(checkTransactions, this.thresholds.timeWindow / 5);
    this.monitoringIntervals.push(interval);
  }

  /**
   * Create a new alert
   */
  private createAlert(
    type: string,
    severity: AlertSeverity,
    options: { message?: string; data?: Record<string, any> }
  ): Alert {
    const alert: Alert = {
      id: `${type}-${Date.now()}`,
      type,
      severity,
      message: options.message || type,
      timestamp: Date.now(),
      data: options.data,
    };

    this.alerts.set(alert.id, alert);

    // Auto-remove info alerts after 10 seconds
    if (severity === 'info') {
      setTimeout(() => this.alerts.delete(alert.id), 10000);
    }

    // Notify subscribers
    this.alertSubscribers.forEach((callback) => callback(alert));

    // Log critical alerts
    if (severity === 'critical') {
      console.error(`[CRITICAL ALERT] ${alert.message}`, alert.data);
    }

    return alert;
  }

  /**
   * Subscribe to alert events
   */
  onAlert(callback: AlertCallback): () => void {
    this.alertSubscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }

  /**
   * Get all active alerts
   */
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.severity === severity);
  }

  /**
   * Clear alerts
   */
  clearAlerts(type?: string): void {
    if (type) {
      for (const [id, alert] of this.alerts.entries()) {
        if (alert.type === type) {
          this.alerts.delete(id);
        }
      }
    } else {
      this.alerts.clear();
    }
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    this.alerts.delete(alertId);
  }

  /**
   * Update monitoring thresholds
   */
  updateThresholds(thresholds: Partial<MonitoringThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get current thresholds
   */
  getThresholds(): Required<MonitoringThresholds> {
    return { ...this.thresholds };
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoringActive;
  }

  /**
   * Generate monitoring report
   */
  generateReport(): Record<string, any> {
    return {
      monitoringActive: this.monitoringActive,
      activeAlerts: this.alerts.size,
      alertsBySeverity: {
        critical: this.getAlertsBySeverity('critical').length,
        warning: this.getAlertsBySeverity('warning').length,
        info: this.getAlertsBySeverity('info').length,
      },
      thresholds: this.thresholds,
      timestamp: Date.now(),
    };
  }
}

export const analyticsMonitoringService = new AnalyticsMonitoringService();
