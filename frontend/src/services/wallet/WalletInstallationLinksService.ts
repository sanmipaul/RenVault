/**
 * Wallet Installation Links Service
 * Provides "Get Wallet" links and installation information for uninstalled wallets
 */

import { CustomWalletConfig, stacksWallets, getWalletConfig } from '../config/customWallets';
import { WalletInstallationDetector } from './WalletInstallationDetector';
import { WalletDeepLinkManager } from './WalletDeepLinkManager';

export interface WalletInstallationLink {
  walletId: string;
  walletName: string;
  walletDescription?: string;
  walletIcon?: string;
  isInstalled: boolean;
  installationUrl: string;
  downloadUrl?: string;
  browserSpecificUrl?: string;
  mobileUrl?: string;
  supportedPlatforms: {
    chrome: boolean;
    firefox: boolean;
    safari: boolean;
    edge: boolean;
    ios: boolean;
    android: boolean;
  };
  installationSteps?: string[];
}

export class WalletInstallationLinksService {
  /**
   * Get installation links for all wallets
   */
  static getInstallationLinks(): WalletInstallationLink[] {
    return stacksWallets.map(wallet => this.getInstallationLink(wallet.id));
  }

  /**
   * Get installation link for specific wallet
   */
  static getInstallationLink(walletId: string): WalletInstallationLink {
    const wallet = getWalletConfig(walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet: ${walletId}`);
    }

    const isInstalled = WalletInstallationDetector.isWalletInstalled(walletId);
    const isMobile = WalletInstallationDetector.isMobileDevice();

    return {
      walletId,
      walletName: wallet.name,
      walletDescription: wallet.description,
      walletIcon: wallet.imageUrl,
      isInstalled,
      installationUrl: wallet.homepage!,
      downloadUrl: isMobile
        ? wallet.downloadUrls?.[WalletInstallationDetector.getMobileOS() === 'iOS' ? 'ios' : 'android']
        : WalletInstallationDetector.getBrowserSpecificDownloadUrl(wallet),
      browserSpecificUrl: WalletInstallationDetector.getBrowserSpecificDownloadUrl(wallet),
      mobileUrl: isMobile
        ? WalletDeepLinkManager.getDownloadLink(walletId)
        : undefined,
      supportedPlatforms: {
        chrome: !!wallet.downloadUrls?.chrome,
        firefox: !!wallet.downloadUrls?.firefox,
        safari: !!wallet.downloadUrls?.safari,
        edge: !!wallet.downloadUrls?.edge,
        ios: !!wallet.downloadUrls?.ios,
        android: !!wallet.downloadUrls?.android,
      },
      installationSteps: this.getInstallationSteps(walletId),
    };
  }

  /**
   * Get only uninstalled wallets
   */
  static getUninstalledWallets(): WalletInstallationLink[] {
    return this.getInstallationLinks().filter(w => !w.isInstalled);
  }

  /**
   * Get download URL for specific browser/platform
   */
  static getDownloadUrl(
    walletId: string,
    platform: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ios' | 'android'
  ): string | undefined {
    const wallet = getWalletConfig(walletId);
    if (!wallet) return undefined;

    return wallet.downloadUrls?.[platform];
  }

  /**
   * Get installation steps for wallet
   */
  static getInstallationSteps(walletId: string): string[] {
    switch (walletId) {
      case 'hiro':
        return [
          'Visit https://wallet.hiro.so',
          'Click "Get Hiro Wallet" button',
          'Select your browser (Chrome, Firefox, Safari, or Edge)',
          'Click "Add to [Browser]" to install the extension',
          'Complete the installation wizard',
          'Create a new wallet or import an existing one',
          'Grant permissions when prompted on websites',
        ];
      case 'leather':
        return [
          'Visit https://leather.io',
          'Click "Get Leather Wallet" or find it in your browser\'s extension store',
          'Click "Add Extension" or equivalent for your browser',
          'Grant the required permissions',
          'Create or import your wallet',
          'Save your recovery phrase securely',
          'Start using Leather with Stacks dApps',
        ];
      case 'xverse':
        return [
          'Visit https://www.xverse.app',
          'Select your browser or mobile platform',
          'Download the extension or app',
          'Install and open the wallet',
          'Create a new wallet or import existing one',
          'Store your seed phrase safely offline',
          'Grant permissions to dApps as needed',
        ];
      default:
        return [];
    }
  }

  /**
   * Create a "Get Wallet" button config
   */
  static getWalletButtonConfig(walletId: string): {
    label: string;
    url: string;
    target: '_blank' | '_self';
    icon?: string;
    className?: string;
  } {
    const link = this.getInstallationLink(walletId);

    if (link.isInstalled) {
      return {
        label: 'Connect Wallet',
        url: '',
        target: '_self',
        icon: link.walletIcon,
        className: 'wallet-connect-btn',
      };
    }

    return {
      label: `Get ${link.walletName}`,
      url: link.downloadUrl || link.installationUrl,
      target: '_blank',
      icon: link.walletIcon,
      className: 'wallet-install-btn',
    };
  }

  /**
   * Get platform-specific installation URL
   */
  static getPlatformSpecificUrl(walletId: string, userAgent?: string): string {
    const wallet = getWalletConfig(walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet: ${walletId}`);
    }

