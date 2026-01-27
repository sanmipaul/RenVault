/**
 * Wallet Fallback Service
 * Implements fallback mechanisms for missing or unavailable wallets
 */

import { StacksConnectorAdapter } from './StacksConnectorAdapter';
import { WalletInstallationDetector } from './WalletInstallationDetector';
import { CustomWalletConfig, stacksWallets } from '../config/customWallets';

export interface FallbackStrategy {
  type: 'none' | 'install-prompt' | 'alternative-wallet' | 'walletconnect';
  message: string;
  action?: () => Promise<void>;
}

export interface WalletFallbackResult {
  success: boolean;
  walletId: string;
  fallbackWalletId?: string;
  strategy: FallbackStrategy;
  error?: Error;
}

export class WalletFallbackManager {
  private static readonly WALLET_PREFERENCE_ORDER = ['leather', 'hiro', 'xverse'];

  /**
   * Attempt to connect with fallback strategy
   */
  static async connectWithFallback(
    preferredWalletId: string
  ): Promise<WalletFallbackResult> {
    try {
      // First, try the preferred wallet
      const adapter = new StacksConnectorAdapter(preferredWalletId);
      const isInstalled = adapter.isWalletInstalled();

      if (!isInstalled) {
        return this.handleMissingWallet(preferredWalletId);
      }

      // Attempt connection
      try {
        await adapter.connect();
        return {
          success: true,
          walletId: preferredWalletId,
          strategy: {
            type: 'none',
            message: 'Connected successfully',
          },
        };
      } catch (error) {
        return this.handleConnectionFailure(preferredWalletId, error as Error);
      }
    } catch (error) {
      return {
        success: false,
        walletId: preferredWalletId,
        strategy: {
          type: 'none',
          message: 'Wallet operation failed',
        },
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Get list of alternative wallets
   */
  static getAlternativeWallets(excludeWalletId: string): CustomWalletConfig[] {
    return this.WALLET_PREFERENCE_ORDER
      .filter(id => id !== excludeWalletId)
      .map(id => stacksWallets.find(w => w.id === id))
      .filter((w): w is CustomWalletConfig => !!w);
  }

  /**
   * Get first available wallet
   */
  static getFirstAvailableWallet(): CustomWalletConfig | null {
    const installedWallets = WalletInstallationDetector.getInstalledWallets();
    if (installedWallets.length === 0) {
      return null;
    }

    const firstInstalled = installedWallets[0];
    return stacksWallets.find(w => w.id === firstInstalled.walletId) || null;
  }

  /**
   * Handle missing wallet scenario
   */
  private static handleMissingWallet(walletId: string): WalletFallbackResult {
    // Try to find an alternative installed wallet
    const alternatives = this.getAlternativeWallets(walletId);
    const availableAlternative = alternatives.find(w =>
      WalletInstallationDetector.isWalletInstalled(w.id)
    );

    if (availableAlternative) {
      return {
        success: false,
        walletId,
        fallbackWalletId: availableAlternative.id,
        strategy: {
          type: 'alternative-wallet',
          message: `${walletId} is not installed. Would you like to use ${availableAlternative.name} instead?`,
          action: async () => {
            const adapter = new StacksConnectorAdapter(availableAlternative.id);
            await adapter.connect();
          },
        },
      };
    }

    // No alternative available, suggest installation
    const wallet = stacksWallets.find(w => w.id === walletId);
    return {
      success: false,
      walletId,
      strategy: {
        type: 'install-prompt',
        message: `${wallet?.name || walletId} is not installed. Please install it to continue.`,
        action: async () => {
          const installUrl = WalletInstallationDetector.getInstallationLink(walletId);
          window.open(installUrl, '_blank');
        },
      },
    };
  }

  /**
   * Handle connection failure scenario
   */
  private static async handleConnectionFailure(
    walletId: string,
    error: Error
  ): Promise<WalletFallbackResult> {
    // Try alternative wallets
    const alternatives = this.getAlternativeWallets(walletId);

    for (const alternative of alternatives) {
      try {
        if (WalletInstallationDetector.isWalletInstalled(alternative.id)) {
          const adapter = new StacksConnectorAdapter(alternative.id);
          await adapter.connect();

          return {
            success: true,
            walletId: alternative.id,
            fallbackWalletId: alternative.id,
            strategy: {
              type: 'alternative-wallet',
              message: `Failed to connect to ${walletId}. Connected using ${alternative.name} instead.`,
            },
          };
        }
      } catch (e) {
        // Continue to next alternative
        continue;
      }
    }

    // All attempts failed
    return {
      success: false,
      walletId,
      strategy: {
        type: 'walletconnect',
        message: 'All wallet connections failed. Please try WalletConnect instead.',
        action: async () => {
          // WalletConnect fallback would be triggered here
          throw new Error('WalletConnect not yet implemented');
        },
      },
      error,
    };
  }

  /**
   * Get fallback strategy based on error type
   */
  static getFallbackStrategy(
    walletId: string,
    error: Error
  ): FallbackStrategy {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('not installed')) {
      return {
        type: 'install-prompt',
        message: `${walletId} is not installed. Would you like to install it?`,
        action: async () => {
          const installUrl = WalletInstallationDetector.getInstallationLink(walletId);
          window.open(installUrl, '_blank');
        },
      };
    }

    if (errorMessage.includes('cancelled') || errorMessage.includes('rejected')) {
      return {
        type: 'none',
        message: 'Connection was cancelled. Please try again.',
      };
    }

    if (errorMessage.includes('timeout')) {
      return {
        type: 'alternative-wallet',
        message: 'Connection timeout. Trying alternative wallet...',
      };
    }

    // Default fallback
    return {
      type: 'walletconnect',
      message: 'Connection failed. Please try another method.',
    };
  }

  /**
   * Create a retry strategy with exponential backoff
   */
  static createRetryStrategy(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): {
    execute: () => Promise<any>;
    getCurrentRetry: () => number;
  } {
    let retryCount = 0;

    return {
      execute: async () => {
        while (retryCount < maxRetries) {
          try {
            return await operation();
          } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
              throw error;
            }

            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      },
      getCurrentRetry: () => retryCount,
    };
  }

  /**
   * Setup fallback error recovery system
   */
  static setupErrorRecovery(
    onFallback: (result: WalletFallbackResult) => void,
    onSuccess: (walletId: string) => void
  ): void {
    // Listen for wallet connection errors
    window.addEventListener('error', (event: ErrorEvent) => {
      if (event.message.includes('wallet')) {
        const result: WalletFallbackResult = {
          success: false,
          walletId: 'unknown',
          strategy: {
            type: 'install-prompt',
            message: event.message,
          },
          error: event.error,
        };
        onFallback(result);
      }
    });

    // Monitor wallet availability changes
    const stopMonitoring = WalletInstallationDetector.startMonitoring(() => {
      // Check if previously unavailable wallet is now available
      // This allows for automatic recovery
    });

    return () => {
      // Cleanup
      stopMonitoring();
    };
  }
}

/**
 * Configuration for fallback behavior
 */
export const fallbackConfig = {
  // List of wallets to try in order
  walletPreference: ['leather', 'hiro', 'xverse', 'walletconnect'],

  // Maximum retry attempts
  maxRetries: 3,

  // Base retry delay in milliseconds
  retryDelayMs: 1000,

  // Show installation prompt after this many failures
  installPromptThreshold: 1,

  // Timeout for connection attempts (ms)
  connectionTimeoutMs: 15000,

  // Monitor for wallet installation changes
  enableMonitoring: true,
  monitoringIntervalMs: 2000,

  // Automatically try alternatives on failure
  autoFallback: true,
};
