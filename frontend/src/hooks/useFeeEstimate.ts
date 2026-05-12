// useFeeEstimate.ts
// React hook for accessing dynamic fee estimates in components

import { useState, useEffect, useCallback } from 'react';
import { TransactionService } from '../services/transaction/TransactionService';
import { FeeEstimate } from '../services/transaction/TransactionFeeEstimator';

export interface UseFeeEstimateResult {
  estimate: FeeEstimate | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFeeEstimate(): UseFeeEstimateResult {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const service = TransactionService.getInstance();
      setEstimate(service.getFeeEstimate());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { estimate, loading, error, refresh };
}
