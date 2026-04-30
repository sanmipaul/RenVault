const RouteOptimizer = require('./routeOptimizer');

describe('RouteOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new RouteOptimizer();
  });

  // addPool
  describe('addPool', () => {
    test('adds a pool successfully', () => {
      optimizer.addPool('pool1', 'STX', 'USDC', 10000, 5000);
      expect(optimizer.pools.has('pool1')).toBe(true);
    });

    test('throws if poolId is missing', () => {
      expect(() => optimizer.addPool('', 'STX', 'USDC', 10000, 5000)).toThrow('poolId is required');
    });

    test('throws if tokens are missing', () => {
      expect(() => optimizer.addPool('pool1', '', 'USDC', 10000, 5000)).toThrow('tokenA and tokenB are required');
    });

    test('throws if tokenA equals tokenB', () => {
      expect(() => optimizer.addPool('pool1', 'STX', 'STX', 10000, 5000)).toThrow('tokenA and tokenB must be different');
    });

    test('throws if reserveA is not positive', () => {
      expect(() => optimizer.addPool('pool1', 'STX', 'USDC', 0, 5000)).toThrow('reserveA must be a positive number');
    });

    test('throws if reserveB is not positive', () => {
      expect(() => optimizer.addPool('pool1', 'STX', 'USDC', 10000, -1)).toThrow('reserveB must be a positive number');
    });
  });

  // findDirectRoute
  describe('findDirectRoute', () => {
    beforeEach(() => {
      optimizer.addPool('pool1', 'STX', 'USDC', 10000, 5000);
    });

    test('finds a direct route', () => {
      expect(optimizer.findDirectRoute('STX', 'USDC')).toEqual(['pool1']);
    });

    test('finds a direct route in reverse direction', () => {
      expect(optimizer.findDirectRoute('USDC', 'STX')).toEqual(['pool1']);
    });

    test('returns null when no direct route exists', () => {
      expect(optimizer.findDirectRoute('STX', 'BTC')).toBeNull();
    });
  });

  // findBestRoute
  describe('findBestRoute', () => {
    beforeEach(() => {
      optimizer.addPool('pool1', 'STX', 'USDC', 10000, 5000);
      optimizer.addPool('pool2', 'USDC', 'BTC', 5000, 1);
    });

    test('returns direct route when available', () => {
      const result = optimizer.findBestRoute('STX', 'USDC', 100);
      expect(result).not.toBeNull();
      expect(result.hops).toBe(1);
    });

    test('returns 2-hop route when no direct route', () => {
      const result = optimizer.findBestRoute('STX', 'BTC', 100);
      expect(result).not.toBeNull();
      expect(result.hops).toBe(2);
    });

    test('returns null when no route exists', () => {
      expect(optimizer.findBestRoute('STX', 'DOGE', 100)).toBeNull();
    });
  });

  // estimateOutput
  describe('estimateOutput', () => {
    beforeEach(() => {
      optimizer.addPool('pool1', 'STX', 'USDC', 10000, 5000);
    });

    test('returns a positive estimate for a valid route', () => {
      const out = optimizer.estimateOutput(['pool1'], 100);
      expect(out).toBeGreaterThan(0);
    });

    test('returns 0 for an unknown pool in the route', () => {
      expect(optimizer.estimateOutput(['unknown'], 100)).toBe(0);
    });
  });
});
