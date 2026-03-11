const SwapEngine = require('./swapEngine');

// Helper — creates a SwapEngine with one seeded pool
function makeEngine({ reserveA = 1_000_000, reserveB = 1_000_000 } = {}) {
  const se = new SwapEngine();
  se.createPool('pool1', 'STX', 'REN', reserveA, reserveB);
  return se;
}

// ─────────────────────────────────────────────────────────────────────────────
// createPool — validation
// ─────────────────────────────────────────────────────────────────────────────

describe('SwapEngine.createPool — input validation', () => {
  let se;
  beforeEach(() => { se = new SwapEngine(); });

  test('creates a pool and makes it retrievable', () => {
    se.createPool('p1', 'STX', 'REN', 500_000, 250_000);
    expect(se.pools.get('p1')).toMatchObject({ tokenA: 'STX', tokenB: 'REN', reserveA: 500_000, reserveB: 250_000 });
  });

  test('throws when tokenA equals tokenB', () => {
    expect(() => se.createPool('p1', 'STX', 'STX', 100, 100)).toThrow('must be different');
  });

  test('throws when reserveA is zero', () => {
    expect(() => se.createPool('p1', 'STX', 'REN', 0, 100)).toThrow('reserveA must be a positive number');
  });

  test('throws when reserveB is negative', () => {
    expect(() => se.createPool('p1', 'STX', 'REN', 100, -1)).toThrow('reserveB must be a positive number');
  });

  test('throws on duplicate poolId', () => {
    se.createPool('p1', 'STX', 'REN', 100, 100);
    expect(() => se.createPool('p1', 'STX', 'REN', 200, 200)).toThrow('already exists');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executeSwap — zero-output guard
// ─────────────────────────────────────────────────────────────────────────────

describe('SwapEngine.executeSwap — zero output is rejected', () => {
  test('throws when amountIn is too small to produce any output', () => {
    // Reserves of 1 trillion each; swapping 1 unit → Math.floor produces 0
    const se = makeEngine({ reserveA: 1_000_000_000_000, reserveB: 1_000_000_000_000 });
    expect(() => se.executeSwap('pool1', 'STX', 1, 0)).toThrow('Insufficient output amount');
  });

  test('does not mutate reserves when zero-output swap is rejected', () => {
    const se = makeEngine({ reserveA: 1_000_000_000_000, reserveB: 1_000_000_000_000 });
    const before = { ...se.pools.get('pool1') };
    try { se.executeSwap('pool1', 'STX', 1, 0); } catch (_) {}
    expect(se.pools.get('pool1')).toEqual(before);
  });

  test('succeeds and updates reserves for a valid swap', () => {
    const se = makeEngine({ reserveA: 1_000_000, reserveB: 1_000_000 });
    const { amountOut, fee } = se.executeSwap('pool1', 'STX', 1_000, 0);
    expect(amountOut).toBeGreaterThan(0);
    expect(fee).toBeCloseTo(1_000 * 0.003, 5);
    const pool = se.pools.get('pool1');
    expect(pool.reserveA).toBe(1_001_000);
    expect(pool.reserveB).toBe(1_000_000 - amountOut);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateSlippage — NaN guard
// ─────────────────────────────────────────────────────────────────────────────

describe('SwapEngine.calculateSlippage — no NaN or Infinity', () => {
  let se;
  beforeEach(() => { se = new SwapEngine(); });

  test('returns 100 when expectedOut is zero instead of NaN', () => {
    const result = se.calculateSlippage(0, 500);
    expect(result).toBe(100);
    expect(Number.isNaN(result)).toBe(false);
  });

  test('returns 0 when actualOut equals expectedOut', () => {
    expect(se.calculateSlippage(1000, 1000)).toBe(0);
  });

  test('returns correct percentage for a partial output', () => {
    // expectedOut=1000, actualOut=990 → 1% slippage
    expect(se.calculateSlippage(1000, 990)).toBeCloseTo(1, 5);
  });

  test('result is always a finite non-negative number', () => {
    [
      [0, 0],
      [0, 100],
      [100, 0],
      [500, 499],
    ].forEach(([exp, act]) => {
      const slip = se.calculateSlippage(exp, act);
      expect(Number.isFinite(slip)).toBe(true);
      expect(slip).toBeGreaterThanOrEqual(0);
    });
  });
});
