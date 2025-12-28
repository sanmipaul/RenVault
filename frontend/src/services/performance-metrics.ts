/**
 * Performance Metrics Tracker
 * Tracks connection latency, transaction times, and system performance
 */

import { PerformanceMetrics } from '../types/analytics';

export interface PerformanceMeasurement {
  metricType: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

class PerformanceMetricsTracker {
  private measurements: Map<string, PerformanceMeasurement[]> = new Map();
  private thresholds: Map<string, number> = new Map([
    ['connection_latency', 5000],
    ['transaction_confirmation', 30000],
    ['modal_load_time', 2000],
    ['error_rate', 0.05],
  ]);
  private maxMeasurements = 1000;
  private performanceData: PerformanceMetrics = {
    connectionLatency: [],
    transactionConfirmationTime: [],
    modalLoadTime: [],
    errorRate: 0,
    errorsByType: {},
  };

  constructor() {
    this.loadMetrics();
  }

  /**
   * Load metrics from storage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('performance_metrics');
      if (stored) {
        this.performanceData = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', error);
    }
  }

  /**
   * Save metrics to storage
   */
  private saveMetrics(): void {
    try {
      localStorage.setItem('performance_metrics', JSON.stringify(this.performanceData));
    } catch (error) {
      console.warn('Failed to save performance metrics:', error);
    }
  }

  /**
   * Record connection latency
   */
  recordConnectionLatency(duration: number): void {
    this.recordMeasurement('connection_latency', duration);
    this.performanceData.connectionLatency.push(duration);
    if (this.performanceData.connectionLatency.length > this.maxMeasurements) {
      this.performanceData.connectionLatency.shift();
    }
    this.saveMetrics();
  }

  /**
   * Record transaction confirmation time
   */
  recordTransactionConfirmationTime(duration: number): void {
    this.recordMeasurement('transaction_confirmation', duration);
    this.performanceData.transactionConfirmationTime.push(duration);
    if (this.performanceData.transactionConfirmationTime.length > this.maxMeasurements) {
      this.performanceData.transactionConfirmationTime.shift();
    }
    this.saveMetrics();
  }

  /**
   * Record modal load time
   */
  recordModalLoadTime(duration: number): void {
    this.recordMeasurement('modal_load_time', duration);
    this.performanceData.modalLoadTime.push(duration);
    if (this.performanceData.modalLoadTime.length > this.maxMeasurements) {
      this.performanceData.modalLoadTime.shift();
    }
    this.saveMetrics();
  }

  /**
   * Record error occurrence
   */
  recordError(errorType: string): void {
    if (!this.performanceData.errorsByType[errorType]) {
      this.performanceData.errorsByType[errorType] = 0;
    }
    this.performanceData.errorsByType[errorType]++;

    const totalMeasurements =
      (this.performanceData.connectionLatency.length +
        this.performanceData.transactionConfirmationTime.length +
        this.performanceData.modalLoadTime.length) /
      3;

    const totalErrors = Object.values(this.performanceData.errorsByType).reduce(
      (sum, count) => sum + count,
      0
    );

    this.performanceData.errorRate = totalMeasurements > 0 ? totalErrors / totalMeasurements : 0;
    this.saveMetrics();
  }

  /**
   * Record a measurement
   */
  private recordMeasurement(
    metricType: string,
    value: number,
    context?: Record<string, any>
  ): void {
    const measurement: PerformanceMeasurement = {
      metricType,
      value,
      timestamp: Date.now(),
      context,
    };

    if (!this.measurements.has(metricType)) {
      this.measurements.set(metricType, []);
    }

    const measurements = this.measurements.get(metricType)!;
    measurements.push(measurement);

    if (measurements.length > this.maxMeasurements) {
      measurements.shift();
    }
  }

  /**
   * Get average connection latency
   */
  getAverageConnectionLatency(): number {
    return this.calculateAverage(this.performanceData.connectionLatency);
  }

  /**
   * Get average transaction confirmation time
   */
  getAverageTransactionConfirmationTime(): number {
    return this.calculateAverage(this.performanceData.transactionConfirmationTime);
  }

  /**
   * Get average modal load time
   */
  getAverageModalLoadTime(): number {
    return this.calculateAverage(this.performanceData.modalLoadTime);
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(metricType: string, percentile: number): number | null {
    const measurements = this.measurements.get(metricType);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements]
      .sort((a, b) => a.value - b.value)
      .map((m) => m.value);

    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || null;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceData };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      avgConnectionLatency: this.getAverageConnectionLatency(),
      p95ConnectionLatency: this.calculatePercentile('connection_latency', 95),
      p99ConnectionLatency: this.calculatePercentile('connection_latency', 99),
      avgTransactionTime: this.getAverageTransactionConfirmationTime(),
      p95TransactionTime: this.calculatePercentile('transaction_confirmation', 95),
      p99TransactionTime: this.calculatePercentile('transaction_confirmation', 99),
      avgModalLoadTime: this.getAverageModalLoadTime(),
      errorRate: this.performanceData.errorRate,
      errorsByType: this.performanceData.errorsByType,
    };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): string {
    const summary = this.getPerformanceSummary();

    return `
Performance Metrics Report
Generated: ${new Date().toISOString()}

Connection Performance
---------------------
Average Latency: ${summary.avgConnectionLatency.toFixed(2)}ms
95th Percentile: ${summary.p95ConnectionLatency?.toFixed(2) || 'N/A'}ms
99th Percentile: ${summary.p99ConnectionLatency?.toFixed(2) || 'N/A'}ms

Transaction Performance
---------------------
Average Time: ${summary.avgTransactionTime.toFixed(2)}ms
95th Percentile: ${summary.p95TransactionTime?.toFixed(2) || 'N/A'}ms
99th Percentile: ${summary.p99TransactionTime?.toFixed(2) || 'N/A'}ms

Modal Performance
-----------------
Average Load Time: ${summary.avgModalLoadTime.toFixed(2)}ms

Error Statistics
----------------
Error Rate: ${(summary.errorRate * 100).toFixed(2)}%
    `;
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.measurements.clear();
    this.performanceData = {
      connectionLatency: [],
      transactionConfirmationTime: [],
      modalLoadTime: [],
      errorRate: 0,
      errorsByType: {},
    };
    this.saveMetrics();
  }
}

export const performanceMetricsTracker = new PerformanceMetricsTracker();

export default PerformanceMetricsTracker;
