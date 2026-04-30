const PriceOracle = require('./priceOracle');

describe('PriceOracle', () => {
  let oracle;

  beforeEach(() => {
    oracle = new PriceOracle();
  });

  // setPrice
  describe('setPrice', () => {
    test('stores a valid price', () => {
      oracle.setPrice('ETH', 2000);
      expect(oracle.getPrice('ETH')).toBe(2000);
    });

    test('overwrites an existing price', () => {
      oracle.setPrice('ETH', 2000);
      oracle.setPrice('ETH', 3000);
      expect(oracle.getPrice('ETH')).toBe(3000);
    });

    test('throws if token is missing or not a string', () => {
      expect(() => oracle.setPrice('', 2000)).toThrow('token identifier is required');
      expect(() => oracle.setPrice(null, 2000)).toThrow();
    });

    test('throws if price is not a positive number', () => {
      expect(() => oracle.setPrice('ETH', 0)).toThrow('price must be a positive number');
      expect(() => oracle.setPrice('ETH', -100)).toThrow();
      expect(() => oracle.setPrice('ETH', 'high')).toThrow();
    });
  });

  // getPrice
  describe('getPrice', () => {
    test('returns null for unknown token', () => {
      expect(oracle.getPrice('UNKNOWN')).toBeNull();
    });

    test('returns null for a stale price', () => {
      oracle.setPrice('ETH', 2000);
      // Manually backdate timestamp beyond stale threshold
      oracle.prices.get('ETH').timestamp = Date.now() - oracle.updateInterval * 6;
      expect(oracle.getPrice('ETH')).toBeNull();
    });

    test('returns price when fresh', () => {
      oracle.setPrice('BTC', 50000);
      expect(oracle.getPrice('BTC')).toBe(50000);
    });
  });

  // calculatePoolPrice
  describe('calculatePoolPrice', () => {
    test('returns reserveB / reserveA', () => {
      expect(oracle.calculatePoolPrice('pool1', 100, 200)).toBeCloseTo(2, 10);
    });

    test('throws if reserveA is zero or negative', () => {
      expect(() => oracle.calculatePoolPrice('pool1', 0, 200)).toThrow('reserveA must be a positive number');
      expect(() => oracle.calculatePoolPrice('pool1', -1, 200)).toThrow();
    });

    test('throws if reserveB is negative', () => {
      expect(() => oracle.calculatePoolPrice('pool1', 100, -1)).toThrow('reserveB must be a non-negative number');
    });

    test('returns 0 when reserveB is 0', () => {
      expect(oracle.calculatePoolPrice('pool1', 100, 0)).toBe(0);
    });
  });

  // isPriceStale
  describe('isPriceStale', () => {
    test('returns true for unknown token', () => {
      expect(oracle.isPriceStale('UNKNOWN')).toBe(true);
    });

    test('returns false for a fresh price', () => {
      oracle.setPrice('ETH', 2000);
      expect(oracle.isPriceStale('ETH')).toBe(false);
    });

    test('returns true for a stale price', () => {
      oracle.setPrice('ETH', 2000);
      oracle.prices.get('ETH').timestamp = Date.now() - oracle.updateInterval * 6;
      expect(oracle.isPriceStale('ETH')).toBe(true);
    });
  });
});
