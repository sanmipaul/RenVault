import {
  isValidUrl,
  isValidHttpsUrl,
  isValidHttpOrHttpsUrl,
  isValidRelativeUrl,
  isValidImageUrl,
  isValidImageUrlStrict,
  isValidDeepLinkUrl,
  isValidWalletHomepage,
  isValidDownloadUrl,
  isValidMobileUniversalUrl,
  isValidMobileNativeUrl,
  getUrlValidationError,
  sanitizeUrl,
  normalizeUrl,
  extractDomain,
  isSameDomain,
} from '../utils/urlValidator';

describe('isValidUrl', () => {
  it('returns true for a valid https URL', () => expect(isValidUrl('https://example.com')).toBe(true));
  it('returns true for a valid http URL', () => expect(isValidUrl('http://example.com')).toBe(true));
  it('returns false for a plain string', () => expect(isValidUrl('not-a-url')).toBe(false));
  it('returns false for empty string', () => expect(isValidUrl('')).toBe(false));
});

describe('isValidHttpsUrl', () => {
  it('returns true for https URL', () => expect(isValidHttpsUrl('https://example.com')).toBe(true));
  it('returns false for http URL', () => expect(isValidHttpsUrl('http://example.com')).toBe(false));
  it('returns false for invalid string', () => expect(isValidHttpsUrl('example.com')).toBe(false));
});

describe('isValidHttpOrHttpsUrl', () => {
  it('accepts https', () => expect(isValidHttpOrHttpsUrl('https://example.com')).toBe(true));
  it('accepts http', () => expect(isValidHttpOrHttpsUrl('http://example.com')).toBe(true));
  it('rejects ftp', () => expect(isValidHttpOrHttpsUrl('ftp://example.com')).toBe(false));
});

describe('isValidRelativeUrl', () => {
  it('accepts /wallets/icon.svg', () => expect(isValidRelativeUrl('/wallets/icon.svg')).toBe(true));
  it('rejects //cdn.example.com/icon.svg', () => expect(isValidRelativeUrl('//cdn.example.com/icon.svg')).toBe(false));
  it('rejects relative path without leading slash', () => expect(isValidRelativeUrl('wallets/icon.svg')).toBe(false));
});

describe('isValidImageUrlStrict', () => {
  it('accepts /wallets/icon.svg', () => expect(isValidImageUrlStrict('/wallets/icon.svg')).toBe(true));
  it('accepts /wallets/icon.png', () => expect(isValidImageUrlStrict('/wallets/icon.png')).toBe(true));
  it('accepts https URL with .webp', () => expect(isValidImageUrlStrict('https://cdn.example.com/icon.webp')).toBe(true));
  it('rejects /wallets/icon.bmp', () => expect(isValidImageUrlStrict('/wallets/icon.bmp')).toBe(false));
  it('rejects /wallets/icon (no extension)', () => expect(isValidImageUrlStrict('/wallets/icon')).toBe(false));
  it('rejects plain string', () => expect(isValidImageUrlStrict('icon.svg')).toBe(false));
});

describe('isValidDeepLinkUrl', () => {
  it('accepts hiro://', () => expect(isValidDeepLinkUrl('hiro://')).toBe(true));
  it('accepts leather://', () => expect(isValidDeepLinkUrl('leather://')).toBe(true));
  it('rejects plain string', () => expect(isValidDeepLinkUrl('not-a-deep-link')).toBe(false));
  it('rejects https URL', () => expect(isValidDeepLinkUrl('https://example.com')).toBe(true));
});

describe('isValidWalletHomepage', () => {
  it('accepts https homepage', () => expect(isValidWalletHomepage('https://wallet.hiro.so')).toBe(true));
  it('rejects http homepage', () => expect(isValidWalletHomepage('http://wallet.hiro.so')).toBe(false));
});

describe('isValidDownloadUrl', () => {
  it('accepts https download URL', () => expect(isValidDownloadUrl('https://chrome.google.com/webstore/detail/test')).toBe(true));
  it('rejects http download URL', () => expect(isValidDownloadUrl('http://chrome.google.com/webstore/detail/test')).toBe(false));
});

describe('isValidMobileNativeUrl', () => {
  it('accepts hiro://', () => expect(isValidMobileNativeUrl('hiro://')).toBe(true));
  it('rejects plain string', () => expect(isValidMobileNativeUrl('hiro')).toBe(false));
});

describe('isValidMobileUniversalUrl', () => {
  it('accepts https universal link', () => expect(isValidMobileUniversalUrl('https://wallet.hiro.so/install')).toBe(true));
  it('rejects http universal link', () => expect(isValidMobileUniversalUrl('http://wallet.hiro.so/install')).toBe(false));
});

describe('getUrlValidationError', () => {
  it('returns null for valid URL', () => expect(getUrlValidationError('https://example.com', 'homepage')).toBeNull());
  it('returns error for empty string', () => expect(getUrlValidationError('', 'homepage')).not.toBeNull());
  it('returns error for invalid URL', () => expect(getUrlValidationError('not-a-url', 'homepage')).not.toBeNull());
});

describe('sanitizeUrl', () => {
  it('trims whitespace', () => expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com'));
  it('removes internal spaces', () => expect(sanitizeUrl('https://exam ple.com')).toBe('https://example.com'));
});

describe('normalizeUrl', () => {
  it('removes trailing slash from path', () => expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path'));
  it('keeps root slash', () => expect(normalizeUrl('https://example.com/')).toBe('https://example.com/'));
  it('returns sanitized string for invalid URL', () => expect(normalizeUrl('  not-a-url  ')).toBe('not-a-url'));
});

describe('extractDomain', () => {
  it('extracts hostname from https URL', () => expect(extractDomain('https://wallet.hiro.so/install')).toBe('wallet.hiro.so'));
  it('returns null for invalid URL', () => expect(extractDomain('not-a-url')).toBeNull());
});

describe('isSameDomain', () => {
  it('returns true for same domain', () => expect(isSameDomain('https://example.com/a', 'https://example.com/b')).toBe(true));
  it('returns false for different domains', () => expect(isSameDomain('https://example.com', 'https://other.com')).toBe(false));
  it('returns false when either URL is invalid', () => expect(isSameDomain('not-a-url', 'https://example.com')).toBe(false));
});
