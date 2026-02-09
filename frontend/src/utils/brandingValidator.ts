export interface BrandingConfig {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
}

export const validateBrandingConfig = (config: BrandingConfig): boolean => {
  const urlValid = (url: string) => url.startsWith('/') || url.startsWith('http');
  const colorValid = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
  return !!(config.name && config.tagline && config.description && urlValid(config.logo) && colorValid(config.primaryColor) && colorValid(config.accentColor));
};
