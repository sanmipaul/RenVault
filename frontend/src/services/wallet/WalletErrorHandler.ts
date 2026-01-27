/**
 * Wallet-Specific Error Handling Middleware
 * Handles wallet-related errors with appropriate recovery strategies
 */

import { StacksConnectorAdapter } from './StacksConnectorAdapter';
import { WalletFallbackManager } from './WalletFallbackManager';

export enum WalletErrorType {
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_CANCELLED = 'CONNECTION_CANCELLED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_CANCELLED = 'TRANSACTION_CANCELLED',
  SIGNING_FAILED = 'SIGNING_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_WALLET = 'INVALID_WALLET',
  UNKNOWN = 'UNKNOWN',
}

export interface WalletError {
  type: WalletErrorType;
  message: string;
  walletId: string;
  originalError?: Error;
  timestamp: number;
  recoverable: boolean;
  suggestedAction?: () => Promise<void>;
}

export interface ErrorContext {
  walletId: string;
  operation: 'connect' | 'disconnect' | 'sign' | 'transaction';
  metadata?: Record<string, any>;
}

export class WalletErrorHandler {
  private static errorListeners: Set<(error: WalletError) => void> = new Set();
  private static errorHistory: WalletError[] = [];
  private static readonly MAX_HISTORY = 50;

  /**
   * Categorize and handle wallet error
   */
  static handleError(error: Error, context: ErrorContext): WalletError {
    const errorType = this.categorizeError(error);
    const walletError = this.createWalletError(error, errorType, context);

    // Store in history
    this.errorHistory.push(walletError);
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory.shift();
    }

