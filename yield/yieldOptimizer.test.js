const { YieldOptimizer } = require('./yieldOptimizer');

describe('YieldOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new YieldOptimizer();
  });

  // addStrategy
  describe('addStrategy', () => {
    test('adds a valid strategy', () => {
      optimizer.addStrategy('myStrat', { apy: 0.1, risk: 'low', minAmount: 100 });
      expect(optimizer.strategies.has('myStrat')).toBe(true);
    });

    test('throws if name is missing', () => {
      expect(() => optimizer.addStrategy('', { apy: 0.1, risk: 'low', minAmount: 100 })).toThrow('strategy name is required');
    });

    test('throws if config.apy is negative', () => {
      expect(() => optimizer.addStrategy('s', { apy: -1, risk: 'low', minAmount: 100 })).toThrow('config.apy');
    });

    test('throws if config.minAmount is negative', () => {
      expect(() => optimizer.addStrategy('s', { apy: 0.1, risk: 'low', minAmount: -1 })).toThrow('config.minAmount');
    });
  });

  // optimizeAllocation
  describe('optimizeAllocation', () => {
    test('returns low-risk allocation for riskTolerance=low', () => {
      const alloc = optimizer.optimizeAllocation(10000, 'low');
      expect(alloc.staking).toBe(70);
      expect(alloc.staking + alloc.liquidity + alloc.lending).toBe(100);
    });

    test('returns medium-risk allocation for riskTolerance=medium', () => {
      const alloc = optimizer.optimizeAllocation(10000, 'medium');
      expect(alloc.staking).toBe(50);
    });

    test('returns high-risk allocation for any other riskTolerance', () => {
      const alloc = optimizer.optimizeAllocation(10000, 'high');
      expect(alloc.liquidity).toBe(60);
    });

    test('throws if userBalance is negative', () => {
      expect(() => optimizer.optimizeAllocation(-1, 'low')).toThrow('userBalance must be a non-negative number');
    });

    test('throws if riskTolerance is missing', () => {
      expect(() => optimizer.optimizeAllocation(1000, '')).toThrow('riskTolerance is required');
    });
  });

  // calculateExpectedYield
  describe('calculateExpectedYield', () => {
    const alloc = { staking: 70, liquidity: 20, lending: 10 };

    test('returns a positive yield for valid inputs', () => {
      expect(optimizer.calculateExpectedYield(10000, alloc)).toBeGreaterThan(0);
    });

    test('returns 0 when amount is 0', () => {
      expect(optimizer.calculateExpectedYield(0, alloc)).toBe(0);
    });

    test('throws if amount is negative', () => {
      expect(() => optimizer.calculateExpectedYield(-1, alloc)).toThrow('amount must be a non-negative number');
    });

    test('throws if allocation is missing', () => {
      expect(() => optimizer.calculateExpectedYield(1000, null)).toThrow('allocation is required');
    });

    test('yield scales linearly with amount', () => {
      const y1 = optimizer.calculateExpectedYield(1000, alloc);
      const y2 = optimizer.calculateExpectedYield(2000, alloc);
      expect(y2).toBeCloseTo(y1 * 2, 10);
    });
  });

  // calculateImprovement
  describe('calculateImprovement', () => {
    test('returns "0.00" when current allocation yields nothing', () => {
      const zero = { staking: 0, liquidity: 0, lending: 0 };
      const optimal = { staking: 50, liquidity: 40, lending: 10 };
      expect(optimizer.calculateImprovement(zero, optimal)).toBe('0.00');
    });

    test('returns positive improvement when optimal is better', () => {
      const current = { staking: 100, liquidity: 0, lending: 0 };
      const optimal = { staking: 30, liquidity: 60, lending: 10 };
      const improvement = parseFloat(optimizer.calculateImprovement(current, optimal));
      expect(improvement).toBeGreaterThan(0);
    });
  });

  // needsRebalancing
  describe('needsRebalancing', () => {
    test('returns false when allocations are within threshold', () => {
      const alloc = { staking: 50, liquidity: 40, lending: 10 };
      expect(optimizer.needsRebalancing(alloc, alloc)).toBe(false);
    });

    test('returns true when any allocation diverges beyond threshold', () => {
      const current = { staking: 80, liquidity: 10, lending: 10 };
      const optimal = { staking: 50, liquidity: 40, lending: 10 };
      expect(optimizer.needsRebalancing(current, optimal)).toBe(true);
    });
  });
});
