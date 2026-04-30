export interface WalletConfigValidation {
  isValid: boolean;
  errors: string[];
}

export interface WalletConfigError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: WalletConfigErrorCode;
}

export type WalletConfigErrorCode =
  | 'REQUIRED'
  | 'INVALID_URL'
  | 'INVALID_HTTPS_URL'
  | 'INVALID_IMAGE_URL'
  | 'INVALID_DEEP_LINK'
  | 'INVALID_DOWNLOAD_URL'
  | 'UNSUPPORTED_PLATFORM'
  | 'MISSING_PLATFORM';

export type ValidationResult = {
  valid: boolean;
  errors: WalletConfigError[];
  warnings: WalletConfigError[];
};

export interface UrlValidationOptions {
  requireHttps?: boolean;
  allowRelative?: boolean;
  allowDeepLink?: boolean;
  strictImageExtension?: boolean;
}
