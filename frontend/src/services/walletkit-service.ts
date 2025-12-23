import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

export class WalletKitService {
  private walletKit: WalletKit;

  constructor(walletKit: WalletKit) {
    this.walletKit = walletKit;
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
