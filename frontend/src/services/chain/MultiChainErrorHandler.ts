/**
 * Multi-Chain Error Handling and Recovery Service
 * Provides comprehensive error handling and recovery strategies
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'validation' | 'wallet' | 'transaction' | 'unknown';

export interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  recovery?: RecoveryStrategy;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'manual' | 'abort';
  maxAttempts?: number;
  delayMs?: number;
  fallbackChain?: string;
}

export enum ErrorCode {
  // Network errors
  RPC_TIMEOUT = 'RPC_TIMEOUT',
  RPC_UNREACHABLE = 'RPC_UNREACHABLE',
  NETWORK_DISCONNECTED = 'NETWORK_DISCONNECTED',

  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CHAIN = 'INVALID_CHAIN',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',

  // Wallet errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_LOCKED = 'WALLET_LOCKED',
  WALLET_NOT_AVAILABLE = 'WALLET_NOT_AVAILABLE',
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',

  // Transaction errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  GAS_PRICE_EXCEEDED = 'GAS_PRICE_EXCEEDED',
  NONCE_TOO_LOW = 'NONCE_TOO_LOW',

  // Chain errors
  CHAIN_SWITCH_FAILED = 'CHAIN_SWITCH_FAILED',
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Multi-Chain Error Handler Service
 */
export class MultiChainErrorHandler {
  private static errors: Map<string, AppError> = new Map();
  private static errorListeners: Set<(error: AppError) => void> = new Set();
  private static recoveryStrategies: Map<ErrorCode, RecoveryStrategy> = new Map([
    [ErrorCode.RPC_TIMEOUT, { type: 'retry', maxAttempts: 3, delayMs: 1000 }],
    [ErrorCode.RPC_UNREACHABLE, { type: 'fallback' }],
    [ErrorCode.NETWORK_DISCONNECTED, { type: 'retry', maxAttempts: 5, delayMs: 2000 }],
    [ErrorCode.WALLET_NOT_CONNECTED, { type: 'manual' }],
    [ErrorCode.USER_REJECTED, { type: 'abort' }],
    [ErrorCode.INSUFFICIENT_BALANCE, { type: 'manual' }],
    [ErrorCode.TRANSACTION_FAILED, { type: 'retry', maxAttempts: 2, delayMs: 3000 }],
  ]);

  /**
   * Create and handle error
   */
  static handleError(
    code: ErrorCode,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      code,
      message,
      category,
      severity,
      timestamp: Date.now(),
      context,
      recovery: this.recoveryStrategies.get(code),
    };

    // Store error
    const errorId = `${code}_${Date.now()}`;
    this.errors.set(errorId, error);

    // Notify listeners
    this.notifyListeners(error);

    // Log based on severity
    this.logError(error);

