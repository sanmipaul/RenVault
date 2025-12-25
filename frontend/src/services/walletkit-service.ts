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
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to approve session: ${errorMessage}`, error as Error);
      throw new Error(`Failed to approve wallet session: ${errorMessage}`);
    }
  }

  async rejectSession(proposal: WalletKitTypes.SessionProposal) {
    try {
      return await this.walletKit.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED'),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to reject session: ${errorMessage}`, error as Error);
      throw new Error(`Failed to reject wallet session: ${errorMessage}`);
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

  async rejectSessionRequest(
    topic: string,
    id: number,
    error: { code: number; message: string }
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
    } catch (error) {
      throw error;
    }
  }

  getActiveSessions() {
    return this.walletKit.getActiveSessions();
  }

  getSession(topic: string) {
    const sessions = this.getActiveSessions();
    return sessions[topic];
  }

  static reset() {
    WalletKitService.instance = null as any;
  }
}
