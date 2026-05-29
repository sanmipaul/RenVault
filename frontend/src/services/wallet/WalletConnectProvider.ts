// services/wallet/WalletConnectProvider.ts
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';
import { WalletKitService } from '../walletkit-service';
import { makeContractCall } from '@stacks/transactions';

export class WalletConnectProvider extends BaseWalletProvider {
  id = 'walletconnect';
  name = 'WalletConnect';

  private sessionTopic: string = '';

  async connect(): Promise<WalletConnection> {
    const service = await WalletKitService.init();

    // Get active sessions and pick the first Stacks session
    const sessions = await service.getActiveSessions();
    const sessionKeys = Object.keys(sessions);
    if (sessionKeys.length > 0) {
      this.sessionTopic = sessionKeys[0];
      const session = sessions[this.sessionTopic];
      const stacksAccount = session?.namespaces?.stacks?.accounts?.[0];
      if (stacksAccount) {
        const address = stacksAccount.split(':')[2] || '';
        return {
          address,
          publicKey: '',
        };
      }
    }

    return {
      address: 'placeholder',
      publicKey: 'placeholder',
    };
  }

  async disconnect(): Promise<void> {
    try {
      const service = await WalletKitService.init();
      if (this.sessionTopic) {
        await service.disconnectSession(this.sessionTopic);
      }
    } catch {
      // Best-effort disconnect
    }
    localStorage.removeItem('walletconnect-session');
  }

  async signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult> {
    // Build and sign the transaction using the Stacks provider
    const transaction = await makeContractCall({
      contractAddress: tx.contractAddress,
      contractName: tx.contractName,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs,
      senderKey: tx.senderKey || '',
      network: tx.network,
      anchorMode: tx.anchorMode,
      postConditionMode: tx.postConditionMode,
      sponsored: tx.sponsored,
    });

    return {
      txId: transaction.txid(),
      txRaw: transaction.serialize().toString('hex'),
      transaction,
    };
  }
}