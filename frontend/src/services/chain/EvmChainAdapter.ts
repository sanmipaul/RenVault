/**
 * EVM Chain Adapter
 * Implements AppKit chain adapter for EVM-compatible chains
 */

import { ChainAdapter } from '@reown/appkit-core';
import { useContractRead, useContractWrite, useAccount, useSwitchNetwork } from 'wagmi';
import { getChainConfig, isTestnet, getChainMetadata } from '../config/multi-chain-config';
import type { ChainType } from '../config/multi-chain-config';

export interface EvmAdapterConfig {
  chainId: ChainType;
  rpcUrl: string;
  explorerUrl: string;
}

/**
 * EVM Chain Adapter for AppKit
 */
export class EvmChainAdapter implements ChainAdapter {
  private chainId: ChainType;
  private rpcUrl: string;
  private explorerUrl: string;

  constructor(config: EvmAdapterConfig) {
    this.chainId = config.chainId;
    this.rpcUrl = config.rpcUrl;
    this.explorerUrl = config.explorerUrl;
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
    return 'evm';
  }

  /**
   * Get numeric chain ID
   */
  getNumericChainId(): number {
    const chainId = getChainConfig(this.chainId).chainId;
    const numericId = chainId.split(':')[1];
    return parseInt(numericId, 10);
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
    return this.rpcUrl;
  }

  /**
   * Get explorer URL
   */
  getExplorerUrl(): string {
    return this.explorerUrl;
  }

  /**
   * Get native token info
   */
  getNativeToken() {
    const config = getChainConfig(this.chainId);
    return config.nativeCurrency;
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format Ethereum address (checksum)
   */
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }
    // Basic checksum (production would use web3.utils.toChecksumAddress)
    return address.toLowerCase();
  }

  /**
   * Convert amount to wei
   */
  toWei(amount: number): bigint {
    const decimals = this.getNativeToken().decimals;
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  }

  /**
   * Convert from wei to token amount
   */
  fromWei(amount: bigint): number {
    const decimals = this.getNativeToken().decimals;
    return Number(amount) / Math.pow(10, decimals);
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.result) {
        return BigInt(data.result);
      }
      throw new Error('Failed to get gas price');
    } catch (error) {
      console.error('Error fetching gas price:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(to: string, data?: string): Promise<bigint> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{ to, data }],
          id: 1,
        }),
      });

      const data_response = await response.json();
      if (data_response.result) {
        return BigInt(data_response.result);
      }
      throw new Error('Failed to estimate gas');
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Get balance of address
   */
  async getBalance(address: string): Promise<bigint> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.result) {
        return BigInt(data.result);
      }
      throw new Error('Failed to get balance');
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}

/**
 * Create EVM adapter for Ethereum
 */
export function createEthereumAdapter(): EvmChainAdapter {
  const config = getChainConfig('ethereum');
  return new EvmChainAdapter({
    chainId: 'ethereum',
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
  });
}

/**
 * Create EVM adapter for Polygon
 */
export function createPolygonAdapter(): EvmChainAdapter {
  const config = getChainConfig('polygon');
  return new EvmChainAdapter({
    chainId: 'polygon',
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
  });
}

/**
 * Create EVM adapter for Arbitrum
 */
export function createArbitrumAdapter(): EvmChainAdapter {
  const config = getChainConfig('arbitrum');
  return new EvmChainAdapter({
    chainId: 'arbitrum',
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
  });
}

/**
 * Create EVM adapter for Sepolia testnet
 */
export function createSepoliaAdapter(): EvmChainAdapter {
  const config = getChainConfig('sepolia');
  return new EvmChainAdapter({
    chainId: 'sepolia',
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
  });
}
