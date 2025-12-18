import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  makeContractCall,
  broadcastTransaction,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

function App() {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState('0');
  const [points, setPoints] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!userData) return;
    
    try {
      const balanceResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [userData.profile.stxAddress.mainnet],
        network,
      });
      
      const pointsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-points',
        functionArgs: [userData.profile.stxAddress.mainnet],
        network,
      });

      setBalance((parseInt(balanceResult.value) / 1000000).toFixed(6));
      setPoints(pointsResult.value);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !userData) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = Math.floor(parseFloat(depositAmount) * 1000000);
      
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit',
        functionArgs: [amount],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      
      setStatus(`Deposit transaction submitted: ${broadcastResponse.txid}`);
      setDepositAmount('');
      
      setTimeout(fetchUserStats, 3000);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !userData) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const amount = Math.floor(parseFloat(withdrawAmount) * 1000000);
      
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [amount],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      
      setStatus(`Withdraw transaction submitted: ${broadcastResponse.txid}`);
      setWithdrawAmount('');
      
      setTimeout(fetchUserStats, 3000);
    } catch (error) {
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