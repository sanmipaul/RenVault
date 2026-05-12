// useFeeEstimate.ts
// React hook for accessing dynamic fee estimates in components

import { useState, useEffect, useCallback } from 'react';
import { TransactionService } from '../services/transaction/TransactionService';
import { FeeEstimate } from '../services/transaction/TransactionFeeEstimator';

export interface UseFeeEstimateResult {
  estimate: FeeEstimate | null;
  loading: boolean;
  refresh: () => void;
}

export function useFeeEstimate(): UseFeeEstimateResult {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const service = TransactionService.getInstance();
      setEstimate(service.getFeeEstimate());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { estimate, loading, refresh };
}
