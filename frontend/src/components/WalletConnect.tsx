import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useWalletKitContext } from '../context/WalletKitProvider';
import { getWalletConnectUri } from '../utils/walletkit-helpers';
import { SessionProposalModal } from './SessionProposalModal';
import { SessionRequestModal } from './SessionRequestModal';

interface WalletConnectProps {
  onSessionEstablished?: (session: any) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onSessionEstablished }) => {
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
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWithUri = async (connectionUri: string) => {
    if (!walletKit || !connectionUri) return;
    
    setError(null);
    setIsConnecting(true);
    try {
      await walletKit.pair({ uri: connectionUri });
    } catch (err) {
      console.error('Failed to pair with URI:', err);
      setError('Failed to connect to the wallet. Please check your URI and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const generateWalletConnectUri = async () => {
    if (!walletKit) return;
    
    setError(null);
    setIsConnecting(true);
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
    } catch (err) {
      console.error('Failed to create WalletConnect session:', err);
      setError('Failed to generate connection QR code. Please try again.');
    } finally {
      setIsConnecting(false);
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

      <div className='connection-status' style={{ marginBottom: '16px', fontSize: '0.9em' }}>
        Status: <span style={{ fontWeight: 'bold', color: isConnecting ? '#f39c12' : '#2ecc71' }}>
          {isConnecting ? 'Connecting...' : 'Ready'}
        </span>
      </div>

      {error && (
        <div className='error-container' style={{ color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: '#fff0f0', borderRadius: '4px', position: 'relative' }}>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button 
              onClick={() => {
                if (uri) {
                  handleConnectWithUri(uri);
                } else {
                  generateWalletConnectUri();
                }
              }}
              className='btn btn-small'
            >
              Retry
            </button>
            <button 
              onClick={() => setError(null)}
              className='btn btn-small btn-outline'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {!showQR ? (
        <div className='connect-methods'>
          <button 
            onClick={generateWalletConnectUri}
            disabled={isLoading || isConnecting}
            className='btn btn-primary'
          >
            {isLoading || isConnecting ? 'Connecting...' : 'Generate QR Code'}
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
          onSessionApproved={onSessionEstablished}
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
