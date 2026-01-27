/**
 * Multi-Chain API Types and Interfaces
 * Complete TypeScript type definitions for multi-chain operations
 */

import type { ChainType } from '../config/multi-chain-config';

// ============================================================================
// Chain Types
// ============================================================================

export interface ChainMetadata {
  type: ChainType;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  testnet: boolean;
  chainId: string;
  namespace: 'evm' | 'stacks';
}

export interface Chain extends ChainMetadata {
  nativeCurrency: Token;
  rpcUrl: string;
  explorers: Explorer[];
}

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
}

export interface Explorer {
  name: string;
  url: string;
  txPath?: string;
  addressPath?: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface WalletProvider {
  name: string;
  chainType: ChainType;
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface WalletState {
  provider: string | null;
  address: string | null;
  chainType: ChainType | null;
  isConnected: boolean;
}

export interface ConnectWalletParams {
  provider: string;
  chain?: ChainType;
}

export interface WalletConnectError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// Balance Types
// ============================================================================

export interface Balance {
  chainType: ChainType;
  address: string;
  balance: string;
  displayBalance: string;
  currency: string;
  decimals: number;
  timestamp: number;
}

export interface MultiChainBalance {
  stacks: Balance | null;
  ethereum: Balance | null;
  polygon: Balance | null;
  arbitrum: Balance | null;
  total: number;
  lastUpdated: number;
}

export interface BalanceUpdateEvent {
  chainType: ChainType;
  balance: Balance;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';
export type TransactionType = 'transfer' | 'swap' | 'bridge' | 'stake' | 'claim';

export interface Transaction {
  id: string;
  chainType: ChainType;
  type: TransactionType;
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  hash?: string;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  fee?: string;
  data?: string;
  nonce?: number;
}

export interface TransactionRequest {
  chainType: ChainType;
  type: TransactionType;
  from: string;
  to: string;
  amount: string;
  currency: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionResponse extends Transaction {
  explorerUrl?: string;
}

export interface TransactionFilter {
  chainType?: ChainType;
  address?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: number;
  endDate?: number;
}

export interface TransactionStatistics {
  totalTransactions: number;
  pending: number;
  confirmed: number;
  failed: number;
  totalValueTransferred: number;
  byChain: Record<ChainType, number>;
  averageGasPrice?: string;
  totalGasUsed?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface AddressValidationResult extends ValidationResult {
  normalizedAddress?: string;
  chainType?: ChainType;
}

export interface TransactionValidationResult extends ValidationResult {
  details?: {
    fromValid: boolean;
    toValid: boolean;
    amountValid: boolean;
    warnings: string[];
  };
}

export interface ChainCompatibility {
  operation: 'transfer' | 'bridge' | 'swap';
  supportedChains: ChainType[];
}

// ============================================================================
// Error Types
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'validation' | 'wallet' | 'transaction' | 'unknown';

export interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  recovery?: RecoveryStrategy;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'manual' | 'abort';
  maxAttempts?: number;
  delayMs?: number;
  fallbackChain?: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface MultiChainConfig {
  projectId: string;
  appName: string;
  appIcon?: string;
  appUrl?: string;
  defaultChain?: ChainType;
  chains: Chain[];
  rpcEndpoints?: Record<ChainType, string>;
  explorerUrls?: Record<ChainType, string>;
}

export interface ChainConfig {
  type: ChainType;
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: Token;
  testnet: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export interface ChainSwitchEvent {
  previousChain: ChainType | null;
  newChain: ChainType;
  timestamp: number;
}

export interface WalletConnectEvent {
  address: string;
  chainType: ChainType;
  timestamp: number;
}

export interface TransactionEvent {
  type: 'created' | 'updated' | 'confirmed' | 'failed';
  transaction: Transaction;
  timestamp: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GasPriceEstimate {
  chainType: ChainType;
  low: string;
  standard: string;
  fast: string;
  timestamp: number;
}

export interface TransactionGasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedFee: string;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseChainSwitchReturn {
  activeChain: Chain | null;
  switchChain: (chainType: ChainType) => Promise<void>;
  isStacks: boolean;
  isEvm: boolean;
  adapter: any;
  allChains: Chain[];
  evmChains: Chain[];
  stacksChains: Chain[];
  history: ChainSwitchEvent[];
}

export interface UseMultiChainBalanceReturn {
  balances: MultiChainBalance | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseMultiChainWalletReturn {
  wallet: WalletState;
  providers: WalletProvider[];
  loading: boolean;
  error: string | null;
  connectWallet: (providerName: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isConnected: boolean;
  address: string | null;
  chainType: ChainType | null;
}

export interface UseMultiChainTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getByChain: (chainType: ChainType) => Transaction[];
  getByStatus: (status: TransactionStatus) => Transaction[];
  statistics: TransactionStatistics | null;
}

export interface UseAsyncReturn<T> {
  execute: () => Promise<T>;
  status: 'idle' | 'pending' | 'success' | 'error';
  value: T | null;
  error: any;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ChainSelectorProps {
  onChainChange?: (chainType: ChainType) => void;
  compact?: boolean;
  className?: string;
}

export interface BalanceDisplayProps {
  address?: string;
  showAllChains?: boolean;
  compact?: boolean;
  className?: string;
  onRefresh?: () => void;
}

export interface TransactionStatusProps {
  address?: string;
  showAll?: boolean;
  className?: string;
  maxTransactions?: number;
}

export interface AccessibleFormProps {
  onSubmit: (tx: TransactionRequest) => Promise<void>;
  userAddress: string;
  className?: string;
}

// ============================================================================
// Adapter Types
// ============================================================================

export interface ChainAdapter {
  getChainId(): string;
  getChainNamespace(): string;
  getNetwork(): any;
  isTestnet(): boolean;
  getMetadata(): ChainMetadata;
  getRpcUrl(): string;
  getExplorerUrl(): string;
  getNativeToken(): Token;
  isValidAddress(address: string): boolean;
  formatAddress(address: string): string;
}

export interface EvmChainAdapterMethods extends ChainAdapter {
  toWei(amount: string): string;
  fromWei(wei: string | number): number;
  getGasPrice(): Promise<string>;
  estimateGas(tx: any): Promise<string>;
  getBalance(address: string): Promise<string>;
  getNumericChainId(): number;
}

export interface StacksChainAdapterMethods extends ChainAdapter {
  toSmallestUnit(amount: string): string;
  fromSmallestUnit(microStx: string | number): number;
}

// ============================================================================
// Service Types
// ============================================================================

export interface ChainSwitchServiceConfig {
  initialChain?: ChainType;
  persistToStorage?: boolean;
  maxHistorySize?: number;
}

export interface TransactionServiceConfig {
  maxTransactions?: number;
  persistToStorage?: boolean;
  autoCleanupAge?: number;
}

export interface BalanceServiceConfig {
  updateInterval?: number;
  cacheTime?: number;
  persistToStorage?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type AsyncFunction<T> = () => Promise<T>;
export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

// ============================================================================
// Export all types as a namespace
// ============================================================================

export namespace MultiChain {
  export type {
    ChainType,
    Chain,
    Token,
    Balance,
    Transaction,
    TransactionStatus,
    WalletState,
    AppError,
  };
}
