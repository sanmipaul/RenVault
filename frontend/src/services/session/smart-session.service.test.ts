/**
 * SmartSessionService Tests
 */

import { SmartSessionService } from '../services/session/smart-session.service';
import { SessionStatus, SessionPermission } from '../types/smartsessions';

describe('SmartSessionService', () => {
  let service: SmartSessionService;

  beforeEach(() => {
    service = SmartSessionService.getInstance();
    localStorage.clear();
  });

  it('should create a session with valid params', () => {
    const session = service.createSession({
      duration: 7 * 24 * 60 * 60 * 1000,
      spendingLimit: { amount: '1000000000', currency: 'STX' },
      constraints: {
        maxTransactionsPerDay: 10,
        operationWhitelist: [SessionPermission.VAULT_DEPOSIT],
        requiresConfirmation: false,
        allowBatching: true,
      },
      walletAddress: 'SP123456789',
    });

    expect(session.id).toBeDefined();
    expect(session.status).toBe(SessionStatus.ACTIVE);
    expect(session.walletAddress).toBe('SP123456789');
  });

  it('should retrieve active sessions', () => {
    const address = 'SP123456789';
    service.createSession({
      duration: 7 * 24 * 60 * 60 * 1000,
      spendingLimit: { amount: '1000000000', currency: 'STX' },
      constraints: {
        maxTransactionsPerDay: 10,
        operationWhitelist: [SessionPermission.VAULT_DEPOSIT],
        requiresConfirmation: false,
        allowBatching: true,
      },
      walletAddress: address,
    });

    const sessions = service.getActiveSessions(address);
    expect(sessions.length).toBe(1);
    expect(sessions[0].walletAddress).toBe(address);
  });

  it('should revoke a session', () => {
    const session = service.createSession({
      duration: 7 * 24 * 60 * 60 * 1000,
      spendingLimit: { amount: '1000000000', currency: 'STX' },
      constraints: {
        maxTransactionsPerDay: 10,
        operationWhitelist: [SessionPermission.VAULT_DEPOSIT],
        requiresConfirmation: false,
        allowBatching: true,
      },
      walletAddress: 'SP123456789',
    });

    service.revokeSession(session.id);
    const retrieved = service.getSession(session.id);
    expect(retrieved?.status).toBe(SessionStatus.REVOKED);
  });

  it('should filter expired sessions', () => {
    const session = service.createSession({
      duration: 1, // 1ms expiry for testing
      spendingLimit: { amount: '1000000000', currency: 'STX' },
      constraints: {
        maxTransactionsPerDay: 10,
        operationWhitelist: [SessionPermission.VAULT_DEPOSIT],
        requiresConfirmation: false,
        allowBatching: true,
      },
      walletAddress: 'SP123456789',
    });

    // Wait a bit for expiry
    setTimeout(() => {
      const active = service.getActiveSessions('SP123456789');
      expect(active.length).toBe(0);
    }, 10);
  });
});
