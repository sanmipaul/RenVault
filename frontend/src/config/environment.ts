export const environment = {
  walletConnect: {
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    appName: process.env.REACT_APP_NAME || 'RenVault Wallet',
    appDescription: process.env.REACT_APP_DESCRIPTION || 'RenVault Web Wallet',
    appUrl: process.env.REACT_APP_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),
    appIcon: process.env.REACT_APP_ICON || '',
  },
  api: {
    analyticsUrl: process.env.REACT_APP_ANALYTICS_API_URL || '',
    notificationsUrl: process.env.REACT_APP_NOTIFICATIONS_API_URL || '',
    sponsorshipUrl: process.env.REACT_APP_SPONSORSHIP_API_URL || '',
    coreUrl: process.env.REACT_APP_CORE_API_URL || '',
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export const validateEnvironment = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!environment.walletConnect.projectId) {
    errors.push('REACT_APP_WALLETCONNECT_PROJECT_ID is required');
  }

  if (!environment.walletConnect.appUrl) {
    errors.push('REACT_APP_URL is required');
  }

  if (environment.isProd) {
    if (!environment.api.analyticsUrl) {
      warnings.push('REACT_APP_ANALYTICS_API_URL is not set for production');
    }
    if (!environment.api.notificationsUrl) {
      warnings.push('REACT_APP_NOTIFICATIONS_API_URL is not set for production');
    }
  }

  if (warnings.length > 0) {
    console.warn(`Environment warnings: ${warnings.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
};

export default environment;
