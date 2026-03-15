// components/WithdrawConfirmModal.tsx
import React from 'react';
import { WithdrawTxDetails } from '../types/app';

interface WithdrawConfirmModalProps {
  txDetails: WithdrawTxDetails;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const WithdrawConfirmModal: React.FC<WithdrawConfirmModalProps> = ({
  txDetails,
  loading,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="card confirmation">
      <h3>Confirm Withdrawal Transaction</h3>
      <div style={{ marginBottom: '16px' }}>
        <p><strong>Action:</strong> Withdraw STX from vault</p>
        <p><strong>Amount:</strong> {txDetails.amount} STX</p>
        <p><strong>Current Balance:</strong> {txDetails.currentBalance} STX</p>
        <p><strong>Remaining Balance:</strong> {txDetails.remainingBalance} STX</p>
        <p>
          <strong>Contract:</strong> {txDetails.contractAddress}.{txDetails.contractName}
        </p>
        <p><strong>Function:</strong> {txDetails.functionName}</p>
        <p><strong>Network:</strong> {(txDetails.network as any).name ?? 'mainnet'}</p>
        <p><small>{txDetails.fee}</small></p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Signing...' : 'Sign & Submit Transaction'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WithdrawConfirmModal;
