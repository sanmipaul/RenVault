// services/wallet/WalletManager.ts
import { WalletProvider, WalletProviderType } from '../../types/wallet';
import { LeatherWalletProvider } from './LeatherWalletProvider';
import { XverseWalletProvider } from './XverseWalletProvider';
import { HiroWalletProvider } from './HiroWalletProvider';
import { WalletConnectProvider } from './WalletConnectProvider';
import { LedgerWalletProvider } from './LedgerWalletProvider';
import { TrezorWalletProvider } from './TrezorWalletProvider';
import * as crypto from 'crypto';

export class WalletManager {
  private providers: Map<WalletProviderType, WalletProvider> = new Map();
  private currentProvider: WalletProvider | null = null;
  private connectionState: { address: string; publicKey: string } | null = null;

  constructor() {
    this.providers.set('leather', new LeatherWalletProvider());
    this.providers.set('xverse', new XverseWalletProvider());
    this.providers.set('hiro', new HiroWalletProvider());
    this.providers.set('walletconnect', new WalletConnectProvider());
    this.providers.set('ledger', new LedgerWalletProvider());
    this.providers.set('trezor', new TrezorWalletProvider());
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

  getConnectionState(): { address: string; publicKey: string } | null {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState !== null;
  }

  async connect(): Promise<any> {
    if (!this.currentProvider) {
      throw new Error('No provider selected');
    }
    const result = await this.currentProvider.connect();
    this.connectionState = result;
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.disconnect();
    }
    // Clear all state
    this.connectionState = null;
    this.currentProvider = null;
    // Clear all wallet-related localStorage
    this.clearStoredData();
  }

  private clearStoredData(): void {
    const keysToRemove = [
      'leather-session',
      'xverse-session',
      'hiro-session',
      'walletconnect-session',
      'renvault-wallet-state'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  async signTransaction(tx: any): Promise<any> {
    if (!this.currentProvider) {
      throw new Error('No provider selected');
    }
    return this.currentProvider.signTransaction(tx);
  }
}