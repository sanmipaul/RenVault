/**
 * WalletKit Sign API v2 Type Definitions
 * Comprehensive types for batch signing, EIP-712, and advanced signing operations
 */

// Signature types
export type SignatureFormat = 'hex' | 'der' | 'raw';
export type SigningAlgorithm = 'ECDSA' | 'EdDSA' | 'BLS';

// Transaction signing types
export interface SigningRequest {
  id: string;
  type: 'transaction' | 'message' | 'typed_data';
  data: any;
  chainId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface SigningResponse {
  requestId: string;
  signature: string;
  signatureFormat: SignatureFormat;
  publicKey?: string;
  timestamp: number;
  transactionHash?: string;
}

// Batch signing types
export interface BatchSigningRequest {
  transactions: SignTransaction[];
  chainId: string;
  topic: string;
  simulationRequired?: boolean;
  onProgress?: (progress: SigningProgress) => void;
}

export interface SignTransaction {
  id: string;
  data: string; // Raw transaction data
  type?: 'legacy' | 'eip2930' | 'eip1559';
  metadata?: TransactionMetadata;
}

export interface TransactionMetadata {
  from?: string;
  to?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
  data?: string;
  description?: string;
}

export interface BatchSigningResponse {
  batchId: string;
  signatures: SigningResponse[];
  failedTransactions: FailedSigningAttempt[];
  totalSigned: number;
  totalFailed: number;
  timestamp: number;
}

export interface SigningProgress {
  batchId: string;
  transactionId: string;
  status: 'pending' | 'signing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export interface FailedSigningAttempt {
  transactionId: string;
  error: string;
  reason: SigningErrorReason;
  timestamp: number;
}

// Message signing types
export interface MessageSigningRequest {
  message: string;
  account: string;
  chainId?: string;
  messageType?: 'personal_sign' | 'eth_sign' | 'sign_typed_data';
  displayMessage?: string; // Human-readable message for user approval
}

export interface MessageSigningResponse {
  signature: string;
  message: string;
  messageHash: string;
  recoveryId?: number;
  timestamp: number;
}

// EIP-712 Typed Data types
export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: number | string;
  verifyingContract?: string;
  salt?: string;
}

export interface TypedDataField {
  name: string;
  type: string;
}

export interface EIP712TypedData {
  types: {
    EIP712Domain?: TypedDataField[];
    [key: string]: TypedDataField[];
  };
  primaryType: string;
  domain: TypedDataDomain;
  message: Record<string, any>;
}

export interface TypedDataSigningRequest {
  typedData: EIP712TypedData;
  account: string;
  chainId: string;
  topic: string;
}

export interface TypedDataSigningResponse extends SigningResponse {
  typedDataHash: string;
}

// Hardware wallet specific types
export interface HardwareWalletConfig {
  type: 'ledger' | 'trezor' | 'keepkey';
  derivationPath: string;
  confirmationRequired: boolean;
  timeoutMs?: number;
  retryAttempts?: number;
}

export interface HardwareSigningRequest extends SigningRequest {
  hardware: HardwareWalletConfig;
  pinRequired?: boolean;
  displayOnDevice?: boolean;
}

export interface HardwareSigningResponse extends SigningResponse {
  hardwareDeviceId?: string;
  userConfirmed: boolean;
  confirmationTime?: number;
}

// Multi-signature coordination types
export interface MultiSigSigningRequest {
  transaction: SignTransaction;
  requiredSignatures: number;
  signers: string[];
  chainId: string;
  timeoutMs?: number;
  metadata?: MultiSigMetadata;
}

export interface MultiSigMetadata {
  walletAddress: string;
  nonce?: number;
  salt?: string;
  description?: string;
}

export interface MultiSigSigningResponse {
  transactionId: string;
  signatures: Map<string, SigningResponse>;
  isComplete: boolean;
  requiredSignatures: number;
  currentSignatures: number;
  remainingSigners: string[];
  expiresAt: number;
}

// Signature verification types
export interface SignatureVerificationRequest {
  message: string;
  signature: string;
  publicKey: string;
  algorithm?: SigningAlgorithm;
  messageFormat?: 'raw' | 'hashed';
}

export interface SignatureVerificationResponse {
  isValid: boolean;
  recoveredAddress?: string;
  verifiedAt: number;
}

// Signing session types
export interface SigningSession {
  sessionId: string;
  topic: string;
  account: string;
  chainId: string;
  createdAt: number;
  expiresAt: number;
  state: 'active' | 'paused' | 'expired' | 'closed';
  signedCount: number;
  failedCount: number;
}

// Transaction simulation types
export interface TransactionSimulation {
  transactionId: string;
  success: boolean;
  gasEstimate: string;
  gasUsed?: string;
  revertReason?: string;
  simulationResult?: SimulationResult;
  warnings?: string[];
}

export interface SimulationResult {
  status: 'success' | 'failure' | 'error';
  output?: string;
  logs?: string[];
  stateDiff?: Record<string, any>;
  gasUsed?: number;
  gasLimit?: number;
}

// Signing error types
export type SigningErrorReason =
  | 'user_rejected'
  | 'invalid_request'
  | 'network_error'
  | 'timeout'
  | 'hardware_error'
  | 'insufficient_funds'
  | 'nonce_conflict'
  | 'gas_estimation_failed'
  | 'simulation_failed'
  | 'unknown';

export interface SigningError extends Error {
  reason: SigningErrorReason;
  transactionId?: string;
  requestId?: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Signing capability types
export interface SigningCapabilities {
  batchSigning: boolean;
  eip712Signing: boolean;
  personalMessageSigning: boolean;
  hardwareWalletSupport: boolean;
  multiSigSupport: boolean;
  transactionSimulation: boolean;
  signatureVerification: boolean;
}

// Signing options/configuration
export interface SigningOptions {
  simulateBeforeSigning?: boolean;
  verifyAfterSigning?: boolean;
  progressCallback?: (progress: SigningProgress) => void;
  timeoutMs?: number;
  retryOnFailure?: boolean;
  maxRetries?: number;
  batchSize?: number;
  priorityFee?: string;
  gasPrice?: string;
}

// Signing history/audit types
export interface SigningHistoryEntry {
  id: string;
  type: SigningRequest['type'];
  status: 'success' | 'failed' | 'pending';
  chainId: string;
  account: string;
  timestamp: number;
  duration?: number;
  gasUsed?: string;
  transactionHash?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SigningAuditLog {
  entries: SigningHistoryEntry[];
  totalSigned: number;
  totalFailed: number;
  averageDuration: number;
  lastSigningTime?: number;
}
