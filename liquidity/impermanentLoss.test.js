const ImpermanentLossCalculator = require('./impermanentLoss');

describe('ImpermanentLossCalculator', () => {
  let calc;

  beforeEach(() => {
    calc = new ImpermanentLossCalculator();
  });

  // recordPosition
  describe('recordPosition', () => {
    test('records a valid position without error', () => {
      expect(() =>
        calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1)
      ).not.toThrow();
    });

    test('throws if user or poolId is missing', () => {
      expect(() =>
        calc.recordPosition('', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1)
      ).toThrow('user and poolId are required');
      expect(() =>
        calc.recordPosition('alice', '', 'ETH', 'USDC', 1, 2000, 2000, 1)
      ).toThrow('user and poolId are required');
    });

    test('throws if tokenA or tokenB is missing', () => {
      expect(() =>
        calc.recordPosition('alice', 'pool1', '', 'USDC', 1, 2000, 2000, 1)
      ).toThrow('tokenA and tokenB are required');
    });

    test('throws if prices are not positive numbers', () => {
      expect(() =>
        calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 0, 1)
      ).toThrow('priceA and priceB must be positive numbers');
      expect(() =>
        calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, -100, 1)
      ).toThrow();
    });

    test('throws if amounts are not positive numbers', () => {
      expect(() =>
        calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 0, 2000, 2000, 1)
      ).toThrow('amountA and amountB must be positive numbers');
      expect(() =>
        calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, -1, 2000, 1)
      ).toThrow();
    });
  });

  // calculateImpermanentLoss
  describe('calculateImpermanentLoss', () => {
    beforeEach(() => {
      // 1 ETH @ $2000, 2000 USDC @ $1 => equal-value position
      calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1);
    });

    test('returns null for unknown position', () => {
      expect(calc.calculateImpermanentLoss('bob', 'pool1', 2000, 1)).toBeNull();
    });

    test('returns ~0% IL when prices are unchanged', () => {
      const result = calc.calculateImpermanentLoss('alice', 'pool1', 2000, 1);
      expect(result).not.toBeNull();
      expect(result.impermanentLoss).toBeCloseTo(0, 5);
      expect(result.isLoss).toBe(false);
    });

    test('IL is ~5.72% when ETH doubles in price (standard known value)', () => {
      // ETH goes from $2000 to $4000 — price ratio k = 2
      // Expected IL = 1 - 2*sqrt(2)/(1+2) ≈ 5.719%
      const result = calc.calculateImpermanentLoss('alice', 'pool1', 4000, 1);
      expect(result).not.toBeNull();
      expect(result.impermanentLoss).toBeCloseTo(5.719, 1);
      expect(result.isLoss).toBe(true);
    });

    test('IL is symmetric — price halving gives same IL as doubling', () => {
      const resultUp = calc.calculateImpermanentLoss('alice', 'pool1', 4000, 1);
      // Reset and record same position, then halve price
      const calc2 = new ImpermanentLossCalculator();
      calc2.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1);
      const resultDown = calc2.calculateImpermanentLoss('alice', 'pool1', 1000, 1);
      expect(resultUp.impermanentLoss).toBeCloseTo(resultDown.impermanentLoss, 3);
    });

    test('lpValue is always <= holdValue when there is IL', () => {
      const result = calc.calculateImpermanentLoss('alice', 'pool1', 4000, 1);
      expect(result.lpValue).toBeLessThan(result.holdValue);
    });

    test('lpValue equals holdValue when priceRatio is 1', () => {
      const result = calc.calculateImpermanentLoss('alice', 'pool1', 2000, 1);
      expect(result.lpValue).toBeCloseTo(result.holdValue, 5);
    });

    test('throws if current prices are not positive', () => {
      expect(() =>
        calc.calculateImpermanentLoss('alice', 'pool1', 0, 1)
      ).toThrow('current prices must be positive numbers');
      expect(() =>
        calc.calculateImpermanentLoss('alice', 'pool1', 2000, -1)
      ).toThrow();
    });
  });

  // getPositionHistory
  describe('getPositionHistory', () => {
    test('returns recorded position', () => {
      calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1);
      const pos = calc.getPositionHistory('alice', 'pool1');
      expect(pos).toBeDefined();
      expect(pos.tokenA).toBe('ETH');
      expect(pos.amountA).toBe(1);
    });

    test('returns undefined for unknown position', () => {
      expect(calc.getPositionHistory('nobody', 'pool99')).toBeUndefined();
    });
  });

  // calculateBreakEvenFees
  describe('calculateBreakEvenFees', () => {
    beforeEach(() => {
      calc.recordPosition('alice', 'pool1', 'ETH', 'USDC', 1, 2000, 2000, 1);
    });

    test('returns breakEven:true when no IL', () => {
      const result = calc.calculateBreakEvenFees('alice', 'pool1', 2000, 1, 0);
      expect(result.breakEven).toBe(true);
      expect(result.feesNeeded).toBe(0);
    });

    test('returns feesNeeded > 0 when fees do not cover the loss', () => {
      const result = calc.calculateBreakEvenFees('alice', 'pool1', 4000, 1, 0);
      expect(result.breakEven).toBe(false);
      expect(result.feesNeeded).toBeGreaterThan(0);
    });

    test('returns breakEven:true when fees fully cover the loss', () => {
      const loss = calc.calculateImpermanentLoss('alice', 'pool1', 4000, 1);
      const lossAmount = loss.holdValue - loss.lpValue;
      const result = calc.calculateBreakEvenFees('alice', 'pool1', 4000, 1, lossAmount + 1);
      expect(result.breakEven).toBe(true);
      expect(result.feesNeeded).toBe(0);
    });

    test('returns null-safe result for unknown position', () => {
      const result = calc.calculateBreakEvenFees('nobody', 'pool99', 2000, 1, 0);
      expect(result.breakEven).toBe(true);
      expect(result.feesNeeded).toBe(0);
    });
  });
});
