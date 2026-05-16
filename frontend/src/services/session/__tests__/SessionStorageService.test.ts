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

  // ─── session expiry ─────────────────────────────────────────────────────

  describe('expired session handling', () => {
    it('returns null for an expired session', () => {
      service.storeSession(BASE_SESSION);
      const stored = JSON.parse(localStorage.getItem('renvault_wallet_session')!);
      // Decode, expire it, re-encode
      const decoded = JSON.parse(atob(stored.data));
      decoded.expiresAt = Date.now() - 1000; // one second ago
      stored.data = btoa(JSON.stringify(decoded));
      // Recompute checksum
      let hash = 0;
      const s = JSON.stringify(decoded);
      for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      stored.checksum = hash.toString(36);
      localStorage.setItem('renvault_wallet_session', JSON.stringify(stored));
      expect(service.getStoredSession()).toBeNull();
    });

    it('clears storage when session is expired', () => {
      service.storeSession(BASE_SESSION);
      const stored = JSON.parse(localStorage.getItem('renvault_wallet_session')!);
      const decoded = JSON.parse(atob(stored.data));
      decoded.expiresAt = Date.now() - 1000;
      stored.data = btoa(JSON.stringify(decoded));
      let hash = 0;
      const s = JSON.stringify(decoded);
      for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash = hash & hash;
      }
      stored.checksum = hash.toString(36);
      localStorage.setItem('renvault_wallet_session', JSON.stringify(stored));
      service.getStoredSession();
      expect(localStorage.getItem('renvault_wallet_session')).toBeNull();
    });
  });

  // ─── clearSession ───────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('removes the session from storage', () => {
      service.storeSession(BASE_SESSION);
      service.clearSession();
      expect(service.getStoredSession()).toBeNull();
    });

    it('does nothing when no session exists', () => {
      expect(() => service.clearSession()).not.toThrow();
    });
  });

  // ─── hasValidSession ────────────────────────────────────────────────────

  describe('hasValidSession', () => {
    it('returns true when a valid session exists', () => {
      service.storeSession(BASE_SESSION);
      expect(service.hasValidSession()).toBe(true);
    });

    it('returns false when no session exists', () => {
      expect(service.hasValidSession()).toBe(false);
    });
  });

  // ─── getSessionExpiration ───────────────────────────────────────────────

  describe('getSessionExpiration', () => {
    it('returns the expiresAt timestamp', () => {
      service.storeSession(BASE_SESSION);
      const expiry = service.getSessionExpiration();
      expect(expiry).toBeGreaterThan(Date.now());
    });

    it('returns null when no session exists', () => {
      expect(service.getSessionExpiration()).toBeNull();
    });
  });

  // ─── validateSessionIntegrity ───────────────────────────────────────────

  describe('validateSessionIntegrity', () => {
    it('returns true for a valid stored session', () => {
      service.storeSession(BASE_SESSION);
      expect(service.validateSessionIntegrity()).toBe(true);
    });

    it('returns false when no session exists', () => {
      expect(service.validateSessionIntegrity()).toBe(false);
    });

    it('returns false for corrupted session data', () => {
      localStorage.setItem('renvault_wallet_session', 'not-valid-json');
      expect(service.validateSessionIntegrity()).toBe(false);
    });
  });
});
