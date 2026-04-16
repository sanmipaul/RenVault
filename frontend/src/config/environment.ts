import { logger } from '../utils/logger';
import { isValidStacksAddress, isMainnetAddress } from '../utils/stacksAddress';

export const environment = {
  walletConnect: {
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    appName: process.env.REACT_APP_NAME || 'RenVault Wallet',
    appDescription: process.env.REACT_APP_DESCRIPTION || 'RenVault Web Wallet',
    appUrl: process.env.REACT_APP_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),
    appIcon: process.env.REACT_APP_ICON || '',
  },
  contracts: {
    // Bare Stacks principal for the ren-vault contract.
    // May also be supplied as a fully-qualified "principal.contract-name"
    // identifier; prepareDepositTransaction() will split it automatically.
    renVaultAddress: process.env.REACT_APP_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    renVaultName: process.env.REACT_APP_CONTRACT_NAME || 'ren-vault',
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

  // Validate the resolved contract address (env override or built-in default).
  // Accepts bare principals OR fully-qualified "principal.contract-name".
  if (!isValidStacksAddress(environment.contracts.renVaultAddress)) {
    errors.push(
      `REACT_APP_CONTRACT_ADDRESS "${environment.contracts.renVaultAddress}" is not a valid Stacks address`
    );
  }

  if (environment.isProd) {
    if (!environment.api.analyticsUrl) {
      warnings.push('REACT_APP_ANALYTICS_API_URL is not set for production');
    }
    if (!environment.api.notificationsUrl) {
      warnings.push('REACT_APP_NOTIFICATIONS_API_URL is not set for production');
    }

    // Warn loudly when a testnet address reaches a production build.
    // The built-in fallback is a testnet principal (ST…); production must
    // always use a mainnet address (SP… or SM…).
    if (
      isValidStacksAddress(environment.contracts.renVaultAddress) &&
      !isMainnetAddress(environment.contracts.renVaultAddress)
    ) {
      warnings.push(
        'REACT_APP_CONTRACT_ADDRESS is a testnet address in a production build — ' +
          'set it to a mainnet (SP… or SM…) principal'
      );
    }
  }

  if (warnings.length > 0) {
    logger.warn(`Environment warnings: ${warnings.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
};

export default environment;
