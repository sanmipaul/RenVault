/**
 * Smart Sessions Types
 * Defines interfaces for AppKit Smart Sessions integration
 */

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum SessionPermission {
  VAULT_DEPOSIT = 'vault.deposit',
  VAULT_WITHDRAW = 'vault.withdraw',
  VAULT_CLAIM_REWARDS = 'vault.claim_rewards',
  VAULT_REBALANCE = 'vault.rebalance',
  MULTI_DEPOSIT = 'multi.deposit',
  AUTO_COMPOUND = 'auto.compound',
  STOP_LOSS = 'stop.loss',
}

export interface SpendingLimit {
  amount: string; // in microSTX
  currency: 'STX' | 'TOKEN';
  resetPeriod?: 'daily' | 'weekly' | 'session';
}

export interface SessionConstraints {
  maxTransactionsPerDay: number;
  maxTransactionsPerHour?: number;
  operationWhitelist: SessionPermission[];
  contractWhitelist?: string[]; // Stacks contract addresses
  requiresConfirmation: boolean;
  allowBatching: boolean;
}

export interface SmartSessionConfig {
  id: string;
  walletAddress: string;
  duration: number; // in milliseconds
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
  status: SessionStatus;
  spendingLimit: SpendingLimit;
  constraints: SessionConstraints;
  isEncrypted: boolean;
  encryptionKey?: string; // Derived from wallet + session id
}

export interface SessionActivityLog {
  id: string;
  sessionId: string;
  timestamp: number;
  operation: SessionPermission;
  amount?: string;
  transactionHash?: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface SessionPermissionRequest {
  sessionId: string;
  operation: SessionPermission;
  amount?: string;
  contractAddress?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  requiresConfirmation: boolean;
}

export interface SessionAnomalyAlert {
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  type: 'unusual_amount' | 'rate_limit_exceeded' | 'unknown_contract' | 'time_anomaly';
  description: string;
  timestamp: number;
}
