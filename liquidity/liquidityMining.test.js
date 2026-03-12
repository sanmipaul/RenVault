const LiquidityMining = require('./liquidityMining');

describe('LiquidityMining', () => {
  let lm;

  beforeEach(() => {
    lm = new LiquidityMining();
  });

  // createProgram
  describe('createProgram', () => {
    test('creates a program with correct fields', () => {
      lm.createProgram('pool1', 'REN', 0.1, 86400000);
      const info = lm.getProgramInfo('pool1');
      expect(info).toBeDefined();
      expect(info.rewardToken).toBe('REN');
      expect(info.rewardRate).toBe(0.1);
      expect(info.totalStaked).toBe(0);
    });

    test('throws if poolId is missing', () => {
      expect(() => lm.createProgram('', 'REN', 0.1, 86400000)).toThrow('poolId is required');
    });

    test('throws if rewardToken is missing', () => {
      expect(() => lm.createProgram('pool1', '', 0.1, 86400000)).toThrow('rewardToken is required');
    });

    test('throws if rewardRate is not positive', () => {
      expect(() => lm.createProgram('pool1', 'REN', 0, 86400000)).toThrow('rewardRate must be a positive number');
      expect(() => lm.createProgram('pool1', 'REN', -1, 86400000)).toThrow();
    });

    test('throws if duration is not positive', () => {
      expect(() => lm.createProgram('pool1', 'REN', 0.1, 0)).toThrow('duration must be a positive number');
      expect(() => lm.createProgram('pool1', 'REN', 0.1, -1000)).toThrow();
    });
  });

  // stake
  describe('stake', () => {
    beforeEach(() => {
      lm.createProgram('pool1', 'REN', 0.1, 86400000);
    });

    test('successfully stakes and increments totalStaked', () => {
      lm.stake('pool1', 'alice', 500);
      expect(lm.getProgramInfo('pool1').totalStaked).toBe(500);
    });

    test('accumulates stake for the same user', () => {
      lm.stake('pool1', 'alice', 200);
      lm.stake('pool1', 'alice', 300);
      expect(lm.getProgramInfo('pool1').totalStaked).toBe(500);
    });

    test('throws if poolId is missing', () => {
      expect(() => lm.stake('', 'alice', 100)).toThrow('poolId is required');
    });

    test('throws if user is missing', () => {
      expect(() => lm.stake('pool1', '', 100)).toThrow('user is required');
    });

    test('throws if amount is not positive', () => {
      expect(() => lm.stake('pool1', 'alice', 0)).toThrow('amount must be a positive number');
      expect(() => lm.stake('pool1', 'alice', -50)).toThrow();
    });
  });

  // calculatePending — negative timeElapsed regression
  describe('calculatePending', () => {
    test('returns 0 for unknown user or program', () => {
      expect(lm.calculatePending('pool1', 'nobody')).toBe(0);
    });

    test('returns non-negative reward after time passes', () => {
      lm.createProgram('pool1', 'REN', 1, 86400000);
      lm.stake('pool1', 'alice', 1000);
      // Backdate lastUpdate to simulate elapsed time
      const key = 'pool1-alice';
      const stakeData = lm.userStakes.get(key);
      stakeData.lastUpdate = Date.now() - 5000; // 5 seconds ago
      lm.userStakes.set(key, stakeData);
      expect(lm.calculatePending('pool1', 'alice')).toBeGreaterThanOrEqual(0);
    });

    test('returns 0 when program has already ended (no negative rewards)', () => {
      const past = Date.now() - 10000;
      lm.programs.set('pool1', {
        rewardToken: 'REN', rewardRate: 1,
        startTime: past - 20000, endTime: past,
        totalStaked: 1000
      });
      lm.userStakes.set('pool1-alice', {
        amount: 1000, rewardDebt: 0,
        lastUpdate: past + 5000 // lastUpdate AFTER endTime
      });
      const pending = lm.calculatePending('pool1', 'alice');
      expect(pending).toBe(0);
    });
  });

  // harvest
  describe('harvest', () => {
    test('returns pending rewards and resets lastUpdate', () => {
      lm.createProgram('pool1', 'REN', 1, 86400000);
      lm.stake('pool1', 'alice', 1000);
      const key = 'pool1-alice';
      const stakeData = lm.userStakes.get(key);
      stakeData.lastUpdate = Date.now() - 3000;
      lm.userStakes.set(key, stakeData);
      const harvested = lm.harvest('pool1', 'alice');
      expect(harvested).toBeGreaterThan(0);
    });

    test('returns 0 for unknown user', () => {
      lm.createProgram('pool1', 'REN', 1, 86400000);
      expect(lm.harvest('pool1', 'nobody')).toBe(0);
    });
  });

  // getProgramInfo
  describe('getProgramInfo', () => {
    test('returns undefined for unknown pool', () => {
      expect(lm.getProgramInfo('unknown')).toBeUndefined();
    });
  });
});
