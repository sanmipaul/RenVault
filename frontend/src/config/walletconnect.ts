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
};

export const supportedChains = {
  eip155: {
    chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'eth_signTypedData_v4',
    ],
    events: ['chainChanged', 'accountsChanged'],
  },
};

export default walletConnectConfig;
