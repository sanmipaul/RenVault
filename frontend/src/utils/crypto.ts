/**
 * Secure cryptographic utilities for RenVault
 * Uses Web Crypto API for browser-safe cryptographic operations
 */

/**
 * Generate a cryptographically secure random ID
 * @param prefix Optional prefix for the ID
 * @param length Length of the random portion (default: 16)
 * @returns Secure random ID string
 */
export function generateSecureId(prefix: string = '', length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return prefix ? `${prefix}_${hex}` : hex;
}

/**
 * Generate a cryptographically secure UUID v4
 * @returns UUID string
 */
export function generateSecureUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  // Set version (4) and variant (10xx)
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;

  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generate cryptographically secure random bytes
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Generate a secure random hex string
 * @param length Length of the hex string (will generate length/2 bytes)
 * @returns Hex string
 */
export function generateSecureHex(length: number = 64): string {
  const byteLength = Math.ceil(length / 2);
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

/**
 * Convert Uint8Array to hex string
 * @param bytes Uint8Array to convert
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 * @param hex Hex string to convert
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert string to Uint8Array using UTF-8 encoding
 * @param str String to convert
 * @returns Uint8Array
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to string using UTF-8 decoding
 * @param bytes Uint8Array to convert
 * @returns Decoded string
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Generate a secure transaction ID (64 character hex with 0x prefix)
 * @returns Transaction ID string
 */
export function generateSecureTransactionId(): string {
  return '0x' + generateSecureHex(64);
}

/**
 * Generate a secure backup ID with timestamp
 * @returns Backup ID string
 */
export function generateSecureBackupId(): string {
  return generateSecureId('backup', 12) + '_' + Date.now().toString(36);
}
