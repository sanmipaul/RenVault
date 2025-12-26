import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { useWalletKitContext } from '../context/WalletKitProvider';
import { WalletError, WalletErrorCode, getFriendlyErrorMessage } from '../utils/wallet-errors';
import QRCode from 'react-native-qrcode-svg';
import { logger } from '../utils/logger';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
  buttonStyle?: object;
  buttonTextStyle?: object;
  containerStyle?: object;
  showDisconnectButton?: boolean;
  autoConnect?: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  onDisconnect,
  onError,
  buttonStyle,
  buttonTextStyle,
  containerStyle,
  showDisconnectButton = true,
  autoConnect = true,
}) => {
  const { walletKit, isLoading, sessionProposal, setSessionProposal } = useWalletKitContext();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectionUri, setConnectionUri] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle connection state changes
  useEffect(() => {
    if (walletKit && autoConnect) {
      checkExistingSession();
    }
  }, [walletKit, autoConnect]);

  // Handle session proposal
  useEffect(() => {
    if (sessionProposal) {
      handleSessionProposal(sessionProposal);
    }
  }, [sessionProposal]);

  const checkExistingSession = useCallback(async () => {
    if (!walletKit) return;

    try {
      const sessions = await walletKit.getActiveSessions();
      const session = Object.values(sessions)[0];
      
      if (session) {
        const [account] = session.namespaces.stacks.accounts;
        const address = account.split(':')[2];
        
        setWalletAddress(address);
        setStatus('connected');
        onConnect?.(address);
      }
    } catch (error) {
      logger.warn('Error checking existing session:', error);
    }
  }, [walletKit, onConnect]);

  const handleSessionProposal = useCallback(async (proposal: WalletKitTypes.SessionProposal) => {
    if (!walletKit) return;

    try {
      setStatus('connecting');
      setError(null);
      
      const approvedNamespaces = {
        stacks: {
          methods: [
            'stacks_signMessage',
            'stacks_signTransaction',
            'stacks_getAccounts',
            'stacks_getAddresses',
          ],
          chains: ['stacks:1'],
          events: ['accountsChanged', 'chainChanged'],
          accounts: [
            'stacks:1:SP000000000000000000002Q6VF78', // Mainnet
          ],
        },
      };

      const session = await walletKit.approveSession({
        id: proposal.id,
        namespaces: approvedNamespaces as any,
      });

      const [account] = session.namespaces.stacks.accounts;
      const address = account.split(':')[2];
      
      setWalletAddress(address);
      setStatus('connected');
      onConnect?.(address);
      setIsModalVisible(false);
      setShowQRCode(false);
      
    } catch (error) {
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to approve session',
        error
      );
      
      logger.error('Session approval failed:', walletError);
      setError(getFriendlyErrorMessage(walletError));
      setStatus('error');
      onError?.(walletError);
      
      // Reset the session proposal to allow retry
      setSessionProposal(null);
    }
  }, [walletKit, onConnect, onError, setSessionProposal]);

  const handleConnect = useCallback(async () => {
    if (!walletKit) {
      const error = new WalletError(
        WalletErrorCode.WALLET_NOT_FOUND,
        'Wallet service not available'
      );
      setError(getFriendlyErrorMessage(error));
      setStatus('error');
      onError?.(error);
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      
      // Generate a new WalletConnect URI
      const { uri } = await walletKit.connect({
        requiredNamespaces: {
          stacks: {
            methods: [
              'stacks_signMessage',
              'stacks_signTransaction',
              'stacks_getAccounts',
              'stacks_getAddresses',
            ],
            chains: ['stacks:1'],
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });

      if (!uri) {
        throw new WalletError(
          WalletErrorCode.UNKNOWN_ERROR,
          'Failed to generate connection URI'
        );
      }

      setConnectionUri(uri);
      setShowQRCode(true);
      setIsModalVisible(true);
      
      // Set a timeout for the connection attempt
      const timeout = setTimeout(() => {
        if (status === 'connecting') {
          const error = new WalletError(
            WalletErrorCode.CONNECTION_TIMEOUT,
            'Connection attempt timed out. Please try again.'
          );
          setError(getFriendlyErrorMessage(error));
          setStatus('error');
          onError?.(error);
          setIsModalVisible(false);
        }
      }, 60000); // 1 minute timeout

      return () => clearTimeout(timeout);
      
    } catch (error) {
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to connect to wallet',
        error
      );
      
      logger.error('Connection failed:', walletError);
      setError(getFriendlyErrorMessage(walletError));
      setStatus('error');
      onError?.(walletError);
    }
  }, [walletKit, onError, status]);

  const handleDisconnect = useCallback(async () => {
    if (!walletKit) return;

    try {
      setStatus('disconnected');
      setWalletAddress(null);
      
      // Get active sessions and disconnect them
      const sessions = await walletKit.getActiveSessions();
      await Promise.all(
        Object.keys(sessions).map(topic => 
          walletKit.disconnectSession({
            topic,
            reason: { code: 0, message: 'User disconnected' }
          }).catch(err => {
            logger.warn('Error disconnecting session:', err);
          })
        )
      );
      
      onDisconnect?.();
      
    } catch (error) {
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to disconnect wallet',
        error
      );
      
      logger.error('Disconnection failed:', walletError);
      setError(getFriendlyErrorMessage(walletError));
      onError?.(walletError);
    }
  }, [walletKit, onDisconnect, onError]);

  const handleRetry = useCallback(() => {
    setError(null);
    setStatus('disconnected');
  }, []);

  const renderButton = () => {
    if (status === 'connected' && walletAddress) {
      if (!showDisconnectButton) return null;
      
      const address = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
      
      return (
        <TouchableOpacity 
          style={[styles.disconnectButton, buttonStyle]}
          onPress={handleDisconnect}
        >
          <Text style={[styles.buttonText, buttonTextStyle]}>
            Disconnect: {address}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.connectButton, buttonStyle]}
        onPress={handleConnect}
        disabled={status === 'connecting' || isLoading}
      >
        {status === 'connecting' || isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, buttonTextStyle]}>
            {status === 'error' ? 'Retry Connection' : 'Connect Wallet'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderButton()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {status === 'error' && (
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setShowQRCode(false);
          if (status === 'connecting') {
            setStatus('disconnected');
          }
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showQRCode ? 'Scan QR Code' : 'Connecting...'}
            </Text>
            
            {showQRCode ? (
              <View style={styles.qrContainer}>
                <QRCode
                  value={connectionUri}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
                <Text style={styles.qrHelpText}>
                  Scan this QR code with your wallet app to connect
                </Text>
              </View>
            ) : (
              <View style={styles.connectingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.connectingText}>
                  Waiting for wallet connection...
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsModalVisible(false);
                setShowQRCode(false);
                if (status === 'connecting') {
                  setStatus('disconnected');
                }
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4a80f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectButton: {
    backgroundColor: '#f54a4a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    padding: 8,
  },
  retryButtonText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrHelpText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  connectingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  connectingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    color: '#4a80f5',
    fontWeight: '600',
  },
});

export default WalletConnection;
