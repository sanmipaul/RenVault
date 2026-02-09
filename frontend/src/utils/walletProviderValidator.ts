export interface WalletProvider {
  id: string;
  name: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const validateWalletProvider = (provider: any): provider is WalletProvider => {
  return !!(provider && typeof provider.id === 'string' && typeof provider.name === 'string' && typeof provider.connect === 'function' && typeof provider.disconnect === 'function');
};

export const safeConnectWallet = async (provider: any): Promise<boolean> => {
  if (!validateWalletProvider(provider)) {
    console.error('Invalid wallet provider');
    return false;
  }
  try {
    await provider.connect();
    return true;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return false;
  }
};
