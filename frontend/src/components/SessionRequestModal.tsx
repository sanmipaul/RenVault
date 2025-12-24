import React, { useState } from 'react';
import { WalletKitTypes } from '@reown/walletkit';
import { getSdkError } from '@walletconnect/utils';
import { WalletKitService } from '../services/walletkit-service';
import { logger } from '../utils/logger';
import { handleRedirect } from '../utils/walletkit-helpers';

interface Props {
  request: WalletKitTypes.SessionRequest | null;
  onClose: () => void;
}

export const SessionRequestModal: React.FC<Props> = ({ request, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const { topic, params, id } = request;
  const { request: requestData, chainId } = params;

  const handleApprove = async () => {
    try {
      setLoading(true);
      const service = WalletKitService.getInstance();
      
      // TODO: Implement actual signing logic here
      // For now, we return a dummy signature for testing
      const result = "0x0000000000000000000000000000000000000000000000000000000000000000";
      
      await service.respondSessionRequest(topic, id, result);
      logger.info('Session request approved');
      
      const session = service.getSession(topic);
      if (session) {
        handleRedirect(session.peer.metadata);
      }
      
      onClose();
    } catch (error) {
      logger.error('Request approval failed:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const service = WalletKitService.getInstance();
      await service.rejectSessionRequest(topic, id, getSdkError('USER_REJECTED'));
      logger.info('Session request rejected');
      onClose();
    } catch (error) {
      logger.error('Request rejection failed:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2>Sign Request</h2>
        <div className='request-details'>
          <div className='detail-row'>
            <span className='label'>Method:</span>
            <span className='value'>{requestData.method}</span>
          </div>
          <div className='detail-row'>
            <span className='label'>Chain:</span>
            <span className='value'>{chainId}</span>
          </div>
          <div className='params-container'>
            <span className='label'>Params:</span>
            <pre className='params-code'>
              {JSON.stringify(requestData.params, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className='modal-actions'>
          <button 
            onClick={handleApprove} 
            disabled={loading}
            className='btn btn-primary'
          >
            {loading ? 'Signing...' : 'Approve'}
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
