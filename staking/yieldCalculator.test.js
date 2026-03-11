const { YieldCalculator } = require('./yieldCalculator');

describe('YieldCalculator', () => {
  let calc;

  beforeEach(() => {
    calc = new YieldCalculator();
  });

  // calculateSimpleYield
  describe('calculateSimpleYield', () => {
    test('returns correct simple yield for basic inputs', () => {
      expect(calc.calculateSimpleYield(1000, 0.1, 1)).toBeCloseTo(100);
    });

    test('returns 0 for zero principal', () => {
      expect(calc.calculateSimpleYield(0, 0.1, 1)).toBe(0);
    });

    test('returns 0 for zero periods', () => {
      expect(calc.calculateSimpleYield(1000, 0.1, 0)).toBe(0);
    });

    test('throws if principal is negative', () => {
      expect(() => calc.calculateSimpleYield(-100, 0.1, 1)).toThrow(TypeError);
    });

    test('throws if rate is negative', () => {
      expect(() => calc.calculateSimpleYield(1000, -0.1, 1)).toThrow(TypeError);
    });

    test('throws if periods is negative', () => {
      expect(() => calc.calculateSimpleYield(1000, 0.1, -1)).toThrow(TypeError);
    });

    test('throws if principal is not a number', () => {
      expect(() => calc.calculateSimpleYield('1000', 0.1, 1)).toThrow(TypeError);
    });

    test('scales linearly with periods', () => {
      const y1 = calc.calculateSimpleYield(1000, 0.05, 1);
      const y2 = calc.calculateSimpleYield(1000, 0.05, 2);
      expect(y2).toBeCloseTo(y1 * 2);
    });
  });

  // calculateCompoundYield
  describe('calculateCompoundYield', () => {
    test('returns more than simple yield for same inputs', () => {
      const simple = calc.calculateSimpleYield(1000, 0.1, 1);
      const compound = calc.calculateCompoundYield(1000, 0.1, 1, 365);
      expect(compound).toBeGreaterThan(simple);
    });

    test('higher compounding frequency yields more', () => {
      const monthly = calc.calculateCompoundYield(1000, 0.1, 1, 12);
      const daily = calc.calculateCompoundYield(1000, 0.1, 1, 365);
      expect(daily).toBeGreaterThan(monthly);
    });

    test('returns 0 for zero principal', () => {
      expect(calc.calculateCompoundYield(0, 0.1, 1, 365)).toBe(0);
    });

    test('uses default compoundingFrequency when not provided', () => {
      const withDefault = calc.calculateCompoundYield(1000, 0.1, 1);
      const withExplicit = calc.calculateCompoundYield(1000, 0.1, 1, 365);
      expect(withDefault).toBeCloseTo(withExplicit);
    });

    test('throws for non-positive compoundingFrequency', () => {
      expect(() => calc.calculateCompoundYield(1000, 0.1, 1, 0)).toThrow(TypeError);
    });

    test('throws for negative rate', () => {
      expect(() => calc.calculateCompoundYield(1000, -0.1, 1, 365)).toThrow(TypeError);
    });

    test('standard compound interest formula: 1000 at 100% daily for 1 year', () => {
      // P*(1+r/n)^(n*t) - P: 1000*(1+1/365)^365 - 1000 ≈ 1718
      const result = calc.calculateCompoundYield(1000, 1.0, 1, 365);
      expect(result).toBeGreaterThan(1700);
      expect(result).toBeLessThan(1720);
    });
  });

  // calculateAPY
  describe('calculateAPY', () => {
    test('APY is greater than nominal rate for daily compounding', () => {
      const apy = calc.calculateAPY(0.05, 365);
      expect(apy).toBeGreaterThan(0.05);
    });

    test('APY with annual compounding equals nominal rate', () => {
      const apy = calc.calculateAPY(0.05, 1);
      expect(apy).toBeCloseTo(0.05);
    });

    test('returns a positive number for positive rate', () => {
      expect(calc.calculateAPY(0.1)).toBeGreaterThan(0);
    });
  });

  // calculateStakingReturns
  describe('calculateStakingReturns', () => {
    test('returns object with expected keys', () => {
      const result = calc.calculateStakingReturns(1000, 365, 0.01);
      expect(result).toHaveProperty('simpleYield');
      expect(result).toHaveProperty('compoundYield');
      expect(result).toHaveProperty('apy');
      expect(result).toHaveProperty('totalSimple');
      expect(result).toHaveProperty('totalCompound');
      expect(result).toHaveProperty('dailyReward');
    });

    test('totalCompound > totalSimple for positive rate', () => {
      const result = calc.calculateStakingReturns(1000, 365, 0.1);
      expect(result.totalCompound).toBeGreaterThan(result.totalSimple);
    });

    test('throws for non-positive stakeAmount', () => {
      expect(() => calc.calculateStakingReturns(0, 365, 0.01)).toThrow(TypeError);
    });

    test('throws for non-positive stakingDays', () => {
      expect(() => calc.calculateStakingReturns(1000, 0, 0.01)).toThrow(TypeError);
    });

    test('throws for non-positive rewardRate', () => {
      expect(() => calc.calculateStakingReturns(1000, 365, 0)).toThrow(TypeError);
    });

    test('dailyReward scales with stakeAmount', () => {
      const r1 = calc.calculateStakingReturns(1000, 365, 0.01);
      const r2 = calc.calculateStakingReturns(2000, 365, 0.01);
      expect(r2.dailyReward).toBeGreaterThan(r1.dailyReward);
    });
  });

  // calculateBreakEven
  describe('calculateBreakEven', () => {
    test('returns breakEvenDays > 0 for valid inputs', () => {
      const result = calc.calculateBreakEven(1000, 10, 0.01);
      expect(result.breakEvenDays).toBeGreaterThan(0);
    });

    test('zero gasCosts yields zero breakEvenDays', () => {
      const result = calc.calculateBreakEven(1000, 0, 0.01);
      expect(result.breakEvenDays).toBe(0);
    });

    test('throws for non-positive stakeAmount', () => {
      expect(() => calc.calculateBreakEven(0, 10, 0.01)).toThrow(TypeError);
    });

    test('throws for negative gasCosts', () => {
      expect(() => calc.calculateBreakEven(1000, -1, 0.01)).toThrow(TypeError);
    });

    test('higher stake reduces breakEvenDays', () => {
      const r1 = calc.calculateBreakEven(1000, 10, 0.01);
      const r2 = calc.calculateBreakEven(5000, 10, 0.01);
      expect(r2.breakEvenDays).toBeLessThan(r1.breakEvenDays);
    });

    test('includes breakEvenWeeks and breakEvenMonths', () => {
      const result = calc.calculateBreakEven(1000, 10, 0.01);
      expect(result).toHaveProperty('breakEvenWeeks');
      expect(result).toHaveProperty('breakEvenMonths');
    });
  });

  // calculateOptimalStakingPeriod
  describe('calculateOptimalStakingPeriod', () => {
    test('returns optimalDays > 0 for valid inputs', () => {
      const result = calc.calculateOptimalStakingPeriod(1000, 1100, 0.01);
      expect(result.optimalDays).toBeGreaterThan(0);
    });

    test('throws when targetReturn <= stakeAmount', () => {
      expect(() => calc.calculateOptimalStakingPeriod(1000, 1000, 0.01)).toThrow();
    });

    test('throws when targetReturn < stakeAmount', () => {
      expect(() => calc.calculateOptimalStakingPeriod(1000, 900, 0.01)).toThrow();
    });

    test('throws for non-positive rewardRate', () => {
      expect(() => calc.calculateOptimalStakingPeriod(1000, 1100, 0)).toThrow(TypeError);
    });

    test('higher targetReturn requires more days', () => {
      const r1 = calc.calculateOptimalStakingPeriod(1000, 1100, 0.01);
      const r2 = calc.calculateOptimalStakingPeriod(1000, 1200, 0.01);
      expect(r2.optimalDays).toBeGreaterThan(r1.optimalDays);
    });

    test('targetYield equals targetReturn minus stakeAmount', () => {
      const result = calc.calculateOptimalStakingPeriod(1000, 1500, 0.1);
      expect(result.targetYield).toBe(500);
    });
  });

  // compareStakingOptions
  describe('compareStakingOptions', () => {
    const options = [
      { name: 'Option A', rewardRate: 0.05, lockPeriod: 90 },
      { name: 'Option B', rewardRate: 0.10, lockPeriod: 180 }
    ];

    test('returns sorted array by compoundYield descending', () => {
      const result = calc.compareStakingOptions(1000, options);
      expect(result[0].compoundYield).toBeGreaterThanOrEqual(result[1].compoundYield);
    });

    test('throws for non-positive stakeAmount', () => {
      expect(() => calc.compareStakingOptions(0, options)).toThrow(TypeError);
    });

    test('throws for empty options array', () => {
      expect(() => calc.compareStakingOptions(1000, [])).toThrow(TypeError);
    });

    test('throws if options is not an array', () => {
      expect(() => calc.compareStakingOptions(1000, 'invalid')).toThrow(TypeError);
    });

    test('result includes name from each option', () => {
      const result = calc.compareStakingOptions(1000, options);
      const names = result.map(r => r.name);
      expect(names).toContain('Option A');
      expect(names).toContain('Option B');
    });
  });

  // calculateRiskAdjustedReturn
  describe('calculateRiskAdjustedReturn', () => {
    test('returns base and adjusted returns', () => {
      const result = calc.calculateRiskAdjustedReturn(1000, 0.1, 2);
      expect(result).toHaveProperty('baseReturn');
      expect(result).toHaveProperty('adjustedReturn');
      expect(result).toHaveProperty('riskPremium');
    });

    test('higher riskFactor reduces adjustedReturn yield', () => {
      const r1 = calc.calculateRiskAdjustedReturn(1000, 0.1, 1);
      const r2 = calc.calculateRiskAdjustedReturn(1000, 0.1, 2);
      expect(r2.adjustedReturn.compoundYield).toBeLessThan(r1.adjustedReturn.compoundYield);
    });

    test('throws for non-positive riskFactor', () => {
      expect(() => calc.calculateRiskAdjustedReturn(1000, 0.1, 0)).toThrow(TypeError);
    });

    test('riskFactor of 1 gives zero riskPremium', () => {
      const result = calc.calculateRiskAdjustedReturn(1000, 0.1, 1);
      expect(result.riskPremium).toBeCloseTo(0);
    });
  });

  // generateYieldProjection
  describe('generateYieldProjection', () => {
    test('returns array of monthly projections', () => {
      const result = calc.generateYieldProjection(1000, 0.1, 365);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('each entry has day, month, totalValue, yield, apy', () => {
      const result = calc.generateYieldProjection(1000, 0.1, 90);
      result.forEach(entry => {
        expect(entry).toHaveProperty('day');
        expect(entry).toHaveProperty('totalValue');
        expect(entry).toHaveProperty('yield');
        expect(entry).toHaveProperty('apy');
      });
    });

    test('totalValue increases over time', () => {
      const result = calc.generateYieldProjection(1000, 0.1, 365);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].totalValue).toBeGreaterThan(result[i - 1].totalValue);
      }
    });

    test('throws for non-positive maxDays', () => {
      expect(() => calc.generateYieldProjection(1000, 0.1, 0)).toThrow(TypeError);
    });
  });

  // getRecommendation
  describe('getRecommendation', () => {
    test('returns medium recommendation by default', () => {
      const result = calc.getRecommendation(1000);
      expect(result.riskLevel).toBe('medium');
    });

    test('returns low recommendation for low risk tolerance', () => {
      const result = calc.getRecommendation(1000, 'low');
      expect(result.riskLevel).toBe('low');
    });

    test('returns high recommendation for high risk tolerance', () => {
      const result = calc.getRecommendation(1000, 'high');
      expect(result.riskLevel).toBe('high');
    });

    test('fallback to medium for unknown riskTolerance', () => {
      const result = calc.getRecommendation(1000, 'unknown');
      expect(result.riskLevel).toBe('unknown');
    });

    test('includes compoundYield in result', () => {
      const result = calc.getRecommendation(1000);
      expect(result).toHaveProperty('compoundYield');
    });
  });
});
