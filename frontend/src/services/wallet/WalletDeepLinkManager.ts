/**
 * Wallet Deep Linking Service for Mobile
 * Handles deep linking to mobile wallet apps
 */

import { getWalletConfig, CustomWalletConfig } from '../config/customWallets';

export interface DeepLinkOptions {
  walletId: string;
  action?: 'connect' | 'sign' | 'transaction';
  params?: Record<string, string | number | boolean>;
  returnUrl?: string;
}

export interface DeepLinkResult {
  url: string;
  walletId: string;
  isDeepLink: boolean;
  isSupported: boolean;
}

export class WalletDeepLinkManager {
  /**
   * Check if running on mobile
   */
  static isMobileEnvironment(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Get mobile OS type
   */
  static getMobileOS(): 'iOS' | 'Android' | 'unsupported' {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return 'iOS';
    } else if (/Android/.test(navigator.userAgent)) {
      return 'Android';
    }
    return 'unsupported';
  }

  /**
   * Generate deep link for wallet
   */
  static generateDeepLink(options: DeepLinkOptions): DeepLinkResult {
    const wallet = getWalletConfig(options.walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet: ${options.walletId}`);
    }

    const isMobile = this.isMobileEnvironment();
    if (!isMobile) {
      return {
        url: wallet.homepage || '',
        walletId: options.walletId,
        isDeepLink: false,
        isSupported: false,
      };
    }

    const deepLink = this.buildDeepLink(wallet, options);

    return {
      url: deepLink,
      walletId: options.walletId,
      isDeepLink: true,
      isSupported: !!deepLink,
    };
  }

  /**
   * Build deep link URL with parameters
   */
  private static buildDeepLink(
    wallet: CustomWalletConfig,
    options: DeepLinkOptions
  ): string {
    const baseLink = wallet.mobile.native || wallet.mobile.universal;
    if (!baseLink) {
      return wallet.homepage || '';
    }

    const params: Record<string, string> = {};

    // Add action parameter
    if (options.action) {
      params.action = options.action;
    }

    // Add return URL if provided
    if (options.returnUrl) {
      params.returnUrl = encodeURIComponent(options.returnUrl);
    }

    // Add custom parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        params[key] = String(value);
      });
    }

    // Build query string
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();

    // Return deep link with parameters
    if (queryString) {
      return `${baseLink}?${queryString}`;
    }

    return baseLink;
  }

  /**
   * Open wallet deep link
   */
  static openWallet(options: DeepLinkOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const result = this.generateDeepLink(options);

        if (!result.isSupported) {
          reject(new Error(`Deep linking not supported for ${options.walletId}`));
          return;
        }

        // Store return URL in sessionStorage if provided
        if (options.returnUrl) {
          sessionStorage.setItem(`wallet_return_${options.walletId}`, options.returnUrl);
        }

        // Open wallet link
        if (this.isMobileEnvironment()) {
          // Mobile: Use window.location for deep linking
          window.location.href = result.url;
        } else {
          // Desktop: Open in new window
          window.open(result.url, '_blank');
        }

        // Resolve after a delay to allow navigation
        setTimeout(() => resolve(), 500);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if wallet can be deep linked on current device
   */
  static canDeepLink(walletId: string): boolean {
    const wallet = getWalletConfig(walletId);
    if (!wallet) return false;

    if (!this.isMobileEnvironment()) {
      return false;
    }

    const os = this.getMobileOS();
    return !!(os === 'iOS' ? wallet.mobile.universal : wallet.mobile.native);
  }

  /**
   * Get universal link (works both mobile and web)
   */
  static getUniversalLink(
    walletId: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const wallet = getWalletConfig(walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet: ${walletId}`);
    }

    const baseLink = wallet.mobile.universal || wallet.desktop.universal || wallet.homepage;
    if (!baseLink) {
      throw new Error(`No universal link available for wallet: ${walletId}`);
    }

    if (!params || Object.keys(params).length === 0) {
      return baseLink;
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });

    return `${baseLink}?${queryParams.toString()}`;
  }

  /**
   * Check if returning from wallet app
   */
  static getReturnUrl(walletId: string): string | null {
    const returnUrl = sessionStorage.getItem(`wallet_return_${walletId}`);
    if (returnUrl) {
      sessionStorage.removeItem(`wallet_return_${walletId}`);
    }
    return returnUrl || null;
  }

  /**
   * Get native deep link if available
   */
  static getNativeDeepLink(walletId: string): string | undefined {
    const wallet = getWalletConfig(walletId);
    if (!wallet) return undefined;

    const os = this.getMobileOS();
    if (os === 'iOS') {
      return wallet.mobile.universal;
    } else if (os === 'Android') {
      return wallet.mobile.native;
    }

    return undefined;
  }

  /**
   * Generate download link for wallet
   */
  static getDownloadLink(walletId: string, platform?: 'ios' | 'android'): string | undefined {
    const wallet = getWalletConfig(walletId);
    if (!wallet) return undefined;

    if (!platform) {
      const os = this.getMobileOS();
      platform = os === 'iOS' ? 'ios' : 'android';
    }

    return wallet.downloadUrls?.[platform];
  }

  /**
   * Check if app is installed (for testing)
   * Note: This is a best-effort check and may not be accurate
   */
  static isWalletAppInstalledOnMobile(walletId: string): boolean {
    const nativeLink = this.getNativeDeepLink(walletId);
    if (!nativeLink) return false;

    // Try to detect app installation by checking for window object
    switch (walletId) {
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
}

/**
 * Configuration builder for deep links
 */
export class DeepLinkConfigBuilder {
  private options: DeepLinkOptions;

  constructor(walletId: string) {
    this.options = { walletId };
  }

  action(action: 'connect' | 'sign' | 'transaction'): this {
    this.options.action = action;
    return this;
  }

  params(params: Record<string, string | number | boolean>): this {
    this.options.params = params;
    return this;
  }

  returnUrl(url: string): this {
    this.options.returnUrl = url;
    return this;
  }

  build(): DeepLinkOptions {
    return { ...this.options };
  }

  async open(): Promise<void> {
    return WalletDeepLinkManager.openWallet(this.options);
  }

  getUrl(): string {
    return WalletDeepLinkManager.generateDeepLink(this.options).url;
  }
}

/**
 * Factory function for creating deep link builders
 */
export const createDeepLinkBuilder = (walletId: string): DeepLinkConfigBuilder => {
  return new DeepLinkConfigBuilder(walletId);
};
