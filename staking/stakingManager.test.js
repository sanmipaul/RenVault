const { StakingManager } = require('./stakingManager');

describe('StakingManager', () => {
  let sm;
  const MIN = 1000000; // 1 STX (minStake)

  beforeEach(() => {
    sm = new StakingManager();
  });

  // stake
  describe('stake', () => {
    test('successfully stakes at or above minimum', () => {
      const result = sm.stake('alice', MIN);
      expect(result.success).toBe(true);
      expect(result.newStake).toBe(MIN);
      expect(result.totalStaked).toBe(MIN);
    });

    test('accumulates stake for the same user', () => {
      sm.stake('alice', MIN);
      const result = sm.stake('alice', MIN * 2);
      expect(result.newStake).toBe(MIN * 3);
    });

    test('throws if amount is below minimum', () => {
      expect(() => sm.stake('alice', MIN - 1)).toThrow('Minimum stake');
    });

    test('updates totalStaked across multiple users', () => {
      sm.stake('alice', MIN);
      sm.stake('bob', MIN * 2);
      expect(sm.totalStaked).toBe(MIN * 3);
    });
  });

  // unstake
  describe('unstake', () => {
    test('throws if stake is still locked', () => {
      sm.stake('alice', MIN);
      expect(() => sm.unstake('alice', MIN)).toThrow('Stake is still locked');
    });

    test('throws if insufficient staked balance', () => {
      // Manipulate timestamp to bypass lock
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod - 1);
      expect(() => sm.unstake('alice', MIN * 2)).toThrow('Insufficient staked balance');
    });

    test('allows unstake after lock period', () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod - 1);
      const result = sm.unstake('alice', MIN);
      expect(result.success).toBe(true);
      expect(result.unstaked).toBe(MIN);
      expect(result.remainingStake).toBe(0);
    });

    test('removes user from maps when fully unstaked', () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod - 1);
      sm.unstake('alice', MIN);
      expect(sm.stakes.has('alice')).toBe(false);
    });
  });

  // calculateRewards — key regression: must NOT divide by 100
  describe('calculateRewards', () => {
    test('returns 0 for user with no stake', () => {
      expect(sm.calculateRewards('nobody')).toBe(0);
    });

    test('returns 0 before one epoch has elapsed', () => {
      sm.stake('alice', MIN);
      expect(sm.calculateRewards('alice')).toBe(0);
    });

    test('returns stake * rewardRate per epoch (no extra /100)', () => {
      sm.stake('alice', MIN);
      // Fast-forward 2 epochs
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 2 - 1);
      const rewards = sm.calculateRewards('alice');
      const expected = Math.floor(MIN * sm.rewardRate * 2);
      expect(rewards).toBe(expected);
    });

    test('reward scales linearly with number of epochs', () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 5 - 1);
      const rewards = sm.calculateRewards('alice');
      const expected = Math.floor(MIN * sm.rewardRate * 5);
      expect(rewards).toBe(expected);
    });
  });

  // claimRewards
  describe('claimRewards', () => {
    test('throws if no rewards to claim', () => {
      sm.stake('alice', MIN);
      expect(() => sm.claimRewards('alice')).toThrow('No rewards to claim');
    });

    test('returns claimed amount and accumulates in rewards map', () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 3 - 1);
      const result = sm.claimRewards('alice');
      expect(result.success).toBe(true);
      expect(result.claimed).toBeGreaterThan(0);
      expect(result.totalRewards).toBe(result.claimed);
    });

    test('resets epoch counter after claim', () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 3 - 1);
      sm.claimRewards('alice');
      // Immediately after claim, no new rewards yet
      expect(sm.calculateRewards('alice')).toBe(0);
    });
  });

  // getStakeInfo
  describe('getStakeInfo', () => {
    test('returns zeroed info for user with no stake', () => {
      const info = sm.getStakeInfo('nobody');
      expect(info.stake).toBe(0);
      expect(info.pendingRewards).toBe(0);
    });

    test('returns correct info for active staker', () => {
      sm.stake('alice', MIN);
      const info = sm.getStakeInfo('alice');
      expect(info.stake).toBe(MIN);
      expect(info.isLocked).toBe(true);
    });
  });

  // getGlobalStats
  describe('getGlobalStats', () => {
    test('returns zeroes when no stakers', () => {
      const stats = sm.getGlobalStats();
      expect(stats.totalStaked).toBe(0);
      expect(stats.totalUsers).toBe(0);
      expect(stats.averageStake).toBe(0);
    });

    test('returns correct averageStake', () => {
      sm.stake('alice', MIN);
      sm.stake('bob', MIN * 3);
      const stats = sm.getGlobalStats();
      expect(stats.averageStake).toBe(MIN * 2);
    });
  });

  // getTopStakers
  describe('getTopStakers', () => {
    test('returns stakers sorted by stake descending', () => {
      sm.stake('alice', MIN);
      sm.stake('bob', MIN * 5);
      sm.stake('carol', MIN * 3);
      const top = sm.getTopStakers(3);
      expect(top[0].address).toBe('bob');
      expect(top[1].address).toBe('carol');
      expect(top[2].address).toBe('alice');
    });

    test('respects the limit parameter', () => {
      sm.stake('alice', MIN);
      sm.stake('bob', MIN * 2);
      sm.stake('carol', MIN * 3);
      expect(sm.getTopStakers(2)).toHaveLength(2);
    });
  });

  // updateRewardRate
  describe('updateRewardRate', () => {
    test('updates rate within valid range', () => {
      expect(sm.updateRewardRate(0.05)).toBe(0.05);
    });

    test('throws for rate above 0.2', () => {
      expect(() => sm.updateRewardRate(0.21)).toThrow('Invalid reward rate');
    });

    test('throws for negative rate', () => {
      expect(() => sm.updateRewardRate(-0.01)).toThrow('Invalid reward rate');
    });
  });
});
