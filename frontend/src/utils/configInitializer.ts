import { validateBrandingConfig } from './brandingValidator';
import { validateChainConfig } from './chainValidator';
import { validateModalConfig } from './modalValidator';
import { renvaultBranding, supportedChains, modalConfig } from '../config/walletconnect';

export const initializeConfiguration = (): boolean => {
  const errors: string[] = [];
  if (!validateBrandingConfig(renvaultBranding)) errors.push('Invalid branding configuration');
  if (!validateChainConfig(supportedChains.stacks)) errors.push('Invalid Stacks chain configuration');
  if (!validateChainConfig(supportedChains.stacksTestnet)) errors.push('Invalid Stacks testnet configuration');
  if (!validateModalConfig(modalConfig)) errors.push('Invalid modal configuration');
  if (errors.length > 0) {
    console.error('Configuration initialization failed:', errors);
    return false;
  }
  return true;
};
