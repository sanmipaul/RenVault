/**
 * Secure encryption utilities for RenVault
 * Uses Web Crypto API with AES-GCM for authenticated encryption
 */

import { getRandomBytes, bytesToHex, hexToBytes, stringToBytes, bytesToString } from './crypto';

// Constants for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  ciphertext: string;  // Hex-encoded encrypted data
  iv: string;          // Hex-encoded initialization vector
  salt: string;        // Hex-encoded salt for key derivation
  tag: string;         // Authentication tag (included in ciphertext for AES-GCM)
  version: number;     // Encryption version for future compatibility
}

/**
 * Derive an encryption key from a password using PBKDF2
 * @param password User password
 * @param salt Salt for key derivation
 * @returns CryptoKey for AES-GCM encryption
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBytes(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM with password-derived key
 * @param data Data to encrypt (string)
 * @param password Password for key derivation
 * @returns Encrypted data object
 */
export async function encryptWithPassword(data: string, password: string): Promise<EncryptedData> {
  if (!data || !password) {
    throw new Error('Data and password are required for encryption');
  }

  const salt = getRandomBytes(SALT_LENGTH);
  const iv = getRandomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  const plaintext = stringToBytes(data);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    plaintext
  );

  return {
    ciphertext: bytesToHex(new Uint8Array(ciphertext)),
    iv: bytesToHex(iv),
    salt: bytesToHex(salt),
    tag: '', // AES-GCM includes the tag in the ciphertext
    version: 1
  };
}

/**
 * Decrypt data using AES-GCM with password-derived key
 * @param encryptedData Encrypted data object
 * @param password Password for key derivation
 * @returns Decrypted data string
 */
export async function decryptWithPassword(encryptedData: EncryptedData, password: string): Promise<string> {
  if (!encryptedData || !password) {
    throw new Error('Encrypted data and password are required for decryption');
  }

  const salt = hexToBytes(encryptedData.salt);
  const iv = hexToBytes(encryptedData.iv);
  const ciphertext = hexToBytes(encryptedData.ciphertext);
  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      ciphertext
    );

    return bytesToString(new Uint8Array(decrypted));
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

/**
 * Serialize encrypted data to a portable string format
 * @param encryptedData Encrypted data object
 * @returns Base64-encoded JSON string
 */
export function serializeEncryptedData(encryptedData: EncryptedData): string {
  return btoa(JSON.stringify(encryptedData));
}

/**
 * Deserialize encrypted data from portable string format
 * @param serialized Base64-encoded JSON string
 * @returns Encrypted data object
 */
export function deserializeEncryptedData(serialized: string): EncryptedData {
  try {
    const json = atob(serialized);
    const data = JSON.parse(json);

    // Validate structure
    if (!data.ciphertext || !data.iv || !data.salt || typeof data.version !== 'number') {
      throw new Error('Invalid encrypted data structure');
    }

    return data as EncryptedData;
  } catch (error) {
    throw new Error('Failed to deserialize encrypted data: Invalid format');
  }
}

/**
 * Encrypt and serialize data for storage
 * @param data Data to encrypt
 * @param password Password for encryption
 * @returns Serialized encrypted string
 */
export async function encryptForStorage(data: string, password: string): Promise<string> {
  const encrypted = await encryptWithPassword(data, password);
  return serializeEncryptedData(encrypted);
}

/**
 * Deserialize and decrypt data from storage
 * @param serialized Serialized encrypted string
 * @param password Password for decryption
 * @returns Decrypted data string
 */
export async function decryptFromStorage(serialized: string, password: string): Promise<string> {
  const encrypted = deserializeEncryptedData(serialized);
  return decryptWithPassword(encrypted, password);
}

/**
 * Generate a cryptographic hash of data using SHA-256
 * @param data Data to hash
 * @returns Hex-encoded hash string
 */
export async function hashData(data: string): Promise<string> {
  const encoded = stringToBytes(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Verify data integrity by comparing hashes
 * @param data Data to verify
 * @param expectedHash Expected hash value
 * @returns True if hash matches
 */
export async function verifyHash(data: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashData(data);
  return actualHash === expectedHash;
}
