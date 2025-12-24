import React, { useState } from 'react';
import { useWalletKitContext } from '../context/WalletKitProvider';
import { getWalletConnectUri } from '../utils/walletkit-helpers';
import { SessionProposalModal } from './SessionProposalModal';

export const WalletConnect: React.FC = () => {
  const { walletKit, isLoading, sessionProposal, setSessionProposal } = useWalletKitContext();
  const [uri, setUri] = useState('');
  const [manualUri, setManualUri] = useState('');

  const handleConnectWithUri = async (connectUri: string) => {
    if (!walletKit) return;
    try {
      await walletKit.pair({ uri: connectUri });
    } catch (error) {
      console.error('Failed to pair:', error);
    }
  };

  const handleQrScan = async () => {
    const wcUri = getWalletConnectUri();
    if (wcUri) {
      await handleConnectWithUri(wcUri);
    }
  };

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
        <button onClick={handleQrScan} className='btn btn-primary'>
          Connect via QR Code
        </button>

        <div className='manual-input'>
          <input
            type='text'
            placeholder='Paste WalletConnect URI'
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
    </div>
  );
};
