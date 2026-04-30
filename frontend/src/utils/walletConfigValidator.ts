import { CustomWalletConfig, SupportedPlatform } from '../config/customWallets';
import { ValidationResult, WalletConfigError } from '../types/walletConfig';
import {
  isValidImageUrlStrict,
  isValidWalletHomepage,
  isValidDownloadUrl,
  isValidMobileNativeUrl,
  isValidMobileUniversalUrl,
  extractDomain,
} from './urlValidator';

const TRUSTED_STORE_DOMAINS = [
  'chrome.google.com',
  'addons.mozilla.org',
  'apps.apple.com',
  'microsoftedge.microsoft.com',
  'play.google.com',
];

const VALID_PLATFORMS: SupportedPlatform[] = ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android'];
const SUPPORTED_CHAINS = ['stacks:1', 'stacks:2147483648'];
const WALLET_ID_PATTERN = /^[a-z0-9-]+$/;
const MAX_WALLET_NAME_LENGTH = 64;
const MAX_WALLET_ID_LENGTH = 32;

export const validateWalletId = (id: string): WalletConfigError[] => {
  const errors: WalletConfigError[] = [];
  if (!id || id.trim() === '') {
    errors.push({ field: 'id', message: 'Wallet ID is required', severity: 'error' });
  } else if (id.length > MAX_WALLET_ID_LENGTH) {
    errors.push({ field: 'id', message: `Wallet ID must not exceed ${MAX_WALLET_ID_LENGTH} characters`, severity: 'error' });
  } else if (!WALLET_ID_PATTERN.test(id)) {
    errors.push({ field: 'id', message: 'Wallet ID must contain only lowercase letters, numbers, and hyphens', severity: 'error' });
  }
  return errors;
};

export const validateWalletName = (name: string): WalletConfigError[] => {
  const errors: WalletConfigError[] = [];
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Wallet name is required', severity: 'error' });
  } else if (name.length > MAX_WALLET_NAME_LENGTH) {
    errors.push({ field: 'name', message: `Wallet name must not exceed ${MAX_WALLET_NAME_LENGTH} characters`, severity: 'error' });
  }
  return errors;
};

const pushError = (errors: WalletConfigError[], field: string, message: string): void => {
  errors.push({ field, message, severity: 'error' });
};

const pushWarning = (warnings: WalletConfigError[], field: string, message: string): void => {
  warnings.push({ field, message, severity: 'warning' });
};

const validateChains = (
  chains: string[] | undefined,
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!chains || chains.length === 0) {
    pushWarning(warnings, 'chains', 'No chains configured; wallet may not connect to any network');
    return;
  }
  for (const chain of chains) {
    if (!SUPPORTED_CHAINS.includes(chain)) {
      pushWarning(warnings, 'chains', `Chain "${chain}" is not a recognised Stacks chain`);
    }
  }
};

const validateImageUrl = (
  imageUrl: string | undefined,
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!imageUrl || imageUrl.trim() === '') {
    pushError(errors, 'imageUrl', 'Wallet image URL is required');
    return;
  }
  if (!isValidImageUrlStrict(imageUrl)) {
    pushError(
      errors,
      'imageUrl',
      'Wallet image URL must be a valid relative path or HTTPS URL with a supported image extension (.svg, .png, .jpg, .jpeg, .webp, .gif)'
    );
  } else if (imageUrl.startsWith('http:')) {
    pushWarning(warnings, 'imageUrl', 'Wallet image URL should use HTTPS instead of HTTP');
  }
};

const validateHomepage = (
  homepage: string | undefined,
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!homepage) {
    pushWarning(warnings, 'homepage', 'Wallet homepage is not set; consider adding one for discoverability');
    return;
  }
  if (!isValidWalletHomepage(homepage)) {
    pushError(errors, 'homepage', 'Wallet homepage must be a valid HTTPS URL');
  }
};

