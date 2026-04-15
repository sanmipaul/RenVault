import React, { useState } from 'react';
import { WalletKitTypes } from '@reown/walletkit';
import { getSdkError } from '@walletconnect/utils';
import { WalletKitService } from '../services/walletkit-service';
import { signRequest, getMethodDisplayName, isSupportedMethod } from '../services/SigningService';
import { logger } from '../utils/logger';
import { handleRedirect } from '../utils/walletkit-helpers';

interface Props {
  request: WalletKitTypes.SessionRequest | null;
  onClose: () => void;
}

export const SessionRequestModal: React.FC<Props> = ({ request, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  if (!request) return null;

  const { topic, params, id } = request;
  const { request: requestData, chainId } = params;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setSigningError(null);
      const service = WalletKitService.getInstance();

      const result = await signRequest(
        requestData.method,
        requestData.params,
        chainId
      );

      await service.respondSessionRequest(topic, id, result);
      logger.info('Session request approved');
      
      const session = await service.getSession(topic);
      if (session) {
        handleRedirect(session.peer.metadata);
      }
      
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Signing failed';
      setSigningError(msg);
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
            <span className='value'>
              {getMethodDisplayName(requestData.method)}{' '}
              <code className='method-raw'>({requestData.method})</code>
            </span>
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
        
        {!isSupportedMethod(requestData.method) && (
          <div className='method-warning' role='alert'>
            Warning: <strong>{requestData.method}</strong> is not a supported signing method and will be rejected.
          </div>
        )}

        {signingError && (
          <div className='signing-error' role='alert'>
            <strong>Error:</strong> {signingError}
          </div>
        )}

        <div className='modal-actions'>
          <button
            onClick={handleApprove}
            disabled={loading || !isSupportedMethod(requestData.method)}
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
