import { logger } from './logger';
import { validateBrandingConfig } from './brandingValidator';
import { validateChainConfig } from './chainValidator';
import { validateModalConfig } from './modalValidator';
import { renvaultBranding, supportedChains, modalConfig } from '../config/walletconnect';
import { validateAllStacksWallets } from './walletConfigHelpers';

export const initializeConfiguration = (): boolean => {
  const errors: string[] = [];

  const brandingResult = validateBrandingConfigDetailed(renvaultBranding);
  if (!brandingResult.valid) {
    errors.push(...brandingResult.errors.map(e => `Branding: ${e}`));
  }

  if (!validateChainConfig(supportedChains.stacks)) errors.push('Invalid Stacks chain configuration');
  if (!validateChainConfig(supportedChains.stacksTestnet)) errors.push('Invalid Stacks testnet configuration');
  if (!validateModalConfig(modalConfig)) errors.push('Invalid modal configuration');

  const walletResults = validateAllStacksWallets();
  for (const { walletId, result } of walletResults) {
    if (!result.valid) {
      errors.push(`Wallet "${walletId}" has ${result.errors.length} validation error(s)`);
    }
  }

  if (errors.length > 0) {
    logger.error('Configuration initialization failed:', errors);
    return false;
  }
  return true;
};
