// utils/sessionTesting.ts
import { SessionStorageService } from '../services/session/SessionStorageService';
import { SessionManager } from '../services/session/SessionManager';
import { SessionMonitor } from '../services/session/SessionMonitor';

export interface TestSession {
  id: string;
  walletAddress: string;
  provider: string;
  createdAt: number;
  lastActivity: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface SessionTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface SessionTestSuite {
  name: string;
  tests: SessionTestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

export class SessionTesting {
  private static instance: SessionTesting;
  private sessionStorage = SessionStorageService.getInstance();
  private sessionManager = SessionManager.getInstance();
  private sessionMonitor = SessionMonitor.getInstance();

  private constructor() {}

  static getInstance(): SessionTesting {
    if (!SessionTesting.instance) {
      SessionTesting.instance = new SessionTesting();
    }
    return SessionTesting.instance;
  }

  /**
   * Run comprehensive session testing suite
   */
  async runFullTestSuite(): Promise<SessionTestSuite> {
    const startTime = Date.now();
    const tests: SessionTestResult[] = [];

    console.log('Running comprehensive session test suite...');

    // Test session storage
    tests.push(await this.testSessionStorage());
    tests.push(await this.testSessionPersistence());
    tests.push(await this.testSessionEncryption());
    tests.push(await this.testSessionValidation());

    // Test session manager
    tests.push(await this.testSessionManager());
    tests.push(await this.testSessionReconnection());
    tests.push(await this.testSessionCleanup());

    // Test monitoring
    tests.push(await this.testSessionMonitoring());
    tests.push(await this.testEventTracking());

    // Test performance
    tests.push(await this.testStoragePerformance());
    tests.push(await this.testConcurrentAccess());

    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const duration = Date.now() - startTime;

    const suite: SessionTestSuite = {
      name: 'Session System Test Suite',
      tests,
      totalTests,
      passedTests,
      failedTests,
      duration
    };

    console.log('Test suite completed:', suite);
    return suite;
  }

  /**
   * Test session storage functionality
   */
  private async testSessionStorage(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session storage...');

      // Create test session
      const testSession: TestSession = {
        id: 'test_session_' + Date.now(),
        walletAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        provider: 'leather',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        isActive: true,
        metadata: { test: true, version: '1.0.0' }
      };

      // Test storage
      const stored = this.sessionStorage.storeSessionData(testSession.id, testSession);
      if (!stored) {
        throw new Error('Failed to store session data');
      }

      // Test retrieval
      const retrieved = this.sessionStorage.getSessionData(testSession.id);
      if (!retrieved) {
        throw new Error('Failed to retrieve session data');
      }

      // Verify data integrity
      if (retrieved.walletAddress !== testSession.walletAddress) {
        throw new Error('Session data integrity check failed');
      }

      // Test removal
      const removed = this.sessionStorage.removeSessionData(testSession.id);
      if (!removed) {
        throw new Error('Failed to remove session data');
      }

      return {
        testName: 'Session Storage',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Storage',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session persistence across page reloads
   */
  private async testSessionPersistence(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session persistence...');

      // Create and store session
      const testSession: TestSession = {
        id: 'persistence_test_' + Date.now(),
        walletAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        provider: 'xverse',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        isActive: true,
        metadata: { persistence: true }
      };

      this.sessionStorage.storeSessionData(testSession.id, testSession);

      // Simulate page reload by creating new instance
      const newStorage = new (SessionStorageService as any)();
      const retrieved = newStorage.getSessionData(testSession.id);

      if (!retrieved || retrieved.walletAddress !== testSession.walletAddress) {
        throw new Error('Session persistence failed');
      }

      // Cleanup
      this.sessionStorage.removeSessionData(testSession.id);

      return {
        testName: 'Session Persistence',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Persistence',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session data encryption
   */
  private async testSessionEncryption(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session encryption...');

      const testData = { secret: 'sensitive_wallet_data', key: 'test_key' };

      // Test encryption/decryption
      const encrypted = this.sessionStorage.encryptData(JSON.stringify(testData));
      const decrypted = this.sessionStorage.decryptData(encrypted);
      const parsed = JSON.parse(decrypted);

      if (parsed.secret !== testData.secret) {
        throw new Error('Encryption/decryption failed');
      }

      return {
        testName: 'Session Encryption',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Encryption',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session validation
   */
  private async testSessionValidation(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session validation...');

      // Test valid session
      const validSession: TestSession = {
        id: 'valid_test_' + Date.now(),
        walletAddress: 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
        provider: 'hiro',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        isActive: true,
        metadata: {}
      };

      const isValid = this.sessionStorage.validateSessionData(validSession);
      if (!isValid) {
        throw new Error('Valid session marked as invalid');
      }

      // Test invalid session
      const invalidSession = { ...validSession, walletAddress: '' };
      const isInvalid = this.sessionStorage.validateSessionData(invalidSession);
      if (isInvalid) {
        throw new Error('Invalid session marked as valid');
      }

      return {
        testName: 'Session Validation',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Validation',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session manager functionality
   */
  private async testSessionManager(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session manager...');

      // Test session creation
      const sessionId = await this.sessionManager.createSession({
        walletAddress: 'ST1SJ3DTE5DN7X54YAS72HN51S6BA9NY51FGA1009',
        provider: 'walletconnect',
        network: 'mainnet'
      });

      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      // Test session retrieval
      const session = this.sessionManager.getCurrentSession();
      if (!session || session.id !== sessionId) {
        throw new Error('Failed to retrieve session');
      }

      // Test session update
      const updated = await this.sessionManager.updateSessionActivity();
      if (!updated) {
        throw new Error('Failed to update session activity');
      }

      return {
        testName: 'Session Manager',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Manager',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session reconnection logic
   */
  private async testSessionReconnection(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session reconnection...');

      // Create session
      const sessionId = await this.sessionManager.createSession({
        walletAddress: 'ST2JHG953KZ6B4CKD9HX8VXV985BJWK42X04YFSH2',
        provider: 'leather',
        network: 'testnet'
      });

      // Simulate disconnection
      await this.sessionManager.disconnect();

      // Test reconnection
      const reconnected = await this.sessionManager.attemptReconnection();
      if (!reconnected) {
        throw new Error('Failed to reconnect session');
      }

      return {
        testName: 'Session Reconnection',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Reconnection',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session cleanup functionality
   */
  private async testSessionCleanup(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session cleanup...');

      // Create multiple test sessions
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        const sessionId = 'cleanup_test_' + i + '_' + Date.now();
        const session: TestSession = {
          id: sessionId,
          walletAddress: `ST${i}TEST${Date.now()}`,
          provider: 'test',
          createdAt: Date.now() - (i * 24 * 60 * 60 * 1000), // Different ages
          lastActivity: Date.now() - (i * 60 * 60 * 1000), // Different activity times
          isActive: i < 3, // Some active, some inactive
          metadata: { cleanup: true }
        };
        this.sessionStorage.storeSessionData(sessionId, session);
        sessions.push(sessionId);
      }

      // Test cleanup (dry run)
      const cleanupResult = await this.sessionStorage.cleanupSessions({
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        removeExpired: true,
        removeCorrupted: true,
        removeInactive: true,
        inactiveThreshold: 2 * 60 * 60 * 1000, // 2 hours
        dryRun: true
      });

      if (cleanupResult.totalProcessed !== sessions.length) {
        throw new Error('Cleanup processed incorrect number of sessions');
      }

      // Cleanup test sessions
      sessions.forEach(id => this.sessionStorage.removeSessionData(id));

      return {
        testName: 'Session Cleanup',
        passed: true,
        duration: Date.now() - startTime,
        details: cleanupResult
      };
    } catch (error) {
      return {
        testName: 'Session Cleanup',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test session monitoring
   */
  private async testSessionMonitoring(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing session monitoring...');

      // Record test events
      await this.sessionMonitor.recordEvent('test_event', { test: true });
      await this.sessionMonitor.recordMetric('test_metric', 42);

      // Get health report
      const health = await this.sessionMonitor.getHealthReport();
      if (!health) {
        throw new Error('Failed to get health report');
      }

      return {
        testName: 'Session Monitoring',
        passed: true,
        duration: Date.now() - startTime,
        details: health
      };
    } catch (error) {
      return {
        testName: 'Session Monitoring',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test event tracking
   */
  private async testEventTracking(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing event tracking...');

      const eventTypes = ['session_created', 'session_updated', 'wallet_connected'];

      // Record multiple events
      for (const eventType of eventTypes) {
        await this.sessionMonitor.recordEvent(eventType, {
          timestamp: Date.now(),
          test: true
        });
      }

      // Get events
      const events = await this.sessionMonitor.getEvents(10);
      if (events.length < eventTypes.length) {
        throw new Error('Not all events were recorded');
      }

      return {
        testName: 'Event Tracking',
        passed: true,
        duration: Date.now() - startTime,
        details: { eventsRecorded: events.length }
      };
    } catch (error) {
      return {
        testName: 'Event Tracking',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test storage performance
   */
  private async testStoragePerformance(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing storage performance...');

      const iterations = 100;
      const storeTimes: number[] = [];
      const retrieveTimes: number[] = [];

      // Performance test
      for (let i = 0; i < iterations; i++) {
        const sessionId = 'perf_test_' + i + '_' + Date.now();
        const session: TestSession = {
          id: sessionId,
          walletAddress: `STPERF${i}${Date.now()}`,
          provider: 'performance',
          createdAt: Date.now(),
          lastActivity: Date.now(),
          isActive: true,
          metadata: { perf: true }
        };

        // Measure store time
        const storeStart = performance.now();
        this.sessionStorage.storeSessionData(sessionId, session);
        storeTimes.push(performance.now() - storeStart);

        // Measure retrieve time
        const retrieveStart = performance.now();
        this.sessionStorage.getSessionData(sessionId);
        retrieveTimes.push(performance.now() - retrieveStart);

        // Cleanup
        this.sessionStorage.removeSessionData(sessionId);
      }

      const avgStoreTime = storeTimes.reduce((a, b) => a + b, 0) / storeTimes.length;
      const avgRetrieveTime = retrieveTimes.reduce((a, b) => a + b, 0) / retrieveTimes.length;

      // Performance thresholds (in milliseconds)
      if (avgStoreTime > 10 || avgRetrieveTime > 5) {
        throw new Error(`Performance thresholds exceeded: store=${avgStoreTime.toFixed(2)}ms, retrieve=${avgRetrieveTime.toFixed(2)}ms`);
      }

      return {
        testName: 'Storage Performance',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          avgStoreTime: avgStoreTime.toFixed(2) + 'ms',
          avgRetrieveTime: avgRetrieveTime.toFixed(2) + 'ms',
          iterations
        }
      };
    } catch (error) {
      return {
        testName: 'Storage Performance',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test concurrent access
   */
  private async testConcurrentAccess(): Promise<SessionTestResult> {
    const startTime = Date.now();

    try {
      console.log('Testing concurrent access...');

      const concurrentOperations = 50;
      const sessionId = 'concurrent_test_' + Date.now();

      // Test concurrent reads/writes
      const promises = [];
      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(
          Promise.resolve().then(async () => {
            const session: TestSession = {
              id: sessionId,
              walletAddress: `STCONCURRENT${i}${Date.now()}`,
              provider: 'concurrent',
              createdAt: Date.now(),
              lastActivity: Date.now(),
              isActive: true,
              metadata: { concurrent: true, index: i }
            };

            this.sessionStorage.storeSessionData(sessionId + '_' + i, session);
            const retrieved = this.sessionStorage.getSessionData(sessionId + '_' + i);
            this.sessionStorage.removeSessionData(sessionId + '_' + i);

            return retrieved !== null;
          })
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;

      if (successCount !== concurrentOperations) {
        throw new Error(`Concurrent access failed: ${successCount}/${concurrentOperations} operations succeeded`);
      }

      return {
        testName: 'Concurrent Access',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          operations: concurrentOperations,
          successRate: `${successCount}/${concurrentOperations}`
        }
      };
    } catch (error) {
      return {
        testName: 'Concurrent Access',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}