import { RewardsHistoryService, RewardEntry } from '../RewardsHistoryService';

jest.mock('../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const STAKER = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';

function makeEntries(n: number): RewardEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    epoch: i + 1,
    staker: STAKER,
    amount: (i + 1) * 100,
    type: 'distribution' as const,
    timestamp: Date.now() - i * 1000,
  }));
}

describe('RewardsHistoryService', () => {
  let service: RewardsHistoryService;

  beforeEach(() => {
    // Reset singleton for a clean slate
    (RewardsHistoryService as any).instance = undefined;
    service = RewardsHistoryService.getInstance();
  });

  // ─── fetchHistory ─────────────────────────────────────────────────────────

  describe('fetchHistory', () => {
    it('throws for empty staker', async () => {
      await expect(service.fetchHistory('')).rejects.toThrow('staker address is required');
    });

    it('returns an array for a valid staker', async () => {
      const result = await service.fetchHistory(STAKER);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns cached data on second call', async () => {
      await service.fetchHistory(STAKER);
      // Spy on cache set to confirm second call uses cache
      const spy = jest.spyOn(service as any, 'isCacheValid');
      await service.fetchHistory(STAKER);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ─── clearCache ───────────────────────────────────────────────────────────

  describe('clearCache', () => {
    it('clears without throwing', async () => {
      await service.fetchHistory(STAKER);
      expect(() => service.clearCache()).not.toThrow();
    });
  });

  // ─── fetchPage ────────────────────────────────────────────────────────────

  describe('fetchPage', () => {
    it('returns page 1 with correct shape', async () => {
      const page = await service.fetchPage(STAKER, 1, 20);
      expect(page).toHaveProperty('entries');
      expect(page).toHaveProperty('total');
      expect(page).toHaveProperty('page', 1);
      expect(page).toHaveProperty('pageSize');
      expect(page).toHaveProperty('totalPages');
    });

    it('clamps pageSize to max 200', async () => {
      const page = await service.fetchPage(STAKER, 1, 9999);
      expect(page.pageSize).toBe(200);
    });

    it('clamps pageSize to min 1', async () => {
      const page = await service.fetchPage(STAKER, 1, 0);
      expect(page.pageSize).toBe(1);
    });

    it('clamps page to valid range', async () => {
      const page = await service.fetchPage(STAKER, -5, 20);
      expect(page.page).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── sortHistory ──────────────────────────────────────────────────────────

  describe('sortHistory', () => {
    const entries = makeEntries(3);

    it('sorts descending by timestamp by default', () => {
      const sorted = service.sortHistory(entries);
      expect(sorted[0].timestamp).toBeGreaterThanOrEqual(sorted[1].timestamp);
    });

    it('sorts ascending when specified', () => {
      const sorted = service.sortHistory(entries, 'timestamp', 'asc');
      expect(sorted[0].timestamp).toBeLessThanOrEqual(sorted[1].timestamp);
    });

    it('sorts by amount', () => {
      const sorted = service.sortHistory(entries, 'amount', 'asc');
      expect(sorted[0].amount).toBeLessThanOrEqual(sorted[1].amount);
    });

    it('does not mutate the input array', () => {
      const copy = [...entries];
      service.sortHistory(entries, 'amount', 'asc');
      expect(entries[0].amount).toBe(copy[0].amount);
    });
  });

  // ─── sumRewards ───────────────────────────────────────────────────────────

  describe('sumRewards', () => {
    it('returns correct total', () => {
      const entries = makeEntries(3); // amounts: 100, 200, 300
      expect(service.sumRewards(entries)).toBe(600);
    });

    it('returns 0 for empty array', () => {
      expect(service.sumRewards([])).toBe(0);
    });
  });
});
