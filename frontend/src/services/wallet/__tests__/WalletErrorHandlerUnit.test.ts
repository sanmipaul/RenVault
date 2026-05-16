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
  });
});
