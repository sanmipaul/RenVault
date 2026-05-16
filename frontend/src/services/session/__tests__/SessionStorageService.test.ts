import { SessionStorageService } from '../SessionStorageService';
import { WalletProviderType } from '../../../types/wallet';

jest.mock('../../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const BASE_SESSION = {
  providerType: 'leather' as WalletProviderType,
  address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
  publicKey: 'abc123pubkey',
  connectedAt: Date.now(),
};

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = SessionStorageService.getInstance();
  });

  // ─── storeSession / getStoredSession ────────────────────────────────────

  describe('storeSession and getStoredSession', () => {
    it('stores and retrieves a session', () => {
      service.storeSession(BASE_SESSION);
      const retrieved = service.getStoredSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.address).toBe(BASE_SESSION.address);
    });

    it('assigns an expiresAt in the future', () => {
      service.storeSession(BASE_SESSION);
      const retrieved = service.getStoredSession();
      expect(retrieved!.expiresAt).toBeGreaterThan(Date.now());
    });

    it('assigns a unique sessionId', () => {
      service.storeSession(BASE_SESSION);
      const s1 = service.getStoredSession();
      service.storeSession(BASE_SESSION);
      const s2 = service.getStoredSession();
      expect(s1!.sessionId).not.toBe(s2!.sessionId);
    });

    it('returns null when localStorage is empty', () => {
      expect(service.getStoredSession()).toBeNull();
    });
  });
});
