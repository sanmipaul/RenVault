/**
 * Complete Integration Example
 * Shows how to integrate WalletKit Session Management into your application
 */

import React, { useEffect } from 'react';
import { AppKitService } from '../services/walletkit-service';
import {
  SessionProvider,
  useSessionContext,
  useActiveSessions,
  useCurrentSession,
  useSessionError,
  useSessionOperations,
  useReconnectionStatus,
  useSessionInitialization,
} from '../context/SessionContext';
import { EnhancedAutoReconnect } from '../components/EnhancedAutoReconnect';
import { SessionMonitoringDashboard } from '../components/SessionMonitoringDashboard';

/**
 * Example 1: Basic Session Status Component
 * Shows current connection status and active sessions
 */
export function BasicSessionStatus() {
  const { activeSessions, isInitialized } = useActiveSessions();
  const { session, isConnected } = useCurrentSession();

  if (!isInitialized) {
    return <div className="alert">Loading session...</div>;
  }

  return (
    <div className="session-status">
      <div className="status-badge" style={{ color: isConnected ? 'green' : 'red' }}>
        {isConnected ? '🟢' : '🔴'} {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <p>Active Sessions: {activeSessions.length}</p>
      {session && <p>Primary Session Expiry: {new Date(session.expiry).toLocaleString()}</p>}
    </div>
  );
}

/**
 * Example 2: Session Management Controls
 * Provides buttons to manage sessions
 */
export function SessionManagementControls() {
  const { activeSessions } = useActiveSessions();
  const { extendSession, disconnectSession, reconnect } = useSessionOperations();
  const { error } = useSessionError();

  const handleExtend = async (topic: string) => {
    try {
      await extendSession(topic);
      alert('Session extended successfully');
    } catch (err) {
      alert('Failed to extend session: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDisconnect = async (topic: string) => {
    try {
      await disconnectSession(topic);
      alert('Session disconnected');
    } catch (err) {
      alert('Failed to disconnect: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="session-controls">
      {error && <div className="error-banner">{error.message}</div>}

      <div className="sessions-list">
        {activeSessions.length === 0 ? (
          <p>No active sessions</p>
        ) : (
          activeSessions.map((session) => (
            <div key={session.topic} className="session-item">
              <div className="session-info">
                <strong>Chain:</strong> {session.chainId}
                <br />
                <strong>Accounts:</strong> {session.accounts.join(', ')}
                <br />
                <strong>Expires:</strong> {new Date(session.expiry).toLocaleString()}
              </div>
              <div className="session-actions">
                <button onClick={() => handleExtend(session.topic)} className="btn-primary">
                  Extend Session
                </button>
                <button onClick={() => handleDisconnect(session.topic)} className="btn-danger">
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={reconnect} className="btn-secondary">
        Reconnect
      </button>
    </div>
  );
}

/**
 * Example 3: Reconnection Status Display
 * Shows reconnection attempts and status
 */
export function ReconnectionDisplay() {
  const { isReconnecting, error, isFailed } = useReconnectionStatus();

  if (!isReconnecting && !isFailed) {
    return null; // Only show when reconnecting or failed
  }

  return (
    <div className="reconnection-status">
      {isReconnecting && <p>⏳ Attempting to reconnect...</p>}
      {isFailed && error && <p className="error">❌ Reconnection failed: {error.message}</p>}
    </div>
  );
}

/**
 * Example 4: Complete App Integration
 * Shows how to set up your app with session management
 */
export function AppWithSessionManagement() {
  const appKitService = AppKitService.getInstance();

  const handleSessionRestored = async (session: any) => {
    console.log('Session restored:', session);
  };

  const handleSessionExpired = () => {
    console.log('Session expired');
  };

  const handleError = (error: Error) => {
    console.error('Session error:', error);
  };

  return (
    <SessionProvider
      appKitService={appKitService}
      onSessionRestored={handleSessionRestored}
      onSessionExpired={handleSessionExpired}
      onError={handleError}
    >
      <div className="app-container">
        {/* Main app content */}
        <MainAppContent />

        {/* Session components */}
        <EnhancedAutoReconnect enabled={true} autoHide={true} hideDelay={3000} />
        <ReconnectionDisplay />
      </div>
    </SessionProvider>
  );
}

/**
 * Example 5: Custom Hook for Checking Session Health
 * Demonstrates using context hooks for custom logic
 */
export function useSessionHealthCheck() {
  const { activeSessions, currentSession, error, isReconnecting } = useSessionContext();

  return {
    isHealthy: activeSessions.length > 0 && !error && !isReconnecting,
    hasActiveSessions: activeSessions.length > 0,
    isConnected: currentSession !== null,
    hasErrors: error !== null,
    isAttemptingReconnect: isReconnecting,
    recommendedAction: error ? 'Reconnect' : isReconnecting ? 'Wait' : 'Connected',
  };
}

/**
 * Example 6: Dashboard Component Using Hooks
 * Shows how to build a custom dashboard
 */
export function CustomSessionDashboard() {
  const { isInitialized, isInitializing } = useSessionInitialization();
  const { sessions, count } = useActiveSessions();
  const { session, isConnected, isMultiple } = useCurrentSession();
  const { error, retry } = useSessionError();
  const { extendSession, disconnectSession } = useSessionOperations();
  const health = useSessionHealthCheck();

  if (isInitializing) {
    return <div className="loading">Initializing session management...</div>;
  }

  if (!isInitialized) {
    return <div className="error">Failed to initialize session management</div>;
  }

  return (
    <div className="dashboard">
      <h2>Session Dashboard</h2>

      {/* Health Status */}
      <div className="health-section">
        <h3>Status</h3>
        <p>Health: {health.isHealthy ? '✅ Healthy' : '⚠️ Unhealthy'}</p>
        <p>Connected: {health.isConnected ? 'Yes' : 'No'}</p>
        <p>Active Sessions: {health.hasActiveSessions ? count : 'None'}</p>
      </div>

      {/* Current Session */}
      {session && (
        <div className="session-section">
          <h3>Current Session</h3>
          <p>Chain: {session.chainId}</p>
          <p>Accounts: {session.accounts.length}</p>
          <p>Expires: {new Date(session.expiry).toLocaleString()}</p>
        </div>
      )}

      {/* Multiple Sessions Info */}
      {isMultiple && (
        <div className="multi-session-info">
          <p>💡 You have {count} active sessions</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <p className="error">Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {/* Actions */}
      <div className="actions-section">
        <h3>Actions</h3>
        {sessions.map((sess) => (
          <div key={sess.topic} className="action-row">
            <span>{sess.chainId}</span>
            <button onClick={() => extendSession(sess.topic)}>Extend</button>
            <button onClick={() => disconnectSession(sess.topic)}>Disconnect</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 7: Conditional Rendering Based on Session Status
 */
export function ProtectedContent() {
  const { session, isConnected } = useCurrentSession();
  const { isInitializing } = useSessionInitialization();

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return <div>Please connect a wallet to access this content</div>;
  }

  return (
    <div>
      <p>Welcome! Your session is active.</p>
      <p>Connected with: {session?.accounts[0]}</p>
    </div>
  );
}

/**
 * Example 8: Session Expiry Warning
 */
export function SessionExpiryWarning() {
  const { session } = useCurrentSession();
  const [isExpiringSoon, setIsExpiringSoon] = React.useState(false);

  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      const timeUntilExpiry = session.expiry - Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      setIsExpiringSoon(timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0);
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session]);

  if (!isExpiringSoon) {
    return null;
  }

  return (
    <div className="warning-banner">
      ⏰ Your session is expiring soon. Please extend it to continue.
    </div>
  );
}

/**
 * Example 9: Admin Panel with Monitoring
 */
export function AdminSessionPanel() {
  const [showDashboard, setShowDashboard] = React.useState(false);
  const { isInitialized } = useSessionInitialization();

  return (
    <div className="admin-panel">
      <button onClick={() => setShowDashboard(!showDashboard)}>
        {showDashboard ? 'Hide' : 'Show'} Session Monitoring
      </button>
      {showDashboard && isInitialized && <SessionMonitoringDashboard />}
    </div>
  );
}

/**
 * Example 10: Main App Content Structure
 */
export function MainAppContent() {
  return (
    <div className="main-content">
      {/* Always show session status */}
      <BasicSessionStatus />

      {/* Show session expiry warning */}
      <SessionExpiryWarning />

      {/* Protected content that requires session */}
      <ProtectedContent />

      {/* Session controls */}
      <SessionManagementControls />

      {/* Admin section */}
      <AdminSessionPanel />

      {/* Reconnection display */}
      <ReconnectionDisplay />

      {/* Your other app content */}
      <YourOtherContent />
    </div>
  );
}

/**
 * Example Placeholder for Other App Content
 */
function YourOtherContent() {
  return (
    <div className="other-content">
      {/* Your application content here */}
      <h1>My DApp</h1>
      {/* ... other components ... */}
    </div>
  );
}

/**
 * Usage Instructions:
 *
 * 1. Wrap your app with SessionProvider:
 *    <SessionProvider appKitService={appKitService}>
 *      <MainAppContent />
 *    </SessionProvider>
 *
 * 2. Use hooks to access session data:
 *    - useActiveSessions() - Get active sessions
 *    - useCurrentSession() - Get primary session
 *    - useSessionError() - Get errors
 *    - useSessionOperations() - Perform actions
 *    - useReconnectionStatus() - Get reconnection status
 *    - useSessionInitialization() - Get init status
 *
 * 3. Components automatically update when sessions change
 *
 * 4. Reconnection is automatic but can be triggered manually
 *
 * 5. Use SessionMonitoringDashboard for admin monitoring
 */
