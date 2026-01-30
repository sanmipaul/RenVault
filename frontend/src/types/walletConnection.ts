/**
 * Type definitions for wallet connections
 */

/**
 * Wallet connection state
 */
export interface WalletConnectionState {
  address: string;
  publicKey: string;
  network?: WalletNetwork;
  chainId?: number;
}

/**
 * Supported wallet networks
 */
export type WalletNetwork = 'mainnet' | 'testnet' | 'devnet';

/**
 * Wallet provider types
 */
export type WalletProviderType =
  | 'leather'
  | 'xverse'
  | 'hiro'
  | 'walletconnect'
  | 'ledger'
  | 'trezor'
  | 'multisig';

/**
 * Wallet connection result
 */
export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  publicKey?: string;
  error?: WalletConnectionError;
}

/**
 * Wallet connection error
 */
export interface WalletConnectionError {
  code: WalletErrorCode;
  message: string;
  details?: string;
}

/**
 * Wallet error codes
 */
export enum WalletErrorCode {
  USER_REJECTED = 'USER_REJECTED',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  SIGNING_FAILED = 'SIGNING_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Transaction request options
 */
export interface TransactionOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  postConditions?: unknown[];
  postConditionMode?: 'allow' | 'deny';
  sponsored?: boolean;
  fee?: number;
  nonce?: number;
}

/**
 * Signed transaction result
 */
export interface SignedTransactionResult {
  txId: string;
  rawTx: string;
  broadcast?: boolean;
}

/**
 * Wallet session info
 */
export interface WalletSession {
  id: string;
  wallet: WalletProviderType;
  address: string;
  publicKey: string;
  network: WalletNetwork;
  connectedAt: Date;
  expiresAt?: Date;
}

/**
 * Multi-sig wallet configuration
 */
export interface MultiSigConfig {
  threshold: number;
  totalSigners: number;
  coSigners: CoSigner[];
  owner: string;
}

/**
 * Co-signer information
 */
export interface CoSigner {
  address: string;
  publicKey: string;
  name?: string;
  weight?: number;
}

/**
 * Pending multi-sig transaction
 */
export interface PendingMultiSigTransaction {
  id: string;
  txData: TransactionOptions;
  signatures: TransactionSignature[];
  threshold: number;
  createdAt: Date;
  expiresAt: Date;
  status: MultiSigTxStatus;
}

/**
 * Transaction signature
 */
export interface TransactionSignature {
  signer: string;
  signature: string;
  signedAt: Date;
}

/**
 * Multi-sig transaction status
 */
export type MultiSigTxStatus = 'pending' | 'ready' | 'executed' | 'expired' | 'cancelled';

/**
 * Wallet balance info
 */
export interface WalletBalance {
  stx: bigint;
  fungibleTokens: FungibleTokenBalance[];
  nonFungibleTokens: NFTBalance[];
}

/**
 * Fungible token balance
 */
export interface FungibleTokenBalance {
  contractId: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
}

/**
 * NFT balance
 */
export interface NFTBalance {
  contractId: string;
  tokenIds: string[];
  count: number;
}
