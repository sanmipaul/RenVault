import React, { useState, useEffect } from 'react';
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
import TwoFactorAuthSetup from './components/TwoFactorAuthSetup';
import TwoFactorAuthVerify from './components/TwoFactorAuthVerify';
import { SessionStatus } from './components/SessionStatus';
import { AutoReconnect } from './components/AutoReconnect';
import NotificationService from './services/notificationService';
import TransactionHistory from './components/TransactionHistory';
import { SessionStatus } from './components/SessionStatus';
import { AutoReconnect } from './components/AutoReconnect';
import { WalletBackup } from './components/WalletBackup';
import { WalletRecovery } from './components/WalletRecovery';
import { WalletManager } from './services/wallet/WalletManager';
import { MultiSigSetup } from './components/MultiSigSetup';
import { CoSignerManagement } from './components/CoSignerManagement';
import { MultiSigTransactionSigner } from './components/MultiSigTransactionSigner';
import { WalletProviderLoader } from './services/wallet/WalletProviderLoader';
import { PerformanceMonitor } from './components/PerformanceMonitor';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

const detectNetworkFromAddress = (address: string): 'mainnet' | 'testnet' => {
  // Stacks mainnet addresses start with 'SP', testnet with 'ST'
  return address.startsWith('SP') ? 'mainnet' : 'testnet';
};

const getCurrentNetwork = () => {
  // Always return mainnet for RenVault operations
  return new StacksMainnet();
};

