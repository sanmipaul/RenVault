/**
 * Session Management Initialization Helper
 * Provides easy setup and initialization of all session management services
 */

import { AppKitService } from '../services/walletkit-service';
import { RefactoredSessionManager } from '../services/session/SessionManagerRefactored';
import { WalletKitSessionIntegration } from '../services/session/walletkit-session-integration';
import { AutomaticReconnectionService } from '../services/session/automatic-reconnection';
import { sessionMigrationService } from '../services/session/session-migration';
import { sessionConfigurationManager } from '../config/session-management';
import { logger } from '../utils/logger';

export interface SessionInitializationOptions {
  appKitService: AppKitService;
  onSessionRestored?: (session: any) => Promise<void>;
  onSessionExpired?: () => void;
  enableAutoReconnect?: boolean;
  enableMigration?: boolean;
  enableMonitoring?: boolean;
}

export interface SessionInitializationResult {
  success: boolean;
  sessionManager: RefactoredSessionManager;
  sessionIntegration: WalletKitSessionIntegration;
  reconnectionService: AutomaticReconnectionService;
  error?: Error;
}

/**
 * Initialize all session management services
 */
export async function initializeSessionManagement(
  options: SessionInitializationOptions
): Promise<SessionInitializationResult> {
  try {
    logger.info('Starting session management initialization...');

    const {
      appKitService,
      onSessionRestored,
      onSessionExpired,
      enableAutoReconnect = true,
      enableMigration = true,
      enableMonitoring = true,
    } = options;

    // Get configuration
    const config = sessionConfigurationManager.getConfig();

    // Initialize WalletKit session integration
    logger.info('Initializing WalletKit session integration...');
    const sessionIntegration = WalletKitSessionIntegration.getInstance();
    await sessionIntegration.initialize(appKitService);

    // Initialize automatic reconnection
    if (enableAutoReconnect && config.features.enableAutoReconnect) {
      logger.info('Initializing automatic reconnection service...');
      const reconnectionService = AutomaticReconnectionService.getInstance();
      await reconnectionService.initialize(appKitService, {
        enabled: enableAutoReconnect,
        maxAttempts: config.reconnection.maxAttempts,
        initialDelayMs: config.reconnection.initialDelayMs,
        maxDelayMs: config.reconnection.maxDelayMs,
        backoffMultiplier: config.reconnection.backoffMultiplier,
      });
    }

    // Run migration if enabled
    if (enableMigration && config.features.enableSessionMigration) {
      logger.info('Checking for session migration...');
      if (sessionMigrationService.hasOldSessions()) {
        logger.info('Old sessions found, running migration...');
        const migrationResult = await sessionMigrationService.migrateFromOldStorage();
        logger.info('Migration completed', migrationResult);
        sessionMigrationService.markMigrationCompleted();
      }
    }

    // Initialize session manager
    logger.info('Initializing session manager...');
    const sessionManager = RefactoredSessionManager.getInstance();
    await sessionManager.initialize(appKitService, onSessionRestored, onSessionExpired);

    // Start monitoring if enabled
    if (enableMonitoring && config.features.enableMonitoring) {
      logger.info('Starting session monitoring...');
      sessionIntegration.startSessionMonitoring?.();
    }

    logger.info('Session management initialization completed successfully');

    return {
      success: true,
      sessionManager,
      sessionIntegration,
      reconnectionService: AutomaticReconnectionService.getInstance(),
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown initialization error');
    logger.error('Session management initialization failed', err);

    return {
      success: false,
      sessionManager: RefactoredSessionManager.getInstance(),
      sessionIntegration: WalletKitSessionIntegration.getInstance(),
      reconnectionService: AutomaticReconnectionService.getInstance(),
      error: err,
    };
  }
}

/**
 * Cleanup session management services
 */
export function cleanupSessionManagement(): void {
  try {
    logger.info('Cleaning up session management services...');

    const sessionManager = RefactoredSessionManager.getInstance();
    const sessionIntegration = WalletKitSessionIntegration.getInstance();
    const reconnectionService = AutomaticReconnectionService.getInstance();

    // Stop monitoring
    sessionIntegration.stopSessionMonitoring?.();

    // Cleanup services
    reconnectionService.destroy();
    sessionManager.destroy();

    logger.info('Session management cleanup completed');
  } catch (error) {
    logger.error('Error during session management cleanup', error);
  }
}

/**
 * Setup session management with default initialization
 * Call this in your app's root or in useEffect
 */
export async function setupSessionManagement(
  appKitService: AppKitService
): Promise<SessionInitializationResult> {
  return initializeSessionManagement({
    appKitService,
    enableAutoReconnect: true,
    enableMigration: true,
    enableMonitoring: true,
  });
}

/**
 * Get current session initialization status
 */
export function getSessionInitializationStatus(): {
  isInitialized: boolean;
  sessionManager: RefactoredSessionManager;
  sessionIntegration: WalletKitSessionIntegration;
  activeSessions: number;
} {
  const sessionManager = RefactoredSessionManager.getInstance();
  const sessionIntegration = WalletKitSessionIntegration.getInstance();
  const sessions = sessionIntegration.getActiveSessions();

  return {
    isInitialized: sessions.length >= 0, // Initialized if we can get sessions
    sessionManager,
    sessionIntegration,
    activeSessions: sessions.length,
  };
}

/**
 * Reset all session management services (for testing)
 */
export function resetSessionManagement(): void {
  try {
    logger.warn('Resetting session management services...');

    const sessionManager = RefactoredSessionManager.getInstance();
    const sessionIntegration = WalletKitSessionIntegration.getInstance();
    const reconnectionService = AutomaticReconnectionService.getInstance();

    // Clear all sessions
    sessionManager.clearAllSessions().catch((err) => {
      logger.warn('Error clearing sessions during reset', err);
    });

    // Stop monitoring
    sessionIntegration.stopSessionMonitoring?.();
    reconnectionService.destroy();

    logger.info('Session management reset completed');
  } catch (error) {
    logger.error('Error during session management reset', error);
  }
}

/**
 * Verify session management is working
 */
export async function verifySessionManagement(): Promise<{
  healthy: boolean;
  checks: {
    sessionIntegration: boolean;
    reconnectionService: boolean;
    sessionManager: boolean;
    storage: boolean;
  };
  issues: string[];
}> {
  const issues: string[] = [];
  const checks = {
    sessionIntegration: true,
    reconnectionService: true,
    sessionManager: true,
    storage: true,
  };

  try {
    // Check session integration
    try {
      const sessionIntegration = WalletKitSessionIntegration.getInstance();
      sessionIntegration.getActiveSessions();
    } catch (error) {
      checks.sessionIntegration = false;
      issues.push('Session integration check failed');
    }

    // Check reconnection service
    try {
      const reconnectionService = AutomaticReconnectionService.getInstance();
      reconnectionService.getStatus();
    } catch (error) {
      checks.reconnectionService = false;
      issues.push('Reconnection service check failed');
    }

    // Check session manager
    try {
      const sessionManager = RefactoredSessionManager.getInstance();
      sessionManager.getActiveSessions();
    } catch (error) {
      checks.sessionManager = false;
      issues.push('Session manager check failed');
    }

    // Check storage
    try {
      const stats = sessionConfigurationManager.getConfig();
      if (!stats) {
        checks.storage = false;
        issues.push('Storage check failed');
      }
    } catch (error) {
      checks.storage = false;
      issues.push('Storage configuration check failed');
    }

    return {
      healthy: Object.values(checks).every((v) => v),
      checks,
      issues,
    };
  } catch (error) {
    return {
      healthy: false,
      checks,
      issues: ['Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
    };
  }
}

/**
 * Print initialization diagnostics
 */
export function printSessionDiagnostics(): void {
  try {
    const sessionManager = RefactoredSessionManager.getInstance();
    const sessionIntegration = WalletKitSessionIntegration.getInstance();
    const reconnectionService = AutomaticReconnectionService.getInstance();

    const sessions = sessionIntegration.getActiveSessions();
    const stats = sessionManager.getStorageStats();
    const reconnectStatus = reconnectionService.getStatus();
    const config = sessionConfigurationManager.getConfig();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      sessions: {
        active: sessions.length,
        details: sessions.map((s) => ({
          topic: s.topic.substring(0, 30),
          accounts: s.accounts.length,
          expiry: new Date(s.expiry).toISOString(),
        })),
      },
      storage: {
        used: stats.totalSize,
        max: stats.maxSize,
        percent: Math.round(stats.usagePercent),
      },
      reconnection: {
        isReconnecting: reconnectStatus.isReconnecting,
        attempts: reconnectStatus.attemptCount,
        error: reconnectStatus.lastError,
      },
      configuration: {
        autoReconnect: config.features.enableAutoReconnect,
        persistSessions: config.features.enableSessionPersistence,
        monitoring: config.features.enableMonitoring,
      },
    };

    console.group('🔐 Session Management Diagnostics');
    console.table(diagnostics);
    console.groupEnd();
  } catch (error) {
    logger.error('Error printing diagnostics', error);
  }
}
