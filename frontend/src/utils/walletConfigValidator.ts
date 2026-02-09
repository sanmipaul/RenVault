import { CustomWalletConfig } from '../config/customWallets';
import { ValidationResult, WalletConfigError } from '../types/walletConfig';

export const validateWalletConfig = (config: CustomWalletConfig): ValidationResult => {
  const errors: WalletConfigError[] = [];

  if (!config.id || config.id.trim() === '') {
    errors.push({ field: 'id', message: 'Wallet ID is required', severity: 'error' });
  }

  if (!config.name || config.name.trim() === '') {
    errors.push({ field: 'name', message: 'Wallet name is required', severity: 'error' });
  }

  if (!config.imageUrl || config.imageUrl.trim() === '') {
    errors.push({ field: 'imageUrl', message: 'Wallet image URL is required', severity: 'error' });
  }

  if (!config.supportedPlatforms || config.supportedPlatforms.length === 0) {
    errors.push({ field: 'supportedPlatforms', message: 'At least one platform must be supported', severity: 'error' });
  }

  return { valid: errors.length === 0, errors };
};