const trackAnalytics = async (event: string, data: any) => {
  const optOut = localStorage.getItem('analytics-opt-out') === 'true';
  if (optOut) return;
  
  try {
    await fetch('http://localhost:3001/api/' + event, {
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

  // Preload critical wallet providers for better performance
  useEffect(() => {
    WalletProviderLoader.preloadCriticalProviders().catch(error =>
      console.warn('Failed to preload critical providers:', error)
    );
  }, []);

  // Initialize notification service
  const notificationService = userData ? new NotificationService(userData.profile.stxAddress.mainnet) : null;
  const handle2FASetupComplete = (secret: string, backupCodes: string[]) => {
    setTfaSecret(secret);
    localStorage.setItem('tfa-enabled', 'true');
    localStorage.setItem('tfa-secret', secret);
    localStorage.setItem('tfa-backup-codes', JSON.stringify(backupCodes));
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

  const handleDisable2FA = () => {
    localStorage.removeItem('tfa-enabled');
    localStorage.removeItem('tfa-secret');
    localStorage.removeItem('tfa-backup-codes');
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
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const network = detectNetworkFromAddress(userData.profile.stxAddress.mainnet);
      setDetectedNetwork(network);
      setNetworkMismatch(network !== 'mainnet');
      console.log('Detected network:', network, 'Address:', userData.profile.stxAddress.mainnet);
      fetchUserStats();
    }
  }, [userData]);

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
          name: 'RenVault',
          icon: window.location.origin + '/logo192.png',
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
    if (!depositAmount || !userData) return;
    if (!validateNetwork()) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = Math.floor(parseFloat(depositAmount) * 1000000);
      
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
          notificationService.testDepositNotification(parseFloat(depositAmount), parseFloat(balance) + parseFloat(depositAmount));
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
    // Clear all connection-related state
    setBalance('0');
    setPoints('0');
    setDepositAmount('');
    setWithdrawAmount('');
    setDetectedNetwork(null);
    setNetworkMismatch(false);
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
              <button className="btn btn-primary" onClick={connectWithStacks}>
                🌐 Browser Extension (Stacks)
              </button>
              <button className="btn btn-secondary" onClick={connectWithWalletConnect}>
                📱 WalletConnect (Mobile/Desktop)
              </button>
              <button className="btn btn-outline" onClick={() => setShowConnectionOptions(false)}>
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
            <TwoFactorAuthSetup
              onSetupComplete={handle2FASetupComplete}
              onCancel={() => setShow2FASetup(false)}
            />
          </div>
        )}

        {show2FAVerify && (
          <div className="modal-overlay">
            <TwoFactorAuthVerify
              onVerify={handle2FAVerify}
              onUseBackup={() => {
                setShow2FAVerify(false);
                setShowBackupCodes(true);
              }}
              onCancel={() => setShow2FAVerify(false)}
            />
          </div>
        )}

        {showBackupCodes && (
          <div className="modal-overlay">
            <BackupCodes
              onVerify={handleBackupCodeVerify}
              onCancel={() => setShowBackupCodes(false)}
            />
          </div>
        )}

        {connectionMethod === 'walletconnect' && (
          <div className="card">
            <WalletConnect onSessionEstablished={handleWalletConnectSession} />
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
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
          >
            🔔
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowWalletBackup(true)}
            title="Backup Wallet"
          >
            🛡️ Backup
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowWalletRecovery(true)}
            title="Recover Wallet"
          >
            🔄 Recover
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowMultiSigSetup(true)}
            title="Setup Multi-Sig"
          >
            🔐 Multi-Sig
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowCoSignerManagement(true)}
            title="Manage Co-Signers"
          >
            👥 Co-Signers
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowMultiSigSigner(true)}
            title="Sign Multi-Sig Transactions"
          >
            ✍️ Sign Tx
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowPerformanceMonitor(true)}
            title="Performance Monitor"
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={promptNetworkSwitch}>
              How to Switch Network
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Refresh After Switching
            </button>
          </div>
        </div>
      )}

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
                disabled={localStorage.getItem('tfa-enabled') === 'true'}
              >
                {localStorage.getItem('tfa-enabled') === 'true' ? '2FA Enabled' : 'Enable 2FA'}
              </button>
              {localStorage.getItem('tfa-enabled') === 'true' && (
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

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{balance} STX</div>
          <div>Vault Balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{points}</div>
          <div>Commitment Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{detectedNetwork ? detectedNetwork.toUpperCase() : 'Unknown'}</div>
          <div>Network</div>
        </div>
      </div>

      <Analytics userId={userData?.profile?.stxAddress?.mainnet} />

      <TransactionHistory address={userData?.profile?.stxAddress?.mainnet} />

      <div className="actions">
        <div className="card">
          <h3>Deposit STX</h3>
          <div className="input-group">
            <label>Amount (STX)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              step="0.000001"
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleDeposit}
            disabled={loading || !depositAmount}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
          <p><small>1% protocol fee applies</small></p>
        </div>

        <div className="card">
          <h3>Withdraw STX</h3>
          <div className="input-group">
            <label>Amount (STX)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              step="0.000001"
            />
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || showWithdrawDetails}
          >
            {loading ? 'Preparing...' : showWithdrawDetails ? 'Review Transaction' : 'Withdraw'}
          </button>
        </div>
      </div>

      {showWithdrawDetails && withdrawTxDetails && (
        <div className="card confirmation">
          <h3>🔐 Confirm Withdrawal Transaction</h3>
          <div style={{ marginBottom: '16px' }}>
            <p><strong>Action:</strong> Withdraw STX from vault</p>
            <p><strong>Amount:</strong> {withdrawTxDetails.amount} STX</p>
            <p><strong>Current Balance:</strong> {withdrawTxDetails.currentBalance} STX</p>
            <p><strong>Remaining Balance:</strong> {withdrawTxDetails.remainingBalance} STX</p>
            <p><strong>Contract:</strong> {withdrawTxDetails.contractAddress}.{withdrawTxDetails.contractName}</p>
            <p><strong>Function:</strong> {withdrawTxDetails.functionName}</p>
            <p><strong>Network:</strong> {withdrawTxDetails.network.name}</p>
            <p><small>{withdrawTxDetails.fee}</small></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={executeWithdraw}
              disabled={loading}
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
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className={`status ${status.includes('Error') ? 'error' : 'success'}`}>
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

      <NotificationCenter
        userId={userData.profile.stxAddress.mainnet}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      {showWalletBackup && (
        <div className="modal-overlay">
          <WalletBackup
            walletManager={walletManager}
            onBackupComplete={handleWalletBackupComplete}
            onCancel={() => setShowWalletBackup(false)}
          />
        </div>
      )}

      {showWalletRecovery && (
        <div className="modal-overlay">
          <WalletRecovery
            walletManager={walletManager}
            onRecoveryComplete={handleWalletRecoveryComplete}
            onCancel={() => setShowWalletRecovery(false)}
          />
        </div>
      )}

      {showMultiSigSetup && (
        <div className="modal-overlay">
          <MultiSigSetup
            walletManager={walletManager}
            onSetupComplete={handleMultiSigSetupComplete}
            onCancel={() => setShowMultiSigSetup(false)}
          />
        </div>
      )}

      {showCoSignerManagement && (
        <div className="modal-overlay">
          <CoSignerManagement
            walletManager={walletManager}
            onUpdate={handleCoSignerUpdate}
            onCancel={() => setShowCoSignerManagement(false)}
          />
        </div>
      )}

      {showMultiSigSigner && (
        <div className="modal-overlay">
          <MultiSigTransactionSigner
            walletManager={walletManager}
            transaction={currentTransaction}
            onSigned={handleMultiSigTransactionSigned}
            onCancel={() => setShowMultiSigSigner(false)}
          />
        </div>
      )}

      {showPerformanceMonitor && (
        <div className="modal-overlay">
          <PerformanceMonitor
            walletManager={walletManager}
            isVisible={showPerformanceMonitor}
          />
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

  useEffect(() => {
    const initAppKit = async () => {
      try {
        // AppKit is initialized in AppKitService, but we need to ensure it's ready
        const { AppKitService } = await import('./services/appkit-service');
        await AppKitService.init();
        setAppKitInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
      }
    };

    initAppKit();
  }, []);

  if (!appKitInitialized) {
    return (
      <div className="container">
        <div className="header">
          <h1>RenVault 🏦</h1>
          <p>Initializing AppKit...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppContent />
      <AppKit />
    </>
  );
}

export default App;
