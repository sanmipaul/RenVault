import { customWalletsConfig } from '../config/walletconnect';
import { validateWalletConfig, validateWalletConfigBatch } from './walletConfigValidator';
import { stacksWallets } from '../config/customWallets';
import { ValidationResult } from '../types/walletConfig';
import { configMonitor } from './configMonitor';

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

export const getValidationSummary = (result: ValidationResult): string => {
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  if (errorCount === 0 && warningCount === 0) return 'Valid';
  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
  if (warningCount > 0) parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
  return parts.join(', ');
};

export const validateAllStacksWallets = () => {
  return validateWalletConfigBatch(stacksWallets);
};

export const getWalletsWithErrors = () => {
  return validateAllStacksWallets().filter(r => !r.result.valid);
};

export const getWalletsWithWarnings = () => {
  return validateAllStacksWallets().filter(r => r.result.warnings.length > 0);
};

export const isWalletConfigValid = (walletId: string): boolean => {
  const wallet = stacksWallets.find(w => w.id === walletId);
  if (!wallet) return false;
  const result = validateWalletConfig(wallet);
  if (result.valid) {
    configMonitor.recordValidationSuccess();
  } else {
    configMonitor.recordValidationError();
  }
  if (result.warnings.length > 0) {
    configMonitor.recordValidationWarning();
  }
  return result.valid;
};
