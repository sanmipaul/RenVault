/**
 * Stacks Connector Adapter for AppKit Integration
 * Bridges existing Stacks wallet providers with AppKit
 */

import { CustomWalletConfig, getWalletConfig } from '../config/customWallets';

export interface StacksConnectorOptions {
  projectId: string;
  appMetadata: {
    name: string;
    description?: string;
    url: string;
    icons?: string[];
  };
  chains: string[];
}

export interface WalletConnectionState {
  isConnected: boolean;
  address?: string;
  publicKey?: string;
  chainId?: string;
}

export class StacksConnectorAdapter {
  private walletId: string;
  private config: CustomWalletConfig;
  private connectionState: WalletConnectionState = { isConnected: false };
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(walletId: string) {
    this.walletId = walletId;
    const walletConfig = getWalletConfig(walletId);
    if (!walletConfig) {
      throw new Error(`Unknown wallet configuration: ${walletId}`);
    }
    this.config = walletConfig;
  }

  /**
   * Get wallet configuration
   */
  getConfig(): CustomWalletConfig {
    return this.config;
  }

  /**
   * Get wallet ID
   */
  getWalletId(): string {
    return this.walletId;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): WalletConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if wallet is currently connected
   */
  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  /**
   * Connect to the wallet
   */
  async connect(appMetadata?: StacksConnectorOptions['appMetadata']): Promise<WalletConnectionState> {
    try {
      // Detect if wallet is installed
      const isInstalled = this.isWalletInstalled();
      if (!isInstalled) {
        throw new Error(
          `${this.config.name} is not installed. Please install it from ${this.config.homepage}`
        );
      }

      // Attempt connection based on wallet type
      const connectionState = await this.attemptConnection(appMetadata);
      this.connectionState = { ...connectionState, isConnected: true };
      
      this.emit('connect', this.connectionState);
      return this.connectionState;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      await this.attemptDisconnection();
      this.connectionState = { isConnected: false };
      this.emit('disconnect', this.connectionState);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Check if wallet is installed on the user's system
   */
  isWalletInstalled(): boolean {
    switch (this.walletId) {
      case 'hiro':
        return !!(window as any).HiroWallet;
      case 'leather':
        return !!(window as any).LeatherProvider || !!(window as any).leather;
      case 'xverse':
        return !!(window as any).XverseProvider || !!(window as any).xverse;
      default:
        return false;
    }
  }

  /**
   * Detect wallet installation and get installation URL if needed
   */
  getInstallationInfo(): {
    isInstalled: boolean;
    installUrl?: string;
  } {
    const isInstalled = this.isWalletInstalled();
    return {
      isInstalled,
      installUrl: isInstalled ? undefined : this.config.homepage,
    };
  }

  /**
   * Get deep link URL for mobile wallets
   */
  getDeepLink(params?: Record<string, string>): string | undefined {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobile) {
      return this.config.desktop.native || this.config.desktop.universal;
    }

    const baseLink = this.config.mobile.native || this.config.mobile.universal;
    if (!baseLink) return undefined;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      return `${baseLink}?${queryString}`;
    }

    return baseLink;
  }

  /**
   * Get download URL for current platform
   */
  getDownloadUrl(): string | undefined {
    if (this.isWalletInstalled()) {
      return undefined;
    }

    // Detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) {
      return this.config.downloadUrls?.firefox;
    } else if (userAgent.includes('Edg')) {
      return this.config.downloadUrls?.edge;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return this.config.downloadUrls?.safari;
    }

