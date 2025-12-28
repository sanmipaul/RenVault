/**
 * Analytics Hooks
 * React hooks for analytics integration
 */

import { useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsEventType } from '../services/analytics-service';

/**
 * Hook to track page views
 */
export const usePageView = (pageName: string) => {
  useEffect(() => {
    analyticsService.trackPageView(pageName);
  }, [pageName]);
};

/**
 * Hook to track wallet connection
 */
export const useWalletConnectionTracking = () => {
  const trackConnectionStart = useCallback(() => {
    analyticsService.trackEvent(AnalyticsEventType.WALLET_CONNECTION_INITIATED);
  }, []);

  const trackConnectionSuccess = useCallback((walletType: string, connectionTime: number) => {
    analyticsService.trackWalletConnection({
      walletType,
      connectionTime,
      success: true,
    });
  }, []);

  const trackConnectionError = useCallback(
    (walletType: string | undefined, errorMessage: string) => {
      analyticsService.trackWalletConnection({
        walletType,
        success: false,
        errorMessage,
      });
    },
    []
  );

  return {
    trackConnectionStart,
    trackConnectionSuccess,
    trackConnectionError,
  };
};

/**
 * Hook to track session
 */
export const useSessionTracking = (walletAddress?: string) => {
  useEffect(() => {
    analyticsService.trackSessionStart(walletAddress);

    return () => {
      analyticsService.trackSessionEnd();
    };
  }, [walletAddress]);
};

/**
 * Hook to track transactions
 */
export const useTransactionTracking = () => {
  const trackTransactionInitiated = useCallback((type: string) => {
    if (type === 'deposit') {
      analyticsService.trackEvent(AnalyticsEventType.DEPOSIT_INITIATED);
    } else if (type === 'withdrawal') {
      analyticsService.trackEvent(AnalyticsEventType.WITHDRAWAL_INITIATED);
    }
  }, []);

  const trackTransactionSigned = useCallback((type: string) => {
    if (type === 'deposit') {
      analyticsService.trackEvent(AnalyticsEventType.DEPOSIT_SIGNED);
    } else if (type === 'withdrawal') {
      analyticsService.trackEvent(AnalyticsEventType.WITHDRAWAL_SIGNED);
    }
  }, []);

  const trackTransactionCompleted = useCallback(
    (type: string, amount: number, network: string, duration: number) => {
      analyticsService.trackTransaction({
        type,
        amount,
        network,
        success: true,
        duration,
      });
    },
    []
  );

  const trackTransactionError = useCallback(
    (type: string, errorMessage: string) => {
      analyticsService.trackError('transaction_error', errorMessage, {
        transaction_type: type,
      });
    },
    []
  );

  return {
    trackTransactionInitiated,
    trackTransactionSigned,
    trackTransactionCompleted,
    trackTransactionError,
  };
};

/**
 * Hook to track feature adoption
 */
export const useFeatureTracking = () => {
  const trackFeature = useCallback((featureName: string, metadata?: Record<string, any>) => {
    analyticsService.trackFeatureAdoption(featureName, metadata);
  }, []);

  return { trackFeature };
};

/**
 * Hook to manage analytics opt-out
 */
export const useAnalyticsOptOut = () => {
  const isOptedOut = analyticsService.isUserOptedOut();

  const setOptOut = useCallback((optOut: boolean) => {
    analyticsService.setOptOut(optOut);
  }, []);

  return { isOptedOut, setOptOut };
};

/**
 * Hook to get current session info
 */
export const useAnalyticsSession = () => {
  const sessionId = analyticsService.getSessionId();
  const actionCount = analyticsService.getActionCount();

  return { sessionId, actionCount };
};

export default {
  usePageView,
  useWalletConnectionTracking,
  useSessionTracking,
  useTransactionTracking,
  useFeatureTracking,
  useAnalyticsOptOut,
  useAnalyticsSession,
};