    const ua = userAgent || navigator.userAgent;

    // Check mobile first
    if (/iPad|iPhone|iPod/.test(ua)) {
      return wallet.downloadUrls?.ios || wallet.homepage!;
    }
    if (/Android/.test(ua)) {
      return wallet.downloadUrls?.android || wallet.homepage!;
    }

    // Check browser
    if (/Firefox/.test(ua)) {
      return wallet.downloadUrls?.firefox || wallet.homepage!;
    }
    if (/Edg/.test(ua)) {
      return wallet.downloadUrls?.edge || wallet.homepage!;
    }
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      return wallet.downloadUrls?.safari || wallet.homepage!;
    }

    // Default to Chrome
    return wallet.downloadUrls?.chrome || wallet.homepage!;
  }

  /**
   * Format installation link for display
   */
  static formatForDisplay(walletId: string): {
    name: string;
    icon: string;
    description?: string;
    status: 'installed' | 'available' | 'coming-soon';
    actionText: string;
    actionUrl: string;
    supportedOn: string[];
  } {
    const link = this.getInstallationLink(walletId);
    const supportedOn = Object.entries(link.supportedPlatforms)
      .filter(([_, supported]) => supported)
      .map(([platform]) => platform);

    return {
      name: link.walletName,
      icon: link.walletIcon || '',
      description: link.walletDescription,
      status: link.isInstalled ? 'installed' : 'available',
      actionText: link.isInstalled ? 'Connect' : 'Install',
      actionUrl: link.downloadUrl || link.installationUrl,
      supportedOn,
    };
  }

  /**
   * Track installation link clicks (for analytics)
   */
  static trackInstallationClick(walletId: string, source: string = 'install-prompt'): void {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'wallet_installation_click', {
        walletId,
        source,
        timestamp: new Date().toISOString(),
      });
    }

    // Log locally
    console.log(`[Wallet Installation] User clicked install for ${walletId} from ${source}`);
  }

  /**
   * Generate installation guide HTML
   */
  static generateInstallationGuide(walletId: string): string {
    const link = this.getInstallationLink(walletId);
    const steps = link.walletDescription ? [link.walletDescription, ...link.installationSteps!] : link.installationSteps || [];

    let html = `<div class="wallet-installation-guide">\n`;
    html += `  <h3>How to install ${link.walletName}</h3>\n`;
    html += `  <ol class="installation-steps">\n`;

    steps.forEach((step, index) => {
      html += `    <li class="step-${index + 1}">${step}</li>\n`;
    });

    html += `  </ol>\n`;
    html += `  <p class="support-text">Need help? Visit <a href="${link.installationUrl}" target="_blank">${link.walletName} Support</a></p>\n`;
    html += `</div>\n`;

    return html;
  }

  /**
   * Create redirect to installation with return URL
   */
  static createInstallationRedirect(
    walletId: string,
    returnUrl: string
  ): string {
    const link = this.getInstallationLink(walletId);
    const url = new URL(link.downloadUrl || link.installationUrl);

    // Add return URL as query parameter
    url.searchParams.append('returnTo', returnUrl);

    return url.toString();
  }

  /**
   * Check if wallet is available for current platform
   */
  static isAvailableForPlatform(walletId: string): boolean {
    const link = this.getInstallationLink(walletId);

    if (WalletInstallationDetector.isMobileDevice()) {
      const os = WalletInstallationDetector.getMobileOS();
      return os === 'iOS' ? link.supportedPlatforms.ios : link.supportedPlatforms.android;
    }

    const browser = WalletInstallationDetector.detectBrowser();
    const platformMap: Record<string, keyof WalletInstallationLink['supportedPlatforms']> = {
      'Chrome': 'chrome',
      'Firefox': 'firefox',
      'Safari': 'safari',
      'Edge': 'edge',
    };

    const platform = platformMap[browser];
    if (!platform) return link.supportedPlatforms.chrome; // Default to chrome

    return link.supportedPlatforms[platform];
  }
}

/**
 * React-compatible hook wrapper
 */
export const useWalletInstallationLinks = (walletId?: string) => {
  if (walletId) {
    return WalletInstallationLinksService.getInstallationLink(walletId);
  }

  return {
    all: WalletInstallationLinksService.getInstallationLinks(),
    uninstalled: WalletInstallationLinksService.getUninstalledWallets(),
  };
};
