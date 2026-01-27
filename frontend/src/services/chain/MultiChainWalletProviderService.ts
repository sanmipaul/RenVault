/**
 * Multi-Chain Wallet Provider Service
 * Handles wallet detection and connection across multiple chains
 */

import { ChainSwitchService } from './ChainSwitchService';
import type { ChainType } from '../config/multi-chain-config';

export interface WalletProvider {
  name: string;
  chainType: ChainType;
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface WalletState {
  provider: string | null;
  address: string | null;
  chainType: ChainType | null;
  isConnected: boolean;
}

/**
 * Multi-Chain Wallet Provider Service
 */
export class MultiChainWalletProviderService {
  private static providers: Map<string, WalletProvider> = new Map();
  private static currentWallet: WalletState = {
    provider: null,
    address: null,
    chainType: null,
    isConnected: false,
  };
  private static listeners: Set<(state: WalletState) => void> = new Set();

  /**
   * Initialize wallet providers
   */
  static async initialize(): Promise<void> {
    try {
      // Check for window.ethereum (MetaMask, Polygon, Arbitrum)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;

        // Ethereum provider
        this.registerProvider({
          name: 'MetaMask',
          chainType: 'ethereum',
          isAvailable: true,
          isConnected: false,
          address: null,
          connect: async () => await this.connectEvm('ethereum', provider),
          disconnect: async () => await this.disconnectEvm('ethereum'),
        });

        // Polygon provider (same as Ethereum)
        this.registerProvider({
          name: 'MetaMask (Polygon)',
          chainType: 'polygon',
          isAvailable: true,
          isConnected: false,
          address: null,
          connect: async () => await this.connectEvm('polygon', provider),
          disconnect: async () => await this.disconnectEvm('polygon'),
        });

        // Arbitrum provider (same as Ethereum)
        this.registerProvider({
          name: 'MetaMask (Arbitrum)',
          chainType: 'arbitrum',
          isAvailable: true,
          isConnected: false,
          address: null,
          connect: async () => await this.connectEvm('arbitrum', provider),
          disconnect: async () => await this.disconnectEvm('arbitrum'),
        });
      }

      // Check for Stacks wallet (Leather, Magic)
      if (typeof window !== 'undefined' && (window as any).leather) {
        this.registerProvider({
          name: 'Leather',
          chainType: 'stacks',
          isAvailable: true,
          isConnected: false,
          address: null,
          connect: async () => await this.connectStacks(),
          disconnect: async () => await this.disconnectStacks(),
        });
      }

      // Check for Sepolia testnet support
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.registerProvider({
          name: 'MetaMask (Sepolia)',
          chainType: 'sepolia',
          isAvailable: true,
          isConnected: false,
          address: null,
          connect: async () => await this.connectEvm('sepolia', (window as any).ethereum),
          disconnect: async () => await this.disconnectEvm('sepolia'),
        });
      }
    } catch (error) {
      console.error('Error initializing wallet providers:', error);
    }
  }

  /**
   * Register wallet provider
   */
  private static registerProvider(provider: WalletProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Connect to EVM chain
   */
  private static async connectEvm(chainType: ChainType, provider: any): Promise<void> {
    try {
      if (!provider) {
        throw new Error('Ethereum provider not available');
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];

        // Switch to specific chain if needed
        const chainId = this.getChainIdForType(chainType);
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainId }],
          });
        } catch (switchError: any) {
          // Chain not added, try to add it
          if (switchError.code === 4902) {
            await this.addChainToWallet(provider, chainType);
          }
        }

        await ChainSwitchService.switchChain(chainType);

        this.currentWallet = {
          provider: 'MetaMask',
          address,
          chainType,
          isConnected: true,
        };

        this.notifyListeners();
      }
    } catch (error) {
      console.error(`Error connecting to ${chainType}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from EVM chain
   */
  private static async disconnectEvm(chainType: ChainType): Promise<void> {
    if (this.currentWallet.chainType === chainType) {
      this.currentWallet = {
        provider: null,
        address: null,
        chainType: null,
        isConnected: false,
      };

      this.notifyListeners();
    }
  }

  /**
   * Connect to Stacks
   */
  private static async connectStacks(): Promise<void> {
    try {
      const leather = (window as any).leather;

      if (!leather) {
        throw new Error('Leather wallet not available');
      }

      const userSession = await leather.request('stx_requestAccounts');

      if (userSession && userSession.length > 0) {
        const address = userSession[0].address;

        await ChainSwitchService.switchChain('stacks');

        this.currentWallet = {
          provider: 'Leather',
          address,
          chainType: 'stacks',
          isConnected: true,
        };

        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error connecting to Stacks:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Stacks
   */
  private static async disconnectStacks(): Promise<void> {
    if (this.currentWallet.chainType === 'stacks') {
      this.currentWallet = {
        provider: null,
        address: null,
        chainType: null,
        isConnected: false,
      };

      this.notifyListeners();
    }
  }

  /**
   * Get chain ID hex for wallet switch
   */
  private static getChainIdForType(chainType: ChainType): string {
    const chainIds: Record<string, string> = {
      ethereum: '0x1', // 1
      polygon: '0x89', // 137
      arbitrum: '0xa4b1', // 42161
      sepolia: '0xaa36a7', // 11155111
      stacks: '0x0', // Not applicable
      'stacks-testnet': '0x0', // Not applicable
    };

    return chainIds[chainType] || '0x1';
  }

  /**
   * Add chain to wallet
   */
  private static async addChainToWallet(provider: any, chainType: ChainType): Promise<void> {
    const chainConfigs: Record<string, any> = {
      polygon: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com'],
      },
      arbitrum: {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'ETH', symbol: 'ARB', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
      },
      sepolia: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
    };

    const config = chainConfigs[chainType];

    if (config) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });
    }
  }

  /**
   * Connect to wallet by provider name
   */
  static async connectWallet(providerName: string): Promise<void> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${providerName} is not available`);
    }

    await provider.connect();
  }

  /**
   * Disconnect current wallet
   */
  static async disconnectWallet(): Promise<void> {
    if (this.currentWallet.provider && this.currentWallet.chainType) {
      const provider = [...this.providers.values()].find(
        p => p.name === this.currentWallet.provider && p.chainType === this.currentWallet.chainType
      );

      if (provider) {
        await provider.disconnect();
      }
    }
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): WalletProvider[] {
    return [...this.providers.values()].filter(p => p.isAvailable);
  }

  /**
   * Get current wallet state
   */
  static getCurrentWallet(): WalletState {
    return { ...this.currentWallet };
  }

  /**
   * Subscribe to wallet state changes
   */
  static onWalletChange(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of state changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.currentWallet });
      } catch (error) {
        console.error('Error in wallet change listener:', error);
      }
    });
  }

  /**
   * Destroy service
   */
  static destroy(): void {
    this.providers.clear();
    this.listeners.clear();
    this.currentWallet = {
      provider: null,
      address: null,
      chainType: null,
      isConnected: false,
    };
  }
}

/**
 * React Hook for wallet management
 */
import React from 'react';

export const useMultiChainWallet = () => {
  const [wallet, setWallet] = React.useState<WalletState>(
    MultiChainWalletProviderService.getCurrentWallet()
  );
  const [providers, setProviders] = React.useState<WalletProvider[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = MultiChainWalletProviderService.onWalletChange(state => {
      setWallet(state);
    });

    // Initialize providers
    MultiChainWalletProviderService.initialize()
      .then(() => {
        const available = MultiChainWalletProviderService.getAvailableProviders();
        setProviders(available);
      })
      .catch(err => {
        setError(err.message);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const connectWallet = async (providerName: string) => {
    setLoading(true);
    setError(null);

    try {
      await MultiChainWalletProviderService.connectWallet(providerName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      await MultiChainWalletProviderService.disconnectWallet();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    wallet,
    providers,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    isConnected: wallet.isConnected,
    address: wallet.address,
    chainType: wallet.chainType,
  };
};
