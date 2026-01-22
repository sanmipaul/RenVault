import { environment } from './environment';

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
  // AppKit specific configurations
  appKit: {
    enabled: environment.appKit?.enabled || false,
    apiKey: environment.appKit?.apiKey || '',
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

export default walletConnectConfig;
