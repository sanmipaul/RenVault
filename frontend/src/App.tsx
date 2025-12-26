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
import { WalletKitProvider } from './context/WalletKitProvider';
import { useWalletKit } from './hooks/useWalletKit';
import ConnectionStatus from './components/ConnectionStatus';
import { Analytics } from './components/Analytics';
import { TwoFactorAuthSetup } from './components/TwoFactorAuthSetup';
import { TwoFactorAuthVerify } from './components/TwoFactorAuthVerify';
import { BackupCodes } from './components/BackupCodes';

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
  const handle2FASetupComplete = (secret: string, backupCodes: string[]) => {
    setTfaSecret(secret);
    localStorage.setItem('tfa-enabled', 'true');
    localStorage.setItem('tfa-secret', secret);
    localStorage.setItem('tfa-backup-codes', JSON.stringify(backupCodes));
    setShow2FASetup(false);
    setStatus('✅ Two-factor authentication enabled successfully!');
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
      const response = await fetch('/api/2fa/verify-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user', code })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

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
      <div className="container">
        <div className="header">
          <h1>RenVault 🏦</h1>
          <p>Clarity 4 Micro-Savings Protocol</p>
        </div>
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
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect Wallet
            </button>
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
      <div className="header">
        <h1>RenVault 🏦</h1>
        <p>Welcome, {userData.profile.name || 'Stacker'}</p>
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
    </div>
  );
}

function App() {
  const { walletKit, loading, error } = useWalletKit();

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>RenVault 🏦</h1>
          <p>Initializing WalletConnect...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>RenVault 🏦</h1>
          <p>Error initializing WalletConnect: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <WalletKitProvider value={{ walletKit, isLoading: loading, error }}>
      <AppContent />
    </WalletKitProvider>
  );
}

export default App;
