import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
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
  const [showQR, setShowQR] = useState(false);

  const generateWalletConnectUri = async () => {
    if (!walletKit) return;
    
    try {
      const { uri: wcUri } = await walletKit.createSession({
        requiredNamespaces: {
          stacks: {
            methods: [
              'stacks_signMessage',
              'stacks_signTransaction',
              'stacks_getAccounts',
              'stacks_getAddresses',
            ],
            chains: ['stacks:1'], // Mainnet
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });
      
      setUri(wcUri);
      setShowQR(true);
    } catch (error) {
      console.error('Failed to create WalletConnect session:', error);
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
      <h2>📱 WalletConnect</h2>
      <p>Connect your mobile wallet or desktop app using WalletConnect</p>

      {!showQR ? (
        <div className='connect-methods'>
          <button 
            onClick={generateWalletConnectUri}
            disabled={isLoading}
            className='btn btn-primary'
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
          
          <div className='manual-input' style={{ marginTop: '16px' }}>
            <p style={{ marginBottom: '8px' }}>Or paste a WalletConnect URI:</p>
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
              style={{ marginTop: '8px' }}
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <div className='qr-section'>
          <h3>Scan QR Code</h3>
          <p>Open your mobile wallet app and scan this QR code:</p>
          
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <QRCode value={uri} size={256} />
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              <strong>URI:</strong> {uri}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              onClick={() => setShowQR(false)}
              className='btn btn-secondary'
            >
              Back
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(uri)}
              className='btn btn-outline'
            >
              Copy URI
            </button>
          </div>
        </div>
      )}

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
