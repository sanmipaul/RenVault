/**
 * AppKit Multi-Chain Integration
 * Integrates AppKit with multi-chain support configuration
 */

import { createAppKit } from '@reown/appkit';
import { EthereumAdapter } from '@reown/appkit-adapter-ethereum';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';
import {
  mainnet,
  sepolia,
  arbitrum,
  polygon,
} from '@reown/appkit/networks';
import { multiChainConfig } from './multi-chain-config';
import { ChainSwitchService } from '../services/chain/ChainSwitchService';
import { MultiChainTransactionService } from '../services/chain/MultiChainTransactionService';
import { MultiChainBalanceService } from '../services/chain/MultiChainBalanceService';

/**
 * AppKit Multi-Chain Configuration
 */
export interface AppKitMultiChainConfig {
  projectId: string;
  appName: string;
  appIcon?: string;
  appUrl?: string;
  defaultChain?: string;
}

let appKit: any = null;
let appKitConfig: AppKitMultiChainConfig | null = null;

/**
 * Initialize AppKit with multi-chain support
 */
export const initializeAppKitMultiChain = async (config: AppKitMultiChainConfig) => {
  try {
    appKitConfig = config;

    // Map our chains to AppKit networks
    const networks = [mainnet, sepolia, arbitrum, polygon];

    // Create Ethereum adapter with multiple chains
    const ethereumAdapter = new EthereumAdapter({
      networks,
      walletConnectProjectId: config.projectId,
    });

    // Note: StacksAdapter would be imported from @reown/appkit-adapter-stacks
    // For now, we'll use Ethereum as primary
    const adapters = [ethereumAdapter];

    // Create AppKit instance
    appKit = createAppKit({
      adapters,
      networks,
      projectId: config.projectId,
      metadata: {
        name: config.appName,
        description: 'RenVault - Multi-Chain Asset Management',
        url: config.appUrl || 'https://renvault.app',
        icons: config.appIcon ? [config.appIcon] : [],
      },
      defaultChain: config.defaultChain || 'ethereum',
    });

    // Initialize chain services
    await ChainSwitchService.initialize();
    MultiChainTransactionService.initialize();
    MultiChainBalanceService.startMonitoring(appKit?.getAddress?.() || '');

    // Subscribe to AppKit account changes
    if (appKit?.subscribeAccount) {
      appKit.subscribeAccount(({ address, chainId }: any) => {
        if (address && chainId) {
          // Update active chain based on AppKit selection
          handleAppKitChainChange(chainId);

          // Start monitoring balances for new address
          MultiChainBalanceService.stopMonitoring('');
          MultiChainBalanceService.startMonitoring(address);
        }
      });
    }

    // Subscribe to AppKit network changes
    if (appKit?.subscribeNetwork) {
      appKit.subscribeNetwork(({ chainId }: any) => {
        if (chainId) {
          handleAppKitChainChange(chainId);
        }
      });
    }

    return appKit;
  } catch (error) {
    console.error('Error initializing AppKit multi-chain:', error);
    throw error;
  }
};

/**
 * Handle AppKit chain changes
 */
const handleAppKitChainChange = (chainId: number) => {
  try {
    // Map chainId to our ChainType
    const chainMap: Record<number, any> = {
      1: 'ethereum', // Ethereum Mainnet
      137: 'polygon', // Polygon
      42161: 'arbitrum', // Arbitrum
      11155111: 'sepolia', // Sepolia Testnet
    };

    const chainType = chainMap[chainId];

    if (chainType) {
      ChainSwitchService.switchChain(chainType);
    }
  } catch (error) {
    console.error('Error handling AppKit chain change:', error);
  }
};

/**
 * Get AppKit instance
 */
export const getAppKit = () => {
  return appKit;
};

/**
 * Get current connected address
 */
export const getConnectedAddress = (): string | null => {
  if (!appKit) {
    return null;
  }

  try {
    return appKit.getAddress?.() || null;
  } catch {
    return null;
  }
};

/**
 * Get current connected chain
 */
export const getConnectedChain = (): string | null => {
  if (!appKit) {
    return null;
  }

  try {
    const chainId = appKit.getChainId?.();

    if (!chainId) {
      return null;
    }

    const chainMap: Record<number, string> = {
      1: 'ethereum',
      137: 'polygon',
      42161: 'arbitrum',
      11155111: 'sepolia',
    };

    return chainMap[chainId] || null;
  } catch {
    return null;
  }
};

/**
 * Switch chain using AppKit
 */
export const switchChainViaAppKit = async (chainId: number): Promise<void> => {
  if (!appKit) {
    throw new Error('AppKit not initialized');
  }

  try {
    await appKit.switchNetwork?.({ chainId });
  } catch (error) {
    console.error('Error switching chain via AppKit:', error);
    throw error;
  }
};

/**
 * Connect wallet using AppKit
 */
export const connectWalletViaAppKit = async (): Promise<string | null> => {
  if (!appKit) {
    throw new Error('AppKit not initialized');
  }

  try {
    await appKit.open();
    return getConnectedAddress();
  } catch (error) {
    console.error('Error connecting wallet via AppKit:', error);
    throw error;
  }
};

/**
 * Disconnect wallet from AppKit
 */
export const disconnectWalletViaAppKit = async (): Promise<void> => {
  if (!appKit) {
    return;
  }

  try {
    await appKit.disconnect?.();
  } catch (error) {
    console.error('Error disconnecting wallet from AppKit:', error);
  }
};

/**
 * Send transaction via AppKit
 */
export const sendTransactionViaAppKit = async (tx: {
  to: string;
  from: string;
  data?: string;
  value?: string;
}): Promise<string> => {
  if (!appKit) {
    throw new Error('AppKit not initialized');
  }

  try {
    const provider = await appKit.getProvider?.();

    if (!provider) {
      throw new Error('Provider not available');
    }

    const hash = await provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    });

    // Track transaction
    const address = getConnectedAddress();
    const chainType = getConnectedChain();

    if (address && chainType) {
      MultiChainTransactionService.createTransaction({
        chainType: chainType as any,
        type: 'transfer',
        from: tx.from,
        to: tx.to,
        amount: tx.value || '0',
        currency: chainType === 'ethereum' ? 'ETH' : 'MATIC',
        status: 'pending',
        hash,
      });
    }

    return hash;
  } catch (error) {
    console.error('Error sending transaction via AppKit:', error);
    throw error;
  }
};

/**
 * Get wallet provider for signing
 */
export const getWalletProvider = async () => {
  if (!appKit) {
    throw new Error('AppKit not initialized');
  }

  try {
    return await appKit.getProvider?.();
  } catch (error) {
    console.error('Error getting wallet provider:', error);
    throw error;
  }
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = (): boolean => {
  return getConnectedAddress() !== null;
};

/**
 * Get AppKit connection state
 */
export const getAppKitConnectionState = () => {
  return {
    isConnected: isWalletConnected(),
    address: getConnectedAddress(),
    chain: getConnectedChain(),
    config: appKitConfig,
  };
};

/**
 * Cleanup AppKit
 */
export const cleanupAppKit = () => {
  MultiChainBalanceService.destroy();
  ChainSwitchService.destroy();
};

export default {
  initializeAppKitMultiChain,
  getAppKit,
  getConnectedAddress,
  getConnectedChain,
  switchChainViaAppKit,
  connectWalletViaAppKit,
  disconnectWalletViaAppKit,
  sendTransactionViaAppKit,
  getWalletProvider,
  isWalletConnected,
  getAppKitConnectionState,
  cleanupAppKit,
};
