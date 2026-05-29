// services/wallet/TrezorWalletProvider.ts
import TrezorConnect from '@trezor/connect-web';
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';
import { WalletError, WalletErrorCode } from '../../utils/wallet-errors';
import { makeContractCall, StacksTransaction } from '@stacks/transactions';

export class TrezorWalletProvider extends BaseWalletProvider {
  id = 'trezor';
  name = 'Trezor';

  async connect(): Promise<WalletConnection> {
    try {
      await TrezorConnect.init({
        manifest: {
          appName: 'RenVault',
          email: 'developer@example.com',
          appUrl: 'https://renvault.com',
        },
      });

      const result = await (TrezorConnect as any).stacksGetAddress({
        path: "m/44'/5757'/0'/0/0",
        showOnTrezor: true,
      });

      if (result.success) {
        return {
          address: result.payload.address,
          publicKey: result.payload.publicKey,
        };
      } else {
        throw new WalletError(WalletErrorCode.HARDWARE_WALLET_CONNECTION_FAILED, result.payload.error);
      }
    } catch (error) {
      throw new WalletError(WalletErrorCode.HARDWARE_WALLET_NOT_FOUND, 'Failed to connect to Trezor: ' + (error as Error).message);
    }
  }

  async disconnect(): Promise<void> {
    // Trezor doesn't require explicit disconnect
  }

  async signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult> {
    // Build the Stacks transaction from call options
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

    // Serialize and request on-device signing via Trezor
    const serializedTx = transaction.serialize();
    const result = await (TrezorConnect as any).stacksSignTransaction({
      path: "m/44'/5757'/0'/0/0",
      transaction: serializedTx.toString('hex'),
    });

    if (result.success) {
      return {
        txId: transaction.txid(),
        txRaw: transaction.serialize().toString('hex'),
        transaction,
      };
    } else {
      throw new Error(result.payload.error);
    }
  }
}