// services/wallet/LeatherWalletProvider.ts
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';
import { showConnect as stacksConnect, disconnect as stacksDisconnect, openContractCall } from '@stacks/connect';

export class LeatherWalletProvider extends BaseWalletProvider {
  id = 'leather';
  name = 'Leather';

  async connect(): Promise<WalletConnection> {
    return new Promise((resolve, reject) => {
      stacksConnect({
        appDetails: {
          name: 'RenVault',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (payload: { addresses?: { mainnet?: string }; profile?: { stxAddress?: { mainnet?: string } }; publicKey?: string }) => {
          resolve({
            address: payload.addresses?.mainnet ?? payload.profile?.stxAddress?.mainnet ?? '',
            publicKey: payload.publicKey ?? '',
          });
        },
        onCancel: () => reject(new Error('User cancelled connection')),
      });
    });
  }

  async disconnect(): Promise<void> {
    await stacksDisconnect();
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
        sponsored: tx.sponsored,
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