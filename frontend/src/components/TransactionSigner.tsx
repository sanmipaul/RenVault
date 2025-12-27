// components/TransactionSigner.tsx
import React, { useState } from 'react';
import { TransactionService, TransactionDetails, SignedTransaction } from '../services/transaction/TransactionService';
import { WalletError } from '../utils/wallet-errors';
import './TransactionSigner.css';

interface TransactionSignerProps {
  details: TransactionDetails;
  onSigned?: (signedTx: SignedTransaction) => void;
  onCancelled?: () => void;
  onError?: (error: WalletError) => void;
}

const TransactionSigner: React.FC<TransactionSignerProps> = ({
  details,
  onSigned,
  onCancelled,
  onError
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);

    try {
      const transactionService = TransactionService.getInstance();
      const signedTx = await transactionService.signDepositTransaction(details);

      onSigned?.(signedTx);
    } catch (err) {
      const walletError = err as WalletError;
      setError(walletError.message);
      onError?.(walletError);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = () => {
    onCancelled?.();
  };

  const formatAmount = (microAmount: number) => {
    return (microAmount / 1000000).toFixed(6);
  };

  const formatFee = (microFee: number) => {
    return (microFee / 1000000).toFixed(6);
  };

  return (
    <div className="transaction-signer">
      <div className="transaction-header">
        <h3>🔐 Sign Transaction</h3>
        <p>Please review the transaction details below and confirm signing.</p>
      </div>

      <div className="transaction-details">
        <div className="detail-section">
          <h4>Transaction Type</h4>
          <p className="highlight">Deposit to RenVault</p>
        </div>

        <div className="detail-section">
          <h4>Contract</h4>
          <p className="contract-address">{details.contractAddress}</p>
          <p className="contract-name">{details.contractName}</p>
        </div>

        <div className="detail-section">
          <h4>Function</h4>
          <p className="function-name">{details.functionName}</p>
        </div>

        <div className="detail-section">
          <h4>Amount</h4>
          <p className="amount">{formatAmount(details.amount || 0)} STX</p>
        </div>

        {details.fee && (
          <div className="detail-section">
            <h4>Network Fee</h4>
            <p className="fee">{formatFee(details.fee)} STX</p>
          </div>
        )}

        <div className="detail-section">
          <h4>Network</h4>
          <p className="network">{details.network || 'mainnet'}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="transaction-actions">
        <button
          className="cancel-btn"
          onClick={handleCancel}
          disabled={isSigning}
        >
          Cancel
        </button>
        <button
          className="sign-btn"
          onClick={handleSign}
          disabled={isSigning}
        >
          {isSigning ? '🔄 Signing...' : '✍️ Sign Transaction'}
        </button>
      </div>

      <div className="security-notice">
        <p>
          ⚠️ <strong>Security Notice:</strong> Only sign transactions from trusted sources.
          Verify all details before proceeding.
        </p>
      </div>
    </div>
  );
};

export default TransactionSigner;