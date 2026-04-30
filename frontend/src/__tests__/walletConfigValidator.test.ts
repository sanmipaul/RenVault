import {
  validateWalletConfig,
  validateWalletId,
  validateWalletName,
  validateWalletConfigBatch,
  validateWalletConfigStrict,
  hasValidationErrors,
  hasValidationWarnings,
  getErrorFields,
  getWarningFields,
} from '../utils/walletConfigValidator';
import { CustomWalletConfig } from '../config/customWallets';

const validWallet: CustomWalletConfig = {
  id: 'test-wallet',
  name: 'Test Wallet',
  imageUrl: '/wallets/test.svg',
  homepage: 'https://test.wallet',
  chains: ['stacks:1'],
  supportedPlatforms: ['chrome'],
  mobile: { native: 'test://', universal: 'https://test.wallet/mobile' },
  desktop: { native: 'test://', universal: 'https://test.wallet' },
  downloadUrls: { chrome: 'https://chrome.google.com/webstore/detail/test' },
};

describe('validateWalletId', () => {
  it('returns no errors for a valid id', () => {
    expect(validateWalletId('my-wallet')).toHaveLength(0);
  });

  it('errors on empty id', () => {
    expect(validateWalletId('')).toHaveLength(1);
  });

  it('errors on id with uppercase letters', () => {
    expect(validateWalletId('MyWallet')).toHaveLength(1);
  });

  it('errors on id with spaces', () => {
    expect(validateWalletId('my wallet')).toHaveLength(1);
  });

  it('errors on id exceeding max length', () => {
    expect(validateWalletId('a'.repeat(33))).toHaveLength(1);
  });

  it('accepts id with numbers and hyphens', () => {
    expect(validateWalletId('wallet-v2')).toHaveLength(0);
  });
});

describe('validateWalletName', () => {
  it('returns no errors for a valid name', () => {
    expect(validateWalletName('My Wallet')).toHaveLength(0);
  });

  it('errors on empty name', () => {
    expect(validateWalletName('')).toHaveLength(1);
  });

  it('errors on name exceeding max length', () => {
    expect(validateWalletName('a'.repeat(65))).toHaveLength(1);
  });
});

describe('validateWalletConfig - basic fields', () => {
  it('validates a fully correct wallet config', () => {
    const result = validateWalletConfig(validWallet);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails for missing id', () => {
    const result = validateWalletConfig({ ...validWallet, id: '' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('id');
  });

  it('fails for missing name', () => {
    const result = validateWalletConfig({ ...validWallet, name: '' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('name');
  });
});

describe('validateWalletConfig - imageUrl', () => {
  it('accepts a valid relative SVG path', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: '/wallets/icon.svg' });
    expect(getErrorFields(result)).not.toContain('imageUrl');
  });

  it('accepts a valid HTTPS PNG URL', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: 'https://cdn.example.com/icon.png' });
    expect(getErrorFields(result)).not.toContain('imageUrl');
  });

  it('rejects an imageUrl with no extension', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: '/wallets/icon' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('imageUrl');
  });

  it('rejects an imageUrl with unsupported extension', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: '/wallets/icon.bmp' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('imageUrl');
  });

  it('rejects an empty imageUrl', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: '' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('imageUrl');
  });

  it('rejects a plain string that is not a URL or relative path', () => {
    const result = validateWalletConfig({ ...validWallet, imageUrl: 'not-a-url' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('imageUrl');
  });
});

