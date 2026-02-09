import { renvaultBranding, modalFeatureFlags, walletConnectConfig, supportedChains, customWalletsConfig, modalConfig } from '../config/walletconnect';

export const exportConfiguration = () => {
  return {
    branding: renvaultBranding,
    featureFlags: modalFeatureFlags,
    walletConnect: { projectId: walletConnectConfig.projectId ? '***' : 'NOT_SET', metadata: walletConnectConfig.metadata },
    chains: supportedChains,
    wallets: customWalletsConfig.wallets.map(w => ({ id: w.id, name: w.name })),
    modal: modalConfig,
    timestamp: new Date().toISOString(),
  };
};

export const logConfiguration = () => {
  console.log('RenVault Configuration:', exportConfiguration());
};
