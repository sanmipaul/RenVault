const { NFTMinter } = require('./nftMinter');

describe('NFTMinter', () => {
  let minter;
  const achievement = { name: 'First Steps', description: 'First deposit', rarity: 'common', points: 10 };

  beforeEach(() => {
    minter = new NFTMinter();
  });

  describe('mintAchievementBadge', () => {
    test('mints a token and returns tokenId', () => {
      const result = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      expect(result.success).toBe(true);
      expect(result.tokenId).toBe(1);
    });

    test('increments tokenId for each mint', () => {
      minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      const result = minter.mintAchievementBadge('user1', 'whale', achievement);
      expect(result.tokenId).toBe(2);
    });

    test('returns a valid 64-char hex transactionId', () => {
      const result = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      expect(result.transactionId).toMatch(/^0x[0-9a-f]{64}$/);
    });

    test('stores metadata accessible by tokenId', () => {
      const result = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      const meta = minter.getTokenMetadata(result.tokenId);
      expect(meta).toBeDefined();
      expect(meta.name).toContain('First Steps');
    });
  });

  describe('getTokenOwner', () => {
    test('returns owner for minted token', () => {
      const { tokenId } = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      expect(minter.getTokenOwner(tokenId)).toBe('user1');
    });

    test('returns null for unknown tokenId', () => {
      expect(minter.getTokenOwner(9999)).toBeNull();
    });
  });

  describe('getUserTokens', () => {
    test('returns all tokens owned by user', () => {
      minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      minter.mintAchievementBadge('user1', 'whale', achievement);
      minter.mintAchievementBadge('user2', 'first-deposit', achievement);
      expect(minter.getUserTokens('user1')).toHaveLength(2);
    });
  });

  describe('transferToken', () => {
    test('transfers ownership to new address', () => {
      const { tokenId } = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      const result = minter.transferToken(tokenId, 'user1', 'user2');
      expect(result.success).toBe(true);
      expect(minter.getTokenOwner(tokenId)).toBe('user2');
    });

    test('fails if sender is not owner', () => {
      const { tokenId } = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      const result = minter.transferToken(tokenId, 'user2', 'user3');
      expect(result.success).toBe(false);
    });

    test('throws if toAddress is empty', () => {
      const { tokenId } = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      expect(() => minter.transferToken(tokenId, 'user1', '')).toThrow('toAddress is required');
    });

    test('throws if toAddress is null', () => {
      const { tokenId } = minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      expect(() => minter.transferToken(tokenId, 'user1', null)).toThrow();
    });
  });

  describe('getMintingStats', () => {
    test('returns correct totalMinted and uniqueHolders', () => {
      minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      minter.mintAchievementBadge('user2', 'whale', achievement);
      const stats = minter.getMintingStats();
      expect(stats.totalMinted).toBe(2);
      expect(stats.uniqueHolders).toBe(2);
    });

    test('tracks achievement breakdown', () => {
      minter.mintAchievementBadge('user1', 'first-deposit', achievement);
      minter.mintAchievementBadge('user2', 'first-deposit', achievement);
      const stats = minter.getMintingStats();
      expect(stats.achievementBreakdown['first-deposit']).toBe(2);
    });
  });
});
