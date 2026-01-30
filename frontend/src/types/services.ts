/**
 * Type definitions for services
 */

import { WalletProviderType, WalletNetwork, WalletBalance } from './walletConnection';
import { TransactionDetails, TransactionStatus } from './transaction';

// ============================================================================
// Wallet Service Types
// ============================================================================

/**
 * Wallet service interface
 */
export interface IWalletService {
  connect(provider: WalletProviderType): Promise<WalletConnectionInfo>;
  disconnect(): Promise<void>;
  getBalance(address: string): Promise<WalletBalance>;
  signMessage(message: string): Promise<string>;
  signTransaction(tx: UnsignedTransaction): Promise<SignedTransaction>;
  isConnected(): boolean;
  getCurrentAddress(): string | null;
}

/**
 * Wallet connection info
 */
export interface WalletConnectionInfo {
  address: string;
  publicKey: string;
  network: WalletNetwork;
  provider: WalletProviderType;
}

/**
 * Unsigned transaction
 */
export interface UnsignedTransaction {
  to: string;
  amount: string;
  memo?: string;
  nonce?: number;
  fee?: string;
}

/**
 * Signed transaction
 */
export interface SignedTransaction {
  raw: string;
  hash: string;
  signature: string;
}

// ============================================================================
// Transaction Service Types
// ============================================================================

/**
 * Transaction service interface
 */
export interface ITransactionService {
  submit(tx: SignedTransaction): Promise<TransactionSubmitResult>;
  getStatus(txId: string): Promise<TransactionStatus>;
  getTransaction(txId: string): Promise<TransactionDetails | null>;
  getHistory(address: string, options?: TransactionHistoryOptions): Promise<TransactionHistoryResult>;
  estimateFee(tx: UnsignedTransaction): Promise<FeeEstimate>;
}

/**
 * Transaction submit result
 */
export interface TransactionSubmitResult {
  txId: string;
  success: boolean;
  error?: string;
}

/**
 * Transaction history options
 */
export interface TransactionHistoryOptions {
  limit?: number;
  offset?: number;
  status?: TransactionStatus[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Transaction history result
 */
export interface TransactionHistoryResult {
  transactions: TransactionDetails[];
  total: number;
  hasMore: boolean;
}

/**
 * Fee estimate
 */
export interface FeeEstimate {
  low: string;
  medium: string;
  high: string;
  estimatedTime: {
    low: number;
    medium: number;
    high: number;
  };
}

// ============================================================================
// Storage Service Types
// ============================================================================

/**
 * Storage service interface
 */
export interface IStorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: StorageSetOptions): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

/**
 * Storage set options
 */
export interface StorageSetOptions {
  encrypt?: boolean;
  expiresIn?: number;
  password?: string;
}

/**
 * Encrypted storage item
 */
export interface EncryptedStorageItem<T> {
  data: T;
  encrypted: boolean;
  createdAt: number;
  expiresAt?: number;
}

// ============================================================================
// Session Service Types
// ============================================================================

/**
 * Session service interface
 */
export interface ISessionService {
  create(options: SessionCreateOptions): Promise<Session>;
  get(sessionId: string): Promise<Session | null>;
  extend(sessionId: string, duration: number): Promise<Session>;
  end(sessionId: string): Promise<void>;
  endAll(userId: string): Promise<void>;
  isValid(sessionId: string): Promise<boolean>;
}

/**
 * Session create options
 */
export interface SessionCreateOptions {
  userId: string;
  deviceInfo?: DeviceInfo;
  duration?: number;
  rememberMe?: boolean;
}

/**
 * Session
 */
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  deviceInfo?: DeviceInfo;
  isActive: boolean;
}

/**
 * Device info
 */
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  ip?: string;
  location?: string;
}

// ============================================================================
// Notification Service Types
// ============================================================================

/**
 * Notification service interface
 */
export interface INotificationService {
  show(notification: NotificationCreateOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
  update(id: string, updates: Partial<NotificationCreateOptions>): void;
  getAll(): NotificationItem[];
  subscribe(callback: NotificationCallback): UnsubscribeFn;
}

/**
 * Notification create options
 */
export interface NotificationCreateOptions {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: NotificationActionConfig;
}

/**
 * Notification action config
 */
export interface NotificationActionConfig {
  label: string;
  onClick: () => void;
}

/**
 * Notification item
 */
export interface NotificationItem extends NotificationCreateOptions {
  id: string;
  createdAt: Date;
}

/**
 * Notification callback
 */
export type NotificationCallback = (notifications: NotificationItem[]) => void;

/**
 * Unsubscribe function
 */
export type UnsubscribeFn = () => void;

// ============================================================================
// API Service Types
// ============================================================================

/**
 * API service interface
 */
export interface IApiService {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(url: string, options?: ApiRequestOptions): Promise<T>;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

/**
 * API interceptor
 */
export interface ApiInterceptor {
  request?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  response?: <T>(response: T) => T | Promise<T>;
  error?: (error: ApiServiceError) => void | Promise<void>;
}

/**
 * API request config
 */
export interface ApiRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  data?: unknown;
  timeout: number;
}

/**
 * API service error
 */
export interface ApiServiceError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}

