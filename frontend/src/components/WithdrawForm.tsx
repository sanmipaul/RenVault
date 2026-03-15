// components/WithdrawForm.tsx
import React, { useState } from 'react';
import './WithdrawForm.css';
import { openContractCall, AnchorMode } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/app';
import { WithdrawTxDetails, ConnectionMethod } from '../types/app';
import WithdrawConfirmModal from './WithdrawConfirmModal';

interface WithdrawFormProps {
  balance: string;
  connectionMethod: ConnectionMethod;
  walletConnectSession: object | null;
  userAddress: string;
  onStatusChange: (msg: string) => void;
  onWithdrawSuccess: (amount: string, remaining: number) => void;
  onRefreshStats: () => void;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  balance,
  connectionMethod,
  walletConnectSession,
  userAddress,
  onStatusChange,
  onWithdrawSuccess,
  onRefreshStats,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [txDetails, setTxDetails] = useState<WithdrawTxDetails | null>(null);

  const handlePrepare = async () => {
    const withdrawAmountNum = parseFloat(withdrawAmount);
    const balanceNum = parseFloat(balance);

    if (isNaN(withdrawAmountNum) || withdrawAmountNum <= 0) {
      onStatusChange('Error: Please enter a valid withdrawal amount greater than 0');
      return;
    }

    if (withdrawAmountNum > balanceNum) {
      onStatusChange(`Error: Insufficient balance. You have ${balance} STX available`);
      return;
    }

    const remainingBalance = balanceNum - withdrawAmountNum;
    if (remainingBalance > 0 && remainingBalance < 0.01) {
      const confirmLeave = window.confirm(
        `Warning: This withdrawal will leave only ${remainingBalance.toFixed(6)} STX in your vault. Continue?`
      );
      if (!confirmLeave) return;
    }

    setLoading(true);
    onStatusChange('Preparing transaction details...');

    try {
      const amount = Math.floor(withdrawAmountNum * 1000000);
      const network = new StacksMainnet();

      setTxDetails({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [uintCV(amount)],
        network,
        amount: withdrawAmountNum,
        currentBalance: balance,
        remainingBalance: remainingBalance.toFixed(6),
        fee: 'Network fee: ~0.001 STX (estimated)',
        estimatedFee: '0.001 STX',
      });
    } catch (error: any) {
      onStatusChange(`Error preparing transaction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!txDetails) return;
    setLoading(true);

    const signingTimeout = setTimeout(() => {
      onStatusChange('Transaction signing timed out. Please try again.');
      setTxDetails(null);
      setLoading(false);
    }, 30000);

    try {
      if (connectionMethod === 'walletconnect' && walletConnectSession) {
        clearTimeout(signingTimeout);
        onStatusChange('WalletConnect withdraw transaction initiated. Please check your wallet app.');
        setWithdrawAmount('');
        setTxDetails(null);
        setTimeout(onRefreshStats, 5000);
        return;
      }

      await openContractCall({
        network: txDetails.network,
        anchorMode: AnchorMode.Any,
        contractAddress: txDetails.contractAddress,
        contractName: txDetails.contractName,
        functionName: txDetails.functionName,
        functionArgs: txDetails.functionArgs,
        appDetails: { name: 'RenVault', icon: window.location.origin + '/logo192.png' },
        onFinish: (data) => {
          clearTimeout(signingTimeout);
          onStatusChange(`Withdraw transaction submitted! Transaction ID: ${data.txId}`);
          const remaining = parseFloat(balance) - txDetails.amount;
          onWithdrawSuccess(withdrawAmount, remaining);
          setWithdrawAmount('');
          setTxDetails(null);
          setTimeout(onRefreshStats, 3000);
        },
        onCancel: () => {
          clearTimeout(signingTimeout);
          onStatusChange('Transaction cancelled by user');
          setTxDetails(null);
        },
      });
    } catch (error: any) {
      clearTimeout(signingTimeout);
      onStatusChange(`Error signing transaction: ${error.message}`);
      setTxDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setTxDetails(null);
  };

  return (
    <>
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
          onClick={handlePrepare}
          disabled={loading || !withdrawAmount || !!txDetails}
        >
          {loading ? 'Preparing...' : txDetails ? 'Review Transaction' : 'Withdraw'}
        </button>
      </div>

      {txDetails && (
        <WithdrawConfirmModal
          txDetails={txDetails}
          loading={loading}
          onConfirm={handleExecute}
          onCancel={handleCancelConfirm}
        />
      )}
    </>
  );
};

export default WithdrawForm;
