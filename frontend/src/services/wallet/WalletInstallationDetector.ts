/**
 * Wallet Installation Detection Service
 * Detects available wallets and their installation status
 */

import { CustomWalletConfig, stacksWallets, getWalletConfig } from '../config/customWallets';

export interface WalletAvailability {
  walletId: string;
  name: string;
  isInstalled: boolean;
  installationUrl?: string;
  downloadUrl?: string;
  browserDetected?: string;
}

export class WalletInstallationDetector {
  /**
   * Check if a specific wallet is installed
   */
  static isWalletInstalled(walletId: string): boolean {
    switch (walletId) {
      case 'hiro':
        return !!(window as any).HiroWallet || !!(window as any).stacks?.wallet?.hiro;
      case 'leather':
        return !!(window as any).LeatherProvider || !!(window as any).leather;
      case 'xverse':
        return !!(window as any).XverseProvider || !!(window as any).xverse;
      default:
        return false;
    }
  }

  /**
   * Get all available wallets and their installation status
   */
  static getAvailableWallets(): WalletAvailability[] {
    return stacksWallets.map(wallet => ({
      walletId: wallet.id,
      name: wallet.name,
      isInstalled: this.isWalletInstalled(wallet.id),
      installationUrl: wallet.homepage,
      downloadUrl: this.getBrowserSpecificDownloadUrl(wallet),
      browserDetected: this.detectBrowser(),
    }));
  }

  /**
   * Get only installed wallets
   */
  static getInstalledWallets(): WalletAvailability[] {
    return this.getAvailableWallets().filter(w => w.isInstalled);
  }

  /**
   * Get browser-specific download URL
   */
  static getBrowserSpecificDownloadUrl(wallet: CustomWalletConfig): string | undefined {
    const browser = this.detectBrowser();

    if (browser === 'Firefox') {
      return wallet.downloadUrls?.firefox;
    } else if (browser === 'Edge') {
      return wallet.downloadUrls?.edge;
    } else if (browser === 'Safari') {
      return wallet.downloadUrls?.safari;
    }

    return wallet.downloadUrls?.chrome;
  }

  /**
   * Detect the current browser
   */
  static detectBrowser(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Chrome')) return 'Chrome';

    return 'Unknown';
  }

  /**
   * Check if running on mobile device
   */
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Get mobile OS
   */
  static getMobileOS(): 'iOS' | 'Android' | null {
    const userAgent = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return 'iOS';
    } else if (/Android/.test(userAgent)) {
      return 'Android';
    }

    return null;
  }

  /**
   * Monitor wallet installation changes
   * This polls for newly installed wallets at intervals
   */
  static startMonitoring(
    callback: (wallets: WalletAvailability[]) => void,
    intervalMs: number = 2000
  ): () => void {
    let previousInstalled = new Set(
      this.getInstalledWallets().map(w => w.walletId)
    );

    const interval = setInterval(() => {
      const currentInstalled = new Set(
        this.getInstalledWallets().map(w => w.walletId)
      );

      // Check if installed wallets have changed
      if (previousInstalled.size !== currentInstalled.size) {
        callback(this.getAvailableWallets());
        previousInstalled = currentInstalled;
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Get detailed installation info for a wallet
   */
  static getInstallationInfo(
    walletId: string
  ): {
    isInstalled: boolean;
    installUrl: string;
    downloadUrl?: string;
    isMobile: boolean;
    mobileOS?: 'iOS' | 'Android';
  } {
    const wallet = getWalletConfig(walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet: ${walletId}`);
    }

    const isMobile = this.isMobileDevice();
    const mobileOS = isMobile ? this.getMobileOS() : undefined;

    return {
      isInstalled: this.isWalletInstalled(walletId),
      installUrl: wallet.homepage!,
      downloadUrl: isMobile
        ? wallet.downloadUrls?.[mobileOS === 'iOS' ? 'ios' : 'android']
        : this.getBrowserSpecificDownloadUrl(wallet),
      isMobile,
      mobileOS: mobileOS || undefined,
    };
  }

  /**
   * Create installation link for wallet
   */
  static getInstallationLink(walletId: string): string {
    const info = this.getInstallationInfo(walletId);
    return info.downloadUrl || info.installUrl;
  }

  /**
   * Format wallet availability data for UI display
   */
  static formatForDisplay(wallet: WalletAvailability): {
    id: string;
    name: string;
    status: 'installed' | 'not-installed';
    actionText: string;
    actionUrl: string;
  } {
    if (wallet.isInstalled) {
      return {
        id: wallet.walletId,
        name: wallet.name,
        status: 'installed',
        actionText: 'Connect',
        actionUrl: '',
      };
    }

    return {
      id: wallet.walletId,
      name: wallet.name,
      status: 'not-installed',
      actionText: 'Get Wallet',
      actionUrl: wallet.downloadUrl || wallet.installationUrl || '',
    };
  }
}

/**
 * React hook for wallet detection
 * Note: This is a utility function to be used in React components
 */
export const useWalletDetection = () => {
  const [availableWallets, setAvailableWallets] = React.useState<WalletAvailability[]>(() =>
    WalletInstallationDetector.getAvailableWallets()
  );

  React.useEffect(() => {
    // Start monitoring for wallet changes
    const stopMonitoring = WalletInstallationDetector.startMonitoring(setAvailableWallets);

    return stopMonitoring;
  }, []);

  return {
    availableWallets,
    installedWallets: availableWallets.filter(w => w.isInstalled),
    isWalletInstalled: (walletId: string) =>
      availableWallets.some(w => w.walletId === walletId && w.isInstalled),
  };
};
