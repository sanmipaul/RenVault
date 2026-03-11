const { StakingManager } = require('./stakingManager');

describe('StakingManager.calculateRewards', () => {
  let manager;

  beforeEach(() => {
    manager = new StakingManager();
  });

  test('returns 0 when user has no stake', () => {
    expect(manager.calculateRewards('addr1')).toBe(0);
  });

  test('returns 0 when less than one lock period has elapsed', () => {
    manager.stake('addr1', manager.minStake);
    // No time has passed — epochs = 0
    expect(manager.calculateRewards('addr1')).toBe(0);
  });

  test('calculates correct reward for one epoch at 1% rate', () => {
    const stakeAmount = 1_000_000;
    manager.stake('addr1', stakeAmount);

    // Backdate the timestamp by exactly one lock period
    manager.stakeTimestamps.set('addr1', Date.now() - manager.lockPeriod);

    const rewards = manager.calculateRewards('addr1');
    // Expected: 1_000_000 * 0.01 * 1 epoch = 10_000
    expect(rewards).toBe(10_000);
  });

  test('scales linearly with multiple epochs', () => {
    const stakeAmount = 2_000_000;
    const epochs = 3;
    manager.stake('addr1', stakeAmount);
    manager.stakeTimestamps.set('addr1', Date.now() - manager.lockPeriod * epochs);

    const rewards = manager.calculateRewards('addr1');
    // Expected: 2_000_000 * 0.01 * 3 = 60_000
    expect(rewards).toBe(60_000);
  });
});

describe('StakingManager.updateRewardRate', () => {
  let manager;

  beforeEach(() => {
    manager = new StakingManager();
  });

  test('rejects a rate of exactly 0', () => {
    expect(() => manager.updateRewardRate(0)).toThrow('Invalid reward rate');
  });

  test('rejects negative rates', () => {
    expect(() => manager.updateRewardRate(-0.01)).toThrow('Invalid reward rate');
  });

  test('rejects rates above 20%', () => {
    expect(() => manager.updateRewardRate(0.21)).toThrow('Invalid reward rate');
  });

  test('accepts the maximum allowed rate of 20%', () => {
    expect(manager.updateRewardRate(0.2)).toBe(0.2);
  });

  test('accepts a valid positive rate', () => {
    expect(manager.updateRewardRate(0.05)).toBe(0.05);
  });
});

describe('StakingManager partial unstake lock reset', () => {
  let manager;

  beforeEach(() => {
    manager = new StakingManager();
  });

  test('partial unstake resets lock timer so next unstake requires waiting', () => {
    const amount = manager.minStake * 2;
    manager.stake('addr1', amount);

    // Move timestamp back so the lock has expired
    manager.stakeTimestamps.set('addr1', Date.now() - manager.lockPeriod - 1);

    // First partial unstake should succeed
    manager.unstake('addr1', manager.minStake);

    // Immediately attempting a second unstake should now fail — lock was reset
    expect(() => manager.unstake('addr1', manager.minStake)).toThrow('Stake is still locked');
  });
});
