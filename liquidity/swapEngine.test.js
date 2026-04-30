const SwapEngine = require('./swapEngine');

describe('SwapEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SwapEngine();
    engine.pools.set('pool1', {
      tokenA: 'STX', tokenB: 'USDC',
      reserveA: 100000, reserveB: 50000
    });
  });

  // calculateSwapOutput
  describe('calculateSwapOutput', () => {
    test('returns correct output for a valid swap', () => {
      const out = engine.calculateSwapOutput(1000, 100000, 50000);
      expect(out).toBeGreaterThan(0);
      expect(out).toBeLessThan(50000);
    });

    test('output decreases as amountIn grows relative to reserve (price impact)', () => {
      const small = engine.calculateSwapOutput(100, 100000, 50000);
      const large = engine.calculateSwapOutput(50000, 100000, 50000);
      expect(large / 50000).toBeLessThan(small / 100); // larger trade gets worse rate
    });

    test('throws if amountIn is not positive', () => {
      expect(() => engine.calculateSwapOutput(0, 100000, 50000)).toThrow('amountIn must be a positive number');
      expect(() => engine.calculateSwapOutput(-1, 100000, 50000)).toThrow();
    });

    test('throws if reserveIn is not positive', () => {
      expect(() => engine.calculateSwapOutput(100, 0, 50000)).toThrow('reserveIn must be a positive number');
    });

    test('throws if reserveOut is not positive', () => {
      expect(() => engine.calculateSwapOutput(100, 100000, 0)).toThrow('reserveOut must be a positive number');
    });
  });

  // calculateSlippage
  describe('calculateSlippage', () => {
    test('returns 0 when expected equals actual', () => {
      expect(engine.calculateSlippage(500, 500)).toBe(0);
    });

    test('returns correct slippage percentage', () => {
      expect(engine.calculateSlippage(1000, 950)).toBeCloseTo(5, 5);
    });

    test('throws if expectedOut is zero or negative', () => {
      expect(() => engine.calculateSlippage(0, 500)).toThrow('expectedOut must be a positive number');
      expect(() => engine.calculateSlippage(-1, 500)).toThrow();
    });

    test('throws if actualOut is negative', () => {
      expect(() => engine.calculateSlippage(500, -1)).toThrow('actualOut must be a non-negative number');
    });
  });

  // executeSwap
  describe('executeSwap', () => {
    test('executes a valid swap and returns amountOut and fee', () => {
      const result = engine.executeSwap('pool1', 'STX', 1000, 0);
      expect(result.amountOut).toBeGreaterThan(0);
      expect(result.fee).toBeCloseTo(3, 5); // 0.3% of 1000
    });

    test('throws for unknown pool', () => {
      expect(() => engine.executeSwap('unknown', 'STX', 1000, 0)).toThrow('Pool not found');
    });

    test('throws if amountIn is not positive', () => {
      expect(() => engine.executeSwap('pool1', 'STX', 0, 0)).toThrow('amountIn must be a positive number');
    });

    test('throws if tokenIn does not match pool tokens', () => {
      expect(() => engine.executeSwap('pool1', 'BTC', 100, 0)).toThrow('tokenIn does not match pool tokens');
    });

    test('throws if slippage exceeds minAmountOut', () => {
      expect(() => engine.executeSwap('pool1', 'STX', 1000, 99999)).toThrow('Slippage too high');
    });

    test('updates reserves after swap', () => {
      engine.executeSwap('pool1', 'STX', 1000, 0);
      const pool = engine.pools.get('pool1');
      expect(pool.reserveA).toBe(101000);
      expect(pool.reserveB).toBeLessThan(50000);
    });
  });

  // getPrice
  describe('getPrice', () => {
    test('returns 0 for unknown pool', () => {
      expect(engine.getPrice('unknown', 'STX')).toBe(0);
    });

    test('returns a positive price for a large amountIn', () => {
      expect(engine.getPrice('pool1', 'STX', 1000)).toBeGreaterThan(0);
    });
  });
});
