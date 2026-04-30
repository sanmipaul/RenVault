const FeeCollector = require('./feeCollector');

describe('FeeCollector', () => {
  let fc;

  beforeEach(() => {
    fc = new FeeCollector();
  });

  // collectFee
  describe('collectFee', () => {
    test('accumulates fees for the same pool/token', () => {
      fc.collectFee('pool1', 10, 'ETH');
      fc.collectFee('pool1', 5, 'ETH');
      expect(fc.getTotalFees('pool1', 'ETH')).toBe(15);
    });

    test('keeps fees separate across pools', () => {
      fc.collectFee('pool1', 10, 'ETH');
      fc.collectFee('pool2', 20, 'ETH');
      expect(fc.getTotalFees('pool1', 'ETH')).toBe(10);
      expect(fc.getTotalFees('pool2', 'ETH')).toBe(20);
    });

    test('keeps fees separate across tokens in the same pool', () => {
      fc.collectFee('pool1', 10, 'ETH');
      fc.collectFee('pool1', 50, 'USDC');
      expect(fc.getTotalFees('pool1', 'ETH')).toBe(10);
      expect(fc.getTotalFees('pool1', 'USDC')).toBe(50);
    });

    test('accepts zero-amount fee', () => {
      expect(() => fc.collectFee('pool1', 0, 'ETH')).not.toThrow();
    });

    test('throws if poolId is missing or not a string', () => {
      expect(() => fc.collectFee('', 10, 'ETH')).toThrow('poolId is required');
      expect(() => fc.collectFee(null, 10, 'ETH')).toThrow();
    });

    test('throws if amount is negative', () => {
      expect(() => fc.collectFee('pool1', -1, 'ETH')).toThrow('fee amount must be a non-negative number');
    });

    test('throws if token is missing', () => {
      expect(() => fc.collectFee('pool1', 10, '')).toThrow('token identifier is required');
    });
  });

  // calculateProtocolFee
  describe('calculateProtocolFee', () => {
    test('returns 0.05% of the given swap fee', () => {
      expect(fc.calculateProtocolFee(1000)).toBeCloseTo(0.5, 5);
    });

    test('returns 0 for 0 swap fee', () => {
      expect(fc.calculateProtocolFee(0)).toBe(0);
    });
  });

  // getTotalFees
  describe('getTotalFees', () => {
    test('returns 0 for unknown pool/token', () => {
      expect(fc.getTotalFees('unknown', 'ETH')).toBe(0);
    });

    test('returns correct accumulated total', () => {
      fc.collectFee('pool1', 7, 'BTC');
      fc.collectFee('pool1', 3, 'BTC');
      expect(fc.getTotalFees('pool1', 'BTC')).toBe(10);
    });
  });

  // withdrawFees
  describe('withdrawFees', () => {
    test('returns withdrawal object and resets balance to zero', () => {
      fc.collectFee('pool1', 100, 'ETH');
      const result = fc.withdrawFees('pool1', 'ETH', 'addr123');
      expect(result).toEqual({ recipient: 'addr123', amount: 100, token: 'ETH' });
      expect(fc.getTotalFees('pool1', 'ETH')).toBe(0);
    });

    test('returns null when there are no fees to withdraw', () => {
      expect(fc.withdrawFees('pool1', 'ETH', 'addr123')).toBeNull();
    });

    test('throws if recipient is missing', () => {
      fc.collectFee('pool1', 10, 'ETH');
      expect(() => fc.withdrawFees('pool1', 'ETH', '')).toThrow('recipient address is required');
    });
  });

  // getAllPoolFees — prefix contamination regression
  describe('getAllPoolFees', () => {
    test('returns all token fees for the requested pool', () => {
      fc.collectFee('pool1', 10, 'ETH');
      fc.collectFee('pool1', 20, 'USDC');
      const fees = fc.getAllPoolFees('pool1');
      expect(fees['ETH']).toBe(10);
      expect(fees['USDC']).toBe(20);
    });

    test('does not include fees from a pool whose id starts with the same prefix', () => {
      fc.collectFee('pool1', 10, 'ETH');
      fc.collectFee('pool10', 99, 'ETH'); // pool10 starts with "pool1"
      const fees = fc.getAllPoolFees('pool1');
      expect(fees['ETH']).toBe(10); // must not include pool10's 99
    });

    test('returns empty object when pool has no fees', () => {
      expect(fc.getAllPoolFees('pool99')).toEqual({});
    });
  });
});
