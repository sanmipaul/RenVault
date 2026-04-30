import { isValidImageUrlStrict, isValidHttpsUrl } from './urlValidator';

export interface BrandingConfig {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  termsUrl?: string;
  privacyUrl?: string;
  supportUrl?: string;
}

export interface BrandingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const isValidHexColor = (color: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(color);

export const validateBrandingConfig = (config: BrandingConfig): boolean => {
  return validateBrandingConfigDetailed(config).valid;
};

export const validateBrandingConfigDetailed = (config: BrandingConfig): BrandingValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.name || config.name.trim() === '') errors.push('Branding name is required');
  if (!config.tagline || config.tagline.trim() === '') errors.push('Branding tagline is required');
  if (!config.description || config.description.trim() === '') errors.push('Branding description is required');

  if (!config.logo || config.logo.trim() === '') {
    errors.push('Branding logo is required');
  } else if (!isValidImageUrlStrict(config.logo)) {
    errors.push('Branding logo must be a valid relative path or HTTPS URL with a supported image extension');
  }

  if (!isValidHexColor(config.primaryColor)) errors.push('Primary color must be a valid 6-digit hex color (e.g. #4a80f5)');
  if (!isValidHexColor(config.accentColor)) errors.push('Accent color must be a valid 6-digit hex color (e.g. #10b981)');

  if (config.termsUrl && !isValidHttpsUrl(config.termsUrl)) errors.push('Terms URL must be a valid HTTPS URL');
  if (config.privacyUrl && !isValidHttpsUrl(config.privacyUrl)) errors.push('Privacy URL must be a valid HTTPS URL');
  if (config.supportUrl && !isValidHttpsUrl(config.supportUrl)) errors.push('Support URL must be a valid HTTPS URL');

  if (!config.termsUrl) warnings.push('Terms URL is not set');
  if (!config.privacyUrl) warnings.push('Privacy URL is not set');

  return { valid: errors.length === 0, errors, warnings };
};
