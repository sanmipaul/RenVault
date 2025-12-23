export const environment = {
  walletConnect: {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    appName: import.meta.env.VITE_APP_NAME || 'RenVault Wallet',
    appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'RenVault Web Wallet',
    appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
    appIcon: import.meta.env.VITE_APP_ICON || '',
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export const validateEnvironment = () => {
  if (!environment.walletConnect.projectId) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID environment variable is not set');
  }
};

export default environment;
