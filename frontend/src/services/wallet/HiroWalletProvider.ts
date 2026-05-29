// services/wallet/HiroWalletProvider.ts
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';
import { openContractCall } from '@stacks/connect';

export class HiroWalletProvider extends BaseWalletProvider {
  id = 'hiro';
  name = 'Hiro Wallet';

  async connect(): Promise<WalletConnection> {
    // Hiro wallet connection logic
    return new Promise((resolve, reject) => {
      const provider = (window as any).StacksProvider || (window as any).HiroWallet;
      if (provider) {
        provider.request('connect', {
          appDetails: {
            name: 'RenVault',
            icon: window.location.origin + '/favicon.ico',
          },
        }).then((result: { address: string; publicKey: string }) => {
          resolve({
            address: result.address,
            publicKey: result.publicKey,
          });
        }).catch(reject);
      } else {
        reject(new Error('Hiro wallet not installed'));
      }
    });
  }

  async disconnect(): Promise<void> {
    // Clear Hiro session data
    const provider = (window as any).StacksProvider || (window as any).HiroWallet;
    if (provider) {
      await provider.request('disconnect', {}).catch(() => {});
    }
    localStorage.removeItem('hiro-session');
  }

  async signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult> {
    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: tx.contractAddress,
        contractName: tx.contractName,
        functionName: tx.functionName,
        functionArgs: tx.functionArgs,
        network: tx.network,
        anchorMode: tx.anchorMode,
        postConditionMode: tx.postConditionMode,
        appDetails: {
          name: 'RenVault',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (data) => {
          resolve({
            txId: data.txId,
            txRaw: data.txRaw,
          });
        },
        onCancel: () => reject(new Error('User cancelled transaction signing')),
      });
    });
  }
}