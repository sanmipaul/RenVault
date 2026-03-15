import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { AppConfig, UserSession, showConnect, UserData, openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  standardPrincipalCV
} from '@stacks/transactions';
import { WalletConnect } from './components/WalletConnect';
import { WithdrawTxDetails, WalletConnectSession, WalletConnectTransactionParams, SignedTransactionResult, StacksContractCallOptions } from './types/wallet';
import { AppKit } from '@reown/appkit/react';
import ConnectionStatus from './components/ConnectionStatus';
import { SessionStatus } from './components/SessionStatus';
import { AutoReconnect } from './components/AutoReconnect';
import NotificationService from './services/notificationService';
import TransactionHistory from './components/TransactionHistory';
import NotificationCenter from './components/NotificationCenter';
import AmountInput from './components/AmountInput';
import { useAmountValidation } from './hooks/useAmountValidation';
import { validateDepositAmount, validateWithdrawAmount, parseSTXInput } from './utils/amountValidator';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

// App configuration constants
const APP_CONFIG = {
  name: 'RenVault',
  icon: window.location.origin + '/logo192.png',
  analyticsOptOutKey: 'analytics-opt-out',
  tfaEnabledKey: 'tfa-enabled',
  tfaSecretKey: 'tfa-secret',
  tfaBackupCodesKey: 'tfa-backup-codes',
} as const;

const detectNetworkFromAddress = (address: string): 'mainnet' | 'testnet' => {
  // Stacks mainnet addresses start with 'SP', testnet with 'ST'
  return address.startsWith('SP') ? 'mainnet' : 'testnet';
};

