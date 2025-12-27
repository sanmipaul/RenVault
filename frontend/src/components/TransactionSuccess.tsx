// components/TransactionSuccess.tsx
import React, { useEffect } from 'react';
import './TransactionSuccess.css';

interface TransactionSuccessProps {
  txId: string;
  amount: number;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const TransactionSuccess: React.FC<TransactionSuccessProps> = ({
  txId,
  amount,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, autoCloseDelay]);

  const formatAmount = (amount: number) => {
    return amount.toFixed(6);
  };

  const getExplorerUrl = (txId: string) => {
    return `https://explorer.stacks.co/txid/${txId}`;
  };

  return (
    <div className="transaction-success">
      <div className="success-header">
        <div className="success-icon">✅</div>
        <h3>Deposit Successful!</h3>
        <p>Your STX deposit has been processed successfully.</p>
      </div>

      <div className="success-details">
        <div className="detail-item">
          <span className="label">Amount Deposited:</span>
          <span className="value">{formatAmount(amount)} STX</span>
        </div>
        <div className="detail-item">
          <span className="label">Transaction ID:</span>
          <span className="value tx-id">{txId}</span>
        </div>
        <div className="detail-item">
          <span className="label">Status:</span>
          <span className="value status">Confirmed</span>
        </div>
      </div>

      <div className="success-actions">
        <a
          href={getExplorerUrl(txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="explorer-link"
        >
          View on Explorer 🔗
        </a>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        )}
      </div>

      {autoClose && (
        <div className="auto-close-notice">
          <p>This notification will close automatically in {autoCloseDelay / 1000} seconds.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionSuccess;