import { useState, useEffect, useCallback } from 'react';
import { RewardsHistoryService, RewardEntry, RewardsPage } from '../services/RewardsHistoryService';
import { logger } from '../utils/logger';

export interface UseRewardsHistoryResult {
  entries: RewardEntry[];
  page: RewardsPage | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook that loads paginated reward history for a staker address.
 * @param staker   - wallet address to query
 * @param pageNum  - 1-based page number
 * @param pageSize - entries per page
 */
export function useRewardsHistory(
  staker: string | null,
  pageNum = 1,
  pageSize = 20
): UseRewardsHistoryResult {
  const [entries, setEntries] = useState<RewardEntry[]>([]);
  const [page, setPage] = useState<RewardsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!staker) {
      setEntries([]);
      setPage(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const service = RewardsHistoryService.getInstance();
    service
      .fetchPage(staker, pageNum, pageSize)
      .then(result => {
        if (cancelled) return;
        setPage(result);
        setEntries(result.entries);
        logger.debug(`useRewardsHistory: loaded page ${pageNum} for ${staker}`);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        logger.error('useRewardsHistory fetch failed', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [staker, pageNum, pageSize, tick]);

  return { entries, page, loading, error, refresh };
}

export default useRewardsHistory;
