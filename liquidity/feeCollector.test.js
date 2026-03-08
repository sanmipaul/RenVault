const FeeCollector = require('./feeCollector');

describe('FeeCollector.getAllPoolFees', () => {
  let collector;

  beforeEach(() => {
    collector = new FeeCollector();
  });

  test('returns fees for the correct pool only', () => {
    collector.collectFee('STX-BTC', 50, 'tokenA');
    collector.collectFee('STX-BTC', 30, 'tokenB');
    collector.collectFee('STX-ETH', 99, 'tokenA'); // different pool

    const fees = collector.getAllPoolFees('STX-BTC');

    expect(fees).toEqual({ tokenA: 50, tokenB: 30 });
    // ETH-pool fee must NOT appear
    expect(Object.keys(fees)).not.toContain('STX');
  });

  test('does not include fees from a pool whose ID is a prefix of the queried ID', () => {
    // 'STX' is a prefix of 'STX-BTC' — must not bleed into results
    collector.collectFee('STX', 10, 'tokenA');
    collector.collectFee('STX-BTC', 20, 'tokenA');

    const fees = collector.getAllPoolFees('STX');

    expect(fees).toEqual({ tokenA: 10 });
    expect(Object.values(fees)).not.toContain(20);
  });

  test('extracts the full token name even when it contains a hyphen', () => {
    collector.collectFee('POOL1', 77, 'wrapped-token');

    const fees = collector.getAllPoolFees('POOL1');

    expect(fees['wrapped-token']).toBe(77);
  });

  test('returns an empty object for an unknown pool', () => {
    expect(collector.getAllPoolFees('UNKNOWN')).toEqual({});
  });
});

describe('FeeCollector.withdrawFees', () => {
  let collector;

  beforeEach(() => {
    collector = new FeeCollector();
  });

  test('removes the entry from the map after withdrawal', () => {
    collector.collectFee('POOL1', 100, 'tokenA');
    collector.withdrawFees('POOL1', 'tokenA', 'SP1RECIPIENT');

    // After withdrawal the key must be gone, not set to 0
    expect(collector.fees.has('POOL1::tokenA')).toBe(false);
    expect(collector.getTotalFees('POOL1', 'tokenA')).toBe(0);
  });

  test('returns null when there are no fees to withdraw', () => {
    const result = collector.withdrawFees('POOL1', 'tokenA', 'SP1RECIPIENT');
    expect(result).toBeNull();
  });

  test('withdrawn amount matches what was collected', () => {
    collector.collectFee('POOL1', 42, 'tokenA');
    const result = collector.withdrawFees('POOL1', 'tokenA', 'SP1RECIPIENT');
    expect(result.amount).toBe(42);
    expect(result.recipient).toBe('SP1RECIPIENT');
  });
});

describe('FeeCollector.collectFee', () => {
  let collector;

  beforeEach(() => {
    collector = new FeeCollector();
  });

  test('rejects a zero amount', () => {
    expect(() => collector.collectFee('POOL1', 0, 'tokenA')).toThrow('positive number');
  });

  test('rejects a negative amount', () => {
    expect(() => collector.collectFee('POOL1', -5, 'tokenA')).toThrow('positive number');
  });

  test('accepts a positive amount and accumulates it', () => {
    collector.collectFee('POOL1', 10, 'tokenA');
    collector.collectFee('POOL1', 15, 'tokenA');
    expect(collector.getTotalFees('POOL1', 'tokenA')).toBe(25);
  });
});
