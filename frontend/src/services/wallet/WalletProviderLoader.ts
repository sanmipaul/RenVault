// WalletProviderLoader.ts - Performance optimized provider loading with AppKit integration
import { WalletProvider, WalletProviderType } from '../types/wallet';
import { StacksConnectorAdapter } from './StacksConnectorAdapter';
import { WalletInstallationDetector } from './WalletInstallationDetector';
import { WalletFallbackManager } from './WalletFallbackManager';
import { CustomWalletConfig } from '../config/customWallets';

export interface AppKitWalletConfig {
  id: string;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  custom?: boolean;
  isInstalled: boolean;
  downloadUrl?: string;
}

export class WalletProviderLoader {
  private static providerCache: Map<WalletProviderType, Promise<WalletProvider>> = new Map();
  private static adapterCache: Map<string, StacksConnectorAdapter> = new Map();
  private static appKitWalletsCache: AppKitWalletConfig[] | null = null;

  static async loadProvider(type: WalletProviderType): Promise<WalletProvider> {
    // Check cache first
    if (this.providerCache.has(type)) {
      return this.providerCache.get(type)!;
    }

    // Create and cache the loading promise
    const loadPromise = this.createProvider(type);
    this.providerCache.set(type, loadPromise);

    return loadPromise;
  }

  /**
   * Load AppKit-compatible wallet with fallback
   */
  static async loadAppKitWallet(preferredWalletId: string): Promise<StacksConnectorAdapter> {
    // Check adapter cache
    if (this.adapterCache.has(preferredWalletId)) {
      return this.adapterCache.get(preferredWalletId)!;
    }

    // Use fallback manager for connection attempts
    const result = await WalletFallbackManager.connectWithFallback(preferredWalletId);

    if (result.success) {
      const adapter = new StacksConnectorAdapter(result.walletId);
      this.adapterCache.set(result.walletId, adapter);
      return adapter;
    }

    // If primary failed, create adapter and throw
    const adapter = new StacksConnectorAdapter(preferredWalletId);
    throw result.error || new Error(`Failed to connect to ${preferredWalletId}`);
  }

  /**
   * Get AppKit-compatible wallet list
   */
  static getAppKitWallets(): AppKitWalletConfig[] {
    if (this.appKitWalletsCache) {
      return this.appKitWalletsCache;
    }

    const wallets: AppKitWalletConfig[] = [
      {
        id: 'hiro',
        name: 'Hiro Wallet',
        imageUrl: '/wallets/hiro.svg',
        imageAlt: 'Hiro Wallet',
        custom: true,
        isInstalled: WalletInstallationDetector.isWalletInstalled('hiro'),
        downloadUrl: WalletInstallationDetector.getInstallationLink('hiro'),
      },
      {
        id: 'leather',
        name: 'Leather Wallet',
        imageUrl: '/wallets/leather.svg',
        imageAlt: 'Leather Wallet',
        custom: true,
        isInstalled: WalletInstallationDetector.isWalletInstalled('leather'),
        downloadUrl: WalletInstallationDetector.getInstallationLink('leather'),
      },
      {
        id: 'xverse',
        name: 'Xverse Wallet',
        imageUrl: '/wallets/xverse.svg',
        imageAlt: 'Xverse Wallet',
        custom: true,
        isInstalled: WalletInstallationDetector.isWalletInstalled('xverse'),
        downloadUrl: WalletInstallationDetector.getInstallationLink('xverse'),
      },
    ];

    this.appKitWalletsCache = wallets;
    return wallets;
  }

  /**
   * Get only installed wallets for AppKit
   */
  static getInstalledAppKitWallets(): AppKitWalletConfig[] {
    return this.getAppKitWallets().filter(w => w.isInstalled);
  }

  /**
   * Refresh wallet installation status
   */
  static refreshWalletStatus(): void {
    // Clear cache to force refresh
    this.appKitWalletsCache = null;
  }

  /**
   * Monitor wallet installation changes and update AppKit config
   */
  static startWalletMonitoring(callback: (wallets: AppKitWalletConfig[]) => void): () => void {
    const stopMonitoring = WalletInstallationDetector.startMonitoring(() => {
      this.refreshWalletStatus();
      callback(this.getAppKitWallets());
    });

    return stopMonitoring;
  }

  private static async createProvider(type: WalletProviderType): Promise<WalletProvider> {
    switch (type) {
      case 'leather':
        const { LeatherWalletProvider } = await import('./LeatherWalletProvider');
        return new LeatherWalletProvider();

      case 'xverse':
        const { XverseWalletProvider } = await import('./XverseWalletProvider');
        return new XverseWalletProvider();

      case 'hiro':
        const { HiroWalletProvider } = await import('./HiroWalletProvider');
        return new HiroWalletProvider();

      case 'walletconnect':
        const { WalletConnectProvider } = await import('./WalletConnectProvider');
        return new WalletConnectProvider();

      case 'ledger':
        const { LedgerWalletProvider } = await import('./LedgerWalletProvider');
        return new LedgerWalletProvider();

      case 'trezor':
        const { TrezorWalletProvider } = await import('./TrezorWalletProvider');
        return new TrezorWalletProvider();

      case 'multisig':
        const { MultiSigWalletProvider } = await import('./MultiSigWalletProvider');
        return new MultiSigWalletProvider();

      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  static preloadCriticalProviders(): Promise<void[]> {
    // Preload only the most commonly used providers
    const criticalProviders: WalletProviderType[] = ['leather', 'xverse', 'walletconnect'];
    return Promise.all(
      criticalProviders.map(type => this.loadProvider(type).catch(() => undefined))
    );
  }

  /**
   * Preload AppKit wallets
   */
  static preloadAppKitWallets(): void {
    // Initialize wallet configs
    this.getAppKitWallets();

    // Start monitoring for installation changes
    this.startWalletMonitoring(() => {
      // Cache automatically refreshed by monitoring
    });
  }

  static clearCache(): void {
    this.providerCache.clear();
    this.adapterCache.clear();
    this.appKitWalletsCache = null;
  }

  static getCacheStats(): {
    cached: number;
    types: WalletProviderType[];
    adapters: number;
    appKitWallets: number;
  } {
    return {
      cached: this.providerCache.size,
      types: Array.from(this.providerCache.keys()),
      adapters: this.adapterCache.size,
      appKitWallets: this.appKitWalletsCache?.length || 0,
    };
  }
}