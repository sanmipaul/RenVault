const RewardSystem = require('./rewards');

describe('RewardSystem', () => {
  let rs;

  beforeEach(() => {
    rs = new RewardSystem();
  });

  describe('calculateReward', () => {
    test('rank 1 gets Champion tier with 2x multiplier', () => {
      const reward = rs.calculateReward(1, 100);
      expect(reward.tier).toBe('Champion');
      expect(reward.multiplier).toBe(2.0);
      expect(reward.totalPoints).toBe(Math.floor(100 * 2.0) + 100);
    });

    test('rank 2 gets Elite tier', () => {
      const reward = rs.calculateReward(2, 100);
      expect(reward.tier).toBe('Elite');
      expect(reward.multiplier).toBe(1.5);
    });

    test('rank 3 gets Elite tier', () => {
      const reward = rs.calculateReward(3, 100);
      expect(reward.tier).toBe('Elite');
    });

    test('rank 4-10 gets Pro tier', () => {
      const reward = rs.calculateReward(5, 100);
      expect(reward.tier).toBe('Pro');
      expect(reward.multiplier).toBe(1.2);
    });

    test('rank beyond 10 gets Active tier', () => {
      const reward = rs.calculateReward(50, 100);
      expect(reward.tier).toBe('Active');
      expect(reward.multiplier).toBe(1.1);
    });

    test('returns base points and bonus in result', () => {
      const reward = rs.calculateReward(1, 200);
      expect(reward.basePoints).toBe(200);
      expect(reward.bonus).toBe(100);
    });

    test('totalPoints is floored', () => {
      const reward = rs.calculateReward(4, 3); // Pro: floor(3 * 1.2) + 25 = 3 + 25 = 28
      expect(reward.totalPoints).toBe(28);
    });
  });

  describe('getSeasonRewards', () => {
    test('maps leaderboard to reward objects', () => {
      const leaderboard = [
        { address: 'alice', points: 100 },
        { address: 'bob', points: 50 }
      ];
      const rewards = rs.getSeasonRewards(leaderboard);
      expect(rewards).toHaveLength(2);
      expect(rewards[0].rank).toBe(1);
      expect(rewards[0].address).toBe('alice');
      expect(rewards[1].rank).toBe(2);
    });

    test('returns empty array for empty leaderboard', () => {
      expect(rs.getSeasonRewards([])).toHaveLength(0);
    });

    test('each entry contains reward object', () => {
      const leaderboard = [{ address: 'alice', points: 100 }];
      const rewards = rs.getSeasonRewards(leaderboard);
      expect(rewards[0].reward).toBeDefined();
      expect(rewards[0].reward.tier).toBe('Champion');
    });
  });
});
