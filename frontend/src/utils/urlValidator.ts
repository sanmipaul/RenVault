const ALLOWED_IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
const ALLOWED_IMAGE_MIME_PREFIXES = ['image/'];
const DEEP_LINK_PATTERN = /^[a-z][a-z0-9+\-.]*:\/\//i;

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidHttpsUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidHttpOrHttpsUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const isValidRelativeUrl = (url: string): boolean => {
  return url.startsWith('/') && !url.includes('//');
};

export const isValidImageUrl = (url: string): boolean => {
  return isValidUrl(url) || isValidRelativeUrl(url);
};

export const isValidImageUrlStrict = (url: string): boolean => {
  if (isValidRelativeUrl(url)) {
    const lower = url.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
  }
  if (isValidHttpOrHttpsUrl(url)) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.toLowerCase();
      return ALLOWED_IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }
  return false;
};

export const isValidDeepLinkUrl = (url: string): boolean => {
  return DEEP_LINK_PATTERN.test(url);
};

export const isValidWalletHomepage = (url: string): boolean => {
  return isValidHttpsUrl(url);
};

export const isValidDownloadUrl = (url: string): boolean => {
  return isValidHttpsUrl(url);
};

export const isValidMobileUniversalUrl = (url: string): boolean => {
  return isValidHttpsUrl(url);
};

export const isValidMobileNativeUrl = (url: string): boolean => {
  return isValidDeepLinkUrl(url);
};

export const getUrlValidationError = (url: string, fieldName: string): string | null => {
  if (!url || url.trim() === '') return `${fieldName} is required`;
  if (!isValidUrl(url) && !isValidRelativeUrl(url)) return `${fieldName} is not a valid URL`;
  return null;
};

export const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/\s+/g, '');
};
