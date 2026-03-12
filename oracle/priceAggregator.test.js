const { PriceAggregator } = require('./priceAggregator');

describe('PriceAggregator', () => {
  let agg;

  beforeEach(() => {
    agg = new PriceAggregator();
  });

  describe('addSource', () => {
    test('adds a valid source', () => {
      agg.addSource('test', async () => 100, 1);
      expect(agg.sources.has('test')).toBe(true);
    });

    test('throws if name is missing', () => {
      expect(() => agg.addSource('', async () => 100, 1)).toThrow('source name is required');
    });

    test('throws if fetcher is not a function', () => {
      expect(() => agg.addSource('test', 'not-a-fn', 1)).toThrow('fetcher must be a function');
    });

    test('throws if weight is not positive', () => {
      expect(() => agg.addSource('test', async () => 100, 0)).toThrow('weight must be a positive number');
      expect(() => agg.addSource('test', async () => 100, -1)).toThrow();
    });
  });

  describe('fetchPrice', () => {
    test('returns weighted average from active sources', async () => {
      agg.addSource('s1', async () => 100, 1);
      agg.addSource('s2', async () => 200, 1);
      const result = await agg.fetchPrice('STX');
      expect(result.price).toBe(150);
      expect(result.sources).toBe(2);
    });

    test('throws if no sources are active', async () => {
      await expect(agg.fetchPrice('STX')).rejects.toThrow('No price sources available');
    });

    test('skips failing sources and uses remaining', async () => {
      agg.addSource('good', async () => 100, 1);
      agg.addSource('bad', async () => { throw new Error('API error'); }, 1);
      const result = await agg.fetchPrice('STX');
      expect(result.price).toBe(100);
      expect(result.sources).toBe(1);
    });
  });

  describe('calculateWeightedAverage', () => {
    test('weights sources correctly', () => {
      const results = [
        { price: 100, weight: 1 },
        { price: 300, weight: 3 }
      ];
      const { price } = agg.calculateWeightedAverage(results);
      expect(price).toBe(250); // (100*1 + 300*3) / 4
    });
  });

  describe('calculateDeviation', () => {
    test('returns 0 for a single result', () => {
      expect(agg.calculateDeviation([{ price: 100 }], 100)).toBe(0);
    });

    test('returns 0 when average is 0', () => {
      const results = [{ price: 0 }, { price: 0 }];
      expect(agg.calculateDeviation(results, 0)).toBe(0);
    });

    test('returns positive deviation for spread prices', () => {
      const results = [{ price: 90 }, { price: 110 }];
      expect(agg.calculateDeviation(results, 100)).toBeGreaterThan(0);
    });
  });

  describe('isStale', () => {
    test('returns true for unknown symbol', () => {
      expect(agg.isStale('UNKNOWN')).toBe(true);
    });

    test('returns false for a fresh price', async () => {
      agg.addSource('s', async () => 100, 1);
      await agg.fetchPrice('STX');
      agg.prices.set('STX', { price: 100, timestamp: Date.now() });
      expect(agg.isStale('STX')).toBe(false);
    });
  });
});
