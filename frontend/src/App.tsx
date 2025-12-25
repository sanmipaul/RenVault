import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect, UserData } from '@stacks/connect';
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

  const validateNetwork = () => {
    if (networkMismatch) {
      setStatus('Error: Please switch to mainnet to use RenVault');
      return false;
    }
    return true;
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !userData) return;
    if (!validateNetwork()) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = Math.floor(parseFloat(withdrawAmount) * 1000000);
      const network = getCurrentNetwork();
      
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [uintCV(amount)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      
      setStatus(`Withdraw transaction submitted: ${broadcastResponse.txid}`);
      setWithdrawAmount('');
      
      setTimeout(fetchUserStats, 3000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
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
            disabled={loading || !withdrawAmount}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>

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
