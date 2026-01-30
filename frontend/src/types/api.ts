/**
 * Type definitions for API responses
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Balance API response
 */
export interface BalanceResponse {
  address: string;
  stxBalance: string;
  stxLocked: string;
  tokenBalances: TokenBalanceResponse[];
  lastUpdated: string;
}

/**
 * Token balance response
 */
export interface TokenBalanceResponse {
  contractId: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  usdValue?: string;
}

/**
 * Transaction API response
 */
export interface TransactionResponse {
  txId: string;
  status: string;
  type: string;
  sender: string;
  recipient?: string;
  amount?: string;
  fee: string;
  nonce: number;
  blockHeight?: number;
  blockTime?: string;
  contractCall?: ContractCallResponse;
}

/**
 * Contract call response
 */
export interface ContractCallResponse {
  contractId: string;
  functionName: string;
  functionArgs: FunctionArgResponse[];
}

/**
 * Function argument response
 */
export interface FunctionArgResponse {
  name: string;
  type: string;
  repr: string;
  value: unknown;
}

/**
 * Price API response
 */
export interface PriceResponse {
  asset: string;
  priceUsd: string;
  change24h: string;
  volume24h: string;
  marketCap?: string;
  lastUpdated: string;
}

/**
 * Vault stats API response
 */
export interface VaultStatsResponse {
  totalDeposits: string;
  totalWithdrawals: string;
  tvl: string;
  apy?: string;
  depositors: number;
  transactions: number;
}

/**
 * User stats API response
 */
export interface UserStatsResponse {
  address: string;
  totalDeposited: string;
  totalWithdrawn: string;
  currentBalance: string;
  rewards: string;
  transactionCount: number;
  firstDeposit?: string;
  lastActivity?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: ServiceHealth[];
}

/**
 * Service health status
 */
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  lastCheck: string;
}

/**
 * Network status response
 */
export interface NetworkStatusResponse {
  network: string;
  chainId: number;
  blockHeight: number;
  burnBlockHeight: number;
  microblockHash?: string;
  syncStatus: 'synced' | 'syncing' | 'behind';
}

/**
 * Contract info response
 */
export interface ContractInfoResponse {
  contractId: string;
  name: string;
  version: string;
  deployed: boolean;
  blockHeight?: number;
  functions: ContractFunction[];
  maps: ContractMap[];
}

/**
 * Contract function info
 */
export interface ContractFunction {
  name: string;
  access: 'public' | 'read-only' | 'private';
  args: FunctionArgSpec[];
  outputs: OutputSpec;
}

/**
 * Function argument specification
 */
export interface FunctionArgSpec {
  name: string;
  type: string;
}

/**
 * Output specification
 */
export interface OutputSpec {
  type: string;
}

/**
 * Contract map info
 */
export interface ContractMap {
  name: string;
  keyType: string;
  valueType: string;
}
