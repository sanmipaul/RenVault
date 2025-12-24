import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { CoreService } from './core-service';
import { walletConnectConfig } from '../config/walletconnect';
import { logger } from '../utils/logger';

export class WalletKitService {
  private static instance: WalletKitService;
  private walletKit: WalletKit;

  private constructor(walletKit: WalletKit) {
    this.walletKit = walletKit;
  }

  static async init(): Promise<WalletKitService> {
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
      logger.error('Failed to initialize WalletKit', error as Error);
      throw error;
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
    supportedNamespaces: Record<string, any>
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
      throw error;
    }
  }

  async rejectSession(proposal: WalletKitTypes.SessionProposal) {
    try {
      return await this.walletKit.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED'),
      });
    } catch (error) {
      throw error;
    }
  }

  async respondSessionRequest(
    topic: string,
    id: number,
    result: any
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
      throw error;
    }
  }

  getActiveSessions() {
    return this.walletKit.getActiveSessions();
  }
}
