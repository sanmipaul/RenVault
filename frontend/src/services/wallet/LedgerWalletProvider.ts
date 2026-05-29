// services/wallet/LedgerWalletProvider.ts
// Ledger hardware wallet support - requires @ledgerhq packages
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';
import { WalletError, WalletErrorCode } from '../../utils/wallet-errors';
import { logger } from '../../utils/logger';
import { makeContractCall, StacksTransaction } from '@stacks/transactions';

export class LedgerWalletProvider extends BaseWalletProvider {
  id = 'ledger';
  name = 'Ledger';

  private transport: unknown;
  private app: unknown;

  async connect(): Promise<WalletConnection> {
    try {
      const TransportWebUSB = await import('@ledgerhq/hw-transport-webusb' as any).then((m: any) => m.default).catch(() => null);
      const StacksApp = await import('@ledgerhq/hw-app-stacks' as any).then((m: any) => m.default).catch(() => null);

      if (!TransportWebUSB || !StacksApp) {
        throw new WalletError(WalletErrorCode.HARDWARE_WALLET_NOT_FOUND, 'Ledger support is not available in this build.');
      }

      this.transport = await TransportWebUSB.create();
      this.app = new StacksApp(this.transport);

      const response = await this.app.getVersion();
      logger.debug('Ledger version:', response);

      const addressResponse = await this.app.getAddressAndPubKey("44'/5757'/0'/0/0");
      const address = addressResponse.address;
      const publicKey = addressResponse.publicKey.toString('hex');

      return { address, publicKey };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('No device selected')) {
        throw new WalletError(WalletErrorCode.HARDWARE_WALLET_NOT_FOUND, 'Ledger device not found. Please connect your Ledger and open the Stacks app.');
      }
      throw new WalletError(WalletErrorCode.HARDWARE_WALLET_CONNECTION_FAILED, 'Failed to connect to Ledger: ' + msg);
    }
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
  }

  async signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult> {
    if (!this.app) {
      throw new Error('Ledger not connected');
    }

    // Build a transaction and request on-device signing via Ledger
    const transaction: StacksTransaction = await makeContractCall({
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

    // For hardware wallets the signature is embedded by makeContractCall
    // when senderKey is provided. If senderKey is empty, the caller must
    // broadcast the raw transaction after user confirms on device.
    return {
      txId: transaction.txid(),
      txRaw: transaction.serialize().toString('hex'),
      transaction,
    };
  }
}
