import { useMemo } from 'react';
import { RewardEntry, RewardsHistoryService } from '../services/RewardsHistoryService';

export interface RewardsAnalyticsSummary {
  total: number;
  count: number;
  average: number;
  peak: RewardEntry | null;
  byType: Record<string, number>;
}

/**
 * Derive analytics from an array of reward entries (synchronous, no fetch).
 */
export function useRewardsAnalytics(entries: RewardEntry[]): RewardsAnalyticsSummary {
  return useMemo(() => {
    const service = RewardsHistoryService.getInstance();
    const total = service.sumRewards(entries);
    const count = entries.length;
    const average = count > 0 ? total / count : 0;
    const peak = entries.length > 0
      ? entries.reduce((m, e) => (e.amount > m.amount ? e : m), entries[0])
      : null;
    const byType: Record<string, number> = {};
    for (const e of entries) {
      byType[e.type] = (byType[e.type] || 0) + e.amount;
    }
    return { total, count, average, peak, byType };
  }, [entries]);
}

export default useRewardsAnalytics;
