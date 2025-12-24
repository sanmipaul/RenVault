import React, { useState, useEffect } from 'react';
import { useWalletKitContext } from '../context/WalletKitProvider';
import { getWalletConnectUri } from '../utils/walletkit-helpers';
import { SessionProposalModal } from './SessionProposalModal';
import { SessionRequestModal } from './SessionRequestModal';

export const WalletConnect: React.FC = () => {
  const { 
    walletKit, 
    isLoading, 
    sessionProposal, 
    setSessionProposal,
    sessionRequest,
    setSessionRequest
  } = useWalletKitContext();
  const [uri, setUri] = useState('');
  const [manualUri, setManualUri] = useState('');

  const handleConnectWithUri = async (connectUri: string) => {
    if (!walletKit) return;
    try {
      await walletKit.pair({ uri: connectUri });
      // Clear URL param after successful pairing attempt to avoid re-pairing on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('uri');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Failed to pair:', error);
    }
  };

  useEffect(() => {
    if (walletKit) {
      const wcUri = getWalletConnectUri();
      if (wcUri) {
        handleConnectWithUri(wcUri);
      }
    }
  }, [walletKit]);

  const handleManualInput = async () => {
    if (manualUri) {
      await handleConnectWithUri(manualUri);
      setManualUri('');
    }
  };

  if (isLoading) {
    return <div>Loading WalletKit...</div>;
  }

  return (
    <div className='wallet-connect-container'>
      <h2>WalletConnect Integration</h2>

      <div className='connect-methods'>
        <div className='scan-instructions'>
          <p>To connect a dApp:</p>
          <ol>
            <li>Scan the QR code with your camera app (if supported)</li>
            <li>Or copy the WalletConnect URI from the dApp</li>
            <li>Paste it below:</li>
          </ol>
        </div>

        <div className='manual-input'>
          <input
            type='text'
            placeholder='wc:...'
            value={manualUri}
            onChange={(e) => setManualUri(e.target.value)}
            className='input-field'
          />
          <button
            onClick={handleManualInput}
            disabled={!manualUri}
            className='btn btn-secondary'
          >
            Connect
          </button>
        </div>
      </div>

      {sessionProposal && (
        <SessionProposalModal
          proposal={sessionProposal}
          onClose={() => setSessionProposal(null)}
        />
      )}

      {sessionRequest && (
        <SessionRequestModal
          request={sessionRequest}
          onClose={() => setSessionRequest(null)}
        />
      )}
    </div>
  );
};
