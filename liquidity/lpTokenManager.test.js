const LPTokenManager = require('./lpTokenManager');

describe('LPTokenManager', () => {
  let lp;

  beforeEach(() => {
    lp = new LPTokenManager();
  });

  // mint
  describe('mint', () => {
    test('mints tokens and returns the amount', () => {
      expect(lp.mint('pool1', 'alice', 1000)).toBe(1000);
    });

    test('accumulates balance for the same user', () => {
      lp.mint('pool1', 'alice', 500);
      lp.mint('pool1', 'alice', 300);
      expect(lp.balanceOf('pool1', 'alice')).toBe(800);
    });

    test('increments pool totalSupply', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.mint('pool1', 'bob', 500);
      expect(lp.totalSupply('pool1')).toBe(1500);
    });

    test('keeps balances separate across pools', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.mint('pool2', 'alice', 200);
      expect(lp.balanceOf('pool1', 'alice')).toBe(1000);
      expect(lp.balanceOf('pool2', 'alice')).toBe(200);
    });
  });

  // burn
  describe('burn', () => {
    test('burns tokens and reduces balance', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.burn('pool1', 'alice', 400);
      expect(lp.balanceOf('pool1', 'alice')).toBe(600);
    });

    test('reduces totalSupply after burn', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.burn('pool1', 'alice', 400);
      expect(lp.totalSupply('pool1')).toBe(600);
    });

    test('throws if insufficient LP tokens', () => {
      lp.mint('pool1', 'alice', 100);
      expect(() => lp.burn('pool1', 'alice', 200)).toThrow('Insufficient LP tokens');
    });
  });

  // balanceOf
  describe('balanceOf', () => {
    test('returns 0 for unknown user', () => {
      expect(lp.balanceOf('pool1', 'nobody')).toBe(0);
    });
  });

  // totalSupply
  describe('totalSupply', () => {
    test('returns 0 for unknown pool', () => {
      expect(lp.totalSupply('unknown')).toBe(0);
    });
  });

  // getShare
  describe('getShare', () => {
    test('returns 0 when pool has no supply', () => {
      expect(lp.getShare('pool1', 'alice')).toBe(0);
    });

    test('returns 100% when user holds all tokens', () => {
      lp.mint('pool1', 'alice', 1000);
      expect(lp.getShare('pool1', 'alice')).toBe(100);
    });

    test('returns 50% when two users hold equal amounts', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.mint('pool1', 'bob', 1000);
      expect(lp.getShare('pool1', 'alice')).toBe(50);
    });

    test('returns proportional share', () => {
      lp.mint('pool1', 'alice', 1000);
      lp.mint('pool1', 'bob', 3000);
      expect(lp.getShare('pool1', 'alice')).toBe(25);
    });
  });
});
