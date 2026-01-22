// services/wallet/BaseWalletProvider.ts
import { WalletProvider, WalletConnection } from '../../types/wallet';

export abstract class BaseWalletProvider implements WalletProvider {
  abstract id: string;
  abstract name: string;
  icon?: string;

  abstract connect(): Promise<WalletConnection>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(tx: any): Promise<any>;
}