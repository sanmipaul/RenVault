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
import { AppKit } from '@reown/appkit/react';
import ConnectionStatus from './components/ConnectionStatus';
import { TwoFactorAuthSetup } from './components/TwoFactorAuthSetup';
import { TwoFactorAuthVerify } from './components/TwoFactorAuthVerify';
import { SessionStatus } from './components/SessionStatus';
import { AutoReconnect } from './components/AutoReconnect';
import NotificationService from './services/notificationService';
import TransactionHistory from './components/TransactionHistory';
import { WalletBackup } from './components/WalletBackup';
import { WalletRecovery } from './components/WalletRecovery';
import { WalletManager } from './services/wallet/WalletManager';
import { MultiSigSetup } from './components/MultiSigSetup';
import { CoSignerManagement } from './components/CoSignerManagement';
import { MultiSigTransactionSigner } from './components/MultiSigTransactionSigner';
import { WalletProviderLoader } from './services/wallet/WalletProviderLoader';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { getAnalyticsUrl } from './config/api';
import { BackupCodes } from './components/BackupCodes';
import { Analytics } from './components/Analytics';
import NotificationCenter from './components/NotificationCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';

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

const trackAnalytics = async (event: string, data: any) => {
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
  const [withdrawTxDetails, setWithdrawTxDetails] = useState<any>(null);
  const [connectionMethod, setConnectionMethod] = useState<'stacks' | 'walletconnect' | null>(null);
  const [showConnectionOptions, setShowConnectionOptions] = useState<boolean>(false);
  const [walletConnectSession, setWalletConnectSession] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [show2FASetup, setShow2FASetup] = useState<boolean>(false);
  const [show2FAVerify, setShow2FAVerify] = useState<boolean>(false);
  const [showBackupCodes, setShowBackupCodes] = useState<boolean>(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [showWalletBackup, setShowWalletBackup] = useState<boolean>(false);
  const [showWalletRecovery, setShowWalletRecovery] = useState<boolean>(false);
  const [walletManager] = useState(() => new WalletManager());
  const [showMultiSigSetup, setShowMultiSigSetup] = useState<boolean>(false);
  const [showCoSignerManagement, setShowCoSignerManagement] = useState<boolean>(false);
  const [showMultiSigSigner, setShowMultiSigSigner] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState<boolean>(false);
  const [tfaSecret, setTfaSecret] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      if (withdrawTxDetails) {
        setWithdrawTxDetails(null);
      }
    };
  }, []);

  // Derive the notification userId from the connected wallet address so it is
  // stable and consistent with the key used everywhere else in the app.
  const notificationUserId = userData?.profile.stxAddress.mainnet ?? null;

  // Initialize notification service — use the singleton so the same instance
  // (and its registered listeners) is reused across re-renders.
  const notificationService = useMemo(
    () =>
      notificationUserId
        ? NotificationService.getInstance(notificationUserId)
        : null,
    [notificationUserId]
  );
  const handle2FASetupComplete = (secret: string, backupCodes: string[]) => {
    setTfaSecret(secret);
    localStorage.setItem(APP_CONFIG.tfaEnabledKey, 'true');
    localStorage.setItem(APP_CONFIG.tfaSecretKey, secret);
    localStorage.setItem(APP_CONFIG.tfaBackupCodesKey, JSON.stringify(backupCodes));
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
      const storedCodes: string[] = JSON.parse(localStorage.getItem(APP_CONFIG.tfaBackupCodesKey) || '[]');
      if (storedCodes.includes(code)) {
        const remaining = storedCodes.filter(c => c !== code);
        localStorage.setItem(APP_CONFIG.tfaBackupCodesKey, JSON.stringify(remaining));
        setShowBackupCodes(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDisable2FA = () => {
    localStorage.removeItem(APP_CONFIG.tfaEnabledKey);
    localStorage.removeItem(APP_CONFIG.tfaSecretKey);
    localStorage.removeItem(APP_CONFIG.tfaBackupCodesKey);
    setTfaSecret('');
    setStatus('✅ Two-factor authentication disabled');
    
    // Send 2FA disabled notification
    if (notificationService) {
      notificationService.testTwoFactorDisabledNotification();
    }
    
    setTimeout(() => setStatus(''), 5000);
  };

  const handleWalletBackupComplete = (backupData: string) => {
    setShowWalletBackup(false);
    setStatus('✅ Wallet backup created successfully! Store it securely.');
    // Optionally send to backend
    fetch('/api/wallet/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData?.profile.stxAddress.mainnet, encryptedBackup: backupData })
    });
    setTimeout(() => setStatus(''), 5000);
  };

  const handleWalletRecoveryComplete = () => {
    setShowWalletRecovery(false);
    setStatus('✅ Wallet recovered successfully!');
    // Refresh user data
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
    setTimeout(() => setStatus(''), 5000);
  };

  const handleMultiSigSetupComplete = () => {
    setShowMultiSigSetup(false);
    setStatus('✅ Multi-signature wallet setup completed!');
    setTimeout(() => setStatus(''), 5000);
  };

  const handleCoSignerUpdate = () => {
    setStatus('✅ Co-signers updated successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleMultiSigTransactionSigned = (signedTx: any) => {
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
    // Clear all session data
    localStorage.removeItem('tfa-enabled');
    localStorage.removeItem('tfa-secret');
    localStorage.removeItem('tfa-backup-codes');
    // Clear all connection-related state
    setBalance('0');
    setPoints('0');
    setDepositAmount('');
    setWithdrawAmount('');
    setDetectedNetwork(null);
    setNetworkMismatch(false);
  };

  useEffect(() => {
    // Check for 2FA requirement on app load
    const tfaEnabled = localStorage.getItem('tfa-enabled') === 'true';
    if (tfaEnabled && !userData) {
      setShow2FAVerify(true);
    }
  }, []);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  useEffect(() => {
    if (userData && detectedNetwork) {
      console.log('Detected network:', detectedNetwork, 'Address:', userData.profile.stxAddress.mainnet);
      fetchUserStats();
    }
  }, [userData, detectedNetwork]);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus('');
      }, 10000); // Clear status after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showWithdrawDetails) {
        if (event.key === 'Enter' && !loading) {
          executeWithdraw();
        } else if (event.key === 'Escape') {
          setShowWithdrawDetails(false);
          setWithdrawTxDetails(null);
        }
      }
    };

    if (showWithdrawDetails) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showWithdrawDetails, loading]);

  const promptNetworkSwitch = () => {
    setStatus('To switch networks: Open your Stacks wallet extension and select "Mainnet" from the network dropdown, then refresh this page.');
  };

  const validateNetwork = (): boolean => {
    if (networkMismatch) {
      setStatus('Please switch to mainnet to perform this action');
      return false;
    }
    return true;
  };

  const connectWallet = () => {
    setShowConnectionOptions(true);
  };

  const connectWithStacks = () => {
    setConnectionError(null);
    setRetryCount(0);
    setConnectionMethod('stacks');
    setShowConnectionOptions(false);
    const startTime = Date.now();
    try {
      showConnect({
        appDetails: {
          name: APP_CONFIG.name,
          icon: APP_CONFIG.icon,
        },
        redirectTo: '/',
        onFinish: () => {
          const duration = Date.now() - startTime;
          trackAnalytics('wallet-connect', { user: 'anonymous', method: 'stacks', success: true });
          trackAnalytics('performance', { operation: 'wallet-connect-stacks', duration });
          window.location.reload();
        },
        userSession,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setConnectionError(`Failed to connect with Stacks wallet: ${error.message}`);
      trackAnalytics('wallet-connect', { user: 'anonymous', method: 'stacks', success: false });
      trackAnalytics('wallet-error', { user: 'anonymous', method: 'stacks', errorType: error.message });
      trackAnalytics('performance', { operation: 'wallet-connect-stacks', duration });
      setToastMessage('Connection failed. Check the error message above.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const retryConnectWithStacks = () => {
    setRetryCount(prev => prev + 1);
    connectWithStacks();
  };

  const connectWithWalletConnect = () => {
    setConnectionMethod('walletconnect');
    setShowConnectionOptions(false);
  };

  const fetchUserStats = async () => {
    if (!userData || networkMismatch) return;
    
    const startTime = Date.now();
    try {
      const network = getCurrentNetwork();
      const balanceResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userData.profile.stxAddress.mainnet)],
        network,
        senderAddress: userData.profile.stxAddress.mainnet,
      });
      
      const pointsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-points',
        functionArgs: [standardPrincipalCV(userData.profile.stxAddress.mainnet)],
        network,
        senderAddress: userData.profile.stxAddress.mainnet,
      });

      // Assuming result is a UIntCV
      // @ts-ignore
      setBalance((parseInt(balanceResult.value) / 1000000).toFixed(6));
      // @ts-ignore
      setPoints(pointsResult.value);
      
      const duration = Date.now() - startTime;
      trackAnalytics('performance', { operation: 'fetch-user-stats', duration });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (networkMismatch) {
        setStatus('Unable to fetch data: Please switch to mainnet');
      }
      const duration = Date.now() - startTime;
      trackAnalytics('performance', { operation: 'fetch-user-stats', duration });
    }
  };

  const handleDeposit = async () => {
    if (!debouncedDepositAmount || !userData) return;
    if (!validateNetwork()) return;

    setLoading(true);
    setStatus('');

    try {
      const amount = Math.floor(parseFloat(debouncedDepositAmount) * 1000000);
      
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
        
        trackAnalytics('deposit', { user: userData.profile.stxAddress.mainnet, amount });
        
        // Send deposit notification
        if (notificationService) {
          notificationService.testDepositNotification(parseFloat(debouncedDepositAmount), parseFloat(balance) + parseFloat(debouncedDepositAmount));
        }
        
        setTimeout(fetchUserStats, 3000);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      trackAnalytics('wallet-error', { user: userData?.profile?.stxAddress?.mainnet || 'anonymous', method: connectionMethod || 'unknown', errorType: error.message });
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
    } catch (error: any) {
      setStatus(`Error signing transaction: ${error.message}`);
      setWithdrawTxDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnectTransaction = async (action: 'deposit' | 'withdraw', params: any) => {
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
    } catch (error: any) {
      setStatus(`WalletConnect error: ${error.message}`);
    }
  };

  const handleWalletConnectSession = (session: any) => {
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
    if (!withdrawAmount || !userData) return;
    if (!validateNetwork()) return;
    
    const withdrawAmountNum = parseFloat(withdrawAmount);
    const balanceNum = parseFloat(balance);
    
    if (isNaN(withdrawAmountNum) || withdrawAmountNum <= 0) {
      setStatus('Error: Please enter a valid withdrawal amount greater than 0');
      return;
    }
    
    if (withdrawAmountNum > balanceNum) {
      setStatus(`Error: Insufficient balance. You have ${balance} STX available`);
      return;
    }
    
    // Warn if withdrawal would leave less than 0.01 STX
    const remainingBalance = balanceNum - withdrawAmountNum;
    if (remainingBalance > 0 && remainingBalance < 0.01) {
      const confirmLeave = window.confirm(`Warning: This withdrawal will leave only ${remainingBalance.toFixed(6)} STX in your vault. Continue?`);
      if (!confirmLeave) return;
    }
    
    setLoading(true);
    setStatus('Preparing transaction details...');
    
    try {
      const amount = Math.floor(parseFloat(withdrawAmount) * 1000000);
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
    } catch (error: any) {
      setStatus(`Error preparing transaction: ${error.message}`);
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <>
      <div className="container">
        <div className="header">
          <h1>RenVault 🏦</h1>
          <p>Clarity 4 Micro-Savings Protocol</p>
        </div>

        <ConnectionStatus
          isConnected={false}
          connectionMethod={null}
        />

        {showConnectionOptions ? (
          <div className="card">
            <h2>Choose Connection Method</h2>
            <p>Select how you'd like to connect your wallet:</p>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button className="btn btn-primary" onClick={connectWithStacks} aria-label="Connect using Stacks browser extension">
                🌐 Browser Extension (Stacks)
              </button>
              <button className="btn btn-secondary" onClick={connectWithWalletConnect} aria-label="Connect using WalletConnect for mobile or desktop">
                📱 WalletConnect (Mobile/Desktop)
              </button>
              <button className="btn btn-outline" onClick={() => setShowConnectionOptions(false)} aria-label="Cancel wallet connection">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>Connect Your Wallet</h2>
            <p>Connect your Stacks wallet to start saving STX and earning commitment points.</p>
            <appkit-button aria-label="Open wallet connection modal" />
          </div>
        )}

        {connectionError && (
          <div className="card error">
            <h3>❌ Connection Failed</h3>
            <p>{connectionError}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={retryConnectWithStacks} aria-label="Retry connecting with Stacks wallet extension">
                Retry Stacks Wallet
              </button>
              <button className="btn btn-secondary" onClick={connectWithWalletConnect} aria-label="Try WalletConnect as an alternative connection method">
                Try WalletConnect Instead
              </button>
              <button className="btn btn-outline" onClick={() => setShowHelp(true)} aria-label="Open connection help guide" aria-expanded={showHelp}>
                Help
              </button>
            </div>
          </div>
        )}

        {showHelp && (
          <div className="card">
            <h3>🔧 Connection Help</h3>
            <p><strong>Stacks Wallet Extension:</strong> Make sure you have the Stacks Wallet browser extension installed and unlocked.</p>
            <p><strong>WalletConnect:</strong> Ensure your mobile wallet app supports WalletConnect and is connected to the internet.</p>
            <p><strong>Network Issues:</strong> Check your internet connection and try refreshing the page.</p>
            <p><strong>Timeout Errors:</strong> The app will automatically retry connections. If it persists, try a different connection method.</p>
            <button className="btn btn-primary" onClick={() => setShowHelp(false)} style={{ marginTop: '16px' }}>
              Close Help
            </button>
          </div>
        )}

        {show2FASetup && (
          <div className="modal-overlay">
            <ErrorBoundary
              sectionName="2FA Setup"
              fallback={(error, reset) => (
                <ErrorFallback error={error} sectionName="2FA Setup" onReset={reset} />
              )}
            >
              <TwoFactorAuthSetup
                onSetupComplete={handle2FASetupComplete}
                onCancel={() => setShow2FASetup(false)}
              />
            </ErrorBoundary>
          </div>
        )}

        {show2FAVerify && (
          <div className="modal-overlay">
            <ErrorBoundary
              sectionName="2FA Verify"
              fallback={(error, reset) => (
                <ErrorFallback error={error} sectionName="2FA Verify" onReset={reset} />
              )}
            >
              <TwoFactorAuthVerify
                onVerify={handle2FAVerify}
                onUseBackup={() => {
                  setShow2FAVerify(false);
                  setShowBackupCodes(true);
                }}
                onCancel={() => setShow2FAVerify(false)}
              />
            </ErrorBoundary>
          </div>
        )}

        {showBackupCodes && (
          <div className="modal-overlay">
            <ErrorBoundary
              sectionName="Backup Codes"
              fallback={(error, reset) => (
                <ErrorFallback error={error} sectionName="Backup Codes" onReset={reset} />
              )}
            >
              <BackupCodes
                onVerify={handleBackupCodeVerify}
                onCancel={() => setShowBackupCodes(false)}
              />
            </ErrorBoundary>
          </div>
        )}

        {connectionMethod === 'walletconnect' && (
          <div className="card">
            <WalletConnect />
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          {toastMessage}
        </div>
      )}
      </>
    );
  }

  return (
    <div className="container">
      <SessionStatus />
      <AutoReconnect />
      <div className="header">
        <h1>RenVault 🏦</h1>
        <p>Welcome, {userData.profile.name || 'Stacker'}</p>
        <div className="header-actions">
          <button
            className="notification-button"
            onClick={() => setShowNotificationCenter(true)}
            title="Notifications"
            aria-label="Open notification center"
            aria-haspopup="dialog"
          >
            🔔
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowWalletBackup(true)}
            title="Backup Wallet"
            aria-label="Open wallet backup"
            aria-haspopup="dialog"
          >
            🛡️ Backup
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowWalletRecovery(true)}
            title="Recover Wallet"
            aria-label="Open wallet recovery"
            aria-haspopup="dialog"
          >
            🔄 Recover
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowMultiSigSetup(true)}
            title="Setup Multi-Sig"
            aria-label="Open multi-signature wallet setup"
            aria-haspopup="dialog"
          >
            🔐 Multi-Sig
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowCoSignerManagement(true)}
            title="Manage Co-Signers"
            aria-label="Manage co-signers for multi-signature wallet"
            aria-haspopup="dialog"
          >
            👥 Co-Signers
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowMultiSigSigner(true)}
            title="Sign Multi-Sig Transactions"
            aria-label="Sign pending multi-signature transactions"
            aria-haspopup="dialog"
          >
            ✍️ Sign Tx
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowPerformanceMonitor(true)}
            title="Performance Monitor"
            aria-label="Open performance monitor"
            aria-haspopup="dialog"
          >
            ⚡ Perf
          </button>
          {detectedNetwork && (
            <div className="network-indicator">
              <span className={`network-badge ${detectedNetwork}`}>
                {detectedNetwork.toUpperCase()}
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ marginLeft: '12px', fontSize: '0.8rem', padding: '4px 8px' }}
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      <ConnectionStatus
        isConnected={!!userData}
        connectionMethod={connectionMethod}
        walletAddress={userData?.profile?.stxAddress?.mainnet}
        onDisconnect={disconnectWallet}
      />

      <div className="appkit-controls" role="region" aria-label="Wallet controls">
        <appkit-account-button aria-label="Account management and balance" />
        <appkit-network-button aria-label="Switch blockchain network" />
      </div>

      {detectedNetwork === 'mainnet' && (
        <div className="card success">
          <h3>✅ Connected to Mainnet</h3>
          <p>You are connected to the correct network. You can now use RenVault.</p>
        </div>
      )}
      {detectedNetwork !== 'mainnet' && (
        <div className="card warning">
          <h3>⚠️ Network Mismatch Detected</h3>
          <p>Your wallet is connected to <strong>{detectedNetwork}</strong>, but RenVault operates on <strong>mainnet</strong>.</p>
          <p>Please switch your wallet to mainnet to use this application.</p>
          <div role="group" aria-label="Network switch actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={promptNetworkSwitch} aria-label="Show instructions for switching to mainnet">
              How to Switch Network
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()} aria-label="Reload page after switching network">
              Refresh After Switching
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3>🔒 Security Settings</h3>
        <div className="security-options">
          <div className="security-item">
            <h4 id="tfa-heading">Two-Factor Authentication</h4>
            <p id="tfa-desc">Add an extra layer of security to your account</p>
            <div role="group" aria-labelledby="tfa-heading" aria-describedby="tfa-desc" style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShow2FASetup(true)}
                disabled={localStorage.getItem('tfa-enabled') === 'true'}
                aria-label={localStorage.getItem('tfa-enabled') === 'true' ? 'Two-factor authentication is already enabled' : 'Enable two-factor authentication'}
                aria-pressed={localStorage.getItem('tfa-enabled') === 'true'}
                aria-haspopup="dialog"
              >
                {localStorage.getItem('tfa-enabled') === 'true' ? '2FA Enabled' : 'Enable 2FA'}
              </button>
              {localStorage.getItem('tfa-enabled') === 'true' && (
                <button
                  className="btn btn-outline"
                  onClick={handleDisable2FA}
                  aria-label="Disable two-factor authentication"
                >
                  Disable 2FA
                </button>
              )}
            </div>
          </div>
          <div className="security-item">
            <h4 id="session-heading">Session Management</h4>
            <p id="session-desc">Manage your active sessions</p>
            <div role="group" aria-labelledby="session-heading" aria-describedby="session-desc" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={disconnectWallet} aria-label="Sign out and disconnect all active wallet sessions">
                Sign Out All Sessions
              </button>
              <button
                className="btn btn-outline"
                aria-label="Trigger a test security alert notification"
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

      <div className="stats" role="region" aria-label="Vault statistics">
        <div className="stat-card" role="group" aria-label="Vault balance">
          <div className="stat-value" aria-live="polite" aria-atomic="true">{balance} STX</div>
          <div>Vault Balance</div>
        </div>
        <div className="stat-card" role="group" aria-label="Commitment points">
          <div className="stat-value" aria-live="polite" aria-atomic="true">{points}</div>
          <div>Commitment Points</div>
        </div>
        <div className="stat-card" role="group" aria-label="Connected network">
          <div className="stat-value">{detectedNetwork ? detectedNetwork.toUpperCase() : 'Unknown'}</div>
          <div>Network</div>
        </div>
      </div>

      <ErrorBoundary
        sectionName="Analytics"
        fallback={(error, reset) => (
          <ErrorFallback error={error} sectionName="Analytics" onReset={reset} compact />
        )}
      >
        <Analytics userId={userData?.profile?.stxAddress?.mainnet} />
      </ErrorBoundary>

      <ErrorBoundary
        sectionName="Transaction History"
        fallback={(error, reset) => (
          <ErrorFallback error={error} sectionName="Transaction History" onReset={reset} />
        )}
      >
        <TransactionHistory address={userData?.profile?.stxAddress?.mainnet} />
      </ErrorBoundary>

      <ErrorBoundary
        sectionName="Vault Actions"
        fallback={(error, reset) => (
          <ErrorFallback error={error} sectionName="Vault Actions" onReset={reset} />
        )}
      >
      <div className="actions" role="region" aria-label="Vault deposit and withdrawal actions">
        <div className="card">
          <h3 id="deposit-heading">Deposit STX</h3>
          <div className="input-group">
            <label htmlFor="deposit-amount">Amount (STX)</label>
            <input
              id="deposit-amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              step="0.000001"
              aria-labelledby="deposit-heading"
              aria-describedby="deposit-fee-note"
              aria-required="true"
              min="0.000001"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleDeposit}
            disabled={loading || !depositAmount}
            aria-label={loading ? 'Processing deposit, please wait' : 'Submit deposit transaction'}
            aria-busy={loading}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
          <p id="deposit-fee-note"><small>1% protocol fee applies</small></p>
        </div>

        <div className="card">
          <h3 id="withdraw-heading">Withdraw STX</h3>
          <div className="input-group">
            <label htmlFor="withdraw-amount">Amount (STX)</label>
            <input
              id="withdraw-amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              step="0.000001"
              aria-labelledby="withdraw-heading"
              aria-required="true"
              min="0.000001"
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || showWithdrawDetails}
            aria-label={loading ? 'Preparing withdrawal, please wait' : 'Prepare withdrawal transaction for review'}
            aria-busy={loading}
          >
            {loading ? 'Preparing...' : showWithdrawDetails ? 'Review Transaction' : 'Withdraw'}
          </button>
        </div>
      </div>
      </ErrorBoundary>

      {showWithdrawDetails && withdrawTxDetails && (
        <div className="card confirmation" role="dialog" aria-modal="true" aria-labelledby="confirm-withdraw-title">
          <h3 id="confirm-withdraw-title">🔐 Confirm Withdrawal Transaction</h3>
          <div style={{ marginBottom: '16px' }} role="list" aria-label="Transaction details">
            <p role="listitem"><strong>Action:</strong> Withdraw STX from vault</p>
            <p role="listitem"><strong>Amount:</strong> {withdrawTxDetails.amount} STX</p>
            <p role="listitem"><strong>Current Balance:</strong> {withdrawTxDetails.currentBalance} STX</p>
            <p role="listitem"><strong>Remaining Balance:</strong> {withdrawTxDetails.remainingBalance} STX</p>
            <p role="listitem"><strong>Contract:</strong> {withdrawTxDetails.contractAddress}.{withdrawTxDetails.contractName}</p>
            <p role="listitem"><strong>Function:</strong> {withdrawTxDetails.functionName}</p>
            <p role="listitem"><strong>Network:</strong> {withdrawTxDetails.network.name}</p>
            <p role="listitem"><small>{withdrawTxDetails.fee}</small></p>
          </div>
          <div role="group" aria-label="Confirm or cancel withdrawal" style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={executeWithdraw}
              disabled={loading}
              aria-label={loading ? 'Signing transaction, please wait' : 'Sign and submit withdrawal transaction'}
              aria-busy={loading}
            >
              {loading ? 'Signing...' : 'Sign & Submit Transaction'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowWithdrawDetails(false);
                setWithdrawTxDetails(null);
              }}
              disabled={loading}
              aria-label="Cancel withdrawal and return to input"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status && (
        <div
          className={`status ${status.includes('Error') ? 'error' : 'success'}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </div>
      )}

      <div className="card">
        <h3>How it Works</h3>
        <ul>
          <li>Deposit STX to your personal vault (1% protocol fee)</li>
          <li>Earn commitment points with each deposit</li>
          <li>Withdraw your funds anytime</li>
          <li>Built with Clarity 4 on Stacks blockchain</li>
        </ul>
      </div>

      <ErrorBoundary
        sectionName="Notification Center"
        fallback={(error, reset) => (
          <ErrorFallback error={error} sectionName="Notification Center" onReset={reset} compact />
        )}
      >
        <NotificationCenter
          userId={userData.profile.stxAddress.mainnet}
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
        />
      </ErrorBoundary>

      {showWalletBackup && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="Wallet Backup"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="Wallet Backup" onReset={reset} />
            )}
          >
            <WalletBackup
              walletManager={walletManager}
              onBackupComplete={handleWalletBackupComplete}
              onCancel={() => setShowWalletBackup(false)}
            />
          </ErrorBoundary>
        </div>
      )}

      {showWalletRecovery && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="Wallet Recovery"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="Wallet Recovery" onReset={reset} />
            )}
          >
            <WalletRecovery
              walletManager={walletManager}
              onRecoveryComplete={handleWalletRecoveryComplete}
              onCancel={() => setShowWalletRecovery(false)}
            />
          </ErrorBoundary>
        </div>
      )}

      {showMultiSigSetup && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="MultiSig Setup"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="MultiSig Setup" onReset={reset} />
            )}
          >
            <MultiSigSetup
              walletManager={walletManager}
              onSetupComplete={handleMultiSigSetupComplete}
              onCancel={() => setShowMultiSigSetup(false)}
            />
          </ErrorBoundary>
        </div>
      )}

      {showCoSignerManagement && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="Co-Signer Management"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="Co-Signer Management" onReset={reset} />
            )}
          >
            <CoSignerManagement
              walletManager={walletManager}
              onUpdate={handleCoSignerUpdate}
              onCancel={() => setShowCoSignerManagement(false)}
            />
          </ErrorBoundary>
        </div>
      )}

      {showMultiSigSigner && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="MultiSig Transaction Signer"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="MultiSig Transaction Signer" onReset={reset} />
            )}
          >
            <MultiSigTransactionSigner
              walletManager={walletManager}
              transaction={currentTransaction}
              onSigned={handleMultiSigTransactionSigned}
              onCancel={() => setShowMultiSigSigner(false)}
            />
          </ErrorBoundary>
        </div>
      )}

      {showPerformanceMonitor && (
        <div className="modal-overlay">
          <ErrorBoundary
            sectionName="Performance Monitor"
            fallback={(error, reset) => (
              <ErrorFallback error={error} sectionName="Performance Monitor" onReset={reset} />
            )}
          >
            <PerformanceMonitor
              walletManager={walletManager}
              isVisible={showPerformanceMonitor}
            />
          </ErrorBoundary>
          <button
            className="modal-close"
            onClick={() => setShowPerformanceMonitor(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [appKitInitialized, setAppKitInitialized] = useState(false);
  const [appKitError, setAppKitError] = useState<string | null>(null);

  useEffect(() => {
    const initAppKit = async () => {
      try {
        // AppKit is initialized in AppKitService, but we need to ensure it's ready
        const { AppKitService } = await import('./services/appkit-service');
        await AppKitService.init();
        setAppKitInitialized(true);
        setAppKitError(null);
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
          <h1>RenVault 🏦</h1>
          <p>Wallet Service Error</p>
        </div>
        <div className="card error">
          <h3>❌ Initialization Failed</h3>
          <p>{appKitError}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
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
          <h1>RenVault 🏦</h1>
          <p>Initializing AppKit...</p>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
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
