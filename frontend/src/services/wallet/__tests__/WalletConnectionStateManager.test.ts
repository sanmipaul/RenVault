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

  // ─── setConnected ───────────────────────────────────────────────────────

  describe('setConnected', () => {
    const WALLET_ID = 'leather';
    const ADDRESS = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';
    const PUB_KEY = 'pubkey123';

    it('sets status to connected', () => {
      WalletConnectionStateManager.setConnected(WALLET_ID, ADDRESS, PUB_KEY);
      expect(WalletConnectionStateManager.getStatus()).toBe('connected');
    });

    it('isConnected returns true after setConnected', () => {
      WalletConnectionStateManager.setConnected(WALLET_ID, ADDRESS, PUB_KEY);
      expect(WalletConnectionStateManager.isConnected()).toBe(true);
    });

    it('getConnectedAddress returns the correct address', () => {
      WalletConnectionStateManager.setConnected(WALLET_ID, ADDRESS, PUB_KEY);
      expect(WalletConnectionStateManager.getConnectedAddress()).toBe(ADDRESS);
    });

    it('getConnectedWalletId returns the correct wallet id', () => {
      WalletConnectionStateManager.setConnected(WALLET_ID, ADDRESS, PUB_KEY);
      expect(WalletConnectionStateManager.getConnectedWalletId()).toBe(WALLET_ID);
    });

    it('persists session to localStorage', () => {
      WalletConnectionStateManager.setConnected(WALLET_ID, ADDRESS, PUB_KEY);
      const stored = localStorage.getItem('wallet_connection_session');
      expect(stored).not.toBeNull();
    });
  });

  // ─── setDisconnected ────────────────────────────────────────────────────

  describe('setDisconnected', () => {
    it('resets status to disconnected', () => {
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      WalletConnectionStateManager.setDisconnected();
      expect(WalletConnectionStateManager.getStatus()).toBe('disconnected');
    });

    it('clears address and walletId after disconnect', () => {
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      WalletConnectionStateManager.setDisconnected();
      expect(WalletConnectionStateManager.getConnectedAddress()).toBeNull();
      expect(WalletConnectionStateManager.getConnectedWalletId()).toBeNull();
    });

    it('removes session from localStorage on disconnect', () => {
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      WalletConnectionStateManager.setDisconnected();
      expect(localStorage.getItem('wallet_connection_session')).toBeNull();
    });
  });

  // ─── setError ───────────────────────────────────────────────────────────

  describe('setError', () => {
    it('sets status to error', () => {
      WalletConnectionStateManager.setError(new Error('connect failed'));
      expect(WalletConnectionStateManager.getStatus()).toBe('error');
    });

    it('stores the error object in state', () => {
      const err = new Error('wallet locked');
      WalletConnectionStateManager.setError(err);
      expect(WalletConnectionStateManager.getState().error).toBe(err);
    });
  });

  // ─── setConnecting ──────────────────────────────────────────────────────

  describe('setConnecting', () => {
    it('sets status to connecting', () => {
      WalletConnectionStateManager.setConnecting('xverse');
      expect(WalletConnectionStateManager.getStatus()).toBe('connecting');
    });

    it('stores the walletId when connecting', () => {
      WalletConnectionStateManager.setConnecting('xverse');
      expect(WalletConnectionStateManager.getConnectedWalletId()).toBe('xverse');
    });
  });

  // ─── validateSession ────────────────────────────────────────────────────

  describe('validateSession', () => {
    it('returns false when no session is saved', () => {
      expect(WalletConnectionStateManager.validateSession()).toBe(false);
    });

    it('returns true for a freshly saved session', () => {
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      expect(WalletConnectionStateManager.validateSession()).toBe(true);
    });
  });

  // ─── onStateChange ──────────────────────────────────────────────────────

  describe('onStateChange', () => {
    it('notifies listener when state changes', () => {
      const listener = jest.fn();
      const unsubscribe = WalletConnectionStateManager.onStateChange(listener);
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('unsubscribing stops further notifications', () => {
      const listener = jest.fn();
      const unsubscribe = WalletConnectionStateManager.onStateChange(listener);
      unsubscribe();
      WalletConnectionStateManager.setConnected('leather', 'SP123', 'pub');
      expect(listener).not.toHaveBeenCalled();
    });

    it('passes the new state snapshot to the listener', () => {
      const listener = jest.fn();
      const unsubscribe = WalletConnectionStateManager.onStateChange(listener);
      WalletConnectionStateManager.setConnected('leather', 'SP3TEST', 'pub');
      expect(listener.mock.calls[0][0].address).toBe('SP3TEST');
      unsubscribe();
    });
  });
});
