import { WalletErrorHandler, WalletErrorType, ErrorContext } from '../WalletErrorHandler';

jest.mock('../../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Prevent dynamic imports from breaking in test env
jest.mock('../WalletInstallationLinksService', () => ({
  WalletInstallationLinksService: {
    getInstallationLink: jest.fn().mockReturnValue({ downloadUrl: 'https://example.com' }),
  },
}));
jest.mock('../StacksConnectorAdapter', () => ({
  StacksConnectorAdapter: jest.fn().mockImplementation(() => ({ connect: jest.fn() })),
}));
jest.mock('../WalletFallbackManager', () => ({
  WalletFallbackManager: {
    connectWithFallback: jest.fn().mockResolvedValue({ success: true, strategy: {} }),
  },
}));

const ctx: ErrorContext = { walletId: 'leather', operation: 'connect' };

describe('WalletErrorHandler', () => {
  beforeEach(() => {
    WalletErrorHandler.clearErrorHistory();
  });

  // ─── error categorization ────────────────────────────────────────────

  describe('handleError - categorization', () => {
    it('categorizes "not installed" message as WALLET_NOT_INSTALLED', () => {
      const err = WalletErrorHandler.handleError(new Error('Wallet not installed'), ctx);
      expect(err.type).toBe(WalletErrorType.WALLET_NOT_INSTALLED);
    });

    it('categorizes "cancelled" message as CONNECTION_CANCELLED', () => {
      const err = WalletErrorHandler.handleError(new Error('User cancelled the request'), ctx);
      expect(err.type).toBe(WalletErrorType.CONNECTION_CANCELLED);
    });

    it('categorizes "timeout" message as CONNECTION_TIMEOUT', () => {
      const err = WalletErrorHandler.handleError(new Error('Connection timed out'), ctx);
      expect(err.type).toBe(WalletErrorType.CONNECTION_TIMEOUT);
    });

    it('categorizes "insufficient balance" as INSUFFICIENT_BALANCE', () => {
      const err = WalletErrorHandler.handleError(new Error('Insufficient balance for transaction'), ctx);
      expect(err.type).toBe(WalletErrorType.INSUFFICIENT_BALANCE);
    });

    it('categorizes "network" message as NETWORK_ERROR', () => {
      const err = WalletErrorHandler.handleError(new Error('network connection refused'), ctx);
      expect(err.type).toBe(WalletErrorType.NETWORK_ERROR);
    });

    it('categorizes unknown errors as UNKNOWN', () => {
      const err = WalletErrorHandler.handleError(new Error('something weird'), ctx);
      expect(err.type).toBe(WalletErrorType.UNKNOWN);
    });

    it('includes walletId from context', () => {
      const err = WalletErrorHandler.handleError(new Error('fail'), ctx);
      expect(err.walletId).toBe('leather');
    });

    it('attaches a timestamp to each error', () => {
      const before = Date.now();
      const err = WalletErrorHandler.handleError(new Error('fail'), ctx);
      expect(err.timestamp).toBeGreaterThanOrEqual(before);
    });
  });

  // ─── recoverable flag ────────────────────────────────────────────────

  describe('recoverable flag', () => {
    it('marks WALLET_NOT_INSTALLED as recoverable', () => {
      const err = WalletErrorHandler.handleError(new Error('not installed'), ctx);
      expect(err.recoverable).toBe(true);
    });

    it('marks CONNECTION_TIMEOUT as recoverable', () => {
      const err = WalletErrorHandler.handleError(new Error('Connection timed out'), ctx);
      expect(err.recoverable).toBe(true);
    });

    it('marks UNKNOWN as not recoverable', () => {
      const err = WalletErrorHandler.handleError(new Error('something weird'), ctx);
      expect(err.recoverable).toBe(false);
    });
  });

  // ─── error history ───────────────────────────────────────────────────

  describe('getErrorHistory', () => {
    it('accumulates errors in history', () => {
      WalletErrorHandler.handleError(new Error('err1'), ctx);
      WalletErrorHandler.handleError(new Error('err2'), ctx);
      expect(WalletErrorHandler.getErrorHistory().length).toBe(2);
    });

    it('clearErrorHistory empties the history', () => {
      WalletErrorHandler.handleError(new Error('err'), ctx);
      WalletErrorHandler.clearErrorHistory();
      expect(WalletErrorHandler.getErrorHistory().length).toBe(0);
    });

    it('filters history by walletId', () => {
      WalletErrorHandler.handleError(new Error('err'), { walletId: 'leather', operation: 'connect' });
      WalletErrorHandler.handleError(new Error('err'), { walletId: 'xverse', operation: 'connect' });
      const leatherErrors = WalletErrorHandler.getErrorHistory('leather');
      expect(leatherErrors.length).toBe(1);
      expect(leatherErrors[0].walletId).toBe('leather');
    });
  });

  // ─── getErrorStats ───────────────────────────────────────────────────

  describe('getErrorStats', () => {
    it('returns zero totals when history is empty', () => {
      const stats = WalletErrorHandler.getErrorStats();
      expect(stats.total).toBe(0);
    });

    it('tallies total, byType, and byWallet correctly', () => {
      WalletErrorHandler.handleError(new Error('not installed'), { walletId: 'leather', operation: 'connect' });
      WalletErrorHandler.handleError(new Error('timeout'), { walletId: 'xverse', operation: 'connect' });
      const stats = WalletErrorHandler.getErrorStats();
      expect(stats.total).toBe(2);
      expect(stats.byWallet['leather']).toBe(1);
      expect(stats.byWallet['xverse']).toBe(1);
    });

    it('counts recoverable errors', () => {
      WalletErrorHandler.handleError(new Error('not installed'), ctx); // recoverable
      WalletErrorHandler.handleError(new Error('something weird'), ctx); // not recoverable
      const stats = WalletErrorHandler.getErrorStats();
      expect(stats.recoverableCount).toBe(1);
    });
  });

  // ─── handleWithRetry ─────────────────────────────────────────────────

  describe('handleWithRetry', () => {
    it('returns the result of a successful operation without retrying', async () => {
      const op = jest.fn().mockResolvedValue('ok');
      const result = await WalletErrorHandler.handleWithRetry(op, ctx, 3);
      expect(result).toBe('ok');
      expect(op).toHaveBeenCalledTimes(1);
    });

    it('retries a recoverable error up to maxRetries times', async () => {
      let attempts = 0;
      const op = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) throw new Error('Connection timed out');
        return Promise.resolve('success');
      });
      const result = await WalletErrorHandler.handleWithRetry(op, ctx, 3, 0);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws after max retries when all attempts fail', async () => {
      const op = jest.fn().mockRejectedValue(new Error('Connection timed out'));
      await expect(WalletErrorHandler.handleWithRetry(op, ctx, 2, 0)).rejects.toThrow();
    });
  });
});
