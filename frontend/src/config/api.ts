const getApiBaseUrl = (service: string, defaultPort: string): string => {
  const envKey = `REACT_APP_${service.toUpperCase()}_API_URL`;
  const envValue = process.env[envKey];

  if (envValue) {
    return envValue;
  }

  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_BASE_URL || '';
  }

  return `http://localhost:${defaultPort}`;
};

export const API_CONFIG = {
  analytics: {
    baseUrl: getApiBaseUrl('analytics', '3001'),
  },
  notifications: {
    baseUrl: getApiBaseUrl('notifications', '3003'),
  },
  sponsorship: {
    baseUrl: getApiBaseUrl('sponsorship', '3003'),
  },
  core: {
    baseUrl: getApiBaseUrl('core', '3000'),
  },
} as const;

export const getAnalyticsUrl = (endpoint: string): string => {
  return `${API_CONFIG.analytics.baseUrl}/api/${endpoint}`;
};

export const getNotificationsUrl = (endpoint: string): string => {
  return `${API_CONFIG.notifications.baseUrl}/api/notifications/${endpoint}`;
};

export const getSponsorshipUrl = (endpoint: string): string => {
  return `${API_CONFIG.sponsorship.baseUrl}/api/sponsorship/${endpoint}`;
};

export const getCoreApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.core.baseUrl}/api/${endpoint}`;
};
