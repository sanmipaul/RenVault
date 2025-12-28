/**
 * Error Analytics & Categorization Module
 * Tracks and categorizes errors for analytics
 */

import { ErrorAnalytics } from '../types/analytics';

export enum ErrorCategory {
  WALLET_CONNECTION = 'wallet_connection',
  TRANSACTION_SIGNING = 'transaction_signing',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  USER_REJECTION = 'user_rejection',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface ErrorEvent {
  category: ErrorCategory;
  message: string;
  code?: string;
  timestamp: number;
  userId?: string;
  walletType?: string;
  context?: Record<string, any>;
}

class ErrorAnalyticsService {
  private errorHistory: Map<string, ErrorAnalytics> = new Map();
  private errorBuffer: ErrorEvent[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.loadErrorHistory();
  }

  /**
   * Load error history from storage
   */
  private loadErrorHistory(): void {
    try {
      const stored = localStorage.getItem('error_analytics_history');
      if (stored) {
        const history = JSON.parse(stored);
        Object.entries(history).forEach(([key, value]) => {
          this.errorHistory.set(key, value as ErrorAnalytics);
        });
      }
    } catch (error) {
      console.warn('Failed to load error history:', error);
    }
  }

  /**
   * Save error history to storage
   */
  private saveErrorHistory(): void {
    try {
      const history: Record<string, ErrorAnalytics> = {};
      this.errorHistory.forEach((value, key) => {
        history[key] = value;
      });
      localStorage.setItem('error_analytics_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save error history:', error);
    }
  }

  /**
   * Categorize error based on message and type
   */
  private categorizeError(
    message: string,
    code?: string
  ): ErrorCategory {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('wallet') ||
      lowerMessage.includes('connection') ||
      code?.includes('WALLET')
    ) {
      return ErrorCategory.WALLET_CONNECTION;
    }

    if (
      lowerMessage.includes('sign') ||
      lowerMessage.includes('transaction') ||
      code?.includes('SIGN')
    ) {
      return ErrorCategory.TRANSACTION_SIGNING;
    }

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('timeout') ||
      code?.includes('NET')
    ) {
      return ErrorCategory.NETWORK_ERROR;
    }

    if (
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('validate') ||
      code?.includes('VALID')
    ) {
      return ErrorCategory.VALIDATION_ERROR;
    }

    if (
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('forbidden') ||
      code?.includes('AUTH')
    ) {
      return ErrorCategory.AUTHORIZATION_ERROR;
    }

    if (
      lowerMessage.includes('rejected') ||
      lowerMessage.includes('cancelled') ||
      lowerMessage.includes('denied')
    ) {
      return ErrorCategory.USER_REJECTION;
    }

    if (
      lowerMessage.includes('timeout') ||
      code?.includes('TIMEOUT')
    ) {
      return ErrorCategory.TIMEOUT;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Track an error
   */
  trackError(
    message: string,
    code?: string,
    userId?: string,
    walletType?: string,
    context?: Record<string, any>
  ): void {
    const category = this.categorizeError(message, code);
    const errorKey = `${category}:${message}`;

    const errorEvent: ErrorEvent = {
      category,
      message,
      code,
      timestamp: Date.now(),
      userId,
      walletType,
      context,
    };

    // Add to buffer
    this.errorBuffer.push(errorEvent);
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }

    // Update history
    if (this.errorHistory.has(errorKey)) {
      const existing = this.errorHistory.get(errorKey)!;
      existing.occurenceCount++;
      existing.lastOccurredAt = Date.now();
      if (userId) {
        existing.affectedUsers++;
      }
    } else {
      this.errorHistory.set(errorKey, {
        errorType: category,
        errorMessage: message,
        occurenceCount: 1,
        lastOccurredAt: Date.now(),
        affectedUsers: userId ? 1 : 0,
        resolutionStatus: 'open',
      });
    }

    this.saveErrorHistory();
    console.error(`[${category}] ${message}`, context);
  }

  /**
   * Get error analytics
   */
  getErrorAnalytics(): ErrorAnalytics[] {
    return Array.from(this.errorHistory.values())
      .sort((a, b) => b.occurenceCount - a.occurenceCount);
  }

  /**
   * Get error by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorAnalytics[] {
    return this.getErrorAnalytics().filter(
      (error) => error.errorType === category
    );
  }

  /**
   * Get critical errors (occurred more than threshold times)
   */
  getCriticalErrors(threshold: number = 5): ErrorAnalytics[] {
    return this.getErrorAnalytics().filter(
      (error) => error.occurenceCount >= threshold
    );
  }

  /**
   * Get error trend
   */
  getErrorTrend(timeWindowMs: number = 3600000): ErrorAnalytics[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.getErrorAnalytics().filter(
      (error) => error.lastOccurredAt >= cutoff
    );
  }

  /**
   * Get error buffer
   */
  getErrorBuffer(): ErrorEvent[] {
    return [...this.errorBuffer];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory.clear();
    this.errorBuffer = [];
    this.saveErrorHistory();
  }

  /**
   * Get summary statistics
   */
  getErrorSummary() {
    const allErrors = this.getErrorAnalytics();

    return {
      totalErrors: allErrors.length,
      totalOccurrences: allErrors.reduce((sum, e) => sum + e.occurenceCount, 0),
      uniqueAffectedUsers: allErrors.reduce((sum, e) => sum + e.affectedUsers, 0),
      criticalErrorCount: this.getCriticalErrors().length,
      topErrors: allErrors.slice(0, 5),
      recentErrors: this.getErrorTrend(3600000).slice(0, 5),
    };
  }

  /**
   * Export error report
   */
  exportErrorReport(): string {
    const summary = this.getErrorSummary();
    const timestamp = new Date().toISOString();

    return `
Error Analytics Report
Generated: ${timestamp}

Summary
-------
Total Unique Errors: ${summary.totalErrors}
Total Occurrences: ${summary.totalOccurrences}
Affected Users: ${summary.uniqueAffectedUsers}
Critical Errors: ${summary.criticalErrorCount}

Top Errors
----------
${summary.topErrors
  .map(
    (err) =>
      `- [${err.errorType}] ${err.errorMessage} (${err.occurenceCount} occurrences)`
  )
  .join('\n')}
    `;
  }
}

export const errorAnalyticsService = new ErrorAnalyticsService();

export default ErrorAnalyticsService;
