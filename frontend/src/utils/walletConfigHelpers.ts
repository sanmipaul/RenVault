import { customWalletsConfig } from '../config/walletconnect';

export const getSafeWalletConfig = (walletId: string) => {
  try {
    const wallet = customWalletsConfig.wallets.find(w => w.id === walletId);
    if (!wallet) {
      console.warn(`Wallet ${walletId} not found`);
      return null;
    }
    return wallet;
  } catch (error) {
    console.error(`Error getting wallet config for ${walletId}:`, error);
    return null;
  }
};
