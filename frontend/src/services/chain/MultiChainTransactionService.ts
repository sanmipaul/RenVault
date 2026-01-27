/**
 * Multi-Chain Transaction Service
 * Handles transactions across Stacks and EVM chains
 */

import { ChainSwitchService } from './ChainSwitchService';
import { getChainConfig, isStacksChain, isEvmChain } from '../config/multi-chain-config';
import type { ChainType } from '../config/multi-chain-config';

export interface Transaction {
  id: string;
  chainType: ChainType;
  type: 'send' | 'receive' | 'contract' | 'swap' | 'stake';
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  fee?: string;
}

/**
 * Multi-Chain Transaction Service
 */
export class MultiChainTransactionService {
  private static transactions: Transaction[] = [];
  private static readonly STORAGE_KEY = 'renvault_transactions';
  private static readonly MAX_TRANSACTIONS = 100;

  /**
   * Initialize service
   */
  static initialize(): void {
    this.loadTransactions();
  }

  /**
   * Create transaction
   */
  static createTransaction(
    tx: Omit<Transaction, 'id' | 'timestamp'>
  ): Transaction {
    const transaction: Transaction = {
      ...tx,
      id: this.generateTransactionId(),
      timestamp: Date.now(),
    };

    this.transactions.unshift(transaction);

    if (this.transactions.length > this.MAX_TRANSACTIONS) {
      this.transactions.pop();
    }

    this.saveTransactions();
    return transaction;
  }

  /**
   * Update transaction status
   */
  static updateTransactionStatus(
    txId: string,
    status: 'pending' | 'confirmed' | 'failed',
    blockNumber?: number
  ): Transaction | null {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) return null;

    tx.status = status;
    if (blockNumber) {
      tx.blockNumber = blockNumber;
    }

    this.saveTransactions();
    return tx;
  }

  /**
   * Get transaction by ID
   */
  static getTransaction(txId: string): Transaction | null {
    return this.transactions.find(t => t.id === txId) || null;
  }

  /**
   * Get transactions by chain
   */
  static getTransactionsByChain(chainType: ChainType): Transaction[] {
    return this.transactions.filter(t => t.chainType === chainType);
  }

  /**
   * Get transactions by address
   */
  static getTransactionsByAddress(address: string): Transaction[] {
    return this.transactions.filter(
      t => t.from.toLowerCase() === address.toLowerCase() ||
           t.to.toLowerCase() === address.toLowerCase()
    );
  }

  /**
   * Get pending transactions
   */
  static getPendingTransactions(): Transaction[] {
    return this.transactions.filter(t => t.status === 'pending');
  }

  /**
   * Get confirmed transactions
   */
  static getConfirmedTransactions(): Transaction[] {
    return this.transactions.filter(t => t.status === 'confirmed');
  }

  /**
   * Get failed transactions
   */
  static getFailedTransactions(): Transaction[] {
    return this.transactions.filter(t => t.status === 'failed');
  }

  /**
   * Get recent transactions
   */
  static getRecentTransactions(count: number = 10): Transaction[] {
    return this.transactions.slice(0, count);
  }

  /**
   * Get all transactions
   */
  static getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }

  /**
   * Get transactions by date range
   */
  static getTransactionsByDateRange(startTime: number, endTime: number): Transaction[] {
    return this.transactions.filter(
      t => t.timestamp >= startTime && t.timestamp <= endTime
    );
  }

  /**
   * Get transaction statistics
   */
  static getStatistics() {
    const stats = {
      totalTransactions: this.transactions.length,
      pendingCount: this.transactions.filter(t => t.status === 'pending').length,
      confirmedCount: this.transactions.filter(t => t.status === 'confirmed').length,
      failedCount: this.transactions.filter(t => t.status === 'failed').length,
      byChain: this.getTransactionsByChainType(),
      totalValueTransferred: this.calculateTotalValue(),
    };

    return stats;
  }

  /**
   * Get transaction count by chain
   */
  private static getTransactionsByChainType() {
    const chainStats: Record<string, number> = {};

    this.transactions.forEach(tx => {
      chainStats[tx.chainType] = (chainStats[tx.chainType] || 0) + 1;
    });

    return chainStats;
  }

  /**
   * Calculate total value transferred
   */
  private static calculateTotalValue() {
    return this.transactions.reduce((total, tx) => {
      try {
        return total + parseFloat(tx.amount);
      } catch {
        return total;
      }
    }, 0);
  }

  /**
   * Clear transactions
   */
  static clearTransactions(): void {
    this.transactions = [];
    this.saveTransactions();
  }

  /**
   * Save transactions to storage
   */
  private static saveTransactions(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.transactions)
      );
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }

  /**
   * Load transactions from storage
   */
  private static loadTransactions(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.transactions = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  /**
   * Generate unique transaction ID
   */
  private static generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export transactions as JSON
   */
  static exportTransactions(): string {
    return JSON.stringify(this.transactions, null, 2);
  }

  /**
   * Import transactions from JSON
   */
  static importTransactions(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.transactions = imported;
        this.saveTransactions();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import transactions:', error);
      return false;
    }
  }
}

/**
 * React Hook for multi-chain transactions
 */
import React from 'react';

export const useMultiChainTransactions = (chainType?: ChainType) => {
  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    if (chainType) {
      return MultiChainTransactionService.getTransactionsByChain(chainType);
    }
    return MultiChainTransactionService.getAllTransactions();
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (chainType) {
        setTransactions(MultiChainTransactionService.getTransactionsByChain(chainType));
      } else {
        setTransactions(MultiChainTransactionService.getAllTransactions());
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [chainType]);

  return {
    transactions,
    createTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) =>
      MultiChainTransactionService.createTransaction(tx),
    updateStatus: (txId: string, status: 'pending' | 'confirmed' | 'failed') =>
      MultiChainTransactionService.updateTransactionStatus(txId, status),
    getTransaction: (txId: string) =>
      MultiChainTransactionService.getTransaction(txId),
    getPending: () => MultiChainTransactionService.getPendingTransactions(),
    getConfirmed: () => MultiChainTransactionService.getConfirmedTransactions(),
    statistics: MultiChainTransactionService.getStatistics(),
  };
};
