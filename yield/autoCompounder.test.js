const { AutoCompounder } = require('./autoCompounder');

describe('AutoCompounder', () => {
  let compounder;

  beforeEach(() => {
    compounder = new AutoCompounder();
  });

  // enableAutoCompound
  describe('enableAutoCompound', () => {
    test('enables auto-compounding for a valid user', () => {
      const result = compounder.enableAutoCompound('alice', 'strat1');
      expect(result.success).toBe(true);
      expect(compounder.getCompoundingStatus('alice').enabled).toBe(true);
    });

    test('throws if userAddress is missing', () => {
      expect(() => compounder.enableAutoCompound('', 'strat1')).toThrow('userAddress is required');
    });

    test('throws if strategyId is missing', () => {
      expect(() => compounder.enableAutoCompound('alice', '')).toThrow('strategyId is required');
    });
  });

  // disableAutoCompound
  describe('disableAutoCompound', () => {
    test('disables auto-compounding', () => {
      compounder.enableAutoCompound('alice', 'strat1');
      compounder.disableAutoCompound('alice');
      expect(compounder.getCompoundingStatus('alice').enabled).toBe(false);
    });

    test('is safe to call for unknown user', () => {
      expect(() => compounder.disableAutoCompound('nobody')).not.toThrow();
    });
  });

  // compound
  describe('compound', () => {
    test('returns compounded:false if not enabled', async () => {
      const result = await compounder.compound('alice', 100);
      expect(result.compounded).toBe(false);
      expect(result.reason).toBe('Auto-compound not enabled');
    });

    test('returns compounded:false if too soon', async () => {
      compounder.enableAutoCompound('alice', 'strat1');
      const result = await compounder.compound('alice', 100);
      expect(result.compounded).toBe(false);
      expect(result.reason).toBe('Too soon to compound');
    });

    test('compounds successfully after frequency elapses', async () => {
      compounder.enableAutoCompound('alice', 'strat1');
      const status = compounder.getCompoundingStatus('alice');
      status.lastCompound = Date.now() - compounder.compoundFrequency - 1;
      const result = await compounder.compound('alice', 1000);
      expect(result.compounded).toBe(true);
      expect(result.amount).toBeCloseTo(1010, 5);
    });
  });

  // calculateCompoundAmount
  describe('calculateCompoundAmount', () => {
    test('returns rewards * 1.01', () => {
      expect(compounder.calculateCompoundAmount(1000)).toBeCloseTo(1010, 5);
    });

    test('returns 0 for 0 rewards', () => {
      expect(compounder.calculateCompoundAmount(0)).toBe(0);
    });

    test('throws if rewards is negative', () => {
      expect(() => compounder.calculateCompoundAmount(-1)).toThrow('rewards must be a non-negative number');
    });
  });

  // setCompoundFrequency
  describe('setCompoundFrequency', () => {
    test('sets frequency in milliseconds correctly', () => {
      compounder.setCompoundFrequency(12);
      expect(compounder.compoundFrequency).toBe(12 * 3600000);
    });

    test('throws if hours is zero', () => {
      expect(() => compounder.setCompoundFrequency(0)).toThrow('hours must be a positive number');
    });

    test('throws if hours is negative', () => {
      expect(() => compounder.setCompoundFrequency(-1)).toThrow();
    });
  });

  // getCompoundingStatus
  describe('getCompoundingStatus', () => {
    test('returns { enabled: false } for unknown user', () => {
      expect(compounder.getCompoundingStatus('nobody').enabled).toBe(false);
    });
  });
});
