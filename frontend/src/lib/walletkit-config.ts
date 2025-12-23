export const walletKitConfig = {
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  metadata: {
    name: process.env.VITE_APP_NAME || 'RenVault Wallet',
    description: process.env.VITE_APP_DESCRIPTION || 'RenVault Web Wallet',
    url: process.env.VITE_APP_URL || 'http://localhost:3000',
    icons: process.env.VITE_APP_ICON ? [process.env.VITE_APP_ICON] : [],
  },
  relayUrl: 'wss://relay.walletconnect.org',
};

export default walletKitConfig;
