/**
 * Wallet Metadata Service
 * Manages wallet metadata, caching, and dynamic loading
 */

import { CustomWalletConfig, stacksWallets, getWalletConfig } from '../config/customWallets';
import { WalletInstallationDetector, WalletAvailability } from './wallet/WalletInstallationDetector';

export interface ExtendedWalletMetadata extends CustomWalletConfig {
  isInstalled: boolean;
  isAvailable: boolean;
  lastUpdated: number;
  supportedOn: string[];
  features: {
    signing: boolean;
    messaging: boolean;
    deepLinking: boolean;
    mobileApp: boolean;
    browserExtension: boolean;
  };
  connectionMethods: ('native' | 'universal' | 'web')[];
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'verified' | 'unverified' | 'deprecated';
  stats?: {
    connectionAttempts: number;
    successfulConnections: number;
    failedConnections: number;
    averageConnectionTime: number;
  };
}

export interface WalletMetadataCache {
  [walletId: string]: ExtendedWalletMetadata;
}

export class WalletMetadataService {
  private static cache: WalletMetadataCache = {};
  private static cacheTimestamp: Map<string, number> = new Map();
  private static readonly CACHE_DURATION = 60000; // 1 minute
  private static statsStore: Map<string, any> = new Map();

  /**
   * Get wallet metadata with caching
   */
  static getWalletMetadata(walletId: string): ExtendedWalletMetadata | null {
    // Check cache first
    if (this.cache[walletId]) {
      const timestamp = this.cacheTimestamp.get(walletId) || 0;
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return this.cache[walletId];
      }
    }

    // Get fresh metadata
    const metadata = this.buildMetadata(walletId);
    if (metadata) {
      this.cache[walletId] = metadata;
      this.cacheTimestamp.set(walletId, Date.now());
    }

