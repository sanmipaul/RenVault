/**
 * Input validation utilities for cryptographic operations
 * Ensures data integrity and security before crypto processing
 */

import { CryptoError, CryptoErrorCode } from '../types/crypto';

/**
 * Minimum password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: false,
  requireLowercase: false,
  requireNumber: false,
  requireSpecial: false
};

/**
 * Validate password strength and format
 */
export function validatePassword(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new CryptoError(
      CryptoErrorCode.INVALID_PASSWORD,
      'Password is required and must be a string'
    );
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_PASSWORD,
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    );
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_PASSWORD,
      `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`
    );
  }
}

/**
 * Validate data for encryption
 */
export function validateEncryptionInput(data: string): void {
  if (data === undefined || data === null) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_DATA,
      'Data to encrypt cannot be null or undefined'
    );
  }

  if (typeof data !== 'string') {
    throw new CryptoError(
      CryptoErrorCode.INVALID_DATA,
      'Data to encrypt must be a string'
    );
  }

  // Check for excessively large data that could cause memory issues
  const MAX_DATA_SIZE = 10 * 1024 * 1024; // 10 MB
  if (data.length > MAX_DATA_SIZE) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_DATA,
      'Data exceeds maximum allowed size for encryption'
    );
  }
}

/**
 * Validate encrypted data structure
 */
export function validateEncryptedData(data: unknown): void {
  if (!data || typeof data !== 'object') {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      'Encrypted data must be an object'
    );
  }

  const encData = data as Record<string, unknown>;

  if (typeof encData.ciphertext !== 'string' || !encData.ciphertext) {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      'Encrypted data missing or invalid ciphertext'
    );
  }

  if (typeof encData.iv !== 'string' || !encData.iv) {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      'Encrypted data missing or invalid IV'
    );
  }

  if (typeof encData.salt !== 'string' || !encData.salt) {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      'Encrypted data missing or invalid salt'
    );
  }

  if (typeof encData.version !== 'number') {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      'Encrypted data missing version'
    );
  }
}

/**
 * Validate hex string format
 */
export function validateHexString(hex: string, fieldName: string): void {
  if (!hex || typeof hex !== 'string') {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      `${fieldName} must be a non-empty string`
    );
  }

  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      `${fieldName} contains invalid hexadecimal characters`
    );
  }

  if (hex.length % 2 !== 0) {
    throw new CryptoError(
      CryptoErrorCode.CORRUPTED_DATA,
      `${fieldName} has invalid length (must be even)`
    );
  }
}

/**
 * Validate byte array
 */
export function validateByteArray(
  bytes: Uint8Array,
  expectedLength: number,
  fieldName: string
): void {
  if (!(bytes instanceof Uint8Array)) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_DATA,
      `${fieldName} must be a Uint8Array`
    );
  }

  if (bytes.length !== expectedLength) {
    throw new CryptoError(
      CryptoErrorCode.INVALID_DATA,
      `${fieldName} must be exactly ${expectedLength} bytes`
    );
  }
}

/**
 * Validate encryption version
 */
export function validateEncryptionVersion(version: number): void {
  const SUPPORTED_VERSIONS = [1];

  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new CryptoError(
      CryptoErrorCode.UNSUPPORTED_VERSION,
      `Encryption version ${version} is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`
    );
  }
}

/**
 * Sanitize string input by removing control characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Check if Web Crypto API is available
 */
export function isWebCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    crypto.subtle !== undefined &&
    typeof crypto.subtle.encrypt === 'function' &&
    typeof crypto.subtle.decrypt === 'function' &&
    typeof crypto.subtle.deriveKey === 'function'
  );
}

/**
 * Ensure Web Crypto API is available
 */
export function requireWebCrypto(): void {
  if (!isWebCryptoAvailable()) {
    throw new CryptoError(
      CryptoErrorCode.ENCRYPTION_FAILED,
      'Web Crypto API is not available in this environment. ' +
      'Ensure you are using HTTPS or a modern browser.'
    );
  }
}
