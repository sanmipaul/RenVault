import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { CoreService } from './core-service';
import { walletConnectConfig } from '../config/walletconnect';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode, isNetworkError, isUserRejectedError } from '../utils/wallet-errors';

export class WalletKitService {
  private static instance: WalletKitService;
  private walletKit: WalletKit;

  private constructor(walletKit: WalletKit) {
    this.walletKit = walletKit;
  }

  private static readonly MAX_RETRIES = 3;
  private static readonly INIT_RETRY_DELAY = 1000; // 1 second

  static async init(retryCount = 0): Promise<WalletKitService> {
    if (WalletKitService.instance) {
      return WalletKitService.instance;
    }

    try {
      logger.info('Initializing WalletKit...');
      const core = CoreService.getInstance();

      const walletKit = await WalletKit.init({
        core,
        metadata: walletConnectConfig.metadata,
      });

      WalletKitService.instance = new WalletKitService(walletKit);
      logger.info('WalletKit initialized successfully');
      return WalletKitService.instance;
    } catch (error) {
      const isNetworkIssue = isNetworkError(error);
      const shouldRetry = isNetworkIssue && retryCount < WalletKitService.MAX_RETRIES;
      
      if (shouldRetry) {
        const delay = WalletKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`WalletKit init attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return WalletKitService.init(retryCount + 1);
      }
      
      const walletError = new WalletError(
        WalletErrorCode.WALLET_INIT_FAILED,
        'Failed to initialize wallet service',
        error
      );
      
      logger.error('Failed to initialize WalletKit', walletError);
      throw walletError;
    }
  }

  static getInstance(): WalletKitService {
    if (!WalletKitService.instance) {
      throw new Error('WalletKitService not initialized. Call init() first.');
    }
    return WalletKitService.instance;
  }

  public getKit(): WalletKit {
    return this.walletKit;
  }

  async approveSession(
    proposal: WalletKitTypes.SessionProposal,
    supportedNamespaces: Record<string, any>,
    retryCount = 0
  ) {
    try {
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      return await this.walletKit.approveSession({
        id: proposal.id,
        namespaces: approvedNamespaces,
      });
    } catch (error) {
      const isNetworkIssue = isNetworkError(error);
      const shouldRetry = isNetworkIssue && retryCount < WalletKitService.MAX_RETRIES;
      
      if (shouldRetry) {
        const delay = WalletKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`Approve session attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.approveSession(proposal, supportedNamespaces, retryCount + 1);
      }
      
      const errorCode = isUserRejectedError(error) 
        ? WalletErrorCode.USER_REJECTED 
        : WalletErrorCode.UNKNOWN_ERROR;
      
      const walletError = new WalletError(
        errorCode,
        'Failed to approve wallet session',
        error
      );
      
      logger.error('Failed to approve session', walletError);
      throw walletError;
    }
  }

  async rejectSession(proposal: WalletKitTypes.SessionProposal) {
    try {
      return await this.walletKit.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED'),
      });
    } catch (error) {
      // Don't throw for rejections as the user is already rejecting
      logger.warn('Error while rejecting session', error);
      return null;
    }
  }

  async respondSessionRequest(
    topic: string,
    id: number,
    result: any,
    retryCount = 0
  ) {
    try {
      const response = {
        id,
        jsonrpc: '2.0',
        result,
      };

      return await this.walletKit.respondSessionRequest({
        topic,
        response,
      });
    } catch (error) {
      const isNetworkIssue = isNetworkError(error);
      const shouldRetry = isNetworkIssue && retryCount < WalletKitService.MAX_RETRIES;
      
      if (shouldRetry) {
        const delay = WalletKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`Session request response attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.respondSessionRequest(topic, id, result, retryCount + 1);
      }
      
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to respond to wallet request',
        error
      );
      
      logger.error('Failed to respond to session request', walletError);
      throw walletError;
    }
  }

  async rejectSessionRequest(
    topic: string,
    id: number,
    error: { code: number; message: string },
    retryCount = 0
  ) {
    try {
      const response = {
        id,
        jsonrpc: '2.0',
        error,
      };

      return await this.walletKit.respondSessionRequest({
        topic,
        response,
      });
    } catch (err) {
      const isNetworkIssue = isNetworkError(err);
      const shouldRetry = isNetworkIssue && retryCount < WalletKitService.MAX_RETRIES;
      
      if (shouldRetry) {
        const delay = WalletKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`Reject session request attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, err);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.rejectSessionRequest(topic, id, error, retryCount + 1);
      }
      
      // Don't throw for rejections as the user is already rejecting
      logger.warn('Error while rejecting session request', err);
      return null;
    }
  }

  async getActiveSessions() {
    try {
      return await this.walletKit.getActiveSessions();
    } catch (error) {
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to get active sessions',
        error
      );
    }
  }

  async getSession(topic: string) {
    try {
      const sessions = await this.getActiveSessions();
      return sessions[topic];
    } catch (error) {
      throw new WalletError(
        WalletErrorCode.SESSION_NOT_FOUND,
        `Session not found for topic: ${topic}`,
        error
      );
    }
  }
  
  async disconnectSession(topic: string) {
    try {
      if (!this.walletKit) {
        throw new WalletError(
          WalletErrorCode.WALLET_NOT_FOUND,
          'Wallet not initialized'
        );
      }
      
      await this.walletKit.disconnectSession({
        topic,
        reason: getSdkError('USER_DISCONNECTED')
      });
      
      return true;
    } catch (error) {
      if (isUserRejectedError(error)) {
        logger.info('User cancelled disconnection');
        return false;
      }
      
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to disconnect session',
        error
      );
    }
  }

  static reset() {
    if (WalletKitService.instance) {
      try {
        // Clean up any active connections
        const instance = WalletKitService.instance;
        instance.getActiveSessions()
          .then(sessions => {
            Object.keys(sessions).forEach(topic => {
              instance.disconnectSession(topic).catch(err => {
                logger.warn('Error disconnecting session during reset:', err);
              });
            });
          })
          .catch(err => {
            logger.warn('Error getting active sessions during reset:', err);
          });
      } catch (error) {
        logger.warn('Error during wallet service reset:', error);
      } finally {
        WalletKitService.instance = null as any;
      }
    }
  }
}
