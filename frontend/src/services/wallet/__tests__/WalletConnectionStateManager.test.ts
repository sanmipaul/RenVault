import { WalletConnectionStateManager } from '../WalletConnectionStateManager';

jest.mock('../../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('WalletConnectionStateManager', () => {
  beforeEach(() => {
    localStorage.clear();
    WalletConnectionStateManager.reset();
  });

  afterAll(() => {
    WalletConnectionStateManager.destroy();
  });

  // ─── initial state ──────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts in disconnected status', () => {
      expect(WalletConnectionStateManager.getStatus()).toBe('disconnected');
    });

    it('isConnected returns false initially', () => {
      expect(WalletConnectionStateManager.isConnected()).toBe(false);
    });

    it('getConnectedAddress returns null initially', () => {
      expect(WalletConnectionStateManager.getConnectedAddress()).toBeNull();
    });

    it('getConnectedWalletId returns null initially', () => {
      expect(WalletConnectionStateManager.getConnectedWalletId()).toBeNull();
    });
  });
});