    // Emit to listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(walletError);
      } catch (e) {
        console.error('Error listener failed:', e);
      }
    });

    return walletError;
  }

  /**
   * Categorize error type
   */
  private static categorizeError(error: Error): WalletErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('not installed') || message.includes('not found')) {
      return WalletErrorType.WALLET_NOT_INSTALLED;
    }

    if (message.includes('cancelled') || message.includes('rejected') || message.includes('denied')) {
      if (message.includes('transaction') || message.includes('sign')) {
        return WalletErrorType.TRANSACTION_CANCELLED;
      }
      return WalletErrorType.CONNECTION_CANCELLED;
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return WalletErrorType.CONNECTION_TIMEOUT;
    }

    if (message.includes('balance') || message.includes('insufficient')) {
      return WalletErrorType.INSUFFICIENT_BALANCE;
    }

    if (message.includes('network') || message.includes('connection refused')) {
      return WalletErrorType.NETWORK_ERROR;
    }

    if (message.includes('transaction')) {
      return WalletErrorType.TRANSACTION_FAILED;
    }

    if (message.includes('sign')) {
      return WalletErrorType.SIGNING_FAILED;
    }

    if (message.includes('invalid') || message.includes('malformed')) {
      return WalletErrorType.INVALID_WALLET;
    }

    if (message.includes('connect')) {
      return WalletErrorType.CONNECTION_FAILED;
    }

    return WalletErrorType.UNKNOWN;
  }

  /**
   * Create wallet error object
   */
  private static createWalletError(
    error: Error,
    type: WalletErrorType,
    context: ErrorContext
  ): WalletError {
    const recoverable = this.isRecoverable(type);
    const suggestedAction = this.getSuggestedAction(type, context);

    return {
      type,
      message: this.formatErrorMessage(type, error.message),
      walletId: context.walletId,
      originalError: error,
      timestamp: Date.now(),
      recoverable,
      suggestedAction,
    };
  }

  /**
   * Check if error is recoverable
   */
  private static isRecoverable(type: WalletErrorType): boolean {
    const recoverableErrors = [
      WalletErrorType.WALLET_NOT_INSTALLED,
      WalletErrorType.CONNECTION_CANCELLED,
      WalletErrorType.CONNECTION_TIMEOUT,
      WalletErrorType.TRANSACTION_CANCELLED,
      WalletErrorType.NETWORK_ERROR,
    ];

    return recoverableErrors.includes(type);
  }

  /**
   * Get suggested action based on error type
   */
  private static getSuggestedAction(
    type: WalletErrorType,
    context: ErrorContext
  ): (() => Promise<void>) | undefined {
    switch (type) {
      case WalletErrorType.WALLET_NOT_INSTALLED:
        return async () => {
          const installUrl = await this.getInstallationUrl(context.walletId);
          window.open(installUrl, '_blank');
        };

      case WalletErrorType.CONNECTION_TIMEOUT:
      case WalletErrorType.NETWORK_ERROR:
        return async () => {
          // Retry connection
          const adapter = new StacksConnectorAdapter(context.walletId);
          await adapter.connect();
        };

      case WalletErrorType.CONNECTION_CANCELLED:
      case WalletErrorType.TRANSACTION_CANCELLED:
        return async () => {
          // Retry the same operation
          console.log(`Retrying ${context.operation} for ${context.walletId}`);
        };

      case WalletErrorType.CONNECTION_FAILED:
        return async () => {
          // Try fallback wallet
          const result = await WalletFallbackManager.connectWithFallback(context.walletId);
          if (!result.success && result.strategy.action) {
            await result.strategy.action();
          }
        };

      default:
        return undefined;
    }
  }

  /**
   * Format error message for display
   */
  private static formatErrorMessage(type: WalletErrorType, originalMessage: string): string {
    const messages: Record<WalletErrorType, string> = {
      [WalletErrorType.WALLET_NOT_INSTALLED]: 'Wallet is not installed. Please install it to continue.',
      [WalletErrorType.CONNECTION_FAILED]: 'Failed to connect to wallet. Please try again.',
      [WalletErrorType.CONNECTION_CANCELLED]: 'Connection was cancelled. Please try again.',
      [WalletErrorType.CONNECTION_TIMEOUT]: 'Connection request timed out. Please try again.',
      [WalletErrorType.TRANSACTION_FAILED]: 'Transaction failed. Please check your wallet and try again.',
      [WalletErrorType.TRANSACTION_CANCELLED]: 'Transaction was cancelled.',
      [WalletErrorType.SIGNING_FAILED]: 'Failed to sign message. Please try again.',
      [WalletErrorType.INSUFFICIENT_BALANCE]: 'Insufficient balance to complete this transaction.',
      [WalletErrorType.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
      [WalletErrorType.INVALID_WALLET]: 'Invalid wallet configuration or data.',
      [WalletErrorType.UNKNOWN]: `An error occurred: ${originalMessage}`,
    };

    return messages[type];
  }

  /**
   * Get installation URL
   */
  private static async getInstallationUrl(walletId: string): Promise<string> {
    // Dynamic import to avoid circular dependencies
    const { WalletInstallationLinksService } = await import('./WalletInstallationLinksService');
    return WalletInstallationLinksService.getInstallationLink(walletId).downloadUrl || '';
  }

  /**
   * Subscribe to wallet errors
   */
  static onError(listener: (error: WalletError) => void): () => void {
    this.errorListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Get error history
   */
  static getErrorHistory(walletId?: string): WalletError[] {
    if (!walletId) {
      return [...this.errorHistory];
    }

    return this.errorHistory.filter(e => e.walletId === walletId);
  }

  /**
   * Clear error history
   */
  static clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get statistics about errors
   */
  static getErrorStats(): {
    total: number;
    byType: Record<WalletErrorType, number>;
    byWallet: Record<string, number>;
    recoverableCount: number;
    lastError?: WalletError;
  } {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<WalletErrorType, number>,
      byWallet: {} as Record<string, number>,
      recoverableCount: 0,
      lastError: this.errorHistory[this.errorHistory.length - 1],
    };

    this.errorHistory.forEach(error => {
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // Count by wallet
      stats.byWallet[error.walletId] = (stats.byWallet[error.walletId] || 0) + 1;

      // Count recoverable
      if (error.recoverable) {
        stats.recoverableCount++;
      }
    });

    return stats;
  }

  /**
   * Handle error with retry logic
   */
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const walletError = this.handleError(lastError, context);

        if (!walletError.recoverable) {
          throw walletError;
        }

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = backoffMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Create error middleware for async operations
   */
  static createMiddleware(context: ErrorContext) {
    return {
      wrap: async <T>(operation: () => Promise<T>): Promise<T> => {
        return this.handleWithRetry(operation, context);
      },
      handle: (error: Error): WalletError => {
        return this.handleError(error, context);
      },
    };
  }
}

/**
 * Global error handler setup
 */
export function setupWalletErrorHandling(): void {
  // Handle unhandled promise rejections related to wallets
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason?.message?.toLowerCase().includes('wallet')) {
      const context: ErrorContext = {
        walletId: 'unknown',
        operation: 'connect',
        metadata: { unhandled: true },
      };

      WalletErrorHandler.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        context
      );
    }
  });
}
