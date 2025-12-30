// WalletProviderLoader.ts - Performance optimized provider loading
import { WalletProvider, WalletProviderType } from '../types/wallet';

export class WalletProviderLoader {
  private static providerCache: Map<WalletProviderType, Promise<WalletProvider>> = new Map();

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

  static clearCache(): void {
    this.providerCache.clear();
  }

  static getCacheStats(): { cached: number; types: WalletProviderType[] } {
    return {
      cached: this.providerCache.size,
      types: Array.from(this.providerCache.keys())
    };
  }
}