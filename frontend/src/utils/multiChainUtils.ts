/**
 * Multi-Chain Utilities
 * Helper functions and utilities for multi-chain operations
 */

import { ChainSwitchService } from '../services/chain/ChainSwitchService';
import type { ChainType } from '../config/multi-chain-config';

/**
 * Format amount with proper decimals
 */
export function formatAmount(amount: string, decimals: number = 18): string {
  try {
    const num = parseFloat(amount);

    if (isNaN(num)) return '0';

    return num.toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Convert between units
 */
export function convertUnits(
  amount: string,
  fromDecimals: number,
  toDecimals: number
): string {
  try {
    const num = parseFloat(amount);

    if (isNaN(num)) return '0';

    const factor = Math.pow(10, toDecimals - fromDecimals);

    return (num * factor).toString();
  } catch {
    return '0';
  }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format chain name
 */
export function formatChainName(chainType: ChainType): string {
  const names: Record<ChainType, string> = {
    stacks: 'Stacks',
    'stacks-testnet': 'Stacks Testnet',
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    arbitrum: 'Arbitrum',
    sepolia: 'Sepolia',
  };

  return names[chainType] || chainType;
}

/**
 * Get chain color
 */
export function getChainColor(chainType: ChainType): string {
  const colors: Record<ChainType, string> = {
    stacks: '#5546FF',
    'stacks-testnet': '#A29BFE',
    ethereum: '#627EEA',
    polygon: '#8247E5',
    arbitrum: '#28A0F0',
    sepolia: '#F6ACEC',
  };

  return colors[chainType] || '#627EEA';
}

/**
 * Get chain icon
 */
export function getChainIcon(chainType: ChainType): string {
  const icons: Record<ChainType, string> = {
    stacks: '🔗',
    'stacks-testnet': '🧪',
    ethereum: 'Ⓔ',
    polygon: '◆',
    arbitrum: '⚡',
    sepolia: '🧪',
  };

  return icons[chainType] || '◇';
}

/**
 * Is testnet
 */
export function isTestnet(chainType: ChainType): boolean {
  return chainType.endsWith('-testnet') || chainType === 'sepolia';
}

/**
 * Format transaction hash
 */
export function formatTransactionHash(hash: string, chars: number = 6): string {
  if (!hash) return '—';

  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Format gas price
 */
export function formatGasPrice(gasPrice: string, decimals: number = 9): string {
  try {
    const num = parseFloat(gasPrice);

    if (isNaN(num)) return '0';

    return (num / Math.pow(10, decimals)).toFixed(2);
  } catch {
    return '0';
  }
}

/**
 * Calculate transaction fee
 */
export function calculateFee(
  gasUsed: string,
  gasPrice: string,
  decimals: number = 18
): string {
  try {
    const used = parseFloat(gasUsed);
    const price = parseFloat(gasPrice);

    if (isNaN(used) || isNaN(price)) return '0';

    const feeWei = used * price;

    return (feeWei / Math.pow(10, decimals)).toFixed(6);
  } catch {
    return '0';
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Is valid Ethereum-style address
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Is valid Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  return /^(SP|ST)[0-9A-Z]{31}$/.test(address);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);

    return true;
  } catch {
    return false;
  }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');

      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep/delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Batch array items
 */
export function batchItems<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 */
export function mergeObjects<T extends object>(...objects: T[]): T {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
}

/**
 * Get random element from array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Filter falsy values
 */
export function compact<T>(array: (T | null | undefined | false)[]): T[] {
  return array.filter(Boolean) as T[];
}

export default {
  formatAmount,
  convertUnits,
  shortenAddress,
  formatChainName,
  getChainColor,
  getChainIcon,
  isTestnet,
  formatTransactionHash,
  formatGasPrice,
  calculateFee,
  formatRelativeTime,
  isValidEvmAddress,
  isValidStacksAddress,
  isValidUrl,
  copyToClipboard,
  debounce,
  throttle,
  sleep,
  retryWithBackoff,
  batchItems,
  deepClone,
  mergeObjects,
  randomElement,
  isEmpty,
  compact,
};
