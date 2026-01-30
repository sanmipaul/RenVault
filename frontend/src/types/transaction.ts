/**
 * Type definitions for transactions
 */

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'dropped';

/**
 * Transaction type
 */
export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'stake'
  | 'unstake'
  | 'claim'
  | 'swap'
  | 'approve'
  | 'contract_call';

/**
 * Transaction details
 */
export interface TransactionDetails {
  txId: string;
  type: TransactionType;
  status: TransactionStatus;
  from: string;
  to?: string;
  amount?: bigint;
  asset?: string;
  fee?: bigint;
  nonce?: number;
  timestamp: Date;
  blockHeight?: number;
  confirmations?: number;
  contractCall?: ContractCallDetails;
  error?: TransactionError;
}

/**
 * Contract call details
 */
export interface ContractCallDetails {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: FunctionArg[];
}

/**
 * Function argument
 */
export interface FunctionArg {
  name: string;
  type: string;
  value: unknown;
}

/**
 * Transaction error
 */
export interface TransactionError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Transaction request (before signing)
 */
export interface TransactionRequest {
  type: TransactionType;
  from: string;
  to?: string;
  amount?: bigint;
  asset?: string;
  memo?: string;
  fee?: bigint;
  contractCall?: ContractCallDetails;
  postConditions?: PostCondition[];
  sponsored?: boolean;
}

/**
 * Post condition types
 */
export interface PostCondition {
  type: PostConditionType;
  principal: string;
  asset?: string;
  amount?: bigint;
  condition: PostConditionCode;
}

export type PostConditionType = 'stx' | 'fungible' | 'non_fungible';
export type PostConditionCode = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';

/**
 * Transaction history filters
 */
export interface TransactionFilters {
  types?: TransactionType[];
  statuses?: TransactionStatus[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: bigint;
  maxAmount?: bigint;
  asset?: string;
}

/**
 * Transaction history page
 */
export interface TransactionPage {
  transactions: TransactionDetails[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  txId: string;
  success: boolean;
  blockHeight: number;
  blockHash: string;
  gasUsed?: bigint;
  events: TransactionEvent[];
}

/**
 * Transaction event
 */
export interface TransactionEvent {
  type: EventType;
  data: Record<string, unknown>;
}

export type EventType =
  | 'stx_transfer'
  | 'ft_transfer'
  | 'nft_transfer'
  | 'contract_event'
  | 'smart_contract_log';

/**
 * Deposit transaction specific details
 */
export interface DepositDetails {
  vaultAddress: string;
  amount: bigint;
  asset: string;
  fee: bigint;
  netAmount: bigint;
}

/**
 * Withdrawal transaction specific details
 */
export interface WithdrawalDetails {
  vaultAddress: string;
  amount: bigint;
  asset: string;
  recipient: string;
}

/**
 * Gas estimation result
 */
export interface GasEstimation {
  estimatedFee: bigint;
  gasLimit: bigint;
  gasPrice: bigint;
  confidence: 'low' | 'medium' | 'high';
}
