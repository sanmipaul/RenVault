/**
 * Comprehensive Signing Error Handler
 * Manages and categorizes signing errors with recovery strategies
 */

import {
  SigningError,
  SigningErrorReason,
  SigningRequest,
} from '../types/signing';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode } from '../utils/wallet-errors';

export interface SigningErrorContext {
  requestId?: string;
  transactionId?: string;
  chainId?: string;
  account?: string;
  operation?: string;
  timestamp?: number;
}

export interface SigningErrorRecoveryStrategy {
  shouldRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  suggestedAction?: string;
}

class SigningErrorHandler {
  private errorLog: SigningErrorWithContext[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_LOG_SIZE = 10000;

  /**
   * Handle a signing error
   */
  handleSigningError(
    error: unknown,
    context: SigningErrorContext
  ): SigningError {
    const signingError = this.normalizeError(error);
    const strategy = this.getRecoveryStrategy(signingError.reason);

    const errorWithContext: SigningErrorWithContext = {
      ...signingError,
      context,
      strategy,
      timestamp: context.timestamp || Date.now(),
      friendlyMessage: this.getFriendlyMessage(signingError.reason),
    };

    this.logError(errorWithContext);

    return signingError;
  }

  /**
   * Determine if error is retryable
   */
  isRetryable(error: SigningError, requestId: string): boolean {
    const strategy = this.getRecoveryStrategy(error.reason);
    const attempts = this.retryAttempts.get(requestId) || 0;

    return strategy.shouldRetry && attempts < strategy.maxRetries;
  }

  /**
   * Get retry delay for exponential backoff
   */
  getRetryDelay(requestId: string): number {
    const strategy = this.getRecoveryStrategy('network_error'); // Default strategy
    const attempts = this.retryAttempts.get(requestId) || 0;

    return (
      strategy.retryDelay *
      Math.pow(strategy.backoffMultiplier, attempts)
    );
  }

  /**
   * Record a retry attempt
   */
  recordRetryAttempt(requestId: string): void {
    const current = this.retryAttempts.get(requestId) || 0;
    this.retryAttempts.set(requestId, current + 1);
  }

  /**
   * Clear retry attempts for a request
   */
  clearRetryAttempts(requestId: string): void {
    this.retryAttempts.delete(requestId);
  }

  /**
   * Get error recovery strategy
   */
  private getRecoveryStrategy(reason: SigningErrorReason): SigningErrorRecoveryStrategy {
    const strategies: Record<SigningErrorReason, SigningErrorRecoveryStrategy> = {
      user_rejected: {
        shouldRetry: false,
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        suggestedAction: 'User rejected the signing request. Please try again.',
      },
      invalid_request: {
        shouldRetry: false,
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        suggestedAction: 'Invalid request format. Check the transaction data.',
      },
      network_error: {
        shouldRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        suggestedAction: 'Network error occurred. The request will be retried automatically.',
      },
      timeout: {
        shouldRetry: true,
        maxRetries: 2,
        retryDelay: 2000,
        backoffMultiplier: 1.5,
        suggestedAction: 'Request timed out. Retrying...',
      },
      hardware_error: {
        shouldRetry: true,
        maxRetries: 2,
        retryDelay: 3000,
        backoffMultiplier: 1,
        suggestedAction: 'Hardware wallet error. Check your device and try again.',
      },
      insufficient_funds: {
        shouldRetry: false,
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        suggestedAction: 'Insufficient balance. Add funds and try again.',
      },
      nonce_conflict: {
        shouldRetry: true,
        maxRetries: 1,
        retryDelay: 500,
        backoffMultiplier: 1,
        suggestedAction: 'Nonce conflict detected. Retrying with updated nonce.',
      },
      gas_estimation_failed: {
        shouldRetry: true,
        maxRetries: 2,
        retryDelay: 1000,
        backoffMultiplier: 1.5,
        suggestedAction: 'Gas estimation failed. Retrying with custom gas limit.',
      },
      simulation_failed: {
        shouldRetry: false,
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        suggestedAction: 'Transaction simulation failed. Review the transaction and try again.',
      },
      unknown: {
        shouldRetry: true,
        maxRetries: 1,
        retryDelay: 1000,
        backoffMultiplier: 1,
        suggestedAction: 'An unknown error occurred. Retrying...',
      },
    };

    return strategies[reason] || strategies.unknown;
  }

  /**
   * Get user-friendly error message
   */
  private getFriendlyMessage(reason: SigningErrorReason): string {
    const messages: Record<SigningErrorReason, string> = {
      user_rejected: 'You rejected the signing request',
      invalid_request: 'The request is invalid',
      network_error: 'Network connection error',
      timeout: 'Request timed out',
      hardware_error: 'Hardware wallet error',
      insufficient_funds: 'Insufficient balance in wallet',
      nonce_conflict: 'Transaction nonce conflict',
      gas_estimation_failed: 'Failed to estimate gas',
      simulation_failed: 'Transaction simulation failed',
      unknown: 'An unexpected error occurred',
    };

    return messages[reason] || 'Unknown error';
  }

  /**
   * Normalize error to SigningError
   */
  private normalizeError(error: unknown): SigningError {
    if (error instanceof Error && 'reason' in error && 'retryable' in error) {
      return error as SigningError;
    }

    if (error instanceof WalletError) {
      const signingError = new Error((error as Error).message) as SigningError;
      signingError.reason = this.mapWalletErrorToReason(error.code);
      signingError.retryable = this.isWalletErrorRetryable(error.code);
      return signingError;
    }

    const msg = (error as Error).message || 'Unknown error';
    const signingError = new Error(msg) as SigningError;
    signingError.reason = this.inferErrorReason(msg);
    signingError.retryable = false;

    return signingError;
  }

  /**
   * Map WalletError to signing error reason
   */
  private mapWalletErrorToReason(code: WalletErrorCode): SigningErrorReason {
    const mapping: Partial<Record<WalletErrorCode, SigningErrorReason>> = {
      [WalletErrorCode.USER_REJECTED]: 'user_rejected',
      [WalletErrorCode.SIGNING_FAILED]: 'invalid_request',
      [WalletErrorCode.NETWORK_ERROR]: 'network_error',
      [WalletErrorCode.TIMEOUT]: 'timeout',
      [WalletErrorCode.INSUFFICIENT_BALANCE]: 'insufficient_funds',
    };

    return mapping[code] || 'unknown';
  }

  /**
   * Check if WalletError is retryable
   */
  private isWalletErrorRetryable(code: WalletErrorCode): boolean {
    const retryable: WalletErrorCode[] = [
      WalletErrorCode.NETWORK_ERROR,
      WalletErrorCode.TIMEOUT,
    ];

    return retryable.includes(code);
  }

  /**
   * Infer error reason from message
   */
  private inferErrorReason(message: string): SigningErrorReason {
    const lower = message.toLowerCase();

    if (lower.includes('rejected') || lower.includes('cancelled')) {
      return 'user_rejected';
    }
    if (lower.includes('timeout')) {
      return 'timeout';
    }
    if (lower.includes('network') || lower.includes('connection')) {
      return 'network_error';
    }
    if (lower.includes('hardware') || lower.includes('device')) {
      return 'hardware_error';
    }
    if (lower.includes('insufficient') || lower.includes('balance')) {
      return 'insufficient_funds';
    }
    if (lower.includes('nonce')) {
      return 'nonce_conflict';
    }
    if (lower.includes('gas estimation')) {
      return 'gas_estimation_failed';
    }
    if (lower.includes('simulation')) {
      return 'simulation_failed';
    }

    return 'unknown';
  }

  /**
   * Log error with context
   */
  private logError(error: SigningErrorWithContext): void {
    this.errorLog.push(error);

    // Trim log if it gets too large
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_LOG_SIZE);
    }

    // Log to console in development
    logger.error(`Signing Error: ${error.message}`, {
      reason: error.reason,
      context: error.context,
      friendlyMessage: error.friendlyMessage,
    });
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    errorsByReason: Record<SigningErrorReason, number>;
    retryableErrors: number;
    nonRetryableErrors: number;
  } {
    const errorsByReason: Partial<Record<SigningErrorReason, number>> = {};
    let retryableErrors = 0;
    let nonRetryableErrors = 0;

    for (const error of this.errorLog) {
      const reason = error.reason;
      errorsByReason[reason] = (errorsByReason[reason] || 0) + 1;

      if (error.retryable) {
        retryableErrors++;
      } else {
        nonRetryableErrors++;
      }
    }

    return {
      totalErrors: this.errorLog.length,
      errorsByReason: errorsByReason as Record<SigningErrorReason, number>,
      retryableErrors,
      nonRetryableErrors,
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): SigningErrorWithContext[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }
}

interface SigningErrorWithContext extends SigningError {
  context: SigningErrorContext;
  strategy: SigningErrorRecoveryStrategy;
  timestamp: number;
  friendlyMessage: string;
}

export const signingErrorHandler = new SigningErrorHandler();
