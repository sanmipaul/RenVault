/**
 * Type definitions for cryptographic operations in RenVault
 */

/**
 * Encrypted data structure for storage
 */
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  version: number;
}

/**
 * Backup encryption configuration
 */
export interface BackupEncryptionConfig {
  algorithm: 'AES-GCM';
  keyLength: 256;
  iterations: number;
  hashAlgorithm: 'SHA-256';
}

/**
 * Secure backup data structure
 */
export interface SecureBackupData {
  id: string;
  timestamp: number;
  encryptedPayload: EncryptedData;
  checksum: string;
  version: string;
  metadata: BackupMetadata;
}

/**
 * Backup metadata (non-sensitive)
 */
export interface BackupMetadata {
  createdAt: string;
  backupType: 'session' | 'wallet' | 'settings';
  compressed: boolean;
  encrypted: boolean;
}

/**
 * Wallet backup data structure
 */
export interface WalletBackupData {
  address: string;
  publicKey: string;
  encryptedMnemonic: EncryptedData;
  createdAt: string;
  version: string;
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  salt: Uint8Array;
  iterations: number;
  hashAlgorithm: string;
  keyLength: number;
}

/**
 * Encryption result with metadata
 */
export interface EncryptionResult {
  success: boolean;
  data?: EncryptedData;
  error?: string;
}

/**
 * Decryption result with metadata
 */
export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Hash verification result
 */
export interface HashVerificationResult {
  valid: boolean;
  expectedHash: string;
  actualHash: string;
}

/**
 * Secure random generation options
 */
export interface SecureRandomOptions {
  length: number;
  encoding: 'hex' | 'base64' | 'raw';
  prefix?: string;
}

/**
 * Crypto operation error codes
 */
export enum CryptoErrorCode {
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_DATA = 'INVALID_DATA',
  KEY_DERIVATION_FAILED = 'KEY_DERIVATION_FAILED',
  HASH_VERIFICATION_FAILED = 'HASH_VERIFICATION_FAILED',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  CORRUPTED_DATA = 'CORRUPTED_DATA'
}

/**
 * Crypto operation error
 */
export class CryptoError extends Error {
  code: CryptoErrorCode;

  constructor(code: CryptoErrorCode, message: string) {
    super(message);
    this.name = 'CryptoError';
    this.code = code;
  }
}
