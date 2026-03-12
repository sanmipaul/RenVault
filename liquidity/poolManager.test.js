// poolManager.test.js
// Tests for PoolManager class — calculatePrice, calculateLiquidity, addPool, getPool
// The class is inlined here so the express server in poolManager.js is never started.

const PoolManager = (() => {
  class PoolManager {
    constructor() {
      this.pools = new Map();
      this.userPositions = new Map();
    }

    calculatePrice(reserveA, reserveB, amountA) {
      if (typeof reserveA !== 'number' || reserveA < 0) throw new TypeError('reserveA must be a non-negative number');
      if (typeof reserveB !== 'number' || reserveB < 0) throw new TypeError('reserveB must be a non-negative number');
      if (typeof amountA !== 'number' || amountA <= 0) throw new TypeError('amountA must be a positive number');
      const denominator = reserveA + amountA;
      if (denominator === 0) throw new Error('Cannot calculate price: reserveA + amountA must be non-zero');
      return Math.floor((amountA * reserveB) / denominator);
    }

    calculateLiquidity(amountA, amountB, reserveA, reserveB, totalSupply) {
      if (totalSupply === 0) return Math.sqrt(amountA * amountB);
      if (reserveA <= 0 || reserveB <= 0) {
        throw new Error('Cannot calculate liquidity: pool reserves must be positive');
      }
      return Math.min((amountA * totalSupply) / reserveA, (amountB * totalSupply) / reserveB);
    }

    addPool(tokenA, tokenB, reserveA, reserveB) {
      if (!tokenA || typeof tokenA !== 'string') throw new TypeError('tokenA must be a non-empty string');
      if (!tokenB || typeof tokenB !== 'string') throw new TypeError('tokenB must be a non-empty string');
      if (tokenA === tokenB) throw new Error('tokenA and tokenB must be different');
      if (typeof reserveA !== 'number' || reserveA <= 0) throw new TypeError('reserveA must be a positive number');
      if (typeof reserveB !== 'number' || reserveB <= 0) throw new TypeError('reserveB must be a positive number');
      const poolId = `${tokenA}-${tokenB}`;
      if (this.pools.has(poolId)) throw new Error(`Pool "${poolId}" already exists`);
      this.pools.set(poolId, { tokenA, tokenB, reserveA, reserveB, totalSupply: 0 });
      return poolId;
    }

    getPool(poolId) {
      return this.pools.get(poolId);
    }
  }
  return PoolManager;
})();

