// services/wallet/XverseWalletProvider.ts
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletConnection, StacksContractCallOptions, SignedTransactionResult } from '../../types/wallet';

export class XverseWalletProvider extends BaseWalletProvider {
  id = 'xverse';
  name = 'Xverse';

  async connect(): Promise<WalletConnection> {
    return new Promise((resolve, reject) => {
      const provider = (window as any).XverseProvider || (window as any).XverseWallet;
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
        reject(new Error('Xverse wallet not installed'));
      }
    });
  }

  async disconnect(): Promise<void> {
    // Clear Xverse session data
    const provider = (window as any).XverseProvider || (window as any).XverseWallet;
    if (provider) {
      await provider.request('disconnect', {}).catch(() => {});
    }
    localStorage.removeItem('xverse-session');
  }

  async signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult> {
    const provider = (window as any).XverseProvider || (window as any).XverseWallet;
    if (!provider) {
      throw new Error('Xverse wallet not installed');
    }
    // Use the Stacks Provider API to request transaction signing
    const response = await provider.request('stx_signTransaction', {
      contractAddress: tx.contractAddress,
      contractName: tx.contractName,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs.map((arg: unknown) => arg),
      network: tx.network,
    });
    return {
      txId: response.txId || response.txid || '',
      txRaw: response.txRaw,
    };
  }
}