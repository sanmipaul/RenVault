const { AchievementTracker } = require('./achievementTracker');

describe('AchievementTracker', () => {
  let at;

  beforeEach(() => {
    at = new AchievementTracker();
  });

  describe('trackUserActivity - deposit', () => {
    test('increments deposit count and total amount', () => {
      at.trackUserActivity('user1', { type: 'deposit', amount: 1000 });
      const p = at.getUserProgress('user1');
      expect(p.deposits).toBe(1);
      expect(p.totalAmount).toBe(1000);
    });

    test('accumulates across multiple deposits', () => {
      at.trackUserActivity('user1', { type: 'deposit', amount: 500 });
      at.trackUserActivity('user1', { type: 'deposit', amount: 300 });
      expect(at.getUserProgress('user1').totalAmount).toBe(800);
    });

    test('throws for negative deposit amount', () => {
      expect(() => at.trackUserActivity('user1', { type: 'deposit', amount: -1 }))
        .toThrow('deposit amount must be a non-negative number');
    });

    test('throws for undefined deposit amount', () => {
      expect(() => at.trackUserActivity('user1', { type: 'deposit', amount: undefined }))
        .toThrow();
    });

    test('allows zero deposit amount', () => {
      expect(() => at.trackUserActivity('user1', { type: 'deposit', amount: 0 })).not.toThrow();
    });
  });

  describe('trackUserActivity - commitment', () => {
    test('sets commitment points', () => {
      at.trackUserActivity('user1', { type: 'commitment', points: 50 });
      expect(at.getUserProgress('user1').commitment).toBe(50);
    });
  });

  describe('trackUserActivity - registration', () => {
    test('sets userRank', () => {
      at.trackUserActivity('user1', { type: 'registration', rank: 42 });
      expect(at.getUserProgress('user1').userRank).toBe(42);
    });
  });

  describe('checkAchievements', () => {
    test('awards first-deposit achievement after one deposit', () => {
      const awarded = at.trackUserActivity('user1', { type: 'deposit', amount: 1 });
      expect(awarded.some(a => a.id === 'first-deposit')).toBe(true);
    });

    test('awards whale achievement when totalAmount exceeds threshold', () => {
      const awarded = at.trackUserActivity('user1', { type: 'deposit', amount: 100000000 });
      expect(awarded.some(a => a.id === 'whale')).toBe(true);
    });

    test('does not re-award the same achievement', () => {
      at.trackUserActivity('user1', { type: 'deposit', amount: 1 });
      const second = at.trackUserActivity('user1', { type: 'deposit', amount: 1 });
      expect(second.filter(a => a.id === 'first-deposit')).toHaveLength(0);
    });
  });

  describe('getUserAchievements', () => {
    test('returns earned achievement details', () => {
      at.trackUserActivity('user1', { type: 'deposit', amount: 1 });
      const achs = at.getUserAchievements('user1');
      expect(achs.some(a => a.id === 'first-deposit')).toBe(true);
    });

    test('returns empty array for user with no achievements', () => {
      expect(at.getUserAchievements('nobody')).toHaveLength(0);
    });
  });

  describe('getAchievementStats', () => {
    test('returns holder counts for each achievement', () => {
      at.trackUserActivity('user1', { type: 'deposit', amount: 1 });
      const stats = at.getAchievementStats();
      expect(stats['first-deposit'].holders).toBe(1);
    });
  });
});
