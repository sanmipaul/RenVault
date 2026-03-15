export interface WalletProvider {
  id: string;
  name: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const validateWalletProvider = (provider: unknown): provider is WalletProvider => {
  return !!(
    provider &&
    typeof provider === 'object' &&
    typeof (provider as Record<string, unknown>).id === 'string' &&
    typeof (provider as Record<string, unknown>).name === 'string' &&
    typeof (provider as Record<string, unknown>).connect === 'function' &&
    typeof (provider as Record<string, unknown>).disconnect === 'function'
  );
};

export const safeConnectWallet = async (provider: unknown): Promise<boolean> => {
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
