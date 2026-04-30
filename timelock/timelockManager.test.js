const { TimelockManager } = require('./timelockManager');

describe('TimelockManager', () => {
  let tm;
  const VALID_DELAY = 86400000; // 24h (minDelay)

  beforeEach(() => {
    tm = new TimelockManager();
  });

  // queueTransaction
  describe('queueTransaction', () => {
    test('queues a valid transaction and returns an id', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      expect(txId).toBe(1);
      expect(tm.getTransaction(1)).toBeDefined();
    });

    test('increments id for each queued transaction', () => {
      tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      const txId = tm.queueTransaction('vault', 'resume', [], VALID_DELAY);
      expect(txId).toBe(2);
    });

    test('throws if target is missing', () => {
      expect(() => tm.queueTransaction('', 'pause', [], VALID_DELAY)).toThrow('target is required');
    });

    test('throws if functionName is missing', () => {
      expect(() => tm.queueTransaction('vault', '', [], VALID_DELAY)).toThrow('functionName is required');
    });

    test('throws if delay is below minDelay', () => {
      expect(() => tm.queueTransaction('vault', 'pause', [], 1000)).toThrow('Invalid delay period');
    });

    test('throws if delay is above maxDelay', () => {
      expect(() => tm.queueTransaction('vault', 'pause', [], tm.maxDelay + 1)).toThrow('Invalid delay period');
    });

    test('throws if delay is not a number', () => {
      expect(() => tm.queueTransaction('vault', 'pause', [], '1day')).toThrow('Invalid delay period');
    });
  });

  // executeTransaction
  describe('executeTransaction', () => {
    test('throws if transaction not found', () => {
      expect(() => tm.executeTransaction(999)).toThrow('Transaction not found');
    });

    test('throws if transaction not yet ready', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      expect(() => tm.executeTransaction(txId)).toThrow('Transaction not ready');
    });

    test('executes a ready transaction', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      tm.getTransaction(txId).eta = Date.now() - 1; // backdate to make it ready
      const result = tm.executeTransaction(txId);
      expect(result.success).toBe(true);
      expect(tm.getTransaction(txId).executed).toBe(true);
    });

    test('throws if already executed', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      tm.getTransaction(txId).eta = Date.now() - 1;
      tm.executeTransaction(txId);
      expect(() => tm.executeTransaction(txId)).toThrow('Already executed');
    });

    test('throws if cancelled', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      tm.cancelTransaction(txId);
      tm.getTransaction(txId).eta = Date.now() - 1;
      expect(() => tm.executeTransaction(txId)).toThrow('Transaction cancelled');
    });
  });

  // cancelTransaction
  describe('cancelTransaction', () => {
    test('cancels a pending transaction', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      const result = tm.cancelTransaction(txId);
      expect(result.success).toBe(true);
      expect(tm.getTransaction(txId).cancelled).toBe(true);
    });

    test('throws if transaction not found', () => {
      expect(() => tm.cancelTransaction(999)).toThrow('Transaction not found');
    });

    test('throws if already cancelled', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      tm.cancelTransaction(txId);
      expect(() => tm.cancelTransaction(txId)).toThrow('Already cancelled');
    });
  });

  // setDelays
  describe('setDelays', () => {
    test('updates min and max delay', () => {
      const result = tm.setDelays(3600000, 86400000);
      expect(result.minDelay).toBe(3600000);
    });

    test('throws if minDelay is not positive', () => {
      expect(() => tm.setDelays(0, 86400000)).toThrow('minDelay must be a positive number');
    });

    test('throws if maxDelay is not positive', () => {
      expect(() => tm.setDelays(3600000, -1)).toThrow('maxDelay must be a positive number');
    });

    test('throws if minDelay >= maxDelay', () => {
      expect(() => tm.setDelays(86400000, 86400000)).toThrow('Invalid delay configuration');
    });
  });

  // isReady / getTimeRemaining
  describe('isReady / getTimeRemaining', () => {
    test('isReady returns false for unknown txId', () => {
      expect(tm.isReady(999)).toBe(false);
    });

    test('getTimeRemaining returns null for unknown txId', () => {
      expect(tm.getTimeRemaining(999)).toBeNull();
    });

    test('getTimeRemaining returns 0 for a ready transaction', () => {
      const txId = tm.queueTransaction('vault', 'pause', [], VALID_DELAY);
      tm.getTransaction(txId).eta = Date.now() - 1;
      expect(tm.getTimeRemaining(txId)).toBe(0);
    });
  });
});