// ============================================================================
// WebSocket Service Types
// ============================================================================

/**
 * WebSocket service interface
 */
export interface IWebSocketService {
  connect(url: string): Promise<void>;
  disconnect(): void;
  send(message: WebSocketOutgoingMessage): void;
  subscribe<T>(channel: string, callback: WebSocketMessageCallback<T>): UnsubscribeFn;
  isConnected(): boolean;
  onConnectionChange(callback: ConnectionChangeCallback): UnsubscribeFn;
}

/**
 * WebSocket outgoing message
 */
export interface WebSocketOutgoingMessage {
  type: string;
  channel?: string;
  payload?: unknown;
}

/**
 * WebSocket incoming message
 */
export interface WebSocketIncomingMessage<T = unknown> {
  type: string;
  channel: string;
  payload: T;
  timestamp: number;
}

/**
 * WebSocket message callback
 */
export type WebSocketMessageCallback<T> = (message: WebSocketIncomingMessage<T>) => void;

/**
 * Connection change callback
 */
export type ConnectionChangeCallback = (isConnected: boolean) => void;

// ============================================================================
// Analytics Service Types
// ============================================================================

/**
 * Analytics service interface
 */
export interface IAnalyticsService {
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: UserTraits): void;
  page(pageName: string, properties?: PageProperties): void;
  setUserProperties(properties: UserTraits): void;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

/**
 * User traits for analytics
 */
export interface UserTraits {
  walletAddress?: string;
  network?: string;
  createdAt?: Date;
  [key: string]: unknown;
}

/**
 * Page properties for analytics
 */
export interface PageProperties {
  title?: string;
  url?: string;
  referrer?: string;
  [key: string]: unknown;
}

// ============================================================================
// Logger Service Types
// ============================================================================

/**
 * Logger service interface
 */
export interface ILoggerService {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  setLevel(level: LogLevelType): void;
}

/**
 * Log level type
 */
export type LogLevelType = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Log context
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Log transport
 */
export interface LogTransport {
  log(level: LogLevelType, message: string, context?: LogContext): void;
}

// ============================================================================
// Backup Service Types
// ============================================================================

/**
 * Backup service interface
 */
export interface IBackupService {
  create(options: BackupCreateOptions): Promise<BackupResult>;
  restore(backup: string, password: string): Promise<RestoreResult>;
  verify(backup: string): Promise<BackupVerifyResult>;
  list(): Promise<BackupInfo[]>;
  delete(backupId: string): Promise<void>;
}

/**
 * Backup create options
 */
export interface BackupCreateOptions {
  password: string;
  includeSettings?: boolean;
  includeHistory?: boolean;
}

/**
 * Backup result
 */
export interface BackupResult {
  id: string;
  data: string;
  createdAt: Date;
  size: number;
}

/**
 * Restore result
 */
export interface RestoreResult {
  success: boolean;
  restoredItems: string[];
  errors?: string[];
}

/**
 * Backup verify result
 */
export interface BackupVerifyResult {
  isValid: boolean;
  version: number;
  createdAt?: Date;
  errors?: string[];
}

/**
 * Backup info
 */
export interface BackupInfo {
  id: string;
  createdAt: Date;
  size: number;
  version: number;
}

// ============================================================================
// Contract Service Types
// ============================================================================

/**
 * Contract service interface
 */
export interface IContractService {
  call<T>(options: ContractCallOptions): Promise<T>;
  read<T>(options: ContractReadOptions): Promise<T>;
  deploy(options: ContractDeployOptions): Promise<ContractDeployResult>;
}

/**
 * Contract call options
 */
export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ContractArg[];
  senderAddress: string;
  postConditions?: unknown[];
  fee?: string;
}

/**
 * Contract read options
 */
export interface ContractReadOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ContractArg[];
}

/**
 * Contract deploy options
 */
export interface ContractDeployOptions {
  contractName: string;
  codeBody: string;
  senderAddress: string;
  fee?: string;
}

/**
 * Contract deploy result
 */
export interface ContractDeployResult {
  txId: string;
  contractId: string;
}

/**
 * Contract argument
 */
export interface ContractArg {
  type: ContractArgType;
  value: unknown;
}

/**
 * Contract argument type
 */
export type ContractArgType =
  | 'uint128'
  | 'int128'
  | 'bool'
  | 'principal'
  | 'buff'
  | 'string-ascii'
  | 'string-utf8'
  | 'list'
  | 'tuple'
  | 'optional'
  | 'response';
