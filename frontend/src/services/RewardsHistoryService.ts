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
}

export default RewardsHistoryService;
