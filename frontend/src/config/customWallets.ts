/**
 * Custom Wallet Configuration for AppKit
 * Defines Stacks-specific wallets: Hiro, Leather, and Xverse
 */

export interface CustomWalletConfig {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  homepage?: string;
  chains?: string[];
  mobile: {
    native?: string;
    universal?: string;
  };
  desktop: {
    native?: string;
    universal?: string;
  };
  downloadUrls?: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    edge?: string;
    ios?: string;
    android?: string;
  };
}

/**
 * Stacks wallet configurations for AppKit integration
 */
export const stacksWallets: CustomWalletConfig[] = [
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    description: 'The most trusted Bitcoin wallet for Stacks',
    imageUrl: '/wallets/hiro.svg',
    imageAlt: 'Hiro Wallet Logo',
    homepage: 'https://wallet.hiro.so',
    chains: ['stacks:1'],
    mobile: {
      native: 'hiro://',
      universal: 'https://wallet.hiro.so/install',
    },
    desktop: {
      native: 'hiro://',
      universal: 'https://wallet.hiro.so',
    },
    downloadUrls: {
      chrome: 'https://chrome.google.com/webstore/detail/hiro-wallet/ldinpeekobncanarwchipofekarywipb',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/hiro-wallet/',
      safari: 'https://apps.apple.com/us/app/hiro-wallet/id1588951625',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/hiro-wallet/jlfebkindbakfokfjdkehiofjefpojoo',
      ios: 'https://apps.apple.com/us/app/hiro-wallet/id1588951625',
      android: 'https://play.google.com/store/apps/details?id=so.hiro.wallet',
    },
  },
  {
    id: 'leather',
    name: 'Leather Wallet',
    description: 'A Bitcoin L1 and L2 wallet',
    imageUrl: '/wallets/leather.svg',
    imageAlt: 'Leather Wallet Logo',
    homepage: 'https://leather.io',
    chains: ['stacks:1'],
    mobile: {
      native: 'leather://',
      universal: 'https://leather.io/install',
    },
    desktop: {
      native: 'leather://',
      universal: 'https://leather.io',
    },
    downloadUrls: {
      chrome: 'https://chrome.google.com/webstore/detail/leather/ldinpeekobncanarwchipofekarywipb',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/leather/',
      safari: 'https://apps.apple.com/us/app/leather-bitcoin-wallet/id1624640087',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/leather/jlfebkindbakfokfjdkehiofjefpojoo',
      ios: 'https://apps.apple.com/us/app/leather-bitcoin-wallet/id1624640087',
      android: 'https://play.google.com/store/apps/details?id=io.leather.wallet',
    },
  },
  {
    id: 'xverse',
    name: 'Xverse Wallet',
    description: 'The complete Bitcoin wallet for Stacks and Bitcoin',
    imageUrl: '/wallets/xverse.svg',
    imageAlt: 'Xverse Wallet Logo',
    homepage: 'https://www.xverse.app',
    chains: ['stacks:1'],
    mobile: {
      native: 'xverse://',
      universal: 'https://www.xverse.app',
    },
    desktop: {
      native: 'xverse://',
      universal: 'https://www.xverse.app',
    },
    downloadUrls: {
      chrome: 'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpfnlniiiplnlbofdojceo',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/xverse-wallet/',
      safari: 'https://apps.apple.com/us/app/xverse-bitcoin-web3-wallet/id1556016087',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/xverse-wallet/ijeflaloonpnlmijndkibkdebjngmndi',
      ios: 'https://apps.apple.com/us/app/xverse-bitcoin-web3-wallet/id1556016087',
      android: 'https://play.google.com/store/apps/details?id=app.xverse.nativeapp',
    },
  },
];

/**
 * Get wallet configuration by ID
 */
export const getWalletConfig = (walletId: string): CustomWalletConfig | undefined => {
  return stacksWallets.find(wallet => wallet.id === walletId);
};

/**
 * Get all featured wallet IDs for AppKit
 */
export const getFeaturedWalletIds = (): string[] => {
  return stacksWallets.map(wallet => wallet.id);
};

/**
 * Get download URL for a specific wallet on a platform
 */
export const getWalletDownloadUrl = (
  walletId: string,
  platform: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ios' | 'android'
): string | undefined => {
  const wallet = getWalletConfig(walletId);
  return wallet?.downloadUrls?.[platform];
};
