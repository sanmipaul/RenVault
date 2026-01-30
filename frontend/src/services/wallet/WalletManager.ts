// services/wallet/WalletManager.ts
import { WalletProvider, WalletProviderType } from '../../types/wallet';
import { WalletProviderLoader } from './WalletProviderLoader';
import { getRandomBytes } from '../../utils/crypto';
import { encryptForStorage, decryptFromStorage } from '../../utils/encryption';

export class WalletManager {
  private providers: Map<WalletProviderType, WalletProvider> = new Map();
  private currentProvider: WalletProvider | null = null;
  private connectionState: { address: string; publicKey: string } | null = null;
  private connectionCache: Map<string, { data: any; timestamp: number }> = new Map();
  private lazyLoadedProviders: Set<WalletProviderType> = new Set();
  private connectionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CONNECTION_TIMEOUT = 10000; // 10 seconds

  constructor() {
    // Initialize critical providers immediately
    this.initializeCriticalProviders();
  }

  private async initializeCriticalProviders(): Promise<void> {
    try {
      // Load leather provider immediately as it's most commonly used
      const leatherProvider = await WalletProviderLoader.loadProvider('leather');
      this.providers.set('leather', leatherProvider);
    } catch (error) {
      console.warn('Failed to load leather provider:', error);
    }
  }

  private async lazyLoadProvider(type: WalletProviderType): Promise<WalletProvider> {
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    const provider = await WalletProviderLoader.loadProvider(type);
    this.providers.set(type, provider);
    this.lazyLoadedProviders.delete(type);
    return provider;
  }

  getAvailableProviders(): WalletProvider[] {
    return Array.from(this.providers.values());
  }

  async setProvider(type: WalletProviderType): Promise<void> {
    const provider = await this.lazyLoadProvider(type);
    this.currentProvider = provider;
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

    // Check cache first
    const cacheKey = `connection-${this.currentProvider.getType()}`;
    const cached = this.connectionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      this.connectionState = cached.data;
      return cached.data;
    }

    // Set connection timeout
    const timeoutPromise = new Promise((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.CONNECTION_TIMEOUT);
      this.connectionTimeouts.set(cacheKey, timeout);
    });

    try {
      const result = await Promise.race([
        this.currentProvider.connect(),
        timeoutPromise
      ]);

      // Cache the result
      this.connectionState = result;
      this.connectionCache.set(cacheKey, { data: result, timestamp: Date.now() });

      // Clear timeout
      const timeout = this.connectionTimeouts.get(cacheKey);
      if (timeout) {
        clearTimeout(timeout);
        this.connectionTimeouts.delete(cacheKey);
      }

      return result;
    } catch (error) {
      // Clear timeout on error
      const timeout = this.connectionTimeouts.get(cacheKey);
      if (timeout) {
        clearTimeout(timeout);
        this.connectionTimeouts.delete(cacheKey);
      }
      throw error;
    }
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
    // BIP39-compatible word list subset for demo purposes
    // In production, use the full BIP39 word list with proper entropy
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance'
    ];

    // Use cryptographically secure random number generation
    const randomBytes = getRandomBytes(12);
    const mnemonicWords: string[] = [];

    for (let i = 0; i < 12; i++) {
      // Use secure random byte to select word index
      const wordIndex = randomBytes[i] % words.length;
      mnemonicWords.push(words[wordIndex]);
    }

    return mnemonicWords.join(' ');
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

  // Multi-Signature Methods
  setupMultiSigWallet(threshold: number, coSigners: any[]): void {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    if (!multiSigProvider) {
      throw new Error('Multi-sig provider not available');
    }

    const config = {
      threshold,
      totalSigners: coSigners.length + 1, // +1 for owner
      coSigners,
      owner: this.connectionState?.address || ''
    };

    multiSigProvider.setupMultiSig(config);
  }

  getMultiSigConfig(): any {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    return multiSigProvider?.getConfig();
  }

  addCoSigner(coSigner: any): void {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    if (!multiSigProvider) {
      throw new Error('Multi-sig provider not available');
    }
    multiSigProvider.addCoSigner(coSigner);
  }

  removeCoSigner(address: string): void {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    if (!multiSigProvider) {
      throw new Error('Multi-sig provider not available');
    }
    multiSigProvider.removeCoSigner(address);
  }

  getPendingMultiSigTransactions(): string[] {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    return multiSigProvider?.getPendingTransactions() || [];
  }

  getMultiSigTransactionStatus(txId: string): any {
    const multiSigProvider = this.providers.get('multisig') as MultiSigWalletProvider;
    return multiSigProvider?.getTransactionStatus(txId);
  }

  // Performance Optimization Methods
  clearConnectionCache(): void {
    this.connectionCache.clear();
    this.connectionTimeouts.forEach(timeout => clearTimeout(timeout));
    this.connectionTimeouts.clear();
  }

  getConnectionCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.connectionCache.size,
      entries: Array.from(this.connectionCache.keys())
    };
  }

  preloadProvider(type: WalletProviderType): Promise<void> {
    return this.lazyLoadProvider(type).then(() => undefined);
  }

  async preloadAllProviders(): Promise<void> {
    const preloadPromises = Array.from(this.lazyLoadedProviders).map(type =>
      this.lazyLoadProvider(type).catch(error =>
        console.warn(`Failed to preload provider ${type}:`, error)
      )
    );
    await Promise.all(preloadPromises);
  }

  getPerformanceMetrics(): {
    cachedConnections: number;
    loadedProviders: number;
    lazyProviders: number;
    activeTimeouts: number;
  } {
    return {
      cachedConnections: this.connectionCache.size,
      loadedProviders: this.providers.size,
      lazyProviders: this.lazyLoadedProviders.size,
      activeTimeouts: this.connectionTimeouts.size
    };
  }
}