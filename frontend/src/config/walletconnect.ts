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
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#4a80f5',
      '--w3m-color-mix-strength': 40,
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
