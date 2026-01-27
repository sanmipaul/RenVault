/**
 * Multi-Chain AppKit Configuration
 * Configures AppKit to support multiple chains (Stacks, Ethereum, Polygon, Arbitrum)
 */

import { ChainConfig, ChainNamespace } from '@reown/appkit-core';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { mainnet, polygon, arbitrum, sepolia } from 'viem/chains';

/**
 * Stacks Chain Configuration
 */
export const STACKS_MAINNET: ChainConfig = {
  chainId: 'stacks:1',
  chainNamespace: 'stacks' as ChainNamespace,
  name: 'Stacks',
  nativeCurrency: {
    name: 'Stacks Token',
    symbol: 'STX',
    decimals: 6,
  },
  rpcUrl: 'https://stacks-node-api.mainnet.stacks.org:20443',
  explorerUrl: 'https://explorer.stacks.co',
  testnet: false,
};

export const STACKS_TESTNET: ChainConfig = {
  chainId: 'stacks:0',
  chainNamespace: 'stacks' as ChainNamespace,
  name: 'Stacks Testnet',
  nativeCurrency: {
    name: 'Stacks Token (Testnet)',
    symbol: 'STX-TEST',
    decimals: 6,
  },
  rpcUrl: 'https://stacks-node-api.testnet.stacks.org:20443',
  explorerUrl: 'https://testnet-explorer.stacks.co',
  testnet: true,
};

/**
 * EVM Chain Configuration
 */
export const EVM_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 'eip155:1',
    chainNamespace: 'evm' as ChainNamespace,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: mainnet.rpcUrls.default.http[0],
    explorerUrl: 'https://etherscan.io',
    testnet: false,
  },
  polygon: {
    chainId: 'eip155:137',
    chainNamespace: 'evm' as ChainNamespace,
    name: 'Polygon',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrl: polygon.rpcUrls.default.http[0],
    explorerUrl: 'https://polygonscan.com',
    testnet: false,
  },
  arbitrum: {
    chainId: 'eip155:42161',
    chainNamespace: 'evm' as ChainNamespace,
    name: 'Arbitrum',
    nativeCurrency: {
      name: 'Arbitrum',
      symbol: 'ARB',
      decimals: 18,
    },
    rpcUrl: arbitrum.rpcUrls.default.http[0],
    explorerUrl: 'https://arbiscan.io',
    testnet: false,
  },
  sepolia: {
    chainId: 'eip155:11155111',
    chainNamespace: 'evm' as ChainNamespace,
    name: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'SEP-ETH',
      decimals: 18,
    },
    rpcUrl: sepolia.rpcUrls.default.http[0],
    explorerUrl: 'https://sepolia.etherscan.io',
    testnet: true,
  },
};

/**
 * All supported chains
 */
export const ALL_CHAINS = [STACKS_MAINNET, STACKS_TESTNET, ...Object.values(EVM_CHAINS)];

/**
 * Chain type definition
 */
export type ChainType = 'stacks' | 'ethereum' | 'polygon' | 'arbitrum' | 'sepolia' | 'stacks-testnet';

/**
 * Get chain configuration by type
 */
export function getChainConfig(chainType: ChainType): ChainConfig {
  switch (chainType) {
    case 'stacks':
      return STACKS_MAINNET;
    case 'stacks-testnet':
      return STACKS_TESTNET;
    case 'ethereum':
      return EVM_CHAINS.ethereum;
    case 'polygon':
      return EVM_CHAINS.polygon;
    case 'arbitrum':
      return EVM_CHAINS.arbitrum;
    case 'sepolia':
      return EVM_CHAINS.sepolia;
    default:
      return STACKS_MAINNET;
  }
}

/**
 * Get chain ID by type
 */
export function getChainId(chainType: ChainType): string {
  return getChainConfig(chainType).chainId;
}

/**
 * Get chain namespace by type
 */
export function getChainNamespace(chainType: ChainType): string {
  const config = getChainConfig(chainType);
  return config.chainNamespace;
}

/**
 * Check if chain is EVM
 */
export function isEvmChain(chainType: ChainType): boolean {
  return getChainNamespace(chainType) === 'evm';
}

/**
 * Check if chain is Stacks
 */
export function isStacksChain(chainType: ChainType): boolean {
  return getChainNamespace(chainType) === 'stacks';
}

/**
 * Check if chain is testnet
 */
export function isTestnet(chainType: ChainType): boolean {
  return getChainConfig(chainType).testnet;
}

/**
 * Get all EVM chains
 */
export function getAllEvmChains(): ChainConfig[] {
  return Object.values(EVM_CHAINS);
}

/**
 * Get all Stacks chains
 */
export function getAllStacksChains(): ChainConfig[] {
  return [STACKS_MAINNET, STACKS_TESTNET];
}

/**
 * Get mainnet chains
 */
export function getMainnetChains(): ChainConfig[] {
  return ALL_CHAINS.filter(chain => !chain.testnet);
}

/**
 * Get testnet chains
 */
export function getTestnetChains(): ChainConfig[] {
  return ALL_CHAINS.filter(chain => chain.testnet);
}

/**
 * Chain metadata
 */
export interface ChainMetadata {
  type: ChainType;
  name: string;
  symbol: string;
  decimals: number;
  namespace: string;
  isTestnet: boolean;
  rpcUrl: string;
  explorerUrl: string;
}

/**
 * Get chain metadata
 */
export function getChainMetadata(chainType: ChainType): ChainMetadata {
  const config = getChainConfig(chainType);
  return {
    type: chainType,
    name: config.name,
    symbol: config.nativeCurrency.symbol,
    decimals: config.nativeCurrency.decimals,
    namespace: config.chainNamespace,
    isTestnet: config.testnet,
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
  };
}

/**
 * AppKit multi-chain configuration
 */
export const multiChainConfig = {
  chains: ALL_CHAINS,
  defaultChain: STACKS_MAINNET,
  chainSwitchingEnabled: true,
  supportsEIP155: true,
  supportsStacks: true,
  rpcEndpoints: {
    stacks: STACKS_MAINNET.rpcUrl,
    ethereum: EVM_CHAINS.ethereum.rpcUrl,
    polygon: EVM_CHAINS.polygon.rpcUrl,
    arbitrum: EVM_CHAINS.arbitrum.rpcUrl,
    sepolia: EVM_CHAINS.sepolia.rpcUrl,
  },
  explorerUrls: {
    stacks: STACKS_MAINNET.explorerUrl,
    ethereum: EVM_CHAINS.ethereum.explorerUrl,
    polygon: EVM_CHAINS.polygon.explorerUrl,
    arbitrum: EVM_CHAINS.arbitrum.explorerUrl,
    sepolia: EVM_CHAINS.sepolia.explorerUrl,
  },
};
