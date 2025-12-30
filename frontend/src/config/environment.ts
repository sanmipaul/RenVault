export const environment = {
  walletConnect: {
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    appName: process.env.REACT_APP_NAME || 'RenVault Wallet',
    appDescription: process.env.REACT_APP_DESCRIPTION || 'RenVault Web Wallet',
    appUrl: process.env.REACT_APP_URL || 'http://localhost:3000',
    appIcon: process.env.REACT_APP_ICON || '',
  },
  appKit: {
    enabled: process.env.REACT_APP_APPKIT_ENABLED === 'true',
    apiKey: process.env.REACT_APP_APPKIT_API_KEY || '',
    providerUrl: process.env.REACT_APP_APPKIT_PROVIDER_URL || ''
  },
  appKitSwap: {
    enabled: process.env.REACT_APP_APPKIT_SWAP_ENABLED === 'true'
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export const validateEnvironment = () => {
  if (!environment.walletConnect.projectId) {
    throw new Error('REACT_APP_WALLETCONNECT_PROJECT_ID environment variable is not set');
  }
};

export default environment;
