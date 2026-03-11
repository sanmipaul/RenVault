const PoolAnalytics = require('./poolAnalytics');

describe('PoolAnalytics', () => {
  let analytics;

  beforeEach(() => {
    analytics = new PoolAnalytics();
  });

  // recordSwap
  describe('recordSwap', () => {
    test('records a swap and updates metrics', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      const m = analytics.getPoolMetrics('pool1');
      expect(m.swapCount).toBe(1);
      expect(m.totalVolume).toBe(1000);
      expect(m.totalFees).toBe(3);
    });

    test('accumulates volume and fees across multiple swaps', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      analytics.recordSwap('pool1', 'STX', 'USDC', 500, 245, 1.5);
      const m = analytics.getPoolMetrics('pool1');
      expect(m.swapCount).toBe(2);
      expect(m.totalVolume).toBe(1500);
    });

    test('throws if poolId is missing', () => {
      expect(() => analytics.recordSwap('', 'STX', 'USDC', 1000, 490, 3)).toThrow('poolId is required');
    });

    test('throws if amountIn is not positive', () => {
      expect(() => analytics.recordSwap('pool1', 'STX', 'USDC', 0, 490, 3)).toThrow('amountIn must be a positive number');
    });

    test('throws if amountOut is negative', () => {
      expect(() => analytics.recordSwap('pool1', 'STX', 'USDC', 1000, -1, 3)).toThrow('amountOut must be a non-negative number');
    });

    test('throws if fee is negative', () => {
      expect(() => analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, -1)).toThrow('fee must be a non-negative number');
    });
  });

  // getPoolMetrics
  describe('getPoolMetrics', () => {
    test('returns null for unknown pool', () => {
      expect(analytics.getPoolMetrics('unknown')).toBeNull();
    });

    test('returns correct avgSwapSize', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      analytics.recordSwap('pool1', 'STX', 'USDC', 2000, 980, 6);
      expect(analytics.getPoolMetrics('pool1').avgSwapSize).toBe(1500);
    });

    test('returns correct feeRate', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      expect(analytics.getPoolMetrics('pool1').feeRate).toBeCloseTo(0.3, 5);
    });

    test('dailyVolume includes recent swaps', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      expect(analytics.getPoolMetrics('pool1').dailyVolume).toBe(1000);
    });
  });

  // getTopPools
  describe('getTopPools', () => {
    test('returns pools sorted by totalVolume descending', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 500, 245, 1.5);
      analytics.recordSwap('pool2', 'STX', 'USDC', 2000, 980, 6);
      const top = analytics.getTopPools(2);
      expect(top[0].poolId).toBe('pool2');
      expect(top[1].poolId).toBe('pool1');
    });

    test('respects the limit parameter', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 500, 245, 1.5);
      analytics.recordSwap('pool2', 'STX', 'USDC', 2000, 980, 6);
      analytics.recordSwap('pool3', 'STX', 'USDC', 1000, 490, 3);
      expect(analytics.getTopPools(2)).toHaveLength(2);
    });
  });

  // getVolumeHistory
  describe('getVolumeHistory', () => {
    test('returns recent swaps within the time window', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 1000, 490, 3);
      const history = analytics.getVolumeHistory('pool1', 1);
      expect(history.length).toBe(1);
      expect(history[0].volume).toBe(1000);
    });

    test('returns empty array for unknown pool', () => {
      expect(analytics.getVolumeHistory('unknown')).toHaveLength(0);
    });

    test('falls back to 24h window for invalid hours', () => {
      analytics.recordSwap('pool1', 'STX', 'USDC', 100, 49, 0.3);
      expect(() => analytics.getVolumeHistory('pool1', -5)).not.toThrow();
    });
  });
});
