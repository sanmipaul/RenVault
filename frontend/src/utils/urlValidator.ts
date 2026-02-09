export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
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

export const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/\s+/g, '');
};
