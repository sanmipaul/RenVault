import React, { useState } from 'react';
import { WalletKitTypes } from '@reown/walletkit';
import { WalletKitService } from '../services/walletkit-service';
import { logger } from '../utils/logger';
import { handleRedirect } from '../utils/walletkit-helpers';

interface Props {
  proposal: WalletKitTypes.SessionProposal | null;
  onClose: () => void;
  onSessionApproved?: (session: any) => void;
}

export const SessionProposalModal: React.FC<Props> = ({ proposal, onClose, onSessionApproved }) => {
  const [loading, setLoading] = useState(false);

  if (!proposal) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      const service = WalletKitService.getInstance();
      
      const supportedNamespaces = {
        stacks: {
          chains: ['stacks:1'], // Stacks mainnet
          methods: [
            'stacks_signMessage',
            'stacks_signTransaction', 
            'stacks_getAccounts',
            'stacks_getAddresses'
          ],
          events: ['accountsChanged', 'chainChanged'],
          accounts: ['stacks:1:SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'], // TODO: Use actual Stacks account
        },
      };
      
      const session = await service.approveSession(proposal, supportedNamespaces);
      logger.info('Session approved successfully');
      
      if (onSessionApproved) {
        onSessionApproved(session);
      }
      
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
