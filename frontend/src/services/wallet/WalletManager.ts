// services/wallet/WalletManager.ts
import { WalletProvider, WalletProviderType } from '../../types/wallet';
import { LeatherWalletProvider } from './LeatherWalletProvider';
import { XverseWalletProvider } from './XverseWalletProvider';
import { HiroWalletProvider } from './HiroWalletProvider';
import { WalletConnectProvider } from './WalletConnectProvider';
import { LedgerWalletProvider } from './LedgerWalletProvider';
import { TrezorWalletProvider } from './TrezorWalletProvider';
import { MultiSigWalletProvider } from './MultiSigWalletProvider';
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

  // Wallet Backup and Recovery Methods
  async createBackup(password: string): Promise<string> {
    if (!this.connectionState) {
      throw new Error('Wallet not connected');
    }

    // Generate a random mnemonic or use existing seed
    const mnemonic = this.generateMnemonic();
    const encryptedMnemonic = this.encryptData(mnemonic, password);

    const backupData = {
      address: this.connectionState.address,
      publicKey: this.connectionState.publicKey,
      encryptedMnemonic,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    // Store locally or send to backend
    localStorage.setItem('renvault-wallet-backup', JSON.stringify(backupData));

    return JSON.stringify(backupData);
  }

  async recoverFromBackup(backupData: string, password: string): Promise<void> {
    const data = JSON.parse(backupData);
    const mnemonic = this.decryptData(data.encryptedMnemonic, password);

    // Restore wallet state
    this.connectionState = {
      address: data.address,
      publicKey: data.publicKey
    };

    // Store mnemonic securely
    localStorage.setItem('renvault-recovered-mnemonic', mnemonic);
  }

  private generateMnemonic(): string {
    // Simple mnemonic generation (in real app, use bip39)
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse'];
    let mnemonic = '';
    for (let i = 0; i < 12; i++) {
      mnemonic += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return mnemonic.trim();
  }

  private encryptData(data: string, password: string): string {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
  }

  private decryptData(encryptedData: string, password: string): string {
    const parts = encryptedData.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}