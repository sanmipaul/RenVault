import { isValidHttpsUrl } from './urlValidator';

export interface WalletProvider {
  id: string;
  name: string;
  homepage?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface WalletProviderValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateWalletProvider = (provider: any): provider is WalletProvider => {
  return !!(
    provider &&
    typeof provider.id === 'string' &&
    typeof provider.name === 'string' &&
    typeof provider.connect === 'function' &&
    typeof provider.disconnect === 'function'
  );
};

export const validateWalletProviderDetailed = (provider: any): WalletProviderValidationResult => {
  const errors: string[] = [];

  if (!provider) {
    errors.push('Provider is null or undefined');
    return { valid: false, errors };
  }
  if (typeof provider.id !== 'string' || provider.id.trim() === '') errors.push('Provider id must be a non-empty string');
  if (typeof provider.name !== 'string' || provider.name.trim() === '') errors.push('Provider name must be a non-empty string');
  if (typeof provider.connect !== 'function') errors.push('Provider must implement connect()');
  if (typeof provider.disconnect !== 'function') errors.push('Provider must implement disconnect()');
  if (provider.homepage && !isValidHttpsUrl(provider.homepage)) {
    errors.push('Provider homepage must be a valid HTTPS URL');
  }

  return { valid: errors.length === 0, errors };
};

export const safeConnectWallet = async (provider: any): Promise<boolean> => {
  const validation = validateWalletProviderDetailed(provider);
  if (!validation.valid) {
    console.error('Invalid wallet provider:', validation.errors);
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
