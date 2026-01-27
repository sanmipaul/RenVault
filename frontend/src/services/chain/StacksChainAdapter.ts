/**
 * Stacks Chain Adapter
 * Implements AppKit chain adapter for Stacks blockchain
 */

import { ChainAdapter } from '@reown/appkit-core';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { getChainConfig, isTestnet, getChainMetadata } from '../config/multi-chain-config';
import type { ChainType } from '../config/multi-chain-config';

export interface StacksAdapterConfig {
  chainId: ChainType;
  network: StacksMainnet | StacksTestnet;
}

/**
 * Stacks Chain Adapter for AppKit
 */
export class StacksChainAdapter implements ChainAdapter {
  private network: StacksMainnet | StacksTestnet;
  private chainId: ChainType;

  constructor(config: StacksAdapterConfig) {
    this.chainId = config.chainId;
    this.network = config.network;
  }

  /**
   * Get chain ID
   */
  getChainId(): string {
    return getChainConfig(this.chainId).chainId;
  }

  /**
   * Get chain namespace
   */
  getChainNamespace(): string {
    return 'stacks';
  }

  /**
   * Get network
   */
  getNetwork() {
    return this.network;
  }

  /**
   * Check if chain is testnet
   */
  isTestnet(): boolean {
    return isTestnet(this.chainId);
  }

  /**
   * Get chain metadata
   */
  getMetadata() {
    return getChainMetadata(this.chainId);
  }

  /**
   * Get RPC URL
   */
  getRpcUrl(): string {
    return getChainConfig(this.chainId).rpcUrl;
  }

  /**
   * Get explorer URL
   */
  getExplorerUrl(): string {
    return getChainConfig(this.chainId).explorerUrl;
  }

  /**
   * Validate address format
   */
  isValidAddress(address: string): boolean {
    // Stacks addresses start with S (mainnet) or ST (testnet)
    if (this.isTestnet()) {
      return /^ST[A-Z0-9]{38}$/.test(address);
    }
    return /^SP[A-Z0-9]{38}$/.test(address);
  }

  /**
   * Format address
   */
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Stacks address: ${address}`);
    }
    return address;
  }

  /**
   * Get native token info
   */
  getNativeToken() {
    const config = getChainConfig(this.chainId);
    return config.nativeCurrency;
  }

  /**
   * Convert amount to smallest unit (microSTX)
   */
  toSmallestUnit(amount: number): bigint {
    const decimals = this.getNativeToken().decimals;
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  }

  /**
   * Convert from smallest unit to token amount
   */
  fromSmallestUnit(amount: bigint): number {
    const decimals = this.getNativeToken().decimals;
    return Number(amount) / Math.pow(10, decimals);
  }
}

/**
 * Create Stacks adapter for mainnet
 */
export function createStacksMainnetAdapter(): StacksChainAdapter {
  return new StacksChainAdapter({
    chainId: 'stacks',
    network: new StacksMainnet(),
  });
}

/**
 * Create Stacks adapter for testnet
 */
export function createStacksTestnetAdapter(): StacksChainAdapter {
  return new StacksChainAdapter({
    chainId: 'stacks-testnet',
    network: new StacksTestnet(),
  });
}
