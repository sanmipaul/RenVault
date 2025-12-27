// services/wallet/LedgerWalletProvider.ts
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import StacksApp from '@ledgerhq/hw-app-stacks';
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection } from '../../types/wallet';
import { StacksNetwork } from '@stacks/network';

export class LedgerWalletProvider extends BaseWalletProvider {
  id = 'ledger';
  name = 'Ledger';
  icon = 'ledger-icon.png'; // Add icon later

  private transport: any;
  private app: StacksApp;

  async connect(): Promise<WalletConnection> {
    try {
      this.transport = await TransportWebUSB.create();
      this.app = new StacksApp(this.transport);

      const response = await this.app.getVersion();
      console.log('Ledger version:', response);

      // Get address
      const addressResponse = await this.app.getAddressAndPubKey("44'/5757'/0'/0/0");
      const address = addressResponse.address;
      const publicKey = addressResponse.publicKey.toString('hex');

      return {
        address,
        publicKey,
      };
    } catch (error) {
      throw new Error('Failed to connect to Ledger: ' + error.message);
    }
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
  }

  async signTransaction(tx: any): Promise<any> {
    if (!this.app) {
      throw new Error('Ledger not connected');
    }

    // Sign the transaction using Ledger
    const serializedTx = tx.serialize();
    const signature = await this.app.sign("44'/5757'/0'/0/0", serializedTx);

    // Attach signature to tx
    tx.auth.spendingCondition.signature = signature;
    return tx;
  }
}