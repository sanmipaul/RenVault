import React, { useState } from 'react';
import { WalletKitTypes } from '@reown/walletkit';
import { WalletKitService } from '../services/walletkit-service';
import { logger } from '../utils/logger';
import { handleRedirect } from '../utils/walletkit-helpers';

interface Props {
  proposal: WalletKitTypes.SessionProposal | null;
  onClose: () => void;
}

export const SessionProposalModal: React.FC<Props> = ({ proposal, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!proposal) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      const service = WalletKitService.getInstance();
      
      const supportedNamespaces = {
        eip155: {
          chains: ['eip155:1', 'eip155:137'],
          methods: ['eth_sendTransaction', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          accounts: ['eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'], // TODO: Use actual account
        },
      };
      
      await service.approveSession(proposal, supportedNamespaces);
      logger.info('Session approved successfully');
      handleRedirect(proposal.params.proposer.metadata);
      onClose();
    } catch (error) {
      logger.error('Approval failed:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const service = WalletKitService.getInstance();
      await service.rejectSession(proposal);
      logger.info('Session rejected');
      onClose();
    } catch (error) {
      logger.error('Rejection failed:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2>Session Proposal</h2>
        <div className='dapp-info'>
          {proposal.params.proposer.metadata.icons[0] && (
            <img 
              src={proposal.params.proposer.metadata.icons[0]} 
              alt={proposal.params.proposer.metadata.name} 
              className='dapp-icon'
            />
          )}
          <h3>{proposal.params.proposer.metadata.name}</h3>
          <p>{proposal.params.proposer.metadata.description}</p>
          <a href={proposal.params.proposer.metadata.url} target="_blank" rel="noopener noreferrer">
            {proposal.params.proposer.metadata.url}
          </a>
        </div>
        
        <div className='modal-actions'>
          <button 
            onClick={handleApprove} 
            disabled={loading}
            className='btn btn-primary'
          >
            {loading ? 'Approving...' : 'Approve'}
          </button>
          <button 
            onClick={handleReject} 
            disabled={loading}
            className='btn btn-danger'
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};
