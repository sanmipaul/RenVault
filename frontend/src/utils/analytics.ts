// utils/analytics.ts
import { getAnalyticsUrl } from '../config/api';

const ANALYTICS_OPT_OUT_KEY = 'analytics-opt-out';
const ANALYTICS_TIMEOUT = 3000;

export const trackAnalytics = async (event: string, data: Record<string, unknown>): Promise<void> => {
  const optOut = localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === 'true';
  if (optOut) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYTICS_TIMEOUT);
    await fetch(getAnalyticsUrl(event), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn('Analytics tracking timed out');
    } else {
      logger.warn('Analytics tracking failed:', error);
    }
  }
};
