import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { AppKit } from '@reown/appkit/react';
import ConnectionStatus from './components/ConnectionStatus';
import { SessionStatus } from './components/SessionStatus';
import { AutoReconnect } from './components/AutoReconnect';
import NotificationService from './services/notificationService';
import TransactionHistory from './components/TransactionHistory';
import NotificationCenter from './components/NotificationCenter';
import { Analytics } from './components/Analytics';
import { WalletConnect } from './components/WalletConnect';
import { WalletManager } from './services/wallet/WalletManager';

import AppHeader from './components/AppHeader';
import ConnectionOptions from './components/ConnectionOptions';
import HelpPanel from './components/HelpPanel';
import NetworkStatus from './components/NetworkStatus';
import StatsPanel from './components/StatsPanel';
import SecuritySettings from './components/SecuritySettings';
import DepositPanel from './components/DepositPanel';
import WithdrawForm from './components/WithdrawForm';
import HowItWorks from './components/HowItWorks';
import AuthModals from './components/AuthModals';
import WalletActionModals from './components/WalletActionModals';

import { use2FA } from './hooks/use2FA';
import { useVaultStats } from './hooks/useVaultStats';
import { useNetworkDetection } from './hooks/useNetworkDetection';
import { trackAnalytics } from './utils/analytics';
import { APP_CONFIG } from './constants/app';
import { ConnectionMethod, WalletConnectSession, AppUserProfile } from './types/app';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function AppContent() {
  const [userData, setUserData] = useState<AppUserProfile | null>(null);
  const [status, setStatus] = useState<string>('');
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>(null);
  const [showConnectionOptions, setShowConnectionOptions] = useState<boolean>(false);
  const [walletConnectSession, setWalletConnectSession] = useState<WalletConnectSession | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [, setRetryCount] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);

  // Modal visibility state
  const [show2FASetup, setShow2FASetup] = useState<boolean>(false);
  const [show2FAVerify, setShow2FAVerify] = useState<boolean>(false);
  const [showBackupCodes, setShowBackupCodes] = useState<boolean>(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [showWalletBackup, setShowWalletBackup] = useState<boolean>(false);
  const [showWalletRecovery, setShowWalletRecovery] = useState<boolean>(false);
  const [showMultiSigSetup, setShowMultiSigSetup] = useState<boolean>(false);
  const [showCoSignerManagement, setShowCoSignerManagement] = useState<boolean>(false);
  const [showMultiSigSigner, setShowMultiSigSigner] = useState<boolean>(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState<boolean>(false);

  const [walletManager] = useState(() => new WalletManager());

  const { isEnabled: is2FAEnabled, enable: enable2FA, disable: disable2FA, verifyBackupCode } = use2FA();
  const { balance, points, fetchStats, resetStats } = useVaultStats();
  const { detectedNetwork, networkMismatch, detectFromAddress, reset: resetNetwork, promptSwitch } = useNetworkDetection();

  const userAddress = userData?.profile.stxAddress.mainnet ?? null;
  const notificationUserId = userAddress;

  const notificationService = useMemo(
    () => (notificationUserId ? NotificationService.getInstance(notificationUserId) : null),
    [notificationUserId]
  );

  // Auto-detect network when user connects
  useEffect(() => {
    if (userAddress) {
      detectFromAddress(userAddress);
    }
  }, [userAddress, detectFromAddress]);

  // Fetch vault stats when user and network are ready
  useEffect(() => {
    if (userAddress && detectedNetwork) {
      fetchStats(userAddress, networkMismatch);
    }
  }, [userAddress, detectedNetwork, fetchStats, networkMismatch]);

  // Show 2FA verify on load if enabled — intentionally runs once on mount
  useEffect(() => {
    if (is2FAEnabled && !userData) {
      setShow2FAVerify(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle pending Stacks sign-in on mount
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((ud) => {
        setUserData(ud as unknown as AppUserProfile);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData() as unknown as AppUserProfile);
    }
  }, []);

  // Auto-clear status after 10 seconds
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(''), 10000);
    return () => clearTimeout(timer);
  }, [status]);

  const connectWithStacks = () => {
    setConnectionError(null);
    setRetryCount(0);
    setConnectionMethod('stacks');
    setShowConnectionOptions(false);
    const startTime = Date.now();
    try {
      showConnect({
        appDetails: { name: APP_CONFIG.name, icon: APP_CONFIG.icon },
        redirectTo: '/',
        onFinish: () => {
          trackAnalytics('wallet-connect', { user: 'anonymous', method: 'stacks', success: true });
          trackAnalytics('performance', { operation: 'wallet-connect-stacks', duration: Date.now() - startTime });
          window.location.reload();
        },
        userSession,
      });
    } catch (error: any) {
      setConnectionError(`Failed to connect with Stacks wallet: ${error.message}`);
      trackAnalytics('wallet-connect', { user: 'anonymous', method: 'stacks', success: false });
      setToastMessage('Connection failed. Check the error message above.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const retryConnectWithStacks = () => {
    setRetryCount((prev) => prev + 1);
    connectWithStacks();
  };

  const connectWithWalletConnect = () => {
    setConnectionMethod('walletconnect');
    setShowConnectionOptions(false);
  };

  const disconnectWallet = () => {
    if (connectionMethod === 'stacks') {
      userSession.signUserOut();
    }
    setUserData(null);
    setConnectionMethod(null);
    setWalletConnectSession(null);
    resetStats();
    resetNetwork();
    disable2FA();
  };

  const handle2FASetupComplete = (secret: string, backupCodes: string[]) => {
    enable2FA(secret, backupCodes);
    setShow2FASetup(false);
    setStatus('Two-factor authentication enabled successfully!');
    notificationService?.testTwoFactorEnabledNotification();
  };

  const handle2FAVerify = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user', code }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleBackupCodeVerify = async (code: string): Promise<boolean> => {
    const result = verifyBackupCode(code);
    if (result) setShowBackupCodes(false);
    return result;
  };

  const handleDisable2FA = () => {
    disable2FA();
    setStatus('Two-factor authentication disabled');
    notificationService?.testTwoFactorDisabledNotification();
  };

  const handleWalletBackupComplete = (backupData: string) => {
    setShowWalletBackup(false);
    setStatus('Wallet backup created successfully! Store it securely.');
    fetch('/api/wallet/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userAddress, encryptedBackup: backupData }),
    });
  };

  const handleWalletRecoveryComplete = () => {
    setShowWalletRecovery(false);
    setStatus('Wallet recovered successfully!');
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData() as unknown as AppUserProfile);
    }
  };

  const handleMultiSigSetupComplete = () => {
    setShowMultiSigSetup(false);
    setStatus('Multi-signature wallet setup completed!');
  };

  const handleCoSignerUpdate = () => setStatus('Co-signers updated successfully!');

  const handleMultiSigTransactionSigned = (_signedTx: any) => {
    setShowMultiSigSigner(false);
    setCurrentTransaction(null);
    setStatus('Transaction signed successfully!');
  };

  const handleWithdrawSuccess = (amount: string, remaining: number) => {
    if (notificationUserId) {
      const service = NotificationService.getInstance(notificationUserId);
      service.testWithdrawalNotification(parseFloat(amount), remaining);
    }
    trackAnalytics('withdrawal', { user: userAddress ?? 'anonymous', amount });
  };

  const handleRefreshStats = () => {
    if (userAddress) fetchStats(userAddress, networkMismatch);
  };

  if (!userData) {
    return (
      <>
        <div className="container">
          <div className="header">
            <h1>RenVault</h1>
            <p>Clarity 4 Micro-Savings Protocol</p>
          </div>

          <ConnectionStatus isConnected={false} connectionMethod={null} />

          {showConnectionOptions ? (
            <ConnectionOptions
              onConnectStacks={connectWithStacks}
              onConnectWalletConnect={connectWithWalletConnect}
              onCancel={() => setShowConnectionOptions(false)}
            />
          ) : (
            <div className="card">
              <h2>Connect Your Wallet</h2>
              <p>Connect your Stacks wallet to start saving STX and earning commitment points.</p>
              <appkit-button aria-label="Open wallet connection modal" />
            </div>
          )}

          {connectionError && (
            <div className="card error">
              <h3>Connection Failed</h3>
              <p>{connectionError}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={retryConnectWithStacks}>
                  Retry Stacks Wallet
                </button>
                <button className="btn btn-secondary" onClick={connectWithWalletConnect}>
                  Try WalletConnect Instead
                </button>
                <button className="btn btn-outline" onClick={() => setShowHelp(true)}>
                  Help
                </button>
              </div>
            </div>
          )}

          {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

          <AuthModals
            show2FASetup={show2FASetup}
            show2FAVerify={show2FAVerify}
            showBackupCodes={showBackupCodes}
            on2FASetupComplete={handle2FASetupComplete}
            on2FAVerify={handle2FAVerify}
            onBackupCodeVerify={handleBackupCodeVerify}
            onClose2FASetup={() => setShow2FASetup(false)}
            onClose2FAVerify={() => setShow2FAVerify(false)}
            onUseBackup={() => { setShow2FAVerify(false); setShowBackupCodes(true); }}
            onCloseBackupCodes={() => setShowBackupCodes(false)}
          />

          {connectionMethod === 'walletconnect' && (
            <div className="card">
              <WalletConnect />
            </div>
          )}
        </div>

        {toastMessage && <div className="toast">{toastMessage}</div>}
      </>
    );
  }

  return (
    <div className="container">
      <SessionStatus />
      <AutoReconnect />

      <AppHeader
        userName={userData.profile.name}
        detectedNetwork={detectedNetwork}
        onOpenNotifications={() => setShowNotificationCenter(true)}
        onOpenWalletBackup={() => setShowWalletBackup(true)}
        onOpenWalletRecovery={() => setShowWalletRecovery(true)}
        onOpenMultiSigSetup={() => setShowMultiSigSetup(true)}
        onOpenCoSignerManagement={() => setShowCoSignerManagement(true)}
        onOpenMultiSigSigner={() => setShowMultiSigSigner(true)}
        onOpenPerformanceMonitor={() => setShowPerformanceMonitor(true)}
      />

      <ConnectionStatus
        isConnected
        connectionMethod={connectionMethod}
        walletAddress={userAddress ?? undefined}
        onDisconnect={disconnectWallet}
      />

      <div className="appkit-controls" role="region" aria-label="Wallet controls">
        <appkit-account-button aria-label="Account management and balance" />
        <appkit-network-button aria-label="Switch blockchain network" />
      </div>

      <NetworkStatus
        detectedNetwork={detectedNetwork}
        onPromptSwitch={() => setStatus(promptSwitch())}
      />

      <SecuritySettings
        is2FAEnabled={is2FAEnabled}
        onEnable2FA={() => setShow2FASetup(true)}
        onDisable2FA={handleDisable2FA}
        onSignOutAllSessions={disconnectWallet}
        notificationUserId={notificationUserId}
      />

      <StatsPanel balance={balance} points={points} detectedNetwork={detectedNetwork} />

      <Analytics userId={userAddress ?? ''} />

      <TransactionHistory address={userAddress ?? ''} />

      <div className="actions">
        <DepositPanel
          balance={balance}
          connectionMethod={connectionMethod}
          walletConnectSession={walletConnectSession}
          userAddress={userAddress ?? ''}
          appPrivateKey={userData.appPrivateKey}
          notificationUserId={notificationUserId}
          onStatusChange={setStatus}
          onRefreshStats={handleRefreshStats}
        />

        <WithdrawForm
          balance={balance}
          connectionMethod={connectionMethod}
          walletConnectSession={walletConnectSession}
          userAddress={userAddress ?? ''}
          onStatusChange={setStatus}
          onWithdrawSuccess={handleWithdrawSuccess}
          onRefreshStats={handleRefreshStats}
        />
      </div>

      {status && (
        <div className={`status ${status.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}

      <HowItWorks />

      <NotificationCenter
        userId={userAddress ?? ''}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      <WalletActionModals
        walletManager={walletManager}
        showWalletBackup={showWalletBackup}
        showWalletRecovery={showWalletRecovery}
        showMultiSigSetup={showMultiSigSetup}
        showCoSignerManagement={showCoSignerManagement}
        showMultiSigSigner={showMultiSigSigner}
        showPerformanceMonitor={showPerformanceMonitor}
        currentTransaction={currentTransaction}
        onBackupComplete={handleWalletBackupComplete}
        onRecoveryComplete={handleWalletRecoveryComplete}
        onMultiSigSetupComplete={handleMultiSigSetupComplete}
        onCoSignerUpdate={handleCoSignerUpdate}
        onMultiSigTransactionSigned={handleMultiSigTransactionSigned}
        onCloseBackup={() => setShowWalletBackup(false)}
        onCloseRecovery={() => setShowWalletRecovery(false)}
        onCloseMultiSigSetup={() => setShowMultiSigSetup(false)}
        onCloseCoSignerManagement={() => setShowCoSignerManagement(false)}
        onCloseMultiSigSigner={() => setShowMultiSigSigner(false)}
        onClosePerformanceMonitor={() => setShowPerformanceMonitor(false)}
      />

      <AuthModals
        show2FASetup={show2FASetup}
        show2FAVerify={show2FAVerify}
        showBackupCodes={showBackupCodes}
        on2FASetupComplete={handle2FASetupComplete}
        on2FAVerify={handle2FAVerify}
        onBackupCodeVerify={handleBackupCodeVerify}
        onClose2FASetup={() => setShow2FASetup(false)}
        onClose2FAVerify={() => setShow2FAVerify(false)}
        onUseBackup={() => { setShow2FAVerify(false); setShowBackupCodes(true); }}
        onCloseBackupCodes={() => setShowBackupCodes(false)}
      />
    </div>
  );
}

function App() {
  const [appKitInitialized, setAppKitInitialized] = useState(false);
  const [appKitError, setAppKitError] = useState<string | null>(null);

  useEffect(() => {
    const initAppKit = async () => {
      try {
        const { AppKitService } = await import('./services/appkit-service');
        await AppKitService.init();
        setAppKitInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
        setAppKitError('Failed to initialize wallet service. Please refresh the page.');
      }
    };
    initAppKit();
  }, []);

  if (appKitError) {
    return (
      <div className="container">
        <div className="header">
          <h1>RenVault</h1>
          <p>Wallet Service Error</p>
        </div>
        <div className="card error">
          <h3>Initialization Failed</h3>
          <p>{appKitError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!appKitInitialized) {
    return (
      <div className="container">
        <div className="header">
          <h1>RenVault</h1>
          <p>Initializing AppKit...</p>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading wallet service...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppContent />
      {/* @ts-ignore */}
      <AppKit />
    </>
  );
}

export default App;
