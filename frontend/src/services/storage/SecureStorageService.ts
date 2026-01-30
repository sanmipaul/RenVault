/**
 * Secure Storage Service for RenVault
 * Provides encrypted localStorage operations with integrity verification
 */

import { encryptForStorage, decryptFromStorage, hashData } from '../../utils/encryption';
import { generateSecureId } from '../../utils/crypto';

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  checksum: string;
  version: number;
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  password?: string;
  expirationMs?: number;
}

const STORAGE_VERSION = 1;
const DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class SecureStorageService {
  private static instance: SecureStorageService;
  private readonly prefix: string = 'renvault_secure_';

  private constructor() {}

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Store data securely with optional encryption
   */
  async setItem<T>(
    key: string,
    data: T,
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const serializedData = JSON.stringify(data);
      const checksum = await hashData(serializedData);

      const storageItem: StorageItem<string> = {
        data: serializedData,
        timestamp: Date.now(),
        checksum,
        version: STORAGE_VERSION
      };

      let finalData: string;

      if (options.encrypt && options.password) {
        // Encrypt the entire storage item
        finalData = await encryptForStorage(JSON.stringify(storageItem), options.password);
      } else {
        finalData = JSON.stringify(storageItem);
      }

      localStorage.setItem(this.prefix + key, finalData);
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to store item:', error);
      return false;
    }
  }

  /**
   * Retrieve data with integrity verification
   */
  async getItem<T>(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<T | null> {
    try {
      const rawData = localStorage.getItem(this.prefix + key);
      if (!rawData) {
        return null;
      }

      let storageItem: StorageItem<string>;

      if (options.encrypt && options.password) {
        // Decrypt the storage item
        const decrypted = await decryptFromStorage(rawData, options.password);
        storageItem = JSON.parse(decrypted);
      } else {
        storageItem = JSON.parse(rawData);
      }

      // Check version compatibility
      if (storageItem.version !== STORAGE_VERSION) {
        console.warn('SecureStorage: Version mismatch, data may be outdated');
      }

      // Check expiration
      const expirationMs = options.expirationMs || DEFAULT_EXPIRATION_MS;
      if (Date.now() - storageItem.timestamp > expirationMs) {
        console.warn('SecureStorage: Data has expired');
        await this.removeItem(key);
        return null;
      }

      // Verify integrity
      const checksum = await hashData(storageItem.data);
      if (checksum !== storageItem.checksum) {
        console.error('SecureStorage: Data integrity check failed');
        await this.removeItem(key);
        return null;
      }

      return JSON.parse(storageItem.data) as T;
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve item:', error);
      return null;
    }
  }

  /**
   * Remove an item from secure storage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to remove item:', error);
      return false;
    }
  }

  /**
   * Clear all secure storage items
   */
  async clear(): Promise<boolean> {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in secure storage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Get all secure storage keys
   */
  getKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }

    return keys;
  }

  /**
   * Get storage statistics
   */
  getStats(): { itemCount: number; totalSize: number } {
    let totalSize = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
          itemCount++;
        }
      }
    }

    return { itemCount, totalSize };
  }

  /**
   * Generate a unique storage key
   */
  generateKey(prefix: string = 'item'): string {
    return generateSecureId(prefix, 12);
  }
}

export default SecureStorageService;
