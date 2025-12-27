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

export interface TransactionHistoryItem {
  txId: string;
  type: 'sent' | 'received' | 'contract_call';
  amount?: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  to?: string;
  from?: string;
  fee: number;
  memo?: string;
}

export type WalletProviderType = 'leather' | 'xverse' | 'hiro' | 'walletconnect' | 'ledger' | 'trezor' | 'multisig';