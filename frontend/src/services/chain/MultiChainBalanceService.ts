/**
 * Multi-Chain Balance Service
 * Manages balances across multiple chains
 */

import { ChainSwitchService } from './ChainSwitchService';
import { EvmChainAdapter } from './EvmChainAdapter';
import { StacksChainAdapter } from './StacksChainAdapter';
import type { ChainType } from '../config/multi-chain-config';

export interface Balance {
  chainType: ChainType;
  address: string;
  balance: string;
  displayBalance: string;
  currency: string;
  decimals: number;
  timestamp: number;
}

export interface MultiChainBalance {
  stacks: Balance | null;
  ethereum: Balance | null;
  polygon: Balance | null;
  arbitrum: Balance | null;
  total: number;
  lastUpdated: number;
}

/**
 * Multi-Chain Balance Service
 */
export class MultiChainBalanceService {
  private static balances: Map<string, Balance> = new Map();
  private static updateListeners: Set<(balances: MultiChainBalance) => void> = new Set();
  private static readonly UPDATE_INTERVAL = 30000; // 30 seconds
  private static updateTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Get balance for specific chain and address
   */
  static async getBalance(chainType: ChainType, address: string): Promise<Balance | null> {
    try {
      const adapter = ChainSwitchService.getAdapter(chainType);

      if (adapter instanceof EvmChainAdapter) {
        const balance = await adapter.getBalance(address);
        const displayBalance = adapter.fromWei(balance);

        const balanceObj: Balance = {
          chainType,
          address,
          balance: balance.toString(),
          displayBalance: displayBalance.toFixed(4),
          currency: adapter.getNativeToken().symbol,
          decimals: adapter.getNativeToken().decimals,
          timestamp: Date.now(),
        };

        const key = `${chainType}:${address}`;
        this.balances.set(key, balanceObj);

        return balanceObj;
      }

      // For Stacks, would need different implementation
      // Placeholder for now
      return null;
    } catch (error) {
      console.error(`Error fetching ${chainType} balance:`, error);
      return null;
    }
  }

  /**
   * Get balances for all chains
   */
  static async getMultiChainBalance(address: string): Promise<MultiChainBalance> {
    const chains: ChainType[] = ['stacks', 'ethereum', 'polygon', 'arbitrum'];

    const balancePromises = chains.map(chainType =>
      this.getBalance(chainType, address)
    );

    const results = await Promise.all(balancePromises);

    const multiChainBalance: MultiChainBalance = {
      stacks: results[0],
      ethereum: results[1],
      polygon: results[2],
      arbitrum: results[3],
      total: this.calculateTotalBalance(results),
      lastUpdated: Date.now(),
    };

    return multiChainBalance;
  }

  /**
   * Calculate total balance across chains
   */
  private static calculateTotalBalance(balances: (Balance | null)[]): number {
    return balances.reduce((total, balance) => {
      if (balance) {
        return total + parseFloat(balance.displayBalance);
      }
      return total;
    }, 0);
  }

  /**
   * Subscribe to balance updates
   */
  static onBalanceUpdate(listener: (balances: MultiChainBalance) => void): () => void {
    this.updateListeners.add(listener);

    return () => {
      this.updateListeners.delete(listener);
    };
  }

  /**
   * Start monitoring balance for address
   */
  static startMonitoring(address: string): void {
    const key = `monitor:${address}`;

    if (this.updateTimers.has(key)) {
      return; // Already monitoring
    }

    const timer = setInterval(async () => {
      const balances = await this.getMultiChainBalance(address);
      this.notifyListeners(balances);
    }, this.UPDATE_INTERVAL);

    this.updateTimers.set(key, timer);
  }

  /**
   * Stop monitoring balance for address
   */
  static stopMonitoring(address: string): void {
    const key = `monitor:${address}`;
    const timer = this.updateTimers.get(key);

    if (timer) {
      clearInterval(timer);
      this.updateTimers.delete(key);
    }
  }

  /**
   * Notify all listeners of balance updates
   */
  private static notifyListeners(balances: MultiChainBalance): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(balances);
      } catch (error) {
        console.error('Error in balance update listener:', error);
      }
    });
  }

  /**
   * Convert balance to USD equivalent (placeholder)
   */
  static async getBalanceInUsd(balance: Balance, price: number): Promise<string> {
    const usdValue = parseFloat(balance.displayBalance) * price;
    return usdValue.toFixed(2);
  }

  /**
   * Clear cached balances
   */
  static clearCache(): void {
    this.balances.clear();
  }

  /**
   * Get balance statistics
   */
  static getStatistics() {
    const stats = {
      totalBalances: this.balances.size,
      byChain: this.getBalancesByChain(),
      lastUpdate: Math.max(
        ...[...this.balances.values()].map(b => b.timestamp)
      ),
    };

    return stats;
  }

  /**
   * Get balance statistics by chain
   */
  private static getBalancesByChain() {
    const stats: Record<string, number> = {};

    this.balances.forEach(balance => {
      stats[balance.chainType] = parseFloat(balance.displayBalance);
    });

    return stats;
  }

  /**
   * Destroy service
   */
  static destroy(): void {
    this.updateTimers.forEach(timer => clearInterval(timer));
    this.updateTimers.clear();
    this.updateListeners.clear();
    this.balances.clear();
  }
}

/**
 * React Hook for multi-chain balances
 */
import React from 'react';

export const useMultiChainBalance = (address?: string) => {
  const [balances, setBalances] = React.useState<MultiChainBalance | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!address) return;

    setLoading(true);

    const unsubscribe = MultiChainBalanceService.onBalanceUpdate(balances => {
      setBalances(balances);
      setLoading(false);
    });

    // Initial fetch
    MultiChainBalanceService.getMultiChainBalance(address)
      .then(balances => {
        setBalances(balances);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Start monitoring
    MultiChainBalanceService.startMonitoring(address);

    return () => {
      unsubscribe();
      MultiChainBalanceService.stopMonitoring(address);
    };
  }, [address]);

  return {
    balances,
    loading,
    error,
    refetch: async () => {
      if (address) {
        setLoading(true);
        try {
          const newBalances = await MultiChainBalanceService.getMultiChainBalance(address);
          setBalances(newBalances);
          setError(null);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      }
    },
  };
};
