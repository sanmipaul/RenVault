export const environment = {
  walletConnect: {
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    appName: process.env.REACT_APP_NAME || 'RenVault Wallet',
    appDescription: process.env.REACT_APP_DESCRIPTION || 'RenVault Web Wallet',
    appUrl: process.env.REACT_APP_URL || 'http://localhost:3000',
    appIcon: process.env.REACT_APP_ICON || '',
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
