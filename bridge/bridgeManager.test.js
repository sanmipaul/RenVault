const { BridgeManager } = require('./bridgeManager');

describe('BridgeManager', () => {
  let bm;

  beforeEach(() => {
    bm = new BridgeManager();
  });

  describe('generateTxId', () => {
    test('returns a 64-char hex string', () => {
      const id = bm.generateTxId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{64}$/);
    });

    test('returns unique ids each call', () => {
      expect(bm.generateTxId()).not.toBe(bm.generateTxId());
    });
  });

  describe('initiateBridge', () => {
    test('returns a hex string txId for valid inputs', async () => {
      const txId = await bm.initiateBridge('ethereum', 'bitcoin', 1000, 'user1');
      expect(typeof txId).toBe('string');
      expect(txId).toHaveLength(64);
    });

    test('stores the transaction and retrieves it by txId', async () => {
      const txId = await bm.initiateBridge('ethereum', 'polygon', 500, 'user1');
      const tx = bm.getTransactionStatus(txId);
      expect(tx).toBeDefined();
      expect(tx.status).toBe('pending');
      expect(tx.amount).toBe(500);
    });

    test('throws for unsupported source chain', async () => {
      await expect(bm.initiateBridge('solana', 'ethereum', 100, 'user1'))
        .rejects.toThrow('Unsupported source chain');
    });

    test('throws for unsupported target chain', async () => {
      await expect(bm.initiateBridge('ethereum', 'solana', 100, 'user1'))
        .rejects.toThrow('Unsupported target chain');
    });

    test('throws if amount is zero', async () => {
      await expect(bm.initiateBridge('ethereum', 'bitcoin', 0, 'user1'))
        .rejects.toThrow('amount must be a positive number');
    });

    test('throws if amount is negative', async () => {
      await expect(bm.initiateBridge('ethereum', 'bitcoin', -50, 'user1'))
        .rejects.toThrow();
    });
  });

  describe('lockAssets', () => {
    test('transitions status to locked', async () => {
      const txId = await bm.initiateBridge('ethereum', 'bitcoin', 1000, 'user1');
      await bm.lockAssets(txId, 1000);
      expect(bm.getTransactionStatus(txId).status).toBe('locked');
    });

    test('throws if transaction not found', async () => {
      await expect(bm.lockAssets('nonexistent', 100)).rejects.toThrow('Transaction not found');
    });
  });

  describe('releaseAssets', () => {
    test('transitions a locked tx to released', async () => {
      const txId = await bm.initiateBridge('ethereum', 'bitcoin', 1000, 'user1');
      await bm.lockAssets(txId, 1000);
      const result = await bm.releaseAssets(txId, 'target-addr');
      expect(result.success).toBe(true);
      expect(bm.getTransactionStatus(txId).status).toBe('released');
    });

    test('throws if tx is not locked', async () => {
      const txId = await bm.initiateBridge('ethereum', 'bitcoin', 1000, 'user1');
      await expect(bm.releaseAssets(txId, 'target')).rejects.toThrow('Invalid transaction state');
    });
  });

  describe('getSupportedChains', () => {
    test('returns supported chains list', () => {
      expect(bm.getSupportedChains()).toContain('ethereum');
    });
  });
});
