// services/wallet/WalletManager.ts
import { WalletProvider, WalletProviderType } from '../../types/wallet';
import { LeatherWalletProvider } from './LeatherWalletProvider';
import { XverseWalletProvider } from './XverseWalletProvider';
import { HiroWalletProvider } from './HiroWalletProvider';
import { WalletConnectProvider } from './WalletConnectProvider';

export class WalletManager {
  private providers: Map<WalletProviderType, WalletProvider> = new Map();
  private currentProvider: WalletProvider | null = null;

  constructor() {
    this.providers.set('leather', new LeatherWalletProvider());
    this.providers.set('xverse', new XverseWalletProvider());
    this.providers.set('hiro', new HiroWalletProvider());
    this.providers.set('walletconnect', new WalletConnectProvider());
  }

  getAvailableProviders(): WalletProvider[] {
    return Array.from(this.providers.values());
  }

  setProvider(type: WalletProviderType): void {
    const provider = this.providers.get(type);
    if (provider) {
      this.currentProvider = provider;
    }
  }

  getCurrentProvider(): WalletProvider | null {
    return this.currentProvider;
  }

  async connect(): Promise<any> {
    if (!this.currentProvider) {
      throw new Error('No provider selected');
    }
    return this.currentProvider.connect();
  }

  async disconnect(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.disconnect();
    }
  }

  async signTransaction(tx: any): Promise<any> {
    if (!this.currentProvider) {
      throw new Error('No provider selected');
    }
    return this.currentProvider.signTransaction(tx);
  }
}