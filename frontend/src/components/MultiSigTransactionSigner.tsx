// MultiSigTransactionSigner Component
import React, { useState, useEffect } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';

interface MultiSigTransactionSignerProps {
  walletManager: WalletManager;
  transaction: any;
  onSigned: (signedTx: any) => void;
  onCancel: () => void;
}

export const MultiSigTransactionSigner: React.FC<MultiSigTransactionSignerProps> = ({
  walletManager,
  transaction,
  onSigned,
  onCancel
}) => {
  const [pendingTxs, setPendingTxs] = useState<string[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingTransactions();
  }, [walletManager]);

  useEffect(() => {
    if (selectedTx) {
      const status = walletManager.getMultiSigTransactionStatus(selectedTx);
      setTxStatus(status);
    }
  }, [selectedTx, walletManager]);

  const loadPendingTransactions = () => {
    const txs = walletManager.getPendingMultiSigTransactions();
    setPendingTxs(txs);
  };

  const handleSignTransaction = async () => {
    if (!transaction) return;

    setLoading(true);
    setError('');

    try {
      const result = await walletManager.signTransaction(transaction);

      if (result.status === 'signed') {
        onSigned(result);
      } else if (result.status === 'pending') {
        setSelectedTx(result.txId);
        loadPendingTransactions();
        setError(`Transaction pending: ${result.currentSignatures}/${result.requiredSignatures} signatures`);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPendingTx = (txId: string) => {
    setSelectedTx(txId);
  };

  return (
    <div className="multisig-transaction-signer">
      <h3>✍️ Multi-Signature Transaction Signing</h3>
      <p>Sign transactions that require multiple approvals.</p>

      {pendingTxs.length > 0 && (
        <div className="pending-transactions">
          <h4>Pending Transactions:</h4>
          <ul>
            {pendingTxs.map(txId => (
              <li key={txId} className="pending-tx-item">
                <button
                  onClick={() => handleSelectPendingTx(txId)}
                  className={selectedTx === txId ? 'selected' : ''}
                >
                  Transaction {txId.slice(0, 8)}...
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedTx && txStatus && (
        <div className="transaction-status">
          <h4>Transaction Status:</h4>
          <p><strong>Signatures:</strong> {txStatus.signatures} / {txStatus.required}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(txStatus.signatures / txStatus.required) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="transaction-details">
        <h4>Current Transaction:</h4>
        <pre>{JSON.stringify(transaction, null, 2)}</pre>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={handleSignTransaction} disabled={loading}>
          {loading ? 'Signing...' : 'Sign Transaction'}
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};