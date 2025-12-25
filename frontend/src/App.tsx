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
  // Return the appropriate network instance based on detected network
  // Note: Contract is deployed on mainnet, so testnet calls will fail
  return detectedNetwork === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

function App() {
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

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'RenVault',
        icon: window.location.origin + '/logo192.png',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const fetchUserStats = async () => {
    if (!userData || networkMismatch) return;
    
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
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (networkMismatch) {
        setStatus('Unable to fetch data: Please switch to mainnet');
      }
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !userData) return;
    if (!validateNetwork()) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = Math.floor(parseFloat(depositAmount) * 1000000);
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
      
      setTimeout(fetchUserStats, 3000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeWithdraw = async () => {
    if (!withdrawTxDetails || !userData) return;
    
    setLoading(true);
    setShowWithdrawDetails(false);
    
    try {
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
          setStatus(`✅ Withdraw transaction submitted successfully: ${data.txId}`);
          setWithdrawAmount('');
          setWithdrawTxDetails(null);
          setTimeout(fetchUserStats, 3000);
        },
        onCancel: () => {
          clearTimeout(signingTimeout);
          setStatus('❌ Transaction cancelled by user');
          setWithdrawTxDetails(null);
        },
      });
    } catch (error: any) {
      setStatus(`Error signing transaction: ${error.message}`);
      setWithdrawTxDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const validateNetwork = () => {
    if (networkMismatch) {
      setStatus('Error: Please switch to mainnet to use RenVault');
      return false;
    }
    return true;
  };

  const promptNetworkSwitch = () => {
    alert('To switch networks in your Stacks wallet:\n\n1. Open your wallet extension\n2. Look for network/chain selection\n3. Switch to Mainnet\n4. Refresh this page\n\nRenVault operates on Stacks Mainnet.');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !userData) return;
    if (!validateNetwork()) return;
    
    const withdrawAmountNum = parseFloat(withdrawAmount);
    const balanceNum = parseFloat(balance);
    
    if (withdrawAmountNum <= 0) {
      setStatus('Error: Withdrawal amount must be greater than 0');
      return;
    }
    
    if (withdrawAmountNum > balanceNum) {
      setStatus(`Error: Insufficient balance. You have ${balance} STX available`);
      return;
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
        <div className="card">
          <h2>Connect Your Wallet</h2>
          <p>Connect your Stacks wallet to start saving STX and earning commitment points.</p>
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
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

export default App;