    return metadata || null;
  }

  /**
   * Get metadata for all wallets
   */
  static getAllWalletMetadata(): ExtendedWalletMetadata[] {
    return stacksWallets
      .map(wallet => this.getWalletMetadata(wallet.id))
      .filter((metadata): metadata is ExtendedWalletMetadata => !!metadata);
  }

  /**
   * Get metadata for installed wallets
   */
  static getInstalledWalletMetadata(): ExtendedWalletMetadata[] {
    return this.getAllWalletMetadata().filter(w => w.isInstalled);
  }

  /**
   * Build extended metadata
   */
  private static buildMetadata(walletId: string): ExtendedWalletMetadata | null {
    const config = getWalletConfig(walletId);
    if (!config) return null;

    const isInstalled = WalletInstallationDetector.isWalletInstalled(walletId);
    const availability = WalletInstallationDetector.getAvailableWallets().find(
      w => w.walletId === walletId
    );

    const metadata: ExtendedWalletMetadata = {
      ...config,
      isInstalled,
      isAvailable: availability?.isInstalled || false,
      lastUpdated: Date.now(),
      supportedOn: this.getSupportedPlatforms(config),
      features: this.getWalletFeatures(walletId),
      connectionMethods: this.getConnectionMethods(config),
      riskLevel: this.assessRiskLevel(walletId),
      verificationStatus: this.getVerificationStatus(walletId),
      stats: this.getWalletStats(walletId),
    };

    return metadata;
  }

  /**
   * Get supported platforms
   */
  private static getSupportedPlatforms(config: CustomWalletConfig): string[] {
    const platforms: string[] = [];

    if (config.downloadUrls?.chrome) platforms.push('Chrome');
    if (config.downloadUrls?.firefox) platforms.push('Firefox');
    if (config.downloadUrls?.safari) platforms.push('Safari');
    if (config.downloadUrls?.edge) platforms.push('Edge');
    if (config.downloadUrls?.ios) platforms.push('iOS');
    if (config.downloadUrls?.android) platforms.push('Android');

    return platforms;
  }

  /**
   * Get wallet features
   */
  private static getWalletFeatures(
    walletId: string
  ): ExtendedWalletMetadata['features'] {
    const features = {
      signing: true,
      messaging: true,
      deepLinking: true,
      mobileApp: false,
      browserExtension: false,
    };

    const config = getWalletConfig(walletId);
    if (!config) return features;

    // Mobile app support
    if (config.downloadUrls?.ios || config.downloadUrls?.android) {
      features.mobileApp = true;
    }

    // Browser extension support
    if (
      config.downloadUrls?.chrome ||
      config.downloadUrls?.firefox ||
      config.downloadUrls?.safari ||
      config.downloadUrls?.edge
    ) {
      features.browserExtension = true;
    }

    return features;
  }

  /**
   * Get connection methods available
   */
  private static getConnectionMethods(config: CustomWalletConfig): ExtendedWalletMetadata['connectionMethods'] {
    const methods: ExtendedWalletMetadata['connectionMethods'] = ['web'];

    if (config.desktop.native) methods.push('native');
    if (config.mobile.universal || config.desktop.universal) methods.push('universal');

    return methods;
  }

  /**
   * Assess wallet risk level
   */
  private static assessRiskLevel(walletId: string): 'low' | 'medium' | 'high' {
    // Major wallets have low risk
    const lowRiskWallets = ['hiro', 'leather', 'xverse'];
    if (lowRiskWallets.includes(walletId)) {
      return 'low';
    }

    // Default to medium risk for unknown wallets
    return 'medium';
  }

  /**
   * Get verification status
   */
  private static getVerificationStatus(walletId: string): 'verified' | 'unverified' | 'deprecated' {
    // All major Stacks wallets are verified
    const verifiedWallets = ['hiro', 'leather', 'xverse'];
    if (verifiedWallets.includes(walletId)) {
      return 'verified';
    }

    return 'unverified';
  }

  /**
   * Get wallet statistics
   */
  private static getWalletStats(walletId: string): ExtendedWalletMetadata['stats'] {
    if (!this.statsStore.has(walletId)) {
      return undefined;
    }

    const stats = this.statsStore.get(walletId);
    const successfulConnections = stats.successfulConnections || 0;
    const totalAttempts = stats.connectionAttempts || 1;

    return {
      connectionAttempts: stats.connectionAttempts || 0,
      successfulConnections,
      failedConnections: stats.failedConnections || 0,
      averageConnectionTime: stats.totalConnectionTime
        ? Math.round(stats.totalConnectionTime / successfulConnections)
        : 0,
    };
  }

  /**
   * Track wallet connection attempt
   */
  static trackConnectionAttempt(walletId: string, success: boolean, duration: number): void {
    const stats = this.statsStore.get(walletId) || {
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalConnectionTime: 0,
    };

    stats.connectionAttempts++;
    if (success) {
      stats.successfulConnections++;
      stats.totalConnectionTime += duration;
    } else {
      stats.failedConnections++;
    }

    this.statsStore.set(walletId, stats);
    this.invalidateCache(walletId);
  }

  /**
   * Get wallet description
   */
  static getWalletDescription(walletId: string): string {
    const config = getWalletConfig(walletId);
    return config?.description || '';
  }

  /**
   * Get wallet homepage
   */
  static getWalletHomepage(walletId: string): string {
    const config = getWalletConfig(walletId);
    return config?.homepage || '';
  }

  /**
   * Get wallet image URL
   */
  static getWalletImageUrl(walletId: string): string {
    const config = getWalletConfig(walletId);
    return config?.imageUrl || '';
  }

  /**
   * Compare wallets for recommendations
   */
  static getRecommendedWallets(criteria?: {
    mobileSupport?: boolean;
    desktopSupport?: boolean;
    mostPopular?: boolean;
  }): ExtendedWalletMetadata[] {
    let wallets = this.getAllWalletMetadata();

    if (criteria?.mobileSupport) {
      wallets = wallets.filter(w => w.features.mobileApp);
    }

    if (criteria?.desktopSupport) {
      wallets = wallets.filter(w => w.features.browserExtension);
    }

    if (criteria?.mostPopular) {
      // Sort by popularity (installed count, successful connections, etc.)
      wallets.sort((a, b) => {
        const statsA = a.stats?.successfulConnections || 0;
        const statsB = b.stats?.successfulConnections || 0;
        return statsB - statsA;
      });
    }

    return wallets;
  }

  /**
   * Get wallet compatibility matrix
   */
  static getCompatibilityMatrix(): Record<string, Record<string, boolean>> {
    const matrix: Record<string, Record<string, boolean>> = {};

    this.getAllWalletMetadata().forEach(wallet => {
      matrix[wallet.id] = {
        stacks: true,
        bitcoin: wallet.id === 'xverse',
        mobile: wallet.features.mobileApp,
        desktop: wallet.features.browserExtension,
        deepLinking: wallet.features.deepLinking,
      };
    });

    return matrix;
  }

  /**
   * Format metadata for display
   */
  static formatForDisplay(walletId: string): {
    name: string;
    description: string;
    icon: string;
    status: string;
    platforms: string[];
    riskLevel: string;
    verification: string;
  } | null {
    const metadata = this.getWalletMetadata(walletId);
    if (!metadata) return null;

    return {
      name: metadata.name,
      description: metadata.description || '',
      icon: metadata.imageUrl,
      status: metadata.isInstalled ? 'Installed' : 'Available',
      platforms: metadata.supportedOn,
      riskLevel: metadata.riskLevel.toUpperCase(),
      verification: metadata.verificationStatus === 'verified' ? 'Verified' : 'Unverified',
    };
  }

  /**
   * Invalidate cache for wallet
   */
  private static invalidateCache(walletId?: string): void {
    if (walletId) {
      delete this.cache[walletId];
      this.cacheTimestamp.delete(walletId);
    } else {
      this.cache = {};
      this.cacheTimestamp.clear();
    }
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.invalidateCache();
  }

  /**
   * Clear statistics
   */
  static clearStats(): void {
    this.statsStore.clear();
    this.invalidateCache();
  }

  /**
   * Export metadata for analytics
   */
  static exportMetadata(): ExtendedWalletMetadata[] {
    return this.getAllWalletMetadata();
  }
}

/**
 * React hook for wallet metadata
 */
export const useWalletMetadata = (walletId?: string) => {
  if (walletId) {
    return WalletMetadataService.getWalletMetadata(walletId);
  }

  return {
    all: WalletMetadataService.getAllWalletMetadata(),
    installed: WalletMetadataService.getInstalledWalletMetadata(),
    recommended: WalletMetadataService.getRecommendedWallets({ mostPopular: true }),
  };
};
