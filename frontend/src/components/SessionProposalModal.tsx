import React, { useState } from 'react';
import { WalletKitTypes } from '@reown/walletkit';
import { useWalletKitContext } from '../context/WalletKitProvider';
import { WalletKitService } from '../services/walletkit-service';

interface Props {
  proposal: WalletKitTypes.SessionProposal | null;
  onClose: () => void;
}

export const SessionProposalModal: React.FC<Props> = ({ proposal, onClose }) => {
  const { walletKit } = useWalletKitContext();
  const [loading, setLoading] = useState(false);

  if (!proposal || !walletKit) return null;

  const service = new WalletKitService(walletKit);

  const handleApprove = async () => {
    try {
      setLoading(true);
      const supportedNamespaces = {
        eip155: {
          chains: ['eip155:1', 'eip155:137'],
          methods: ['eth_sendTransaction', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          accounts: ['eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'],
        },
      };
      await service.approveSession(proposal, supportedNamespaces);
      onClose();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await service.rejectSession(proposal);
      onClose();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2>Session Proposal</h2>
        <p><strong>{proposal.params.proposer.metadata.name}</strong></p>
        <div className='modal-actions'>
          <button onClick={handleApprove} disabled={loading}>Approve</button>
          <button onClick={handleReject} disabled={loading}>Reject</button>
        </div>
      </div>
    </div>
  );
};