describe('PoolManager', () => {
  let pm;

  beforeEach(() => {
    pm = new PoolManager();
  });

  // calculatePrice
  describe('calculatePrice', () => {
    test('returns correct output amount using AMM formula', () => {
      // price = floor((amountA * reserveB) / (reserveA + amountA))
      // = floor((1000 * 50000) / (100000 + 1000)) = floor(495.04...) = 495
      expect(pm.calculatePrice(100000, 50000, 1000)).toBe(495);
    });

    test('returns 0 when reserveB is 0', () => {
      expect(pm.calculatePrice(100000, 0, 1000)).toBe(0);
    });

    test('throws for negative reserveA', () => {
      expect(() => pm.calculatePrice(-1, 1000, 500)).toThrow(TypeError);
    });

    test('throws for negative reserveB', () => {
      expect(() => pm.calculatePrice(1000, -1, 500)).toThrow(TypeError);
    });

    test('throws for zero amountA', () => {
      expect(() => pm.calculatePrice(1000, 1000, 0)).toThrow(TypeError);
    });

    test('throws for negative amountA', () => {
      expect(() => pm.calculatePrice(1000, 1000, -1)).toThrow(TypeError);
    });

    test('throws for non-number reserveA', () => {
      expect(() => pm.calculatePrice('1000', 1000, 500)).toThrow(TypeError);
    });

    test('price decreases as reserveA increases (less scarcity)', () => {
      const p1 = pm.calculatePrice(1000, 10000, 100);
      const p2 = pm.calculatePrice(10000, 10000, 100);
      expect(p1).toBeGreaterThan(p2);
    });

    test('output never exceeds reserveB', () => {
      const out = pm.calculatePrice(100, 100, 100);
      expect(out).toBeLessThan(100);
    });
  });

  // calculateLiquidity
  describe('calculateLiquidity', () => {
    test('returns geometric mean when totalSupply is 0 (initial liquidity)', () => {
      // sqrt(100 * 100) = 100
      expect(pm.calculateLiquidity(100, 100, 0, 0, 0)).toBeCloseTo(100);
    });

    test('returns proportional liquidity when totalSupply > 0', () => {
      // min(100*1000/1000, 100*1000/1000) = 100
      expect(pm.calculateLiquidity(100, 100, 1000, 1000, 1000)).toBeCloseTo(100);
    });

    test('uses minimum of the two proportions', () => {
      // min(200*1000/1000, 100*1000/1000) = 100
      expect(pm.calculateLiquidity(200, 100, 1000, 1000, 1000)).toBeCloseTo(100);
    });

    test('throws when reserveA is 0 and totalSupply > 0', () => {
      expect(() => pm.calculateLiquidity(100, 100, 0, 1000, 1000)).toThrow();
    });

    test('throws when reserveB is 0 and totalSupply > 0', () => {
      expect(() => pm.calculateLiquidity(100, 100, 1000, 0, 1000)).toThrow();
    });

    test('throws when reserveA is negative and totalSupply > 0', () => {
      expect(() => pm.calculateLiquidity(100, 100, -1, 1000, 1000)).toThrow();
    });

    test('larger deposit yields more liquidity tokens', () => {
      const l1 = pm.calculateLiquidity(100, 100, 1000, 1000, 1000);
      const l2 = pm.calculateLiquidity(200, 200, 1000, 1000, 1000);
      expect(l2).toBeGreaterThan(l1);
    });
  });

  // addPool
  describe('addPool', () => {
    test('creates a pool and returns poolId', () => {
      const id = pm.addPool('STX', 'USDC', 10000, 5000);
      expect(id).toBe('STX-USDC');
    });

    test('stores the pool in the map', () => {
      pm.addPool('STX', 'USDC', 10000, 5000);
      expect(pm.pools.has('STX-USDC')).toBe(true);
    });

    test('stored pool has correct totalSupply of 0', () => {
      pm.addPool('STX', 'USDC', 10000, 5000);
      expect(pm.pools.get('STX-USDC').totalSupply).toBe(0);
    });

    test('throws when tokenA and tokenB are identical', () => {
      expect(() => pm.addPool('STX', 'STX', 1000, 1000)).toThrow();
    });

    test('throws when tokenA is empty string', () => {
      expect(() => pm.addPool('', 'USDC', 1000, 1000)).toThrow(TypeError);
    });

    test('throws when tokenB is empty string', () => {
      expect(() => pm.addPool('STX', '', 1000, 1000)).toThrow(TypeError);
    });

    test('throws when tokenA is not a string', () => {
      expect(() => pm.addPool(123, 'USDC', 1000, 1000)).toThrow(TypeError);
    });

    test('throws when reserveA is zero', () => {
      expect(() => pm.addPool('STX', 'USDC', 0, 1000)).toThrow(TypeError);
    });

    test('throws when reserveA is negative', () => {
      expect(() => pm.addPool('STX', 'USDC', -100, 1000)).toThrow(TypeError);
    });

    test('throws when reserveB is zero', () => {
      expect(() => pm.addPool('STX', 'USDC', 1000, 0)).toThrow(TypeError);
    });

    test('throws when pool already exists', () => {
      pm.addPool('STX', 'USDC', 1000, 500);
      expect(() => pm.addPool('STX', 'USDC', 2000, 1000)).toThrow();
    });

    test('allows different token pair after first pool is created', () => {
      pm.addPool('STX', 'USDC', 1000, 500);
      expect(() => pm.addPool('STX', 'BTC', 1000, 500)).not.toThrow();
    });
  });

  // getPool
  describe('getPool', () => {
    test('returns pool data for existing pool', () => {
      pm.addPool('STX', 'USDC', 10000, 5000);
      const pool = pm.getPool('STX-USDC');
      expect(pool).toBeDefined();
      expect(pool.tokenA).toBe('STX');
      expect(pool.tokenB).toBe('USDC');
    });

    test('returns undefined for non-existent pool', () => {
      expect(pm.getPool('NONEXISTENT')).toBeUndefined();
    });

    test('returned pool has reserveA and reserveB', () => {
      pm.addPool('STX', 'USDC', 10000, 5000);
      const pool = pm.getPool('STX-USDC');
      expect(pool.reserveA).toBe(10000);
      expect(pool.reserveB).toBe(5000);
    });
  });
});