    return error;
  }

  /**
   * Handle validation error
   */
  static handleValidationError(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(code, message, 'validation', 'medium', context);
  }

  /**
   * Handle network error
   */
  static handleNetworkError(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(code, message, 'network', 'high', context);
  }

  /**
   * Handle wallet error
   */
  static handleWalletError(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>
  ): AppError {
    const severity =
      code === ErrorCode.USER_REJECTED || code === ErrorCode.WALLET_LOCKED
        ? 'low'
        : 'medium';

    return this.handleError(code, message, 'wallet', severity, context);
  }

  /**
   * Handle transaction error
   */
  static handleTransactionError(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>
  ): AppError {
    const severity =
      code === ErrorCode.INSUFFICIENT_BALANCE ? 'medium' : 'high';

    return this.handleError(code, message, 'transaction', severity, context);
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.RPC_TIMEOUT]: 'The network is taking longer than expected. Please try again.',
      [ErrorCode.RPC_UNREACHABLE]:
        'Unable to reach the blockchain network. Please check your internet connection.',
      [ErrorCode.NETWORK_DISCONNECTED]: 'You appear to be offline. Please check your connection.',

      [ErrorCode.INVALID_ADDRESS]: 'The address format is invalid for this chain.',
      [ErrorCode.INVALID_AMOUNT]: 'Please enter a valid amount.',
      [ErrorCode.INVALID_CHAIN]: 'The selected chain is not valid.',
      [ErrorCode.UNSUPPORTED_OPERATION]:
        'This operation is not supported on the current chain.',

      [ErrorCode.WALLET_NOT_CONNECTED]: 'Please connect your wallet first.',
      [ErrorCode.WALLET_LOCKED]: 'Your wallet is locked. Please unlock it.',
      [ErrorCode.WALLET_NOT_AVAILABLE]: 'The wallet application is not available.',
      [ErrorCode.USER_REJECTED]: 'You rejected the operation.',
      [ErrorCode.INSUFFICIENT_BALANCE]:
        'You do not have enough balance to complete this transaction.',

      [ErrorCode.TRANSACTION_FAILED]:
        'The transaction failed. Please check the details and try again.',
      [ErrorCode.TRANSACTION_REVERTED]: 'The transaction was reverted. Please try again.',
      [ErrorCode.GAS_PRICE_EXCEEDED]: 'The gas price is too high. Please try again later.',
      [ErrorCode.NONCE_TOO_LOW]: 'Please wait for your previous transaction to complete.',

      [ErrorCode.CHAIN_SWITCH_FAILED]: 'Unable to switch to the selected chain.',
      [ErrorCode.CHAIN_NOT_SUPPORTED]: 'This chain is not supported.',

      [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    };

    return messages[error.code as ErrorCode] || error.message;
  }

  /**
   * Get recovery instructions
   */
  static getRecoveryInstructions(error: AppError): string[] {
    const instructions: Record<ErrorCode, string[]> = {
      [ErrorCode.RPC_TIMEOUT]: [
        'Wait a moment and try again',
        'Check if the blockchain network is having issues',
        'Try switching to a different RPC endpoint',
      ],
      [ErrorCode.RPC_UNREACHABLE]: [
        'Check your internet connection',
        'Try using a VPN if your ISP blocks blockchain nodes',
        'Check the blockchain explorer to see if the network is running',
      ],
      [ErrorCode.NETWORK_DISCONNECTED]: [
        'Check your internet connection',
        'Restart your router or modem',
        'Try using mobile data if WiFi is not working',
      ],

      [ErrorCode.INVALID_ADDRESS]: [
        'Double-check the address format for the current chain',
        'Copy-paste addresses instead of typing manually',
        'Use the address book or QR code scanner',
      ],
      [ErrorCode.INVALID_AMOUNT]: [
        'Enter an amount greater than 0',
        'Check the decimal places for this token',
        'Ensure you have sufficient balance',
      ],
      [ErrorCode.INVALID_CHAIN]: [
        'Select a supported chain from the chain selector',
        'Check if the chain is available in your region',
      ],
      [ErrorCode.UNSUPPORTED_OPERATION]: [
        'Switch to a different chain that supports this operation',
        'Use an alternative service or DEX',
      ],

      [ErrorCode.WALLET_NOT_CONNECTED]: [
        'Click the connect wallet button',
        'Make sure your wallet extension is installed',
        'Try refreshing the page',
      ],
      [ErrorCode.WALLET_LOCKED]: [
        'Open your wallet extension',
        'Unlock your wallet with your password',
        'If you forgot your password, recover your wallet from seed phrase',
      ],
      [ErrorCode.WALLET_NOT_AVAILABLE]: [
        'Install your wallet extension (MetaMask, Leather, etc.)',
        'Make sure the extension is enabled in your browser',
        'Restart your browser',
      ],
      [ErrorCode.USER_REJECTED]: [
        'Review the transaction details',
        'Try again and approve the request in your wallet',
        'Contact support if you need help',
      ],
      [ErrorCode.INSUFFICIENT_BALANCE]: [
        'Deposit more funds to your wallet',
        'Check if you have enough for gas fees',
        'Use a bridge to transfer funds from another chain',
      ],

      [ErrorCode.TRANSACTION_FAILED]: [
        'Increase the gas price',
        'Reduce the transaction amount',
        'Try again after the network stabilizes',
      ],
      [ErrorCode.TRANSACTION_REVERTED]: [
        'Check the transaction details for errors',
        'Ensure you have sufficient balance and gas',
        'Try with higher gas limit',
      ],
      [ErrorCode.GAS_PRICE_EXCEEDED]: [
        'Wait for gas prices to decrease',
        'Use a different gas price suggestion',
        'Try the transaction during off-peak hours',
      ],
      [ErrorCode.NONCE_TOO_LOW]: [
        'Wait for your pending transaction to complete',
        'Check your transaction history for stuck transactions',
        'Increase the nonce if using advanced options',
      ],

      [ErrorCode.CHAIN_SWITCH_FAILED]: [
        'Make sure the chain is added to your wallet',
        'Try switching chains from your wallet extension directly',
        'Refresh the page and try again',
      ],
      [ErrorCode.CHAIN_NOT_SUPPORTED]: [
        'Select a different supported chain',
        'Bridge your assets to a supported chain',
      ],

      [ErrorCode.UNKNOWN_ERROR]: [
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Try in a different browser',
        'Contact support with the error code',
      ],
    };

    return (
      instructions[error.code as ErrorCode] || [
        'Check the error details',
        'Try again after a moment',
      ]
    );
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts - 1) {
          const delay = initialDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after max retries');
  }

  /**
   * Subscribe to errors
   */
  static onError(listener: (error: AppError) => void): () => void {
    this.errorListeners.add(listener);

    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Notify listeners
   */
  private static notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Log error
   */
  private static logError(error: AppError): void {
    const logFn = error.severity === 'critical' ? console.error : console.warn;

    logFn(`[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`, error.context);
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(limit: number = 10): AppError[] {
    return [...this.errors.values()]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear errors
   */
  static clearErrors(): void {
    this.errors.clear();
  }

  /**
   * Destroy service
   */
  static destroy(): void {
    this.errors.clear();
    this.errorListeners.clear();
  }
}

/**
 * React Hook for error handling
 */
import React from 'react';

export const useMultiChainErrorHandler = () => {
  const [errors, setErrors] = React.useState<AppError[]>([]);

  React.useEffect(() => {
    const unsubscribe = MultiChainErrorHandler.onError(error => {
      setErrors(prev => [error, ...prev].slice(0, 10));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    dismissError,
    clearAllErrors,
    hasErrors: errors.length > 0,
  };
};

export default MultiChainErrorHandler;
