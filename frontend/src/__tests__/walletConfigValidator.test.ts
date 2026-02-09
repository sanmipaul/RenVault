import { validateWalletConfig } from '../utils/walletConfigValidator';
import { CustomWalletConfig } from '../config/customWallets';

describe('Wallet Configuration Validation', () => {
  const validWallet: CustomWalletConfig = {
    id: 'test-wallet',
    name: 'Test Wallet',
    type: 'browser',
    category: 'recommended',
    isRecommended: true,
    imageUrl: '/wallets/test.svg',
    homepage: 'https://test.wallet',
    supportedPlatforms: ['chrome'],
    mobile: { native: 'test://' },
    desktop: { native: 'test://' },
  };

  it('should validate a correct wallet configuration', () => {
    const result = validateWalletConfig(validWallet);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation for missing id', () => {
    const invalid = { ...validWallet, id: '' };
    const result = validateWalletConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'id')).toBe(true);
  });
});
