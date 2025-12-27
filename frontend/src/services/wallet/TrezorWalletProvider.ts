// services/wallet/TrezorWalletProvider.ts
import TrezorConnect from '@trezor/connect-web';
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection } from '../../types/wallet';

export class TrezorWalletProvider extends BaseWalletProvider {
  id = 'trezor';
  name = 'Trezor';
  icon = 'trezor-icon.png'; // Add icon later

  async connect(): Promise<WalletConnection> {
    try {
      await TrezorConnect.init({
        manifest: {
          email: 'developer@example.com',
          appUrl: 'https://renvault.com',
        },
      });

      const result = await TrezorConnect.stacksGetAddress({
        path: "m/44'/5757'/0'/0/0",
        showOnTrezor: true,
      });

      if (result.success) {
        return {
          address: result.payload.address,
          publicKey: result.payload.publicKey,
        };
      } else {
        throw new Error(result.payload.error);
      }
    } catch (error) {
      throw new Error('Failed to connect to Trezor: ' + error.message);
    }
  }

  async disconnect(): Promise<void> {
    // Trezor doesn't require explicit disconnect
  }

  async signTransaction(tx: any): Promise<any> {
    // For Stacks transactions, we need to sign the serialized transaction
    const serializedTx = tx.serialize();

    const result = await TrezorConnect.stacksSignTransaction({
      path: "m/44'/5757'/0'/0/0",
      transaction: serializedTx.toString('hex'),
    });

    if (result.success) {
      // Attach signature
      tx.auth.spendingCondition.signature = Buffer.from(result.payload.signature, 'hex');
      return tx;
    } else {
      throw new Error(result.payload.error);
    }
  }
}