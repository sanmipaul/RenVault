// types/wallet.ts
import { StacksTransaction } from '@stacks/transactions';

export interface WalletProvider {
  id: string;
  name: string;
  icon?: string;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  signTransaction(tx: StacksContractCallOptions): Promise<SignedTransactionResult>;
  // Add other methods as needed
}

export interface WalletConnection {
  address: string;
  publicKey: string;
  // etc.
}

/** Options passed to wallet providers when requesting a contract call signature */
export interface StacksContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: import('@stacks/transactions').ClarityValue[];
  network: import('@stacks/network').StacksNetwork;
  anchorMode?: import('@stacks/transactions').AnchorMode;
  postConditionMode?: import('@stacks/transactions').PostConditionMode;
  sponsored?: boolean;
  sponsorAddress?: string;
  senderKey?: string;
  onFinish?: (data: SignedTransactionResult) => void;
  onCancel?: () => void;
}

/** Result returned after a wallet signs a transaction */
export interface SignedTransactionResult {
  txId: string;
  txRaw?: string;
  transaction?: StacksTransaction;
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

export interface CoSigner {
  address: string;
  publicKey: string;
  name?: string;
}

export interface MultiSigConfig {
  threshold: number;
  totalSigners: number;
  coSigners: CoSigner[];
  owner: string;
}

export interface MultiSigTransaction {
  txId: string;
  transaction: StacksContractCallOptions;
  signatures: string[];
  requiredSignatures: number;
  status: 'pending' | 'signed' | 'executed';
  createdAt: string;
}
