import { environment } from './environment';
import { stacksWallets, getFeaturedWalletIds } from './customWallets';

export const walletConnectConfig = {
  projectId: environment.walletConnect.projectId,
  metadata: {
    name: environment.walletConnect.appName,
    description: environment.walletConnect.appDescription,
    url: environment.walletConnect.appUrl,
    icons: environment.walletConnect.appIcon
      ? [environment.walletConnect.appIcon]
      : [],
  },
  relayUrl: 'wss://relay.walletconnect.org',
  termsConditionsUrl: 'https://renvault.app/terms',
  privacyPolicyUrl: 'https://renvault.app/privacy',
  // AppKit specific configurations
  appKit: {
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#4a80f5',
      '--w3m-color-mix-strength': 40,
      '--w3m-font-family': 'system-ui, -apple-system, sans-serif',
      '--w3m-border-radius-master': '8px',
      '--w3m-accent': '#4a80f5',
      '--w3m-accent-soft': '#e8f0fe',
      '--w3m-background': '#ffffff',
      '--w3m-overlay': 'rgba(0, 0, 0, 0.5)',
    },
  },
};

export const supportedChains = {
  stacks: {
    chains: ['stacks:1'],
    methods: [
      'stacks_signMessage',
      'stacks_signTransaction',
      'stacks_getAccounts',
      'stacks_getAddresses',
    ],
    events: ['accountsChanged', 'chainChanged'],
  },
};

/**
 * AppKit Custom Wallet Configuration
 * Integrates Stacks wallets (Hiro, Leather, Xverse) with AppKit
 */
export const customWalletsConfig = {
  // List of custom wallet configurations
  wallets: stacksWallets.map(wallet => ({
    id: wallet.id,
    name: wallet.name,
    imageUrl: wallet.imageUrl,
    mobile: wallet.mobile,
    desktop: wallet.desktop,
    homepage: wallet.homepage,
  })),

  // Featured wallet IDs to show prominently
  featuredWalletIds: getFeaturedWalletIds(),

  // Include all custom wallet IDs
  includeWalletIds: getFeaturedWalletIds(),

  // Wallet configuration options
  options: {
    // Show Stacks wallets first
    prioritizeStacksWallets: true,
    // Enable installation detection
    enableInstallationDetection: true,
    // Show "Get Wallet" links
    showGetWalletLinks: true,
    // Mobile deep linking
    enableDeepLinking: true,
    // Fallback to WalletConnect
    enableWalletConnectFallback: true,
  },
};

/**
 * Get AppKit configuration for wallet modal
 */
export const getAppKitWalletConfig = () => ({
  ...walletConnectConfig.appKit,
  // Featured wallets
  featuredWalletIds: customWalletsConfig.featuredWalletIds,
  // Custom wallet configurations
  customWallets: customWalletsConfig.wallets,
});

/**
 * Get wallet modal options
 */
export const getWalletModalOptions = () => ({
  // Stacks chain configuration
  chains: supportedChains.stacks.chains,
  // Methods supported
  methods: supportedChains.stacks.methods,
  // Events to listen for
  events: supportedChains.stacks.events,
  // Wallet options
  wallets: customWalletsConfig.wallets,
  includeWalletIds: customWalletsConfig.includeWalletIds,
  // UI options
  themeVariables: walletConnectConfig.appKit.themeVariables,
  // Feature flags
  features: {
    installationDetection: customWalletsConfig.options.enableInstallationDetection,
    deepLinking: customWalletsConfig.options.enableDeepLinking,
    getWalletLinks: customWalletsConfig.options.showGetWalletLinks,
  },
});

export default walletConnectConfig;
