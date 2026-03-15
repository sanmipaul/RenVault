// utils/analytics.ts
import { getAnalyticsUrl } from '../config/api';

const ANALYTICS_OPT_OUT_KEY = 'analytics-opt-out';

export const trackAnalytics = async (event: string, data: Record<string, unknown>): Promise<void> => {
  const optOut = localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === 'true';
  if (optOut) return;

  try {
    await fetch(getAnalyticsUrl(event), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};
