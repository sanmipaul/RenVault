/**
 * Network Validation Service
 * Validates chain compatibility and address formats
 */

import { ChainSwitchService } from './ChainSwitchService';
import { EvmChainAdapter } from './EvmChainAdapter';
import { StacksChainAdapter } from './StacksChainAdapter';
import type { ChainType } from '../config/multi-chain-config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface AddressValidationResult extends ValidationResult {
  normalizedAddress?: string;
  chainType?: ChainType;
}

/**
 * Network Validation Service
 */
export class NetworkValidationService {
  /**
   * Validate address for specific chain
   */
  static validateAddress(address: string, chainType: ChainType): AddressValidationResult {
    try {
      const adapter = ChainSwitchService.getAdapter(chainType);

      if (!adapter) {
        return {
          isValid: false,
          error: `No adapter found for chain: ${chainType}`,
        };
      }

      // Check if address is valid for this chain type
      if (!adapter.isValidAddress(address)) {
        return {
          isValid: false,
          error: `Invalid ${chainType} address format`,
        };
      }

      // Format address properly
      const normalizedAddress = adapter.formatAddress(address);

      return {
        isValid: true,
        normalizedAddress,
        chainType,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Address validation failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Validate multiple addresses
   */
  static validateAddresses(
    addresses: string[],
    chainType: ChainType
  ): AddressValidationResult[] {
    return addresses.map(address => this.validateAddress(address, chainType));
  }

  /**
   * Validate amount for chain
   */
  static validateAmount(
    amount: string,
    chainType: ChainType
  ): ValidationResult {
    try {
      const adapter = ChainSwitchService.getAdapter(chainType);

      if (!adapter) {
        return {
          isValid: false,
          error: `No adapter found for chain: ${chainType}`,
        };
      }

      const numAmount = parseFloat(amount);

      if (isNaN(numAmount)) {
        return {
          isValid: false,
          error: 'Invalid amount format',
        };
      }

      if (numAmount <= 0) {
        return {
          isValid: false,
          error: 'Amount must be greater than 0',
        };
      }

      // Check for reasonable limits
      if (numAmount > 1000000) {
        return {
          isValid: true,
          warnings: ['Large amount - please verify before sending'],
        };
      }

      return {
        isValid: true,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Amount validation failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Validate transaction object
   */
  static validateTransaction(transaction: {
    from: string;
    to: string;
    amount: string;
    chainType: ChainType;
    data?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate from address
    const fromValidation = this.validateAddress(transaction.from, transaction.chainType);
    if (!fromValidation.isValid) {
      errors.push(`Invalid from address: ${fromValidation.error}`);
    }

    // Validate to address
    const toValidation = this.validateAddress(transaction.to, transaction.chainType);
    if (!toValidation.isValid) {
      errors.push(`Invalid to address: ${toValidation.error}`);
    }

    // Check if from and to are different
    if (transaction.from.toLowerCase() === transaction.to.toLowerCase()) {
      warnings.push('From and to addresses are the same');
    }

    // Validate amount
    const amountValidation = this.validateAmount(transaction.amount, transaction.chainType);
    if (!amountValidation.isValid) {
      errors.push(`Invalid amount: ${amountValidation.error}`);
    }

    if (amountValidation.warnings) {
      warnings.push(...amountValidation.warnings);
    }

    // Validate data if present
    if (transaction.data) {
      if (!transaction.data.startsWith('0x')) {
        errors.push('Transaction data must start with 0x');
      }

      if (transaction.data.length % 2 !== 0) {
        errors.push('Transaction data must have even length');
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Check if chain is reachable
   */
  static async isChainReachable(chainType: ChainType): Promise<ValidationResult> {
    try {
      const adapter = ChainSwitchService.getAdapter(chainType);

      if (!adapter) {
        return {
          isValid: false,
          error: `No adapter found for chain: ${chainType}`,
        };
      }

      // Try to get RPC URL to verify connectivity
      const rpcUrl = adapter.getRpcUrl?.();

      if (!rpcUrl && adapter instanceof EvmChainAdapter) {
        return {
          isValid: false,
          error: 'No RPC URL available for chain',
        };
      }

      // For EVM chains, test RPC connectivity
      if (adapter instanceof EvmChainAdapter) {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'net_version',
            params: [],
            id: 1,
          }),
        });

        if (!response.ok) {
          return {
            isValid: false,
            error: `Chain RPC returned status ${response.status}`,
          };
        }

        const data = await response.json();

        if (data.error) {
          return {
            isValid: false,
            error: `Chain RPC error: ${data.error.message}`,
          };
        }

        return {
          isValid: true,
        };
      }

      return {
        isValid: true,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Chain reachability check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Validate multiple chains
   */
  static async validateChains(chainTypes: ChainType[]): Promise<Record<ChainType, ValidationResult>> {
    const results: Record<ChainType, ValidationResult> = {} as any;

    const checks = chainTypes.map(async chainType => {
      const result = await this.isChainReachable(chainType);
      results[chainType] = result;
    });

    await Promise.all(checks);

    return results;
  }

  /**
   * Get chain compatibility matrix
   */
  static getChainCompatibility(
    operation: 'transfer' | 'bridge' | 'swap'
  ): Record<string, ChainType[]> {
    const compatibility: Record<string, ChainType[]> = {
      transfer: ['stacks', 'stacks-testnet', 'ethereum', 'polygon', 'arbitrum', 'sepolia'],
      bridge: ['ethereum', 'polygon', 'arbitrum'], // Bridges available for EVM chains
      swap: ['ethereum', 'polygon', 'arbitrum', 'sepolia'], // DEXs available on these chains
    };

    return {
      [operation]: compatibility[operation] || [],
    };
  }

  /**
   * Check if operation is supported on chain
   */
  static isOperationSupported(
    operation: 'transfer' | 'bridge' | 'swap',
    chainType: ChainType
  ): boolean {
    const compatibility = this.getChainCompatibility(operation);
    return (compatibility[operation] || []).includes(chainType);
  }

  /**
   * Validate chain switch feasibility
   */
  static validateChainSwitch(fromChain: ChainType, toChain: ChainType): ValidationResult {
    // Check if both chains are supported
    const allChains = ['stacks', 'stacks-testnet', 'ethereum', 'polygon', 'arbitrum', 'sepolia'];

    if (!allChains.includes(fromChain)) {
      return {
        isValid: false,
        error: `Unsupported source chain: ${fromChain}`,
      };
    }

    if (!allChains.includes(toChain)) {
      return {
        isValid: false,
        error: `Unsupported target chain: ${toChain}`,
      };
    }

    if (fromChain === toChain) {
      return {
        isValid: false,
        error: 'Source and target chains are the same',
      };
    }

    // Check if switching between different chain types
    const fromIsStacks = fromChain.startsWith('stacks');
    const toIsStacks = toChain.startsWith('stacks');

    if (fromIsStacks !== toIsStacks) {
      return {
        isValid: true,
        warnings: ['Switching between different blockchain types (Stacks ↔ EVM)'],
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Get validation report
   */
  static getValidationReport(): {
    timestamp: number;
    chainsChecked: number;
    operationsSupported: string[];
  } {
    return {
      timestamp: Date.now(),
      chainsChecked: 6, // Number of chains we support
      operationsSupported: ['transfer', 'bridge', 'swap'],
    };
  }
}

export default NetworkValidationService;