const getCurrentNetwork = () => {
  // Always return mainnet for RenVault operations
  return new StacksMainnet();
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const trackAnalytics = async (event: string, data: Record<string, unknown>) => {
  const optOut = localStorage.getItem(APP_CONFIG.analyticsOptOutKey) === 'true';
  if (optOut) return;
  
  try {
    await fetch(getAnalyticsUrl(event), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

function AppContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [points, setPoints] = useState<string>('0');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const debouncedDepositAmount = useDebounce(depositAmount, 300);
  const debouncedWithdrawAmount = useDebounce(withdrawAmount, 300);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [detectedNetwork, setDetectedNetwork] = useState<'mainnet' | 'testnet' | null>(null);
  const [networkMismatch, setNetworkMismatch] = useState<boolean>(false);
  const [showWithdrawDetails, setShowWithdrawDetails] = useState<boolean>(false);
  const [withdrawTxDetails, setWithdrawTxDetails] = useState<WithdrawTxDetails | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'stacks' | 'walletconnect' | null>(null);
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
  const [currentTransaction, setCurrentTransaction] = useState<StacksContractCallOptions | null>(null);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState<boolean>(false);
  const [tfaSecret, setTfaSecret] = useState<string>('');
  const [tfaEnabled, setTfaEnabled] = useState<boolean>(TwoFactorSecureStorage.hasSecret());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // ── Real-time amount validation ─────────────────────────────────────────
  const balanceNum = parseFloat(balance) || 0;
  const depositValidation = useAmountValidation('deposit');
  const withdrawValidation = useAmountValidation('withdraw', balanceNum);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      if (withdrawTxDetails) {
        setWithdrawTxDetails(null);
      }
    };
  }, []);

  const userAddress = userData?.profile.stxAddress.mainnet ?? null;
  const notificationUserId = userAddress;

  const notificationService = useMemo(
    () => (notificationUserId ? NotificationService.getInstance(notificationUserId) : null),
    [notificationUserId]
  );
  /** Derive the active wallet address from userData, preferring mainnet. */
  const getWalletAddress = (): string =>
    userData?.profile?.stxAddress?.mainnet ??
    userData?.profile?.stxAddress?.testnet ??
    '';

  const handle2FASetupComplete = async (secret: string, backupCodes: string[]) => {
    setTfaSecret(secret);
    localStorage.setItem(APP_CONFIG.tfaEnabledKey, 'true');
    setTfaEnabled(true);
    // Store secret and backup codes encrypted, not as plain text
    const walletAddress = getWalletAddress();
    await TwoFactorSecureStorage.saveSecret(secret, walletAddress);
    await TwoFactorSecureStorage.saveBackupCodes(backupCodes, walletAddress);
    setShow2FASetup(false);
    setStatus('✅ Two-factor authentication enabled successfully!');

    // Send 2FA enabled notification
    if (notificationService) {
      notificationService.testTwoFactorEnabledNotification();
    }

    setTimeout(() => setStatus(''), 5000);
  };

  const handle2FAVerify = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user', code })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleBackupCodeVerify = async (code: string): Promise<boolean> => {
    try {
      const valid = await TwoFactorSecureStorage.verifyAndConsumeBackupCode(code, getWalletAddress());
      if (valid) setShowBackupCodes(false);
      return valid;
    } catch {
      return false;
    }
  };

  const handleDisable2FA = () => {
    localStorage.removeItem(APP_CONFIG.tfaEnabledKey);
    TwoFactorSecureStorage.clearAll();
    setTfaSecret('');
    setTfaEnabled(false);
    setStatus('✅ Two-factor authentication disabled');
    
    // Send 2FA disabled notification
    if (notificationService) {
      notificationService.testTwoFactorDisabledNotification();
    }
  }, [userAddress, detectFromAddress]);

  const handleMultiSigSetupComplete = () => {
    setShowMultiSigSetup(false);
    setStatus('✅ Multi-signature wallet setup completed!');
    setTimeout(() => setStatus(''), 5000);
  };

  const handleCoSignerUpdate = () => {
    setStatus('✅ Co-signers updated successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleMultiSigTransactionSigned = (_signedTx: SignedTransactionResult): void => {
    setShowMultiSigSigner(false);
    setCurrentTransaction(null);
    setStatus('✅ Transaction signed successfully!');
    setTimeout(() => setStatus(''), 5000);
  };

  const disconnectWallet = () => {
    if (connectionMethod === 'stacks') {
      // Disconnect Stacks wallet
      userSession.signUserOut();
      setUserData(null);
      setConnectionMethod(null);
      setWalletConnectSession(null);
      setStatus('✅ Disconnected from Stacks wallet');
    } else if (connectionMethod === 'walletconnect') {
      // Disconnect WalletConnect
      setWalletConnectSession(null);
      setUserData(null);
      setConnectionMethod(null);
      setStatus('✅ Disconnected from WalletConnect');
    }
    // Clear all 2FA session data on disconnect so no secrets linger in storage
    localStorage.removeItem(APP_CONFIG.tfaEnabledKey);
    TwoFactorSecureStorage.clearAll();
    setTfaEnabled(false);
    console.info('[RenVault] 2FA encrypted storage cleared on wallet disconnect');
    // Clear all connection-related state
    setBalance('0');
    setPoints('0');
    setDepositAmount('');
    setWithdrawAmount('');
    setDetectedNetwork(null);
    setNetworkMismatch(false);
  };

  // Show 2FA verify on load if enabled — intentionally runs once on mount
  useEffect(() => {
    // Check for 2FA requirement on app load — use encrypted storage as source of truth,
    // fall back to the plain-text enabled flag for backwards compatibility.
    const has2FA =
      TwoFactorSecureStorage.hasSecret() ||
      localStorage.getItem(APP_CONFIG.tfaEnabledKey) === 'true';
    setTfaEnabled(has2FA);
    if (has2FA && !userData) {
      setShow2FAVerify(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle pending Stacks sign-in on mount
  useEffect(() => {
    const initSession = async () => {
      let loadedData = null;
      if (userSession.isSignInPending()) {
        loadedData = await userSession.handlePendingSignIn();
        setUserData(loadedData);
      } else if (userSession.isUserSignedIn()) {
        loadedData = userSession.loadUserData();
        setUserData(loadedData);
      }

      // Run 2FA data migration once wallet address is available
      if (loadedData && TwoFactorMigration.needsMigration()) {
        const walletAddress =
          loadedData.profile?.stxAddress?.mainnet ??
          loadedData.profile?.stxAddress?.testnet ??
          '';
        if (walletAddress) {
          await TwoFactorMigration.migrate(walletAddress);
        }
      }
    };

    initSession();
  }, []);

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
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      setConnectionError(`Failed to connect with Stacks wallet: ${getErrorMessage(error)}`);
      trackAnalytics('wallet-connect', { user: 'anonymous', method: 'stacks', success: false });
      trackAnalytics('wallet-error', { user: 'anonymous', method: 'stacks', errorType: getErrorMessage(error) });
      trackAnalytics('performance', { operation: 'wallet-connect-stacks', duration });
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

      // Assuming result is a UIntCV
      // @ts-ignore
      setBalance((parseInt(balanceResult.value) / 1000000).toFixed(6));
      // @ts-ignore
      setPoints(pointsResult.value);
      
      const duration = Date.now() - startTime;
      trackAnalytics('performance', { operation: 'fetch-user-stats', duration });
    } catch (error: unknown) {
      if (networkMismatch) {
        setStatus('Unable to fetch data: Please switch to mainnet');
      } else if (ContractErrorMapper.isContractError(error)) {
        console.warn('Contract error fetching stats:', ContractErrorMapper.toStatusMessage(error, CONTRACT_NAME));
      } else {
        console.error('Error fetching stats:', error);
      }
      const duration = Date.now() - startTime;
      trackAnalytics('performance', { operation: 'fetch-user-stats', duration });
    }
  };

  const handleDeposit = async () => {
    if (!userData) return;
    const preSubmitCheck = validateDepositAmount(depositAmount);
    if (!preSubmitCheck.valid) {
      depositValidation.validate(depositAmount); // surface the error in the field
      setStatus(`❌ ${preSubmitCheck.error}`);
      return;
    }
    if (!validateNetwork()) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = parseSTXInput(depositAmount) ?? 0;
      
      if (connectionMethod === 'walletconnect' && walletConnectSession) {
        // Use WalletConnect for signing
        await handleWalletConnectTransaction('deposit', { amount });
      } else {
        // Use traditional Stacks signing
        const network = getCurrentNetwork();
        
        const txOptions = {
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'deposit',
          functionArgs: [uintCV(amount)],
          senderKey: userData.appPrivateKey,
          network,
          anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, network);
        
        setStatus(`Deposit transaction submitted: ${broadcastResponse.txid}`);
        setDepositAmount('');
        depositValidation.reset();
        
        trackAnalytics('deposit', { user: userData.profile.stxAddress.mainnet, amount });
        
        // Send deposit notification
        if (notificationService) {
          notificationService.testDepositNotification(parseFloat(depositAmount), parseFloat(balance) + parseFloat(depositAmount));
        }
        
        setTimeout(fetchUserStats, 3000);
      }
    } catch (error: unknown) {
      const friendlyMsg = ContractErrorMapper.isContractError(error)
        ? ContractErrorMapper.toStatusMessage(error, CONTRACT_NAME)
        : error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Deposit failed: ${friendlyMsg}`);
      const errMsg = error instanceof Error ? error.message : String(error);
      trackAnalytics('wallet-error', { user: userData?.profile?.stxAddress?.mainnet || 'anonymous', method: connectionMethod || 'unknown', errorType: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const executeWithdraw = async () => {
    if (!withdrawTxDetails || !userData) return;
    
    setLoading(true);
    setShowWithdrawDetails(false);
    
    try {
      if (connectionMethod === 'walletconnect' && walletConnectSession) {
        // Use WalletConnect for signing
        await handleWalletConnectTransaction('withdraw', { amount: withdrawTxDetails.amount });
      } else {
        // Set a timeout for the signing process
        const signingTimeout = setTimeout(() => {
          setStatus('⚠️ Transaction signing timed out. Please try again.');
          setWithdrawTxDetails(null);
          setLoading(false);
        }, 30000); // 30 seconds timeout
        
        await openContractCall({
          network: withdrawTxDetails.network,
          anchorMode: AnchorMode.Any,
          contractAddress: withdrawTxDetails.contractAddress,
          contractName: withdrawTxDetails.contractName,
          functionName: withdrawTxDetails.functionName,
          functionArgs: withdrawTxDetails.functionArgs,
          appDetails: {
            name: 'RenVault',
            icon: window.location.origin + '/logo192.png',
          },
          onFinish: (data) => {
            clearTimeout(signingTimeout);
            setStatus(`✅ Withdraw transaction submitted successfully! Transaction ID: ${data.txId}`);
            setWithdrawAmount('');
            withdrawValidation.reset();
            setWithdrawTxDetails(null);
            trackAnalytics('withdrawal', { user: userData.profile.stxAddress.mainnet, amount: withdrawTxDetails.amount });
            
            // Send withdrawal notification
            if (notificationService) {
              const remainingBalance = parseFloat(balance) - parseFloat(withdrawAmount);
              notificationService.testWithdrawalNotification(parseFloat(withdrawAmount), remainingBalance);
            }
            
            setTimeout(fetchUserStats, 3000);
          },
          onCancel: () => {
            clearTimeout(signingTimeout);
            setStatus('❌ Transaction cancelled by user');
            setWithdrawTxDetails(null);
          },
        });
      }
    } catch (error: unknown) {
      const friendlyMsg = ContractErrorMapper.isContractError(error)
        ? ContractErrorMapper.toStatusMessage(error, CONTRACT_NAME)
        : error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Withdrawal failed: ${friendlyMsg}`);
      setWithdrawTxDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnectTransaction = async (action: 'deposit' | 'withdraw', params: WalletConnectTransactionParams) => {
    if (!walletConnectSession) return;
    
    try {
      // Create transaction payload for WalletConnect
      const txPayload = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: action,
        functionArgs: action === 'deposit' ? [uintCV(params.amount)] : [uintCV(params.amount)],
        network: 'stacks:1', // Stacks mainnet
      };
      
      // Use WalletConnect to sign and send the transaction
      // This would typically involve calling walletKit.request() with the appropriate method
      // For now, show a placeholder message
      setStatus(`WalletConnect ${action} transaction initiated. Please check your wallet app.`);
      
      // Clear form
      if (action === 'deposit') {
        setDepositAmount('');
      } else {
        setWithdrawAmount('');
      }
      
      setTimeout(fetchUserStats, 5000); // Longer delay for WalletConnect
    } catch (error: unknown) {
      const friendlyMsg = ContractErrorMapper.isContractError(error)
        ? ContractErrorMapper.toStatusMessage(error, CONTRACT_NAME)
        : error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ WalletConnect error: ${friendlyMsg}`);
    }
  };

  const handleWalletConnectSession = (session: WalletConnectSession) => {
    // Extract Stacks account from WalletConnect session
    const stacksAccount = session.namespaces.stacks?.accounts?.[0];
    if (stacksAccount) {
      // Create a mock userData object compatible with @stacks/connect
      const mockUserData = {
        profile: {
          stxAddress: {
            mainnet: stacksAccount.split(':')[2], // Extract address from stacks:1:address
            testnet: stacksAccount.split(':')[2],
          },
          name: 'WalletConnect User',
        },
        appPrivateKey: '', // WalletConnect handles signing
      };
      
      setUserData(mockUserData as any);
      setWalletConnectSession(session);
      setStatus('✅ Connected via WalletConnect');
      trackAnalytics('wallet-connect', { user: stacksAccount.split(':')[2], method: 'walletconnect', success: true });
    } else {
      trackAnalytics('wallet-connect', { user: 'anonymous', method: 'walletconnect', success: false });
    }
  };

  const handleWithdraw = async () => {
    if (!userData) return;
    const preSubmitCheck = validateWithdrawAmount(withdrawAmount, balanceNum);
    if (!preSubmitCheck.valid) {
      withdrawValidation.validate(withdrawAmount); // surface error in the field
      setStatus(`❌ ${preSubmitCheck.error}`);
      return;
    }
    if (!validateNetwork()) return;

    // Dust-threshold advisory — confirm before proceeding
    if (preSubmitCheck.warning) {
      const ok = window.confirm(`⚠ ${preSubmitCheck.warning}\n\nContinue?`);
      if (!ok) return;
    }
    
    setLoading(true);
    setStatus('Preparing transaction details...');
    
    try {
      const amount = parseSTXInput(withdrawAmount) ?? 0;
      const network = getCurrentNetwork();
      
      // Prepare transaction details for display
      const txDetails = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [uintCV(amount)],
        network,
        amount: parseFloat(withdrawAmount),
        currentBalance: balance,
        remainingBalance: (parseFloat(balance) - parseFloat(withdrawAmount)).toFixed(6),
        fee: 'Network fee: ~0.001 STX (estimated)',
        estimatedFee: '0.001 STX'
      };
      
      setWithdrawTxDetails(txDetails);
      setShowWithdrawDetails(true);
      setLoading(false);
    } catch (error: unknown) {
      const friendlyMsg = ContractErrorMapper.isContractError(error)
        ? ContractErrorMapper.toStatusMessage(error, CONTRACT_NAME)
        : error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error preparing transaction: ${friendlyMsg}`);
      setLoading(false);
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

      <div className="card">
        <h3>🔒 Security Settings</h3>
        <div className="security-options">
          <div className="security-item">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShow2FASetup(true)}
                disabled={tfaEnabled}
              >
                {tfaEnabled ? '2FA Enabled' : 'Enable 2FA'}
              </button>
              {tfaEnabled && (
                <button
                  className="btn btn-outline"
                  onClick={handleDisable2FA}
                >
                  Disable 2FA
                </button>
              )}
            </div>
          </div>
          <div className="security-item">
            <h4>Session Management</h4>
            <p>Manage your active sessions</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={disconnectWallet}>
                Sign Out All Sessions
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (notificationService) {
                    notificationService.testFailedLoginNotification('192.168.1.100', 'Chrome/91.0');
                  }
                }}
              >
                Test Security Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      <StatsPanel balance={balance} points={points} detectedNetwork={detectedNetwork} />

      <Analytics userId={userAddress ?? ''} />

      <TransactionHistory address={userAddress ?? ''} />

      <div className="actions">
        <div className="card">
          <h3>Deposit STX</h3>
          <AmountInput
            value={depositAmount}
            onChange={(val) => {
              setDepositAmount(val);
              depositValidation.validate(val);
            }}
            validation={depositValidation.result}
            label="Amount (STX)"
            placeholder="Enter amount to deposit"
            disabled={loading}
            onEnter={handleDeposit}
          />
          <button
            className="btn btn-primary"
            onClick={handleDeposit}
            disabled={loading || !depositValidation.result.valid || !depositAmount}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
          <p><small>1% protocol fee applies</small></p>
        </div>

        <div className="card">
          <h3>Withdraw STX</h3>
          <AmountInput
            value={withdrawAmount}
            onChange={(val) => {
              setWithdrawAmount(val);
              withdrawValidation.validate(val);
            }}
            validation={withdrawValidation.result}
            label="Amount (STX)"
            placeholder="Enter amount to withdraw"
            disabled={loading || showWithdrawDetails}
            onEnter={handleWithdraw}
          />
          <button
            className="btn btn-secondary"
            onClick={handleWithdraw}
            disabled={loading || !withdrawValidation.result.valid || !withdrawAmount || showWithdrawDetails}
          >
            {loading ? 'Preparing...' : showWithdrawDetails ? 'Review Transaction' : 'Withdraw'}
          </button>
        </div>
      </div>
      </ErrorBoundary>

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
    <ErrorBoundary
      sectionName="RenVault"
      fallback={(error, reset) => (
        <div className="container">
          <div className="header">
            <h1>RenVault 🏦</h1>
          </div>
          <ErrorFallback error={error} sectionName="RenVault" onReset={reset} />
        </div>
      )}
    >
      <AppContent />
      {/* @ts-ignore */}
      <AppKit />
    </ErrorBoundary>
  );
}

export default App;