const validateDownloadUrls = (
  downloadUrls: CustomWalletConfig['downloadUrls'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!downloadUrls) {
    pushWarning(warnings, 'downloadUrls', 'No download URLs configured; users may not be able to install the wallet');
    return;
  }
  const configuredPlatforms = VALID_PLATFORMS.filter(p => downloadUrls[p]);
  if (configuredPlatforms.length === 0) {
    pushWarning(warnings, 'downloadUrls', 'Download URLs object is empty; no install links will be shown');
  }
  for (const platform of VALID_PLATFORMS) {
    const url = downloadUrls[platform];
    if (url !== undefined && url !== '') {
        if (!isValidDownloadUrl(url)) {
          pushError(errors, `downloadUrls.${platform}`, `Download URL for ${platform} must be a valid HTTPS URL`);
        } else {
          const domain = extractDomain(url);
          const trusted = domain !== null && TRUSTED_STORE_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`));
          if (!trusted) {
            pushWarning(warnings, `downloadUrls.${platform}`, `Download URL for ${platform} is not from a recognised app store domain`);
          }
        }
      }
  }
};

const validateMobileConfig = (
  mobile: CustomWalletConfig['mobile'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!mobile) {
    pushError(errors, 'mobile', 'Mobile configuration is required');
    return;
  }
  if (mobile.native && !isValidMobileNativeUrl(mobile.native)) {
    pushError(errors, 'mobile.native', 'Mobile native URL must be a valid deep link (e.g. wallet://)');
  }
  if (mobile.universal && !isValidMobileUniversalUrl(mobile.universal)) {
    pushError(errors, 'mobile.universal', 'Mobile universal URL must be a valid HTTPS URL');
  }
  if (!mobile.native && !mobile.universal) {
    pushWarning(warnings, 'mobile', 'No mobile URL configured (native or universal)');
  }
};

const validateDesktopConfig = (
  desktop: CustomWalletConfig['desktop'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!desktop) {
    pushError(errors, 'desktop', 'Desktop configuration is required');
    return;
  }
  if (desktop.native && !isValidMobileNativeUrl(desktop.native)) {
    pushError(errors, 'desktop.native', 'Desktop native URL must be a valid deep link (e.g. wallet://)');
  }
  if (desktop.universal && !isValidMobileUniversalUrl(desktop.universal)) {
    pushError(errors, 'desktop.universal', 'Desktop universal URL must be a valid HTTPS URL');
  }
  if (!desktop.native && !desktop.universal) {
    pushWarning(warnings, 'desktop', 'No desktop URL configured (native or universal)');
  }
};

const validateSupportedPlatforms = (
  supportedPlatforms: CustomWalletConfig['supportedPlatforms'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!supportedPlatforms || supportedPlatforms.length === 0) {
    pushError(errors, 'supportedPlatforms', 'At least one platform must be supported');
    return;
  }
  for (const platform of supportedPlatforms) {
    if (!VALID_PLATFORMS.includes(platform)) {
      pushError(
        errors,
        'supportedPlatforms',
        `Unknown platform: "${platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`
      );
    }
  }
};

export const validateWalletConfig = (config: CustomWalletConfig): ValidationResult => {
  const errors: WalletConfigError[] = [];
  const warnings: WalletConfigError[] = [];

  errors.push(...validateWalletId(config.id));
  errors.push(...validateWalletName(config.name));

  validateImageUrl(config.imageUrl, errors, warnings);
  validateHomepage(config.homepage, errors, warnings);
  validateChains(config.chains, errors, warnings);
  validateDownloadUrls(config.downloadUrls, errors, warnings);
  validateMobileConfig(config.mobile, errors, warnings);
  validateDesktopConfig(config.desktop, errors, warnings);
  validateSupportedPlatforms(config.supportedPlatforms, errors, warnings);

  return { valid: errors.length === 0, errors, warnings };
};

export interface BatchValidationResult {
  walletId: string;
  result: ValidationResult;
}

export const validateWalletConfigBatch = (configs: CustomWalletConfig[]): BatchValidationResult[] => {
  return configs.map(config => ({
    walletId: config.id,
    result: validateWalletConfig(config),
  }));
};

export const hasValidationErrors = (result: ValidationResult): boolean => result.errors.length > 0;

export const hasValidationWarnings = (result: ValidationResult): boolean => result.warnings.length > 0;

export const getErrorFields = (result: ValidationResult): string[] =>
  result.errors.map(e => e.field);

export const getWarningFields = (result: ValidationResult): string[] =>
  result.warnings.map(w => w.field);
