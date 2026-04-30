import { CustomWalletConfig, SupportedPlatform } from '../config/customWallets';
import { ValidationResult, WalletConfigError } from '../types/walletConfig';
import {
  isValidImageUrlStrict,
  isValidWalletHomepage,
  isValidDownloadUrl,
  isValidMobileNativeUrl,
  isValidMobileUniversalUrl,
} from './urlValidator';

const VALID_PLATFORMS: SupportedPlatform[] = ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android'];

const pushError = (
  errors: WalletConfigError[],
  field: string,
  message: string
): void => {
  errors.push({ field, message, severity: 'error' });
};

const pushWarning = (
  warnings: WalletConfigError[],
  field: string,
  message: string
): void => {
  warnings.push({ field, message, severity: 'warning' });
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
  if (!homepage) return;
  if (!isValidWalletHomepage(homepage)) {
    pushError(errors, 'homepage', 'Wallet homepage must be a valid HTTPS URL');
  }
};

const validateDownloadUrls = (
  downloadUrls: CustomWalletConfig['downloadUrls'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!downloadUrls) return;
  for (const platform of VALID_PLATFORMS) {
    const url = downloadUrls[platform];
    if (url !== undefined && url !== '') {
      if (!isValidDownloadUrl(url)) {
        pushError(
          errors,
          `downloadUrls.${platform}`,
          `Download URL for ${platform} must be a valid HTTPS URL`
        );
      }
    }
  }
};

const validateMobileConfig = (
  mobile: CustomWalletConfig['mobile'],
  errors: WalletConfigError[],
  warnings: WalletConfigError[]
): void => {
  if (!mobile) return;
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
  if (!desktop) return;
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

  if (!config.id || config.id.trim() === '') {
    pushError(errors, 'id', 'Wallet ID is required');
  } else if (!/^[a-z0-9-]+$/.test(config.id)) {
    pushError(errors, 'id', 'Wallet ID must contain only lowercase letters, numbers, and hyphens');
  }

  if (!config.name || config.name.trim() === '') {
    pushError(errors, 'name', 'Wallet name is required');
  }

  validateImageUrl(config.imageUrl, errors, warnings);
  validateHomepage(config.homepage, errors, warnings);
  validateDownloadUrls(config.downloadUrls, errors, warnings);
  validateMobileConfig(config.mobile, errors, warnings);
  validateDesktopConfig(config.desktop, errors, warnings);
  validateSupportedPlatforms(config.supportedPlatforms, errors, warnings);

  return { valid: errors.length === 0, errors, warnings };
};
