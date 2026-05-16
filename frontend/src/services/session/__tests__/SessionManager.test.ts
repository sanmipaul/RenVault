import { SessionManager } from '../SessionManager';
import { WalletProviderType } from '../../../types/wallet';

jest.useFakeTimers();

jest.mock('../../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../SessionMonitor', () => ({
  SessionMonitor: {
    getInstance: jest.fn().mockReturnValue({
      recordEvent: jest.fn(),
      clearAllEvents: jest.fn(),
      importEvents: jest.fn(),
      getRecentEvents: jest.fn().mockReturnValue([]),
    }),
  },
}));

const BASE_SESSION = {
  providerType: 'leather' as WalletProviderType,
  address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
  publicKey: 'pubkey-abc',
  connectedAt: Date.now(),
};

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    localStorage.clear();
    manager = SessionManager.getInstance();
    manager.initialize(undefined, undefined);
  });

  // ─── attemptSessionRestore ────────────────────────────────────────────

  describe('attemptSessionRestore', () => {
    it('returns false when no stored session exists', async () => {
      const result = await manager.attemptSessionRestore();
      expect(result).toBe(false);
    });

    it('returns true and calls onSessionRestored when session exists', async () => {
      manager.storeSession(BASE_SESSION);
      const onRestored = jest.fn().mockResolvedValue(undefined);
      manager.initialize(onRestored, undefined);
      const result = await manager.attemptSessionRestore();
      expect(result).toBe(true);
      expect(onRestored).toHaveBeenCalledTimes(1);
    });

    it('returns false and clears session when onSessionRestored throws', async () => {
      manager.storeSession(BASE_SESSION);
      const onRestored = jest.fn().mockRejectedValue(new Error('wallet unavailable'));
      manager.initialize(onRestored, undefined);
      const result = await manager.attemptSessionRestore();
      expect(result).toBe(false);
      expect(manager.hasValidSession()).toBe(false);
    });
  });
});
