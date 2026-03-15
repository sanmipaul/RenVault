// components/DepositPanel.tsx
// Thin wrapper used in the main App to trigger inline deposits via legacy path.
// The full-featured DepositForm (with TransactionService) is used on its own page.
import React, { useState } from 'react';
import { makeContractCall, broadcastTransaction, AnchorMode, uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/app';
import { ConnectionMethod } from '../types/app';
import { trackAnalytics } from '../utils/analytics';
import NotificationService from '../services/notificationService';

interface DepositPanelProps {
  balance: string;
  connectionMethod: ConnectionMethod;
  walletConnectSession: object | null;
  userAddress: string;
  appPrivateKey: string;
  notificationUserId: string | null;
  onStatusChange: (msg: string) => void;
  onRefreshStats: () => void;
}

const DepositPanel: React.FC<DepositPanelProps> = ({
  balance,
  connectionMethod,
  walletConnectSession,
  userAddress,
  appPrivateKey,
  notificationUserId,
  onStatusChange,
  onRefreshStats,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeposit = async () => {
    if (!depositAmount || !userAddress) return;

    setLoading(true);
    onStatusChange('');

    try {
      const amount = Math.floor(parseFloat(depositAmount) * 1000000);

      if (connectionMethod === 'walletconnect' && walletConnectSession) {
        onStatusChange('WalletConnect deposit transaction initiated. Please check your wallet app.');
        setDepositAmount('');
        trackAnalytics('deposit', { user: userAddress, amount, method: 'walletconnect' });
        setTimeout(onRefreshStats, 5000);
        return;
      }

      const network = new StacksMainnet();
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit',
        functionArgs: [uintCV(amount)],
        senderKey: appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);

      onStatusChange(`Deposit transaction submitted: ${broadcastResponse.txid}`);
      setDepositAmount('');

      trackAnalytics('deposit', { user: userAddress, amount });

      if (notificationUserId) {
        const service = NotificationService.getInstance(notificationUserId);
        service.testDepositNotification(
          parseFloat(depositAmount),
          parseFloat(balance) + parseFloat(depositAmount)
        );
      }

      setTimeout(onRefreshStats, 3000);
    } catch (error: any) {
      onStatusChange(`Error: ${error.message}`);
      trackAnalytics('wallet-error', { user: userAddress, method: connectionMethod ?? 'unknown', errorType: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default DepositPanel;
