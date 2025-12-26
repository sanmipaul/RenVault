// services/wallet/LeatherWalletProvider.ts
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection } from '../../types/wallet';
import { connect as stacksConnect, disconnect as stacksDisconnect } from '@stacks/connect';

export class LeatherWalletProvider extends BaseWalletProvider {
  id = 'leather';
  name = 'Leather';
  icon = 'leather-icon.png'; // placeholder

  async connect(): Promise<WalletConnection> {
    return new Promise((resolve, reject) => {
      stacksConnect({
        appDetails: {
          name: 'RenVault',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (payload) => {
          resolve({
            address: payload.addresses.mainnet,
            publicKey: payload.publicKey,
          });
        },
        onCancel: () => reject(new Error('User cancelled connection')),
      });
    });
  }

  async disconnect(): Promise<void> {
    await stacksDisconnect();
  }

  async signTransaction(tx: any): Promise<any> {
    // Implement signing logic
    return tx; // placeholder
  }
}