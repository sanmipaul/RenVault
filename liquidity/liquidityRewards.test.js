const LiquidityRewards = require('./liquidityRewards');

describe('LiquidityRewards', () => {
  let rewards;

  beforeEach(() => {
    rewards = new LiquidityRewards();
  });

  // addLiquidityProvider
  describe('addLiquidityProvider', () => {
    test('adds a new provider without error', () => {
      expect(() => rewards.addLiquidityProvider('pool1', 'user1', 500)).not.toThrow();
    });

    test('throws TypeError for missing poolId', () => {
      expect(() => rewards.addLiquidityProvider('', 'user1', 500)).toThrow(TypeError);
    });

    test('throws TypeError for non-string poolId', () => {
      expect(() => rewards.addLiquidityProvider(123, 'user1', 500)).toThrow(TypeError);
    });

    test('throws TypeError for missing user', () => {
      expect(() => rewards.addLiquidityProvider('pool1', '', 500)).toThrow(TypeError);
    });

    test('throws TypeError for non-string user', () => {
      expect(() => rewards.addLiquidityProvider('pool1', null, 500)).toThrow(TypeError);
    });

    test('throws TypeError for zero amount', () => {
      expect(() => rewards.addLiquidityProvider('pool1', 'user1', 0)).toThrow(TypeError);
    });

    test('throws TypeError for negative amount', () => {
      expect(() => rewards.addLiquidityProvider('pool1', 'user1', -100)).toThrow(TypeError);
    });

    test('accumulates amount for repeated calls', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 1000);
      rewards.addLiquidityProvider('pool1', 'user1', 500);
      const key = 'pool1-user1';
      const position = rewards.userRewards.get(key);
      expect(position.amount).toBe(1500);
    });

    test('keeps providers for different users separate', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 1000);
      rewards.addLiquidityProvider('pool1', 'user2', 2000);
      expect(rewards.userRewards.get('pool1-user1').amount).toBe(1000);
      expect(rewards.userRewards.get('pool1-user2').amount).toBe(2000);
    });

    test('stores lastUpdate timestamp', () => {
      const before = Date.now();
      rewards.addLiquidityProvider('pool1', 'user1', 500);
      const after = Date.now();
      const ts = rewards.userRewards.get('pool1-user1').lastUpdate;
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  // calculateRewards
  describe('calculateRewards', () => {
    test('returns 0 for unknown provider', () => {
      expect(rewards.calculateRewards('pool1', 'user1')).toBe(0);
    });

    test('returns a non-negative value for a known provider', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      expect(rewards.calculateRewards('pool1', 'user1')).toBeGreaterThanOrEqual(0);
    });

    test('throws TypeError for invalid poolId', () => {
      expect(() => rewards.calculateRewards('', 'user1')).toThrow(TypeError);
    });

    test('throws TypeError for invalid user', () => {
      expect(() => rewards.calculateRewards('pool1', '')).toThrow(TypeError);
    });

    test('includes pendingRewards in result', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      // Force some pendingRewards
      const key = 'pool1-user1';
      const pos = rewards.userRewards.get(key);
      pos.pendingRewards = 50;
      rewards.userRewards.set(key, pos);
      const result = rewards.calculateRewards('pool1', 'user1');
      expect(result).toBeGreaterThanOrEqual(50);
    });

    test('providers in different pools are independent', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      rewards.addLiquidityProvider('pool2', 'user1', 5000);
      // pool2-user1 exists, pool1-user1 exists; neither should cross-contaminate
      expect(rewards.calculateRewards('pool1', 'user1')).toBeGreaterThanOrEqual(0);
      expect(rewards.calculateRewards('pool2', 'user1')).toBeGreaterThanOrEqual(0);
    });
  });

  // claimRewards
  describe('claimRewards', () => {
    test('returns 0 for unknown user', () => {
      expect(rewards.claimRewards('pool1', 'user1')).toBe(0);
    });

    test('resets pendingRewards to 0 after claim', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      const key = 'pool1-user1';
      const pos = rewards.userRewards.get(key);
      pos.pendingRewards = 100;
      rewards.userRewards.set(key, pos);
      rewards.claimRewards('pool1', 'user1');
      expect(rewards.userRewards.get(key).pendingRewards).toBe(0);
    });

    test('updates lastUpdate timestamp on claim', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      const key = 'pool1-user1';
      const pos = rewards.userRewards.get(key);
      pos.pendingRewards = 100;
      rewards.userRewards.set(key, pos);
      const before = Date.now();
      rewards.claimRewards('pool1', 'user1');
      const ts = rewards.userRewards.get(key).lastUpdate;
      expect(ts).toBeGreaterThanOrEqual(before);
    });

    test('returns the reward amount that was calculated', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      const key = 'pool1-user1';
      const pos = rewards.userRewards.get(key);
      pos.pendingRewards = 75;
      rewards.userRewards.set(key, pos);
      const claimed = rewards.claimRewards('pool1', 'user1');
      expect(claimed).toBeGreaterThanOrEqual(75);
    });

    test('calculateRewards returns near 0 immediately after claim', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 10000);
      const key = 'pool1-user1';
      const pos = rewards.userRewards.get(key);
      pos.pendingRewards = 200;
      rewards.userRewards.set(key, pos);
      rewards.claimRewards('pool1', 'user1');
      const rewardsAfter = rewards.calculateRewards('pool1', 'user1');
      expect(rewardsAfter).toBeCloseTo(0, 5);
    });
  });

  // getPoolStats
  describe('getPoolStats', () => {
    test('returns totalLiquidity of 0 for empty pool', () => {
      const stats = rewards.getPoolStats('pool1');
      expect(stats.totalLiquidity).toBe(0);
    });

    test('sums all providers in a pool', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 1000);
      rewards.addLiquidityProvider('pool1', 'user2', 2000);
      const stats = rewards.getPoolStats('pool1');
      expect(stats.totalLiquidity).toBe(3000);
    });

    test('does not include providers from other pools with similar prefix', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 1000);
      rewards.addLiquidityProvider('pool10', 'user1', 5000);
      const stats = rewards.getPoolStats('pool1');
      expect(stats.totalLiquidity).toBe(1000);
    });

    test('does not include providers from pool100 when querying pool1', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 500);
      rewards.addLiquidityProvider('pool100', 'user1', 9000);
      expect(rewards.getPoolStats('pool1').totalLiquidity).toBe(500);
    });

    test('returns correct apy percentage', () => {
      const stats = rewards.getPoolStats('pool1');
      expect(stats.apy).toBe(5);
    });

    test('returns dailyRewards proportional to totalLiquidity', () => {
      rewards.addLiquidityProvider('pool1', 'user1', 3650);
      const stats = rewards.getPoolStats('pool1');
      expect(stats.dailyRewards).toBeCloseTo(0.5, 3);
    });
  });
});
