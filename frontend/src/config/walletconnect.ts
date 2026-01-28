import { environment } from './environment';
import { stacksWallets, getFeaturedWalletIds } from './customWallets';

/**
 * RenVault Branding Configuration
 * Used across wallet modal customization
 */
export const renvaultBranding = {
  name: 'RenVault',
  tagline: 'Connect to Your Vault',
  description: 'Secure micro-savings on Bitcoin layer with Stacks',
  logo: '/logo.svg',
  primaryColor: '#4a80f5',
  accentColor: '#10b981',
  termsUrl: 'https://renvault.app/terms',
  privacyUrl: 'https://renvault.app/privacy',
  supportUrl: 'https://renvault.app/support',
  learnUrl: 'https://renvault.app/learn',
  securityUrl: 'https://renvault.app/security',
};

/**
 * Modal Feature Flags
 * Control which features are displayed in the custom wallet modal
 */
export const modalFeatureFlags = {
  // Header features
  showLogo: true,
  showTagline: true,
  showNetworkIndicator: true,

  // Wallet features
  showRecommendedBadges: true,
  showRecentConnections: true,
  showWalletDescriptions: true,
  showGetWalletLinks: true,

  // Sidebar features
  showOnboardingGuide: true,
  showFeatureHighlights: true,
  showSecurityBadges: true,
  showNetworkStatus: true,

  // Educational content
  showEducationalTooltips: true,
  showFAQSection: true,
  showWalletComparison: true,

  // Footer features
  showTermsLinks: true,
  showSupportLink: true,
  showNewUserGuide: true,

  // A/B testing
  enableAnalytics: true,
  trackWalletSelections: true,
};

/**
 * Wallet Connect Core Configuration
 */
export const walletConnectConfig = {
  projectId: environment.walletConnect.projectId,
  metadata: {
    name: environment.walletConnect.appName || renvaultBranding.name,
    description: environment.walletConnect.appDescription || renvaultBranding.description,
    url: environment.walletConnect.appUrl,
    icons: environment.walletConnect.appIcon
      ? [environment.walletConnect.appIcon]
      : [renvaultBranding.logo],
  },
  relayUrl: 'wss://relay.walletconnect.org',
  termsConditionsUrl: renvaultBranding.termsUrl,
  privacyPolicyUrl: renvaultBranding.privacyUrl,

  // AppKit specific configurations
  appKit: {
    themeMode: 'light' as const,
    themeVariables: {
      // Primary brand colors
      '--w3m-color-mix': renvaultBranding.primaryColor,
      '--w3m-color-mix-strength': 40,
      '--w3m-accent': renvaultBranding.primaryColor,
      '--w3m-accent-soft': '#e8f0fe',

      // Typography
      '--w3m-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

      // Border radius
      '--w3m-border-radius-master': '12px',

      // Background colors
      '--w3m-background': '#ffffff',
      '--w3m-foreground': '#1e293b',

      // Overlay
      '--w3m-overlay': 'rgba(0, 0, 0, 0.7)',

      // Z-index
      '--w3m-z-index': '1000',
    },

    // Dark theme overrides
    darkThemeVariables: {
      '--w3m-background': '#1e293b',
      '--w3m-foreground': '#f1f5f9',
      '--w3m-accent-soft': '#1e3a5f',
      '--w3m-overlay': 'rgba(0, 0, 0, 0.85)',
    },
  },
};

/**
 * Supported Chains Configuration
 */
export const supportedChains = {
  stacks: {
    id: 'stacks:1',
    name: 'Stacks Mainnet',
    network: 'mainnet',
    chains: ['stacks:1'],
    methods: [
      'stacks_signMessage',
      'stacks_signTransaction',
      'stacks_getAccounts',
      'stacks_getAddresses',
      'stacks_callReadOnlyFunction',
    ],
    events: ['accountsChanged', 'chainChanged', 'disconnect'],
  },
  stacksTestnet: {
    id: 'stacks:2147483648',
    name: 'Stacks Testnet',
    network: 'testnet',
    chains: ['stacks:2147483648'],
    methods: [
      'stacks_signMessage',
      'stacks_signTransaction',
      'stacks_getAccounts',
      'stacks_getAddresses',
    ],
    events: ['accountsChanged', 'chainChanged', 'disconnect'],
  },
};

/**
 * AppKit Custom Wallet Configuration
 * Integrates Stacks wallets (Hiro, Leather, Xverse) with AppKit
 */
export const customWalletsConfig = {
  // List of custom wallet configurations
  wallets: stacksWallets.map((wallet) => ({
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

  // Wallet recommendation order
  walletOrder: ['hiro', 'leather', 'xverse'],

  // Wallet categories
  categories: {
    recommended: ['hiro', 'xverse'],
    advanced: ['leather'],
    mobile: ['xverse'],
    desktop: ['hiro', 'leather'],
  },

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
    // Recent connections limit
    recentConnectionsLimit: 3,
  },
};

/**
 * Modal Configuration
 * Settings specific to the custom wallet modal
 */
export const modalConfig = {
  // Modal dimensions
  dimensions: {
    desktop: {
      width: '900px',
      maxHeight: '90vh',
    },
    tablet: {
      width: '95%',
      maxHeight: '95vh',
    },
    mobile: {
      width: '100%',
      maxHeight: '100vh',
    },
  },

  // Sidebar configuration
  sidebar: {
    enabled: true,
    width: '320px',
    sections: ['onboarding', 'features', 'security', 'network'],
  },

  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease',
  },

  // Accessibility
  accessibility: {
    enableKeyboardNav: true,
    enableScreenReader: true,
    enableFocusTrap: true,
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
  // Branding
  branding: renvaultBranding,
  // Feature flags
  features: modalFeatureFlags,
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
  // Modal configuration
  modal: modalConfig,
  // Feature flags
  features: {
    installationDetection: customWalletsConfig.options.enableInstallationDetection,
    deepLinking: customWalletsConfig.options.enableDeepLinking,
    getWalletLinks: customWalletsConfig.options.showGetWalletLinks,
    recentConnections: customWalletsConfig.options.recentConnectionsLimit > 0,
    ...modalFeatureFlags,
  },
});

/**
 * Get theme variables based on mode
 */
export const getThemeVariables = (mode: 'light' | 'dark' = 'light') => {
  if (mode === 'dark') {
    return {
      ...walletConnectConfig.appKit.themeVariables,
      ...walletConnectConfig.appKit.darkThemeVariables,
    };
  }
  return walletConnectConfig.appKit.themeVariables;
};

/**
 * Check if custom modal should be used
 */
export const shouldUseCustomModal = () => {
  // Use custom modal when feature flags are enabled
  return modalFeatureFlags.showOnboardingGuide ||
    modalFeatureFlags.showFeatureHighlights ||
    modalFeatureFlags.showSecurityBadges;
};

export default walletConnectConfig;
