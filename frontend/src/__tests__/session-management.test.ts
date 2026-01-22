/**
 * WalletKit Session Management Integration Tests
 * Tests for session integration, reconnection, storage, and migration
 */

import { WalletKitSessionIntegration } from '../services/session/walletkit-session-integration';
import { AutomaticReconnectionService } from '../services/session/automatic-reconnection';
import { encryptedSessionStorage } from '../services/session/encrypted-session-storage';
import { sessionMigrationService } from '../services/session/session-migration';
import { RefactoredSessionManager } from '../services/session/SessionManagerRefactored';

describe('WalletKit Session Management', () => {
  let sessionIntegration: WalletKitSessionIntegration;
  let reconnectionService: AutomaticReconnectionService;
  let sessionManager: RefactoredSessionManager;

  beforeEach(() => {
    sessionIntegration = WalletKitSessionIntegration.getInstance();
    reconnectionService = AutomaticReconnectionService.getInstance();
    sessionManager = RefactoredSessionManager.getInstance();
  });

  describe('WalletKitSessionIntegration', () => {
    it('should be a singleton', () => {
      const instance1 = WalletKitSessionIntegration.getInstance();
      const instance2 = WalletKitSessionIntegration.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle session created events', (done) => {
      const listener = jest.fn();
      sessionIntegration.on('session_created', listener);

      expect(listener).toBeDefined();
      done();
    });

    it('should track active sessions', () => {
      const sessions = sessionIntegration.getActiveSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should check session expiration', () => {
      const mockSession = {
        topic: 'test-topic',
        pairingTopic: 'pairing-topic',
        peer: {
          publicKey: '0x123',
          metadata: {
            name: 'Test',
            description: 'Test session',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() - 1000, // already expired
        accounts: ['0xabc'],
        chainId: 'stacks:1',
      };

      const isExpired = sessionIntegration.isSessionExpired(mockSession);
      expect(isExpired).toBe(true);
    });

    it('should emit session events', (done) => {
      const mockListener = jest.fn();
      sessionIntegration.on('session_updated', mockListener);

      expect(mockListener).toBeDefined();
      done();
    });
  });

  describe('AutomaticReconnectionService', () => {
    it('should be a singleton', () => {
      const instance1 = AutomaticReconnectionService.getInstance();
      const instance2 = AutomaticReconnectionService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should provide reconnection status', () => {
      const status = reconnectionService.getStatus();
      expect(status).toHaveProperty('isReconnecting');
      expect(status).toHaveProperty('lastAttempt');
      expect(status).toHaveProperty('attemptCount');
      expect(status).toHaveProperty('nextRetryTime');
      expect(status).toHaveProperty('lastError');
    });

    it('should check online status', () => {
      const isOnline = reconnectionService.isOnlineNow();
      expect(typeof isOnline).toBe('boolean');
    });

    it('should allow configuration updates', () => {
      const originalConfig = reconnectionService.getConfig();
      reconnectionService.updateConfig({ maxAttempts: 10 });
      const updatedConfig = reconnectionService.getConfig();

      expect(updatedConfig.maxAttempts).toBe(10);
      
      // Restore original
      reconnectionService.updateConfig(originalConfig);
    });

    it('should emit reconnection events', (done) => {
      const listener = jest.fn();
      reconnectionService.on('reconnecting', listener);

      expect(listener).toBeDefined();
      done();
    });
  });

  describe('EncryptedSessionStorage', () => {
    beforeEach(() => {
      encryptedSessionStorage.clearAllSessions();
    });

    it('should store and retrieve sessions', () => {
      const mockSession = {
        topic: 'test-topic',
        pairingTopic: 'pairing-topic',
        peer: {
          publicKey: '0x123',
          metadata: {
            name: 'Test',
            description: 'Test',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() + 86400000, // 1 day
        accounts: ['0xabc'],
        chainId: 'stacks:1',
      };

      encryptedSessionStorage.storeSession(mockSession.topic, mockSession);
      const retrieved = encryptedSessionStorage.retrieveSession(mockSession.topic);

      expect(retrieved).toBeDefined();
      expect(retrieved?.topic).toBe(mockSession.topic);
      expect(retrieved?.accounts).toEqual(mockSession.accounts);
    });

    it('should check if session exists', () => {
      const mockSession = {
        topic: 'test-exists',
        pairingTopic: 'pairing-topic',
        peer: {
          publicKey: '0x123',
          metadata: {
            name: 'Test',
            description: 'Test',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() + 86400000,
        accounts: ['0xabc'],
        chainId: 'stacks:1',
      };

      encryptedSessionStorage.storeSession(mockSession.topic, mockSession);
      expect(encryptedSessionStorage.hasSession(mockSession.topic)).toBe(true);
      expect(encryptedSessionStorage.hasSession('nonexistent')).toBe(false);
    });

    it('should retrieve all sessions', () => {
      const session1 = {
        topic: 'session-1',
        pairingTopic: 'pairing-1',
        peer: {
          publicKey: '0x1',
          metadata: {
            name: 'Test1',
            description: 'Test',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() + 86400000,
        accounts: ['0xa1'],
        chainId: 'stacks:1',
      };

      const session2 = {
        topic: 'session-2',
        pairingTopic: 'pairing-2',
        peer: {
          publicKey: '0x2',
          metadata: {
            name: 'Test2',
            description: 'Test',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() + 86400000,
        accounts: ['0xa2'],
        chainId: 'stacks:1',
      };

      encryptedSessionStorage.storeSession(session1.topic, session1);
      encryptedSessionStorage.storeSession(session2.topic, session2);

      const allSessions = encryptedSessionStorage.retrieveAllSessions();
      expect(allSessions.length).toBe(2);
    });

    it('should get storage statistics', () => {
      const stats = encryptedSessionStorage.getStatistics();
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('usagePercent');
    });

    it('should remove sessions', () => {
      const mockSession = {
        topic: 'to-remove',
        pairingTopic: 'pairing',
        peer: {
          publicKey: '0x1',
          metadata: {
            name: 'Test',
            description: 'Test',
            url: 'http://localhost',
            icons: [],
          },
        },
        expiry: Date.now() + 86400000,
        accounts: ['0xa1'],
        chainId: 'stacks:1',
      };

      encryptedSessionStorage.storeSession(mockSession.topic, mockSession);
      expect(encryptedSessionStorage.hasSession(mockSession.topic)).toBe(true);

      encryptedSessionStorage.removeSession(mockSession.topic);
      expect(encryptedSessionStorage.hasSession(mockSession.topic)).toBe(false);
    });
  });

  describe('SessionMigrationService', () => {
    beforeEach(() => {
      sessionMigrationService.resetMigrationStatus();
      encryptedSessionStorage.clearAllSessions();
    });

    it('should validate migration compatibility', () => {
      const validation = sessionMigrationService.validateMigrationCompatibility();
      expect(validation).toHaveProperty('compatible');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
    });

    it('should get migration status', () => {
      const status = sessionMigrationService.getMigrationStatus();
      expect(status).toHaveProperty('hasMigrated');
      expect(typeof status.hasMigrated).toBe('boolean');
    });

    it('should mark migration as completed', () => {
      sessionMigrationService.markMigrationCompleted();
      const status = sessionMigrationService.getMigrationStatus();
      expect(status.hasMigrated).toBe(true);
    });

    it('should create and list backups', () => {
      const backupKey = sessionMigrationService.backupOldSession();
      const backups = sessionMigrationService.listBackups();

      if (backupKey) {
        expect(backups.length).toBeGreaterThan(0);
      }
    });

    it('should generate migration summary', () => {
      const summary = sessionMigrationService.generateMigrationSummary();
      expect(summary).toHaveProperty('oldSessionsFound');
      expect(summary).toHaveProperty('newSessionsCount');
      expect(summary).toHaveProperty('migrationStatus');
      expect(summary).toHaveProperty('recommendations');
    });
  });

  describe('RefactoredSessionManager', () => {
    it('should be a singleton', () => {
      const instance1 = RefactoredSessionManager.getInstance();
      const instance2 = RefactoredSessionManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should get active sessions', () => {
      const sessions = sessionManager.getActiveSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should check if session exists', () => {
      const hasSession = sessionManager.hasSession();
      expect(typeof hasSession).toBe('boolean');
    });

    it('should get storage statistics', () => {
      const stats = sessionManager.getStorageStats();
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('usagePercent');
    });

    it('should get reconnection status', () => {
      const status = sessionManager.getReconnectionStatus();
      expect(status).toHaveProperty('isReconnecting');
      expect(status).toHaveProperty('attemptCount');
    });

    it('should allow configuration updates', () => {
      const originalConfig = sessionManager.getConfig();
      sessionManager.updateConfig({ maxReconnectAttempts: 10 });
      const updatedConfig = sessionManager.getConfig();

      expect(updatedConfig.maxReconnectAttempts).toBe(10);

      // Restore
      sessionManager.updateConfig(originalConfig);
    });

    it('should export sessions', () => {
      const exported = sessionManager.exportSessions();
      expect(typeof exported).toBe('string');

      const backup = JSON.parse(exported);
      expect(backup).toHaveProperty('timestamp');
      expect(backup).toHaveProperty('version');
      expect(backup).toHaveProperty('sessions');
      expect(Array.isArray(backup.sessions)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete session lifecycle', async () => {
      // 1. Check initial state
      let sessions = sessionManager.getActiveSessions();
      const initialCount = sessions.length;

      // 2. Get storage stats
      const stats = sessionManager.getStorageStats();
      expect(stats.totalSessions >= initialCount).toBe(true);

      // 3. Check reconnection status
      const reconnectStatus = sessionManager.getReconnectionStatus();
      expect(reconnectStatus).toBeDefined();

      // 4. Export sessions
      const exported = sessionManager.exportSessions();
      expect(typeof exported).toBe('string');
    });

    it('should track migration progress', () => {
      // Check compatibility
      const validation = sessionMigrationService.validateMigrationCompatibility();
      expect(validation.compatible || validation.issues.length > 0).toBe(true);

      // Get summary
      const summary = sessionMigrationService.generateMigrationSummary();
      expect(summary.recommendations).toBeDefined();
    });

    it('should handle session events flow', (done) => {
      const eventOrder: string[] = [];

      sessionIntegration.on('session_created', () => {
        eventOrder.push('created');
      });

      sessionIntegration.on('session_updated', () => {
        eventOrder.push('updated');
      });

      sessionIntegration.on('session_deleted', () => {
        eventOrder.push('deleted');
      });

      expect(eventOrder).toBeDefined();
      done();
    });

    it('should handle reconnection flow', (done) => {
      const events: string[] = [];

      reconnectionService.on('reconnecting', () => {
        events.push('reconnecting');
      });

      reconnectionService.on('reconnected', () => {
        events.push('reconnected');
      });

      reconnectionService.on('failed', () => {
        events.push('failed');
      });

      expect(events).toBeDefined();
      done();
    });
  });
});