    // Default to Chrome
    return this.config.downloadUrls?.chrome;
  }

  /**
   * Sign a transaction using the wallet
   */
  async signTransaction(transaction: any): Promise<any> {
    if (!this.connectionState.isConnected) {
      throw new Error('Wallet is not connected');
    }

    try {
      const signedTx = await this.attemptTransactionSigning(transaction);
      this.emit('transaction_signed', signedTx);
      return signedTx;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sign a message using the wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.connectionState.isConnected) {
      throw new Error('Wallet is not connected');
    }

    try {
      const signature = await this.attemptMessageSigning(message);
      this.emit('message_signed', { message, signature });
      return signature;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Subscribe to wallet events
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Unsubscribe from wallet events
   */
  off(event: string, listener: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(listener);
    }
  }

  /**
   * Emit an event
   */
  private emit(event: string, data?: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(listener => listener(data));
    }
  }

  /**
   * Attempt connection based on wallet type
   */
  private async attemptConnection(
    appMetadata?: StacksConnectorOptions['appMetadata']
  ): Promise<WalletConnectionState> {
    switch (this.walletId) {
      case 'hiro':
        return this.connectHiro(appMetadata);
      case 'leather':
        return this.connectLeather(appMetadata);
      case 'xverse':
        return this.connectXverse(appMetadata);
      default:
        throw new Error(`Connection not implemented for wallet: ${this.walletId}`);
    }
  }

  /**
   * Attempt disconnection based on wallet type
   */
  private async attemptDisconnection(): Promise<void> {
    switch (this.walletId) {
      case 'hiro':
        await this.disconnectHiro();
        break;
      case 'leather':
        await this.disconnectLeather();
        break;
      case 'xverse':
        await this.disconnectXverse();
        break;
    }
  }

  /**
   * Attempt transaction signing based on wallet type
   */
  private async attemptTransactionSigning(transaction: any): Promise<any> {
    switch (this.walletId) {
      case 'hiro':
        return await this.signWithHiro(transaction);
      case 'leather':
        return await this.signWithLeather(transaction);
      case 'xverse':
        return await this.signWithXverse(transaction);
      default:
        throw new Error(`Transaction signing not implemented for wallet: ${this.walletId}`);
    }
  }

  /**
   * Attempt message signing based on wallet type
   */
  private async attemptMessageSigning(message: string): Promise<string> {
    switch (this.walletId) {
      case 'hiro':
        return await this.signMessageWithHiro(message);
      case 'leather':
        return await this.signMessageWithLeather(message);
      case 'xverse':
        return await this.signMessageWithXverse(message);
      default:
        throw new Error(`Message signing not implemented for wallet: ${this.walletId}`);
    }
  }

  // Hiro Wallet Methods
  private async connectHiro(
    appMetadata?: StacksConnectorOptions['appMetadata']
  ): Promise<WalletConnectionState> {
    return new Promise((resolve, reject) => {
      const hiro = (window as any).HiroWallet;
      if (!hiro) {
        reject(new Error('Hiro Wallet is not installed'));
        return;
      }

      hiro.request('connect', {
        appDetails: {
          name: appMetadata?.name || 'RenVault',
          icon: appMetadata?.icons?.[0] || '/favicon.ico',
        },
      })
        .then((result: any) => {
          resolve({
            isConnected: true,
            address: result.address,
            publicKey: result.publicKey,
            chainId: 'stacks:1',
          });
        })
        .catch(reject);
    });
  }

  private async disconnectHiro(): Promise<void> {
    const hiro = (window as any).HiroWallet;
    if (hiro?.disconnect) {
      await hiro.disconnect();
    }
    localStorage.removeItem('hiro-session');
  }

  private async signWithHiro(transaction: any): Promise<any> {
    const hiro = (window as any).HiroWallet;
    if (!hiro) throw new Error('Hiro Wallet is not available');
    return await hiro.signTransaction(transaction);
  }

  private async signMessageWithHiro(message: string): Promise<string> {
    const hiro = (window as any).HiroWallet;
    if (!hiro) throw new Error('Hiro Wallet is not available');
    const result = await hiro.request('signMessage', { message });
    return result.signature;
  }

  // Leather Wallet Methods
  private async connectLeather(
    appMetadata?: StacksConnectorOptions['appMetadata']
  ): Promise<WalletConnectionState> {
    const leatherProvider = (window as any).LeatherProvider || (window as any).leather;
    if (!leatherProvider) {
      throw new Error('Leather Wallet is not installed');
    }

    // Leather uses @stacks/connect
    return new Promise((resolve, reject) => {
      // This would typically use @stacks/connect library
      // For now, we'll provide a placeholder implementation
      resolve({
        isConnected: true,
        address: '',
        publicKey: '',
        chainId: 'stacks:1',
      });
    });
  }

  private async disconnectLeather(): Promise<void> {
    const leatherProvider = (window as any).LeatherProvider || (window as any).leather;
    if (leatherProvider?.disconnect) {
      await leatherProvider.disconnect();
    }
    localStorage.removeItem('leather-session');
  }

  private async signWithLeather(transaction: any): Promise<any> {
    const leatherProvider = (window as any).LeatherProvider || (window as any).leather;
    if (!leatherProvider) throw new Error('Leather Wallet is not available');
    return transaction; // Placeholder
  }

  private async signMessageWithLeather(message: string): Promise<string> {
    const leatherProvider = (window as any).LeatherProvider || (window as any).leather;
    if (!leatherProvider) throw new Error('Leather Wallet is not available');
    return ''; // Placeholder
  }

  // Xverse Wallet Methods
  private async connectXverse(
    appMetadata?: StacksConnectorOptions['appMetadata']
  ): Promise<WalletConnectionState> {
    return new Promise((resolve, reject) => {
      const xverse = (window as any).XverseProvider || (window as any).xverse;
      if (!xverse) {
        reject(new Error('Xverse Wallet is not installed'));
        return;
      }

      xverse.request('connect', {
        appDetails: {
          name: appMetadata?.name || 'RenVault',
          icon: appMetadata?.icons?.[0] || '/favicon.ico',
        },
      })
        .then((result: any) => {
          resolve({
            isConnected: true,
            address: result.address,
            publicKey: result.publicKey,
            chainId: 'stacks:1',
          });
        })
        .catch(reject);
    });
  }

  private async disconnectXverse(): Promise<void> {
    const xverse = (window as any).XverseProvider || (window as any).xverse;
    if (xverse?.disconnect) {
      await xverse.disconnect();
    }
    localStorage.removeItem('xverse-session');
  }

  private async signWithXverse(transaction: any): Promise<any> {
    const xverse = (window as any).XverseProvider || (window as any).xverse;
    if (!xverse) throw new Error('Xverse Wallet is not available');
    return await xverse.signTransaction(transaction);
  }

  private async signMessageWithXverse(message: string): Promise<string> {
    const xverse = (window as any).XverseProvider || (window as any).xverse;
    if (!xverse) throw new Error('Xverse Wallet is not available');
    const result = await xverse.request('signMessage', { message });
    return result.signature;
  }
}

/**
 * Factory function to create a connector adapter
 */
export const createStacksConnectorAdapter = (walletId: string): StacksConnectorAdapter => {
  return new StacksConnectorAdapter(walletId);
};
