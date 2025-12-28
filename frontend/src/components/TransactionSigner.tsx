// components/TransactionSigner.tsx
import React, { useState, useCallback } from 'react';
import { TransactionService, TransactionDetails, SignedTransaction } from '../services/transaction/TransactionService';
import { WalletError } from '../utils/wallet-errors';
import { getFriendlyErrorMessage } from '../utils/wallet-errors';
import { SignTransaction, BatchSigningRequest, SigningProgress, SigningOptions } from '../types/signing';
import { batchSigningService } from '../services/signing/batch-signing';
import './TransactionSigner.css';

interface TransactionSignerProps {
  details?: TransactionDetails;
  transactions?: SignTransaction[];
  onSigned?: (signedTx: SignedTransaction | any) => void;
  onCancelled?: () => void;
  onError?: (error: WalletError | Error) => void;
  onProgress?: (progress: SigningProgress) => void;
  signingOptions?: SigningOptions;
  batchMode?: boolean;
  chainId?: string;
  topic?: string;
}

const TransactionSigner: React.FC<TransactionSignerProps> = ({
  details,
  transactions = [],
  onSigned,
  onCancelled,
  onError,
  onProgress,
  signingOptions,
  batchMode = false,
  chainId = 'stacks:1',
  topic = ''
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingProgress, setSigningProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);
    setSigningProgress(0);
    setStatusMessage('Preparing to sign');

    try {
      if (batchMode && transactions && transactions.length > 0) {
        const batchRequest: BatchSigningRequest = {
          transactions,
          chainId: chainId || 'stacks:1',
          topic: topic || '',
          simulationRequired: signingOptions?.simulateBeforeSigning || false,
          onProgress: (progress: SigningProgress) => {
            setSigningProgress(progress.progress);
            setStatusMessage(progress.message || 'Signing in progress');
            onProgress?.(progress);
          },
        };

        const response = await batchSigningService.signBatch(batchRequest);

        const signedIds = response.signatures.map((s) => s.requestId);
        const failed = response.failedTransactions.map((f) => f.transactionId);

        setSigningProgress(100);
        setStatusMessage(`Signed ${response.totalSigned}, failed ${response.totalFailed}`);

        if (response.totalFailed === 0) {
          onSigned?.(response);
        } else {
          onError?.(new Error(`Batch signing completed with ${response.totalFailed} failures`));
        }

        return;
      }

      // Fallback to single transaction using existing TransactionService
      if (details) {
        const transactionService = TransactionService.getInstance();
        const signedTx = await transactionService.signDepositTransaction(details);
        setSigningProgress(100);
        setStatusMessage('Transaction signed');
        onSigned?.(signedTx);
      } else {
        throw new Error('No transaction details provided');
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      setStatusMessage(`Error: ${e.message}`);
      onError?.(err as any);
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

      {isSigning && (
        <div className="signing-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${signingProgress}%` }} />
          </div>
          <div className="progress-message">{statusMessage} ({signingProgress}%)</div>
        </div>
      )}

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