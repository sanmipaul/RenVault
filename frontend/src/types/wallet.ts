// types/wallet.ts
export interface WalletProvider {
  id: string;
  name: string;
  icon?: string;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  signTransaction(tx: any): Promise<any>;
  // Add other methods as needed
}

export interface WalletConnection {
  address: string;
  publicKey: string;
  // etc.
}

export type WalletProviderType = 'leather' | 'xverse' | 'hiro' | 'walletconnect' | 'ledger' | 'trezor';