/**
 * Crypto Module Index
 * Central export point for all cryptographic utilities
 */

// Core crypto functions
export {
  generateSecureId,
  generateSecureUUID,
  getRandomBytes,
  generateSecureHex,
  bytesToHex,
  hexToBytes,
  stringToBytes,
  bytesToString,
  generateSecureTransactionId,
  generateSecureBackupId
} from './crypto';

// Encryption functions
export {
  encryptWithPassword,
  decryptWithPassword,
  encryptForStorage,
  decryptFromStorage,
  serializeEncryptedData,
  deserializeEncryptedData,
  hashData,
  verifyHash
} from './encryption';
export type { EncryptedData } from './encryption';

// Validation functions
export {
  validatePassword,
  validateEncryptionInput,
  validateEncryptedData,
  validateHexString,
  validateByteArray,
  validateEncryptionVersion,
  sanitizeString,
  isWebCryptoAvailable,
  requireWebCrypto,
  PASSWORD_REQUIREMENTS
} from './cryptoValidation';

// Types
export {
  CryptoError,
  CryptoErrorCode
} from '../types/crypto';
export type {
  BackupEncryptionConfig,
  SecureBackupData,
  BackupMetadata,
  WalletBackupData,
  KeyDerivationParams,
  EncryptionResult,
  DecryptionResult,
  HashVerificationResult,
  SecureRandomOptions
} from '../types/crypto';

// Storage service
export { SecureStorageService } from '../services/storage/SecureStorageService';
export type { StorageItem, SecureStorageOptions } from '../services/storage/SecureStorageService';
