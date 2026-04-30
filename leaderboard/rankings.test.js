const LeaderboardManager = require('./rankings');

describe('LeaderboardManager', () => {
  let lm;

  beforeEach(() => {
    lm = new LeaderboardManager();
  });

  // Inject user data directly to avoid network calls
  const addUser = (lm, address, balance, points) => {
    const score = lm.calculateScore(balance, points);
    lm.users.set(address, { address, balance, points, score, lastUpdated: Date.now() });
  };

  describe('calculateScore', () => {
    test('combines balance and points correctly', () => {
      // (1000000 / 1000000) + (5 * 10) = 1 + 50 = 51
      expect(lm.calculateScore(1000000, 5)).toBe(51);
    });

    test('returns 0 for zero balance and zero points', () => {
      expect(lm.calculateScore(0, 0)).toBe(0);
    });
  });

  describe('getTopUsers', () => {
    test('returns users sorted by score descending', () => {
      addUser(lm, 'alice', 1000000, 1);  // score: 11
      addUser(lm, 'bob', 5000000, 2);    // score: 25
      const top = lm.getTopUsers(2);
      expect(top[0].address).toBe('bob');
      expect(top[1].address).toBe('alice');
    });

    test('respects limit', () => {
      addUser(lm, 'a', 1000000, 1);
      addUser(lm, 'b', 2000000, 2);
      addUser(lm, 'c', 3000000, 3);
      expect(lm.getTopUsers(2)).toHaveLength(2);
    });

    test('returns empty array for empty leaderboard', () => {
      expect(lm.getTopUsers()).toHaveLength(0);
    });
  });

  describe('getUserRank', () => {
    test('returns correct rank (1-based) for a known user', () => {
      addUser(lm, 'alice', 5000000, 5);
      addUser(lm, 'bob', 1000000, 1);
      expect(lm.getUserRank('alice')).toBe(1);
      expect(lm.getUserRank('bob')).toBe(2);
    });

    test('returns null for an unknown user', () => {
      addUser(lm, 'alice', 1000000, 1);
      expect(lm.getUserRank('nobody')).toBeNull();
    });

    test('returns null (not 0) when leaderboard is empty', () => {
      expect(lm.getUserRank('anyone')).toBeNull();
    });
  });
});
