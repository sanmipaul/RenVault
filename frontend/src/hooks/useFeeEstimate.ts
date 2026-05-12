// useFeeEstimate.ts
// React hook for accessing dynamic fee estimates in components

import { useState, useEffect, useCallback, useRef } from 'react';
import { TransactionService } from '../services/transaction/TransactionService';
import { FeeEstimate } from '../services/transaction/TransactionFeeEstimator';

export interface UseFeeEstimateResult {
  estimate: FeeEstimate | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  cacheStats: { hits: number; misses: number; hitRate: number } | null;
}

export function useFeeEstimate(autoRefreshMs?: number): UseFeeEstimateResult {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<{ hits: number; misses: number; hitRate: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const service = TransactionService.getInstance();
      setEstimate(service.getFeeEstimate());
      setCacheStats(service.getFeeCacheStats());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (autoRefreshMs && autoRefreshMs > 0) {
      intervalRef.current = setInterval(refresh, autoRefreshMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, autoRefreshMs]);

  return { estimate, loading, error, refresh, cacheStats };
}
