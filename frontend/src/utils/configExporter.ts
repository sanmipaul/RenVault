import { renvaultBranding, modalFeatureFlags, walletConnectConfig, supportedChains, customWalletsConfig, modalConfig } from '../config/walletconnect';
import { validateAllStacksWallets, getValidationSummary } from './walletConfigHelpers';

export const exportConfiguration = () => {
  const walletValidations = validateAllStacksWallets().map(({ walletId, result }) => ({
    walletId,
    valid: result.valid,
    summary: getValidationSummary(result),
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
  }));

  return {
    branding: renvaultBranding,
    featureFlags: modalFeatureFlags,
    walletConnect: { projectId: walletConnectConfig.projectId ? '***' : 'NOT_SET', metadata: walletConnectConfig.metadata },
    chains: supportedChains,
    wallets: customWalletsConfig.wallets.map(w => ({ id: w.id, name: w.name })),
    walletValidations,
    modal: modalConfig,
    timestamp: new Date().toISOString(),
  };
};

export const logConfiguration = () => {
  console.log('RenVault Configuration:', exportConfiguration());
};
