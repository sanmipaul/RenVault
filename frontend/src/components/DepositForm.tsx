// components/DepositForm.tsx
import React, { useState } from 'react';
import { TransactionService, TransactionDetails } from '../services/transaction/TransactionService';
import { useWallet } from '../hooks/useWallet';
import { WalletError } from '../utils/wallet-errors';
import { getFriendlyErrorMessage } from '../utils/wallet-errors';
import TransactionSuccess from './TransactionSuccess';
import { PermissionService, PermissionType } from '../services/permissions/PermissionService';
import TransactionSigner from './TransactionSigner';
import './DepositForm.css';

interface DepositFormProps {
  onDepositSuccess?: (txId: string) => void;
  onDepositError?: (error: WalletError) => void;
}

const DepositForm: React.FC<DepositFormProps> = ({
  onDepositSuccess,
  onDepositError
}) => {
  const { isConnected, connectionState } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successTxId, setSuccessTxId] = useState<string | null>(null);
  const [successAmount, setSuccessAmount] = useState<number>(0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handlePrepareDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    // Check transaction signing permission
    if (connectionState?.address) {
      const permissionService = PermissionService.getInstance();
      const hasPermission = permissionService.isPermissionGranted(connectionState.address, PermissionType.TRANSACTION_SIGN);

      if (!hasPermission) {
        setError('Transaction signing permission required. Please grant permission in wallet settings.');
        return;
      }
    }

    setIsPreparing(true);
    setError(null);

    try {
      const transactionService = TransactionService.getInstance();
      const details = await transactionService.prepareDepositTransaction(parseFloat(amount));
      setTransactionDetails(details);
    } catch (err) {
      const walletError = err as WalletError;
      setError(getFriendlyErrorMessage(walletError));
      onDepositError?.(walletError);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleTransactionSigned = async (signedTx: any) => {
    try {
      const transactionService = TransactionService.getInstance();
      const txId = await transactionService.broadcastTransaction(signedTx);

      // Extract amount from transaction details
      const depositedAmount = transactionDetails ? (transactionDetails.amount / 1000000) : 0;

      // Show success notification
      setSuccessTxId(txId);
      setSuccessAmount(depositedAmount);
      setTransactionDetails(null);
      setError(null);

      onDepositSuccess?.(txId);
    } catch (err) {
      const walletError = err as WalletError;
      setError(getFriendlyErrorMessage(walletError));
      onDepositError?.(walletError);
    }
  };

  const handleTransactionCancelled = () => {
    setTransactionDetails(null);
    setError(null);
  };

  const handleTransactionError = (walletError: WalletError) => {
    setError(walletError.message);
    onDepositError?.(walletError);
  };

  const handleSuccessClose = () => {
    setSuccessTxId(null);
    setSuccessAmount(0);
    setAmount(''); // Reset form after success
  };

  if (successTxId) {
    return (
      <TransactionSuccess
        txId={successTxId}
        amount={successAmount}
        onClose={handleSuccessClose}
      />
    );
  }
    return (
      <TransactionSigner
        details={transactionDetails}
        onSigned={handleTransactionSigned}
        onCancelled={handleTransactionCancelled}
        onError={handleTransactionError}
      />
    );
  }

  return (
    <div className="deposit-form">
      <div className="deposit-header">
        <h3>💰 Deposit STX</h3>
        <p>Deposit STX into your RenVault to earn rewards and commitment points.</p>
      </div>

      <div className="deposit-content">
        <div className="amount-input-section">
          <label htmlFor="amount">Deposit Amount (STX)</label>
          <div className="input-group">
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              disabled={!isConnected || isPreparing}
              className="amount-input"
            />
            <span className="currency">STX</span>
          </div>
        </div>

        {connectionState?.address && (
          <div className="wallet-info">
            <p>From: <span className="address">{connectionState.address}</span></p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        <div className="deposit-info">
          <div className="info-item">
            <span className="label">Fee:</span>
            <span className="value">1% (goes to protocol)</span>
          </div>
          <div className="info-item">
            <span className="label">Rewards:</span>
            <span className="value">Earn commitment points</span>
          </div>
          <div className="info-item">
            <span className="label">Network:</span>
            <span className="value">Stacks Mainnet</span>
          </div>
        </div>

        <button
          className="deposit-btn"
          onClick={handlePrepareDeposit}
          disabled={!isConnected || !amount || parseFloat(amount) <= 0 || isPreparing}
        >
          {isPreparing ? '🔄 Preparing...' : '📝 Prepare Deposit'}
        </button>

        {!isConnected && (
          <div className="connect-notice">
            <p>🔗 Please connect your wallet to make a deposit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositForm;