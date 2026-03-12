const { ReferralManager } = require('./referralManager');

describe('ReferralManager', () => {
  let rm;

  beforeEach(() => {
    rm = new ReferralManager();
  });

  describe('generateReferralCode', () => {
    test('returns last 8 chars uppercased', () => {
      const code = rm.generateReferralCode('SP1234567890ABCDEF');
      expect(code).toBe('90ABCDEF');
    });
  });

  describe('registerReferral', () => {
    test('registers a valid referral', () => {
      const result = rm.registerReferral('user1', 'referrer1');
      expect(result.success).toBe(true);
      expect(result.referrer).toBe('referrer1');
      expect(result.bonus).toBe(rm.settings.referralBonus);
    });

    test('increments referrer count', () => {
      rm.registerReferral('user1', 'referrer1');
      rm.registerReferral('user2', 'referrer1');
      expect(rm.referralCounts.get('referrer1')).toBe(2);
    });

    test('gives bonus to new user', () => {
      rm.registerReferral('user1', 'referrer1');
      expect(rm.userRewards.get('user1')).toBe(rm.settings.referralBonus);
    });

    test('throws if user refers themselves', () => {
      expect(() => rm.registerReferral('alice', 'alice')).toThrow('Cannot refer yourself');
    });

    test('throws if user already has a referrer', () => {
      rm.registerReferral('user1', 'referrer1');
      expect(() => rm.registerReferral('user1', 'referrer2')).toThrow('User already has a referrer');
    });
  });

  describe('processReferralReward', () => {
    test('calculates commission for referred user', () => {
      rm.registerReferral('user1', 'referrer1');
      const result = rm.processReferralReward('user1', 1000);
      expect(result.commission).toBe(50); // 5% of 1000
      expect(result.referrer).toBe('referrer1');
    });

    test('returns zero commission for non-referred user', () => {
      const result = rm.processReferralReward('unknown', 1000);
      expect(result.commission).toBe(0);
    });

    test('accumulates rewards for referrer', () => {
      rm.registerReferral('user1', 'referrer1');
      rm.processReferralReward('user1', 1000);
      rm.processReferralReward('user1', 2000);
      expect(rm.referralRewards.get('referrer1')).toBe(150); // 50 + 100
    });

    test('throws if transactionAmount is negative', () => {
      expect(() => rm.processReferralReward('user1', -1)).toThrow('transactionAmount must be a non-negative number');
    });

    test('allows zero transactionAmount', () => {
      rm.registerReferral('user1', 'referrer1');
      const result = rm.processReferralReward('user1', 0);
      expect(result.commission).toBe(0);
    });
  });

  describe('claimRewards', () => {
    test('claims accumulated rewards and clears balance', () => {
      rm.registerReferral('user1', 'referrer1');
      rm.processReferralReward('user1', 1000);
      const result = rm.claimRewards('referrer1');
      expect(result.success).toBe(true);
      expect(result.amount).toBe(50);
      expect(rm.referralRewards.has('referrer1')).toBe(false);
    });

    test('throws if no rewards to claim', () => {
      expect(() => rm.claimRewards('nobody')).toThrow('No rewards to claim');
    });
  });

  describe('getReferralStats', () => {
    test('returns stats for a referrer', () => {
      rm.registerReferral('user1', 'referrer1');
      rm.processReferralReward('user1', 2000);
      const stats = rm.getReferralStats('referrer1');
      expect(stats.referralCount).toBe(1);
      expect(stats.totalRewards).toBe(100);
    });

    test('returns default stats for unknown user', () => {
      const stats = rm.getReferralStats('nobody');
      expect(stats.referralCount).toBe(0);
      expect(stats.totalRewards).toBe(0);
    });
  });

  describe('getLeaderboard', () => {
    test('returns referrers sorted by count', () => {
      rm.registerReferral('u1', 'alice');
      rm.registerReferral('u2', 'alice');
      rm.registerReferral('u3', 'bob');
      const board = rm.getLeaderboard(2);
      expect(board[0].address).toBe('alice');
      expect(board[0].referralCount).toBe(2);
    });

    test('respects limit', () => {
      rm.registerReferral('u1', 'a');
      rm.registerReferral('u2', 'b');
      rm.registerReferral('u3', 'c');
      expect(rm.getLeaderboard(2)).toHaveLength(2);
    });
  });

  describe('updateSettings', () => {
    test('updates referralBonus', () => {
      rm.updateSettings({ referralBonus: 100000 });
      expect(rm.settings.referralBonus).toBe(100000);
    });

    test('updates referrerCommission', () => {
      rm.updateSettings({ referrerCommission: 10 });
      expect(rm.settings.referrerCommission).toBe(10);
    });

    test('throws if commission exceeds max', () => {
      expect(() => rm.updateSettings({ referrerCommission: 25 })).toThrow('Commission cannot exceed');
    });

    test('throws if referrerCommission is negative', () => {
      expect(() => rm.updateSettings({ referrerCommission: -1 })).toThrow('referrerCommission must be a non-negative number');
    });
  });
});
