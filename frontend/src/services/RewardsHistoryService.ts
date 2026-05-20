import { logger } from '../utils/logger';

export interface RewardEntry {
  epoch: number;
  staker: string;
  amount: number;
  type: 'distribution' | 'claim' | 'bonus';
  timestamp: number;
}

export interface RewardsPage {
  entries: RewardEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CACHE_TTL_MS = 60_000; // 1 minute

export class RewardsHistoryService {
  private static instance: RewardsHistoryService;
  private cache: Map<string, { data: RewardEntry[]; cachedAt: number }> = new Map();

  static getInstance(): RewardsHistoryService {
    if (!RewardsHistoryService.instance) {
      RewardsHistoryService.instance = new RewardsHistoryService();
    }
    return RewardsHistoryService.instance;
  }

  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && Date.now() - entry.cachedAt < CACHE_TTL_MS;
  }

  /**
   * Fetch all reward entries for a staker, using cache when fresh.
   */
  async fetchHistory(staker: string): Promise<RewardEntry[]> {
    if (!staker) throw new Error('fetchHistory: staker address is required');

    const cacheKey = `history:${staker}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // In production this would call a backend API; returning mock data here.
      const data: RewardEntry[] = [];
      this.cache.set(cacheKey, { data, cachedAt: Date.now() });
      logger.debug(`Fetched rewards history for ${staker}`);
      return data;
    } catch (err) {
      logger.error('fetchHistory failed', err);
      throw err;
    }
  }

  /** Invalidate all cached entries. */
  clearCache(): void {
    this.cache.clear();
    logger.debug('RewardsHistoryService cache cleared');
  }

  /**
   * Return a paginated slice of reward history.
   * @param staker   - wallet address
   * @param page     - 1-based page index
   * @param pageSize - entries per page (clamped 1–200)
   */
  async fetchPage(staker: string, page = 1, pageSize = 20): Promise<RewardsPage> {
    const clampedSize = Math.min(200, Math.max(1, pageSize));
    const all = await this.fetchHistory(staker);
    const totalPages = Math.max(1, Math.ceil(all.length / clampedSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * clampedSize;
    return {
      entries: all.slice(start, start + clampedSize),
      total: all.length,
      page: safePage,
      pageSize: clampedSize,
      totalPages,
    };
  }

  /**
   * Sort a history array by a given field.
   */
  sortHistory(
    entries: RewardEntry[],
    field: keyof RewardEntry = 'timestamp',
    direction: 'asc' | 'desc' = 'desc'
  ): RewardEntry[] {
    return [...entries].sort((a, b) => {
      const av = a[field] as number;
      const bv = b[field] as number;
      return direction === 'asc' ? av - bv : bv - av;
    });
  }

  /**
   * Compute total rewards from an array of entries.
   */
  sumRewards(entries: RewardEntry[]): number {
    return entries.reduce((s, e) => s + e.amount, 0);
  }
}

export default RewardsHistoryService;
