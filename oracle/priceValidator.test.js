const { PriceValidator } = require('./priceValidator');

describe('PriceValidator', () => {
  let pv;

  beforeEach(() => {
    pv = new PriceValidator();
  });

  const freshData = (price = 100, sources = 3, deviation = 0.01) => ({
    price, sources, deviation, timestamp: Date.now()
  });

  describe('validatePrice', () => {
    test('returns valid:true for clean data', () => {
      const result = pv.validatePrice('STX', freshData());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('flags insufficient sources as error', () => {
      const result = pv.validatePrice('STX', freshData(100, 1));
      expect(result.errors.some(e => e.type === 'INSUFFICIENT_SOURCES')).toBe(true);
    });

    test('flags high deviation as warning', () => {
      const result = pv.validatePrice('STX', freshData(100, 3, 0.5));
      expect(result.warnings.some(w => w.type === 'HIGH_DEVIATION')).toBe(true);
    });

    test('flags stale data as error', () => {
      const stale = { ...freshData(), timestamp: Date.now() - 400000 };
      const result = pv.validatePrice('STX', stale);
      expect(result.errors.some(e => e.type === 'STALE_DATA')).toBe(true);
    });

    test('flags large price change as error', () => {
      pv.updatePriceHistory('STX', freshData(100));
      const result = pv.validatePrice('STX', freshData(200)); // 100% jump
      expect(result.errors.some(e => e.type === 'LARGE_PRICE_CHANGE')).toBe(true);
    });
  });

  describe('calculateVolatility', () => {
    test('returns 0 for single price', () => {
      expect(pv.calculateVolatility([100])).toBe(0);
    });

    test('returns 0 for zero prices without throwing', () => {
      expect(() => pv.calculateVolatility([0, 0, 100])).not.toThrow();
    });

    test('returns positive for volatile prices', () => {
      expect(pv.calculateVolatility([100, 200, 50, 300])).toBeGreaterThan(0);
    });
  });

  describe('calculateTrend', () => {
    test('returns 0 for single price', () => {
      expect(pv.calculateTrend([100])).toBe(0);
    });

    test('returns 0 when first price is 0', () => {
      expect(pv.calculateTrend([0, 100])).toBe(0);
    });

    test('returns positive for uptrend', () => {
      expect(pv.calculateTrend([100, 150])).toBeCloseTo(0.5, 10);
    });

    test('returns negative for downtrend', () => {
      expect(pv.calculateTrend([200, 100])).toBeCloseTo(-0.5, 10);
    });
  });

  describe('setThreshold', () => {
    test('updates a known threshold', () => {
      pv.setThreshold('maxDeviation', 0.2);
      expect(pv.thresholds.maxDeviation).toBe(0.2);
    });

    test('returns false for unknown threshold', () => {
      expect(pv.setThreshold('unknown', 0.5)).toBe(false);
    });

    test('throws if value is negative', () => {
      expect(() => pv.setThreshold('maxDeviation', -1)).toThrow('threshold value must be a non-negative number');
    });
  });

  describe('calculateScore', () => {
    test('returns 100 for no validations', () => {
      expect(pv.calculateScore([])).toBe(100);
    });

    test('deducts 30 per HIGH severity', () => {
      expect(pv.calculateScore([{ severity: 'HIGH' }, { severity: 'HIGH' }])).toBe(40);
    });

    test('floors at 0', () => {
      const highs = Array(5).fill({ severity: 'HIGH' });
      expect(pv.calculateScore(highs)).toBe(0);
    });
  });
});
