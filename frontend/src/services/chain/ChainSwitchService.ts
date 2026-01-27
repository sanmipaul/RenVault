/**
 * Chain Switching Service
 * Manages active chain selection and switching between chains
 */

import { StacksChainAdapter, createStacksMainnetAdapter, createStacksTestnetAdapter } from './StacksChainAdapter';
import {
  EvmChainAdapter,
  createEthereumAdapter,
  createPolygonAdapter,
  createArbitrumAdapter,
  createSepoliaAdapter,
} from './EvmChainAdapter';
import { getChainConfig, getAllStacksChains, getAllEvmChains } from '../config/multi-chain-config';
import type { ChainType } from '../config/multi-chain-config';

export type ChainAdapter = StacksChainAdapter | EvmChainAdapter;

export interface ChainSwitchEvent {
  previousChain: ChainType;
  newChain: ChainType;
  timestamp: number;
}

/**
 * Chain Switching Service
 */
export class ChainSwitchService {
  private static activeChain: ChainType = 'stacks';
  private static adapters: Map<ChainType, ChainAdapter> = new Map();
  private static listeners: Set<(event: ChainSwitchEvent) => void> = new Set();
  private static history: ChainSwitchEvent[] = [];
  private static readonly STORAGE_KEY = 'renvault_active_chain';
  private static readonly MAX_HISTORY = 20;

  /**
   * Initialize chain service
   */
  static initialize(): void {
    this.loadActiveChain();
    this.initializeAdapters();
  }

  /**
   * Initialize all chain adapters
   */
  private static initializeAdapters(): void {
    // Stacks adapters
    this.adapters.set('stacks', createStacksMainnetAdapter());
    this.adapters.set('stacks-testnet', createStacksTestnetAdapter());

    // EVM adapters
    this.adapters.set('ethereum', createEthereumAdapter());
    this.adapters.set('polygon', createPolygonAdapter());
    this.adapters.set('arbitrum', createArbitrumAdapter());
    this.adapters.set('sepolia', createSepoliaAdapter());
  }

  /**
   * Get active chain
   */
  static getActiveChain(): ChainType {
    return this.activeChain;
  }

  /**
   * Get active adapter
   */
  static getActiveAdapter(): ChainAdapter {
    const adapter = this.adapters.get(this.activeChain);
    if (!adapter) {
      throw new Error(`No adapter found for chain: ${this.activeChain}`);
    }
    return adapter;
  }

  /**
   * Get adapter by chain type
   */
  static getAdapter(chainType: ChainType): ChainAdapter {
    const adapter = this.adapters.get(chainType);
    if (!adapter) {
      throw new Error(`No adapter found for chain: ${chainType}`);
    }
    return adapter;
  }

  /**
   * Switch to a different chain
   */
  static switchChain(chainType: ChainType): void {
    if (this.activeChain === chainType) return;

    const previousChain = this.activeChain;
    this.activeChain = chainType;

    this.saveActiveChain();
    this.addToHistory(previousChain, chainType);
    this.notifyListeners(previousChain, chainType);
  }

  /**
   * Switch to Stacks
   */
  static switchToStacks(): void {
    this.switchChain('stacks');
  }

  /**
   * Switch to Ethereum
   */
  static switchToEthereum(): void {
    this.switchChain('ethereum');
  }

  /**
   * Switch to Polygon
   */
  static switchToPolygon(): void {
    this.switchChain('polygon');
  }

  /**
   * Switch to Arbitrum
   */
  static switchToArbitrum(): void {
    this.switchChain('arbitrum');
  }

  /**
   * Switch to Sepolia testnet
   */
  static switchToSepolia(): void {
    this.switchChain('sepolia');
  }

  /**
   * Get all available chains
   */
  static getAllChains() {
    return [...getAllStacksChains(), ...getAllEvmChains()];
  }

  /**
   * Get all Stacks chains
   */
  static getStacksChains() {
    return getAllStacksChains();
  }

  /**
   * Get all EVM chains
   */
  static getEvmChains() {
    return getAllEvmChains();
  }

  /**
   * Check if active chain is Stacks
   */
  static isStacksActive(): boolean {
    return this.activeChain.includes('stacks');
  }

  /**
   * Check if active chain is EVM
   */
  static isEvmActive(): boolean {
    return !this.activeChain.includes('stacks');
  }

  /**
   * Listen to chain switches
   */
  static onChainSwitch(listener: (event: ChainSwitchEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(previousChain: ChainType, newChain: ChainType): void {
    const event: ChainSwitchEvent = {
      previousChain,
      newChain,
      timestamp: Date.now(),
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in chain switch listener:', error);
      }
    });
  }

  /**
   * Save active chain to storage
   */
  private static saveActiveChain(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        chain: this.activeChain,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to save active chain:', error);
    }
  }

  /**
   * Load active chain from storage
   */
  private static loadActiveChain(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const { chain } = JSON.parse(saved);
        if (this.isValidChain(chain)) {
          this.activeChain = chain;
        }
      }
    } catch (error) {
      console.error('Failed to load active chain:', error);
    }
  }

  /**
   * Validate chain type
   */
  private static isValidChain(chain: any): boolean {
    const validChains = ['stacks', 'stacks-testnet', 'ethereum', 'polygon', 'arbitrum', 'sepolia'];
    return validChains.includes(chain);
  }

  /**
   * Add switch to history
   */
  private static addToHistory(previousChain: ChainType, newChain: ChainType): void {
    const event: ChainSwitchEvent = {
      previousChain,
      newChain,
      timestamp: Date.now(),
    };

    this.history.unshift(event);

    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }
  }

  /**
   * Get chain switch history
   */
  static getHistory(): ChainSwitchEvent[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  static clearHistory(): void {
    this.history = [];
  }

  /**
   * Get state
   */
  static getState() {
    return {
      activeChain: this.activeChain,
      isStacks: this.isStacksActive(),
      isEvm: this.isEvmActive(),
      adapter: this.getActiveAdapter(),
      history: this.getHistory(),
    };
  }

  /**
   * Destroy service
   */
  static destroy(): void {
    this.listeners.clear();
    this.history = [];
    this.adapters.clear();
  }
}

/**
 * React Hook for chain switching
 */
import React from 'react';

export const useChainSwitch = () => {
  const [activeChain, setActiveChain] = React.useState<ChainType>(() =>
    ChainSwitchService.getActiveChain()
  );

  React.useEffect(() => {
    ChainSwitchService.initialize();
    const unsubscribe = ChainSwitchService.onChainSwitch(({ newChain }) => {
      setActiveChain(newChain);
    });

    return unsubscribe;
  }, []);

  return {
    activeChain,
    switchChain: (chain: ChainType) => ChainSwitchService.switchChain(chain),
    switchToStacks: () => ChainSwitchService.switchToStacks(),
    switchToEthereum: () => ChainSwitchService.switchToEthereum(),
    switchToPolygon: () => ChainSwitchService.switchToPolygon(),
    switchToArbitrum: () => ChainSwitchService.switchToArbitrum(),
    switchToSepolia: () => ChainSwitchService.switchToSepolia(),
    isStacks: ChainSwitchService.isStacksActive(),
    isEvm: ChainSwitchService.isEvmActive(),
    adapter: ChainSwitchService.getActiveAdapter(),
    allChains: ChainSwitchService.getAllChains(),
    evmChains: ChainSwitchService.getEvmChains(),
    stacksChains: ChainSwitchService.getStacksChains(),
    history: ChainSwitchService.getHistory(),
  };
};