describe('validateWalletConfig - homepage', () => {
  it('accepts a valid HTTPS homepage', () => {
    const result = validateWalletConfig({ ...validWallet, homepage: 'https://wallet.example.com' });
    expect(getErrorFields(result)).not.toContain('homepage');
  });

  it('rejects an HTTP homepage', () => {
    const result = validateWalletConfig({ ...validWallet, homepage: 'http://wallet.example.com' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('homepage');
  });

  it('rejects a non-URL homepage', () => {
    const result = validateWalletConfig({ ...validWallet, homepage: 'not-a-url' });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('homepage');
  });

  it('warns when homepage is missing', () => {
    const { homepage: _, ...noHomepage } = validWallet;
    const result = validateWalletConfig(noHomepage as CustomWalletConfig);
    expect(hasValidationWarnings(result)).toBe(true);
    expect(getWarningFields(result)).toContain('homepage');
  });
});

describe('validateWalletConfig - downloadUrls', () => {
  it('accepts valid HTTPS download URLs', () => {
    const result = validateWalletConfig(validWallet);
    expect(getErrorFields(result)).not.toContain('downloadUrls.chrome');
  });

  it('rejects an HTTP download URL', () => {
    const result = validateWalletConfig({
      ...validWallet,
      downloadUrls: { chrome: 'http://chrome.google.com/webstore/detail/test' },
    });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('downloadUrls.chrome');
  });

  it('warns when downloadUrls is missing', () => {
    const { downloadUrls: _, ...noDownload } = validWallet;
    const result = validateWalletConfig(noDownload as CustomWalletConfig);
    expect(hasValidationWarnings(result)).toBe(true);
    expect(getWarningFields(result)).toContain('downloadUrls');
  });
});

describe('validateWalletConfig - mobile/desktop', () => {
  it('accepts valid deep link native URL', () => {
    const result = validateWalletConfig(validWallet);
    expect(getErrorFields(result)).not.toContain('mobile.native');
  });

  it('rejects invalid mobile native URL', () => {
    const result = validateWalletConfig({
      ...validWallet,
      mobile: { native: 'not-a-deep-link', universal: 'https://test.wallet/mobile' },
    });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('mobile.native');
  });

  it('rejects invalid desktop universal URL', () => {
    const result = validateWalletConfig({
      ...validWallet,
      desktop: { native: 'test://', universal: 'not-a-url' },
    });
    expect(result.valid).toBe(false);
    expect(getErrorFields(result)).toContain('desktop.universal');
  });
});

describe('validateWalletConfig - chains', () => {
  it('accepts known Stacks mainnet chain', () => {
    const result = validateWalletConfig({ ...validWallet, chains: ['stacks:1'] });
    expect(getWarningFields(result)).not.toContain('chains');
  });

  it('warns on unknown chain', () => {
    const result = validateWalletConfig({ ...validWallet, chains: ['ethereum:1'] });
    expect(hasValidationWarnings(result)).toBe(true);
    expect(getWarningFields(result)).toContain('chains');
  });

  it('warns when chains is empty', () => {
    const result = validateWalletConfig({ ...validWallet, chains: [] });
    expect(hasValidationWarnings(result)).toBe(true);
    expect(getWarningFields(result)).toContain('chains');
  });
});

describe('validateWalletConfigBatch', () => {
  it('validates multiple wallets and returns results keyed by walletId', () => {
    const results = validateWalletConfigBatch([validWallet, { ...validWallet, id: 'wallet-b', name: 'Wallet B' }]);
    expect(results).toHaveLength(2);
    expect(results[0].walletId).toBe('test-wallet');
    expect(results[1].walletId).toBe('wallet-b');
  });

  it('captures errors for invalid wallets in batch', () => {
    const results = validateWalletConfigBatch([{ ...validWallet, id: '' }]);
    expect(hasValidationErrors(results[0].result)).toBe(true);
  });
});

describe('helper utilities', () => {
  it('hasValidationErrors returns false for valid config', () => {
    expect(hasValidationErrors(validateWalletConfig(validWallet))).toBe(false);
  });

  it('getErrorFields returns empty array for valid config', () => {
    expect(getErrorFields(validateWalletConfig(validWallet))).toHaveLength(0);
  });
});

describe('validateWalletConfigStrict', () => {
  it('fails when warnings exist (strict mode)', () => {
    const { homepage: _, ...noHomepage } = validWallet;
    const result = validateWalletConfigStrict(noHomepage as CustomWalletConfig);
    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(0);
    expect(result.errors.some(e => e.field === 'homepage')).toBe(true);
  });

  it('passes for a fully complete config with no warnings', () => {
    const fullWallet: CustomWalletConfig = {
      ...validWallet,
      description: 'A test wallet',
      imageAlt: 'Test Wallet Logo',
    };
    const result = validateWalletConfigStrict(fullWallet);
    expect(result.valid).toBe(true);
  });
});

describe('validateWalletConfig - description and imageAlt', () => {
  it('warns when description is missing', () => {
    const result = validateWalletConfig({ ...validWallet, description: undefined });
    expect(getWarningFields(result)).toContain('description');
  });

  it('warns when description exceeds 256 chars', () => {
    const result = validateWalletConfig({ ...validWallet, description: 'a'.repeat(257) });
    expect(getWarningFields(result)).toContain('description');
  });

  it('warns when imageAlt is missing', () => {
    const result = validateWalletConfig({ ...validWallet, imageAlt: undefined });
    expect(getWarningFields(result)).toContain('imageAlt');
  });
});
